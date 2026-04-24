import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const apiUrl = process.env.REACT_APP_API_URL;
const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 8 * 60 * 1000; // 8 minutes
const ELAPSED_TICK_MS = 1000;

type RunPhase = "idle" | "queued" | "running" | "success" | "error";

interface RunTickerDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful run so the parent can refresh the table. */
  onRunComplete?: (ticker: string) => void;
  /** Existing ticker suggestions (from the table) shown in the autocomplete. */
  suggestions?: { ticker: string; company_name: string | null }[];
  /** If set, pre-fills the ticker input and runs immediately on open. */
  autoRunTicker?: string;
}

const RunTickerDialog: React.FC<RunTickerDialogProps> = ({
  open,
  onClose,
  onRunComplete,
  suggestions = [],
  autoRunTicker,
}) => {
  const [ticker, setTicker] = useState("");
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const pollTimerRef = useRef<number | null>(null);
  const elapsedTimerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (elapsedTimerRef.current !== null) {
      window.clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  }, []);

  // Reset whenever the dialog opens fresh
  useEffect(() => {
    if (open) {
      setPhase("idle");
      setTaskId(null);
      setErrorMsg("");
      setElapsed(0);
      setTicker(autoRunTicker || "");
    } else {
      cleanup();
    }
    return cleanup;
  }, [open, autoRunTicker, cleanup]);

  // Auto-start if a ticker was prefilled
  useEffect(() => {
    if (open && autoRunTicker && phase === "idle") {
      void handleRun(autoRunTicker);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoRunTicker]);

  const pollStatus = useCallback(
    async (id: string, pickedTicker: string) => {
      try {
        const res = await fetch(
          `${apiUrl}/api/gator_post_ipo/run-status/${id}/?ticker=${encodeURIComponent(pickedTicker)}`,
          { headers: authHeaders() },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Status check failed");

        const state: string = data.state;
        if (state === "STARTED" || state === "RETRY") setPhase("running");

        if (data.ready) {
          cleanup();
          if (data.successful) {
            setPhase("success");
            setTimeout(() => {
              onRunComplete?.(pickedTicker);
            }, 100);
          } else {
            setPhase("error");
            setErrorMsg(data.error || "Task failed with no detail");
          }
          return;
        }

        // Still running — schedule next poll, but time out after the ceiling
        if (Date.now() - startedAtRef.current > POLL_TIMEOUT_MS) {
          cleanup();
          setPhase("error");
          setErrorMsg(
            `Task is still running after ${Math.round(POLL_TIMEOUT_MS / 60000)}m. ` +
            `It may finish in the background — refresh the table in a minute.`,
          );
          return;
        }
        pollTimerRef.current = window.setTimeout(
          () => pollStatus(id, pickedTicker),
          POLL_INTERVAL_MS,
        );
      } catch (err: any) {
        cleanup();
        setPhase("error");
        setErrorMsg(err.message || "Status poll failed");
      }
    },
    [cleanup, onRunComplete],
  );

  const handleRun = useCallback(
    async (rawTicker: string) => {
      const t = rawTicker.trim().toUpperCase().split(" ")[0];
      if (!t) {
        setErrorMsg("Enter a ticker symbol first.");
        return;
      }
      setPhase("queued");
      setErrorMsg("");
      setElapsed(0);
      startedAtRef.current = Date.now();

      // Elapsed timer
      elapsedTimerRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, ELAPSED_TICK_MS);

      try {
        const res = await fetch(`${apiUrl}/api/gator_post_ipo/run/`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ ticker: t }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to start run");

        setTaskId(data.task_id);
        setPhase("running");
        pollTimerRef.current = window.setTimeout(
          () => pollStatus(data.task_id, t),
          POLL_INTERVAL_MS,
        );
      } catch (err: any) {
        cleanup();
        setPhase("error");
        setErrorMsg(err.message || "Request failed");
      }
    },
    [cleanup, pollStatus],
  );

  const isBusy = phase === "queued" || phase === "running";
  const canClose = !isBusy;

  const suggestionOptions = suggestions.map((s) => ({
    label: `${s.ticker}${s.company_name ? ` — ${s.company_name}` : ""}`,
    ticker: s.ticker,
  }));

  return (
    <Dialog
      open={open}
      onClose={canClose ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, border: "1px solid #c7d2fe" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: "#f0fdff",
          borderBottom: "1px solid #e0f2fe",
          py: 1.8,
        }}
      >
        <PlayArrowOutlinedIcon sx={{ color: "#0891b2", fontSize: 22 }} />
        <Box>
          <Typography sx={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
            Run Gator POST IPO for a ticker
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#475569", mt: 0.3 }}>
            Triggers the Claude Code CLI on the server for just this ticker and upserts the fresh report.
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {/* Ticker input (autocomplete with existing suggestions) */}
        <Autocomplete
          freeSolo
          options={suggestionOptions}
          value={ticker}
          inputValue={ticker}
          disabled={isBusy || phase === "success"}
          onInputChange={(_, val) => setTicker((val || "").toUpperCase())}
          onChange={(_, val) => {
            if (!val) return;
            if (typeof val === "string") setTicker(val.toUpperCase());
            else setTicker(val.ticker.toUpperCase());
          }}
          sx={{ mt: 1 }}
          renderInput={(params) => (
            <TextField
              {...params}
              autoFocus={!autoRunTicker}
              label="Ticker"
              placeholder="e.g. MAIR, FPS, LGNC"
              size="small"
              fullWidth
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isBusy) {
                  e.preventDefault();
                  void handleRun(ticker);
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  borderRadius: 2,
                },
              }}
            />
          )}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.label
          }
          isOptionEqualToValue={(option, value) => {
            const v = typeof value === "string" ? value : value.ticker;
            return option.ticker === v.toUpperCase();
          }}
        />

        {/* Status panel */}
        <Box sx={{ mt: 3 }}>
          {phase === "idle" && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              The run takes ~30–90 seconds. You can close this dialog while it runs —
              the report will appear in the table when it's ready.
            </Alert>
          )}

          {(phase === "queued" || phase === "running") && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid #bae6fd",
                bgcolor: "#f0fdff",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
                <CircularProgress size={18} sx={{ color: "#0891b2" }} />
                <Typography sx={{ fontWeight: 700, color: "#0c4a6e", fontSize: "0.9rem" }}>
                  {phase === "queued"
                    ? "Queued…"
                    : `Running Claude on ${ticker.toUpperCase()} — ${elapsed}s elapsed`}
                </Typography>
              </Box>
              <LinearProgress
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "#e0f2fe",
                  "& .MuiLinearProgress-bar": { bgcolor: "#0891b2" },
                }}
              />
              {taskId && (
                <Typography
                  sx={{ fontSize: "0.7rem", color: "#64748b", mt: 1, fontFamily: "monospace" }}
                >
                  task_id: {taskId}
                </Typography>
              )}
            </Box>
          )}

          {phase === "success" && (
            <Alert
              severity="success"
              icon={<CheckCircleOutlineIcon />}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              {ticker.toUpperCase()} report refreshed. The table below now shows the new run.
            </Alert>
          )}

          {phase === "error" && (
            <Alert severity="error" icon={<ErrorOutlineIcon />} sx={{ borderRadius: 2 }}>
              {errorMsg || "Something went wrong."}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={!canClose}
          sx={{ textTransform: "none", color: "#64748b", fontWeight: 600, borderRadius: 2 }}
        >
          {phase === "success" ? "Close" : "Cancel"}
        </Button>
        {phase !== "success" && (
          <Button
            variant="contained"
            onClick={() => handleRun(ticker)}
            disabled={isBusy || !ticker.trim()}
            startIcon={isBusy ? <CircularProgress size={16} color="inherit" /> : <PlayArrowOutlinedIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2.5,
              px: 3,
              background: "linear-gradient(135deg,#0e5a80,#0891b2)",
              boxShadow: "0 4px 12px rgba(8,145,178,0.3)",
              "&:hover": { background: "linear-gradient(135deg,#0c4a6e,#0891b2)" },
              "&.Mui-disabled": { background: "#e2e8f0", color: "#94a3b8", boxShadow: "none" },
            }}
          >
            {isBusy ? "Running…" : "Run Now"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default RunTickerDialog;
