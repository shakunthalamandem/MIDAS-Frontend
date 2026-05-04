import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  LinearProgress,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import BlockRenderer, { GatorBlock } from "./BlockRenderer";

/* ─────────────────────────── API helpers ─────────────────────────── */
const apiUrl = process.env.REACT_APP_API_URL;
const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/* ─────────────────────────── Types ─────────────────────────── */
interface SavedRecord {
  id: number;
  ticker: string;
  company_name: string | null;
  headline: string | null;
  json_data: GatorBlock[];
  created_at: string;
  updated_at: string;
}

type RunPhase = "idle" | "queued" | "running" | "success" | "error";

/* ─────────────────────────── Polling config ─────────────────────────── */
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 8 * 60 * 1000;

/* ─────────────────────────── Component ─────────────────────────── */

const IpoGatorRunDashboard: React.FC = () => {
  // Form state
  const [ticker, setTicker] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Run state
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [runMessage, setRunMessage] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [isNewTicker, setIsNewTicker] = useState<boolean | null>(null);

  // Recent runs
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [rowRefreshing, setRowRefreshing] = useState<Record<string, boolean>>({});

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const pollTimerRef = useRef<number | null>(null);
  const elapsedTimerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);

  /* ── Fetch records ── */
  const fetchRecords = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/gator_post_ipo/list/`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      setRecords(data.records || []);
    } catch {
      setRecords([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  /* ── Cleanup poll timers ── */
  const cleanupTimers = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (elapsedTimerRef.current !== null) {
      window.clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  }, []);
  useEffect(() => cleanupTimers, [cleanupTimers]);

  /* ── Poll task status ── */
  const pollStatus = useCallback(
    async (id: string, runTicker: string) => {
      try {
        const res = await fetch(
          `${apiUrl}/api/gator_post_ipo/run-status/${id}/?ticker=${encodeURIComponent(runTicker)}`,
          { headers: authHeaders() },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Status check failed");

        if (data.state === "STARTED" || data.state === "RETRY") setPhase("running");

        if (data.ready) {
          cleanupTimers();
          if (data.successful) {
            setPhase("success");
            setRunMessage(`${runTicker} report refreshed.`);
            fetchRecords();
          } else {
            setPhase("error");
            setRunMessage(data.error || "Task failed with no detail");
          }
          return;
        }

        if (Date.now() - startedAtRef.current > POLL_TIMEOUT_MS) {
          cleanupTimers();
          setPhase("error");
          setRunMessage(
            `Task still running after ${Math.round(POLL_TIMEOUT_MS / 60000)}m. ` +
            `It may finish in the background — refresh the list in a moment.`,
          );
          return;
        }
        pollTimerRef.current = window.setTimeout(
          () => pollStatus(id, runTicker),
          POLL_INTERVAL_MS,
        );
      } catch (err: any) {
        cleanupTimers();
        setPhase("error");
        setRunMessage(err.message || "Status poll failed");
      }
    },
    [cleanupTimers, fetchRecords],
  );

  /* ── Submit run ── */
  const handleRun = useCallback(async () => {
    const t = ticker.trim().toUpperCase().split(" ")[0];
    const company = companyName.trim();
    if (!t) {
      setSnackbar({ open: true, message: "Ticker is required.", severity: "error" });
      return;
    }
    if (!company) {
      setSnackbar({ open: true, message: "Company name is required.", severity: "error" });
      return;
    }

    cleanupTimers();
    setPhase("queued");
    setRunMessage("");
    setElapsed(0);
    setIsNewTicker(null);
    startedAtRef.current = Date.now();
    elapsedTimerRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);

    try {
      const res = await fetch(`${apiUrl}/api/gator_post_ipo/run/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ ticker: t, company_name: company }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start run");

      setTaskId(data.task_id);
      setIsNewTicker(!!data.is_new_ticker);
      setPhase("running");
      setRunMessage(
        data.is_new_ticker
          ? `New ticker — running with company context only (no historical deal data in DB).`
          : `Found existing deal data in DB — running full Ritter analysis.`,
      );
      pollTimerRef.current = window.setTimeout(
        () => pollStatus(data.task_id, t),
        POLL_INTERVAL_MS,
      );
    } catch (err: any) {
      cleanupTimers();
      setPhase("error");
      setRunMessage(err.message || "Request failed");
    }
  }, [ticker, companyName, cleanupTimers, pollStatus]);

  const handleReset = () => {
    cleanupTimers();
    setTicker("");
    setCompanyName("");
    setPhase("idle");
    setTaskId(null);
    setRunMessage("");
    setElapsed(0);
    setIsNewTicker(null);
  };

  const handleDelete = async (id: number, t: string) => {
    if (!window.confirm(`Delete ${t}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${apiUrl}/api/gator_post_ipo/${id}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      setSnackbar({ open: true, message: `${t} deleted`, severity: "success" });
      fetchRecords();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Delete failed", severity: "error" });
    }
  };

  const refreshSingle = useCallback(
    async (t: string, company: string) => {
      setRowRefreshing((p) => ({ ...p, [t]: true }));
      try {
        const startRes = await fetch(`${apiUrl}/api/gator_post_ipo/run/`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ ticker: t, company_name: company || "" }),
        });
        const startData = await startRes.json();
        if (!startRes.ok) throw new Error(startData.error || "Failed to start");

        const id = startData.task_id;
        const deadline = Date.now() + POLL_TIMEOUT_MS;
        while (Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
          const sRes = await fetch(
            `${apiUrl}/api/gator_post_ipo/run-status/${id}/?ticker=${encodeURIComponent(t)}`,
            { headers: authHeaders() },
          );
          const s = await sRes.json();
          if (!sRes.ok) throw new Error(s.error || "Poll failed");
          if (s.ready) {
            if (s.successful) {
              setSnackbar({ open: true, message: `${t} refreshed`, severity: "success" });
              fetchRecords();
            } else {
              throw new Error(s.error || "Task failed");
            }
            return;
          }
        }
        throw new Error("Timed out");
      } catch (err: any) {
        setSnackbar({
          open: true,
          message: `${t}: ${err.message || "Refresh failed"}`,
          severity: "error",
        });
      } finally {
        setRowRefreshing((p) => {
          const n = { ...p };
          delete n[t];
          return n;
        });
      }
    },
    [fetchRecords],
  );

  /* ── Filtered records for the recent-runs list ── */
  const visible = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter(
      (r) =>
        r.ticker.toLowerCase().includes(q) ||
        (r.company_name || "").toLowerCase().includes(q) ||
        (r.headline || "").toLowerCase().includes(q),
    );
  }, [records, search]);

  const isBusy = phase === "queued" || phase === "running";

  /* ─────────────────────────── Render ─────────────────────────── */
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f0f4f8" }}>
      {/* ════ HEADER ════ */}
      <Box
        sx={{
          background: "linear-gradient(160deg,#0f2d4a 0%,#0e5a80 50%,#0891b2 100%)",
          pb: 6,
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 5 }, pt: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                bgcolor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(8px)",
              }}
            >
              <AutoAwesomeIcon sx={{ color: "#fff", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: { xs: "1.4rem", md: "1.75rem" },
                  letterSpacing: -0.5,
                  lineHeight: 1.2,
                }}
              >
                IPO Gator — Run Analysis
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.72)",
                  fontSize: "0.82rem",
                  mt: 0.3,
                  fontWeight: 400,
                }}
              >
                Launch a Gator POST IPO run on any ticker — existing or brand new.
                The server invokes Claude Code CLI and saves the JSON report to the
                <code style={{ background: "rgba(255,255,255,0.12)", padding: "0 6px", borderRadius: 4, margin: "0 4px" }}>
                  gator_post_ipo
                </code>
                table.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ════ MAIN CONTENT ════ */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 5 }, mt: -3.5 }}>
        {/* ── Run form ── */}
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: 3,
            boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
            border: "1px solid #e0f2fe",
            p: { xs: 2.5, md: 3.5 },
            mb: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.02em",
              mb: 0.5,
            }}
          >
            Start a new run
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#64748b", mb: 2.5 }}>
            Provide a ticker symbol and company name. If the ticker isn't in the deals
            database, we'll still run it with minimal context.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "180px 1fr auto" },
              gap: 2,
              alignItems: "flex-start",
            }}
          >
            <TextField
              label="Ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="MAIR"
              size="small"
              disabled={isBusy}
              fullWidth
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isBusy) handleRun();
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontWeight: 700,
                  letterSpacing: 0.8,
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0891b2" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
              }}
            />
            <TextField
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Madison Air Solutions Corp"
              size="small"
              disabled={isBusy}
              fullWidth
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isBusy) handleRun();
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0891b2" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
              }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                onClick={handleRun}
                disabled={isBusy || !ticker.trim() || !companyName.trim()}
                startIcon={
                  isBusy ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <PlayArrowOutlinedIcon />
                  )
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  px: 3,
                  py: 1,
                  borderRadius: 2.5,
                  whiteSpace: "nowrap",
                  background: "linear-gradient(135deg,#0e5a80,#0891b2)",
                  boxShadow: "0 4px 14px rgba(8,145,178,0.35)",
                  "&:hover": { background: "linear-gradient(135deg,#0c4a6e,#0891b2)" },
                  "&.Mui-disabled": {
                    background: "#e2e8f0",
                    color: "#94a3b8",
                    boxShadow: "none",
                  },
                }}
              >
                {isBusy ? "Running…" : "Run"}
              </Button>
              {(phase === "success" || phase === "error") && (
                <Button
                  onClick={handleReset}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2.5,
                    color: "#64748b",
                    whiteSpace: "nowrap",
                  }}
                >
                  New run
                </Button>
              )}
            </Box>
          </Box>

          {/* ── Live status panel ── */}
          {phase !== "idle" && (
            <Box sx={{ mt: 3 }}>
              {isBusy && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: "1px solid #bae6fd",
                    bgcolor: "#f0fdff",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
                    <CircularProgress size={18} sx={{ color: "#0891b2" }} />
                    <Typography
                      sx={{ fontWeight: 700, color: "#0c4a6e", fontSize: "0.9rem" }}
                    >
                      {phase === "queued"
                        ? "Queued…"
                        : `Running Claude on ${ticker.toUpperCase()} — ${elapsed}s`}
                    </Typography>
                    {isNewTicker && (
                      <Chip
                        label="NEW TICKER"
                        size="small"
                        sx={{
                          ml: 1,
                          bgcolor: "#fef3c7",
                          color: "#92400e",
                          fontWeight: 700,
                          fontSize: "0.65rem",
                          height: 20,
                        }}
                      />
                    )}
                  </Box>
                  <LinearProgress
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "#e0f2fe",
                      "& .MuiLinearProgress-bar": { bgcolor: "#0891b2" },
                    }}
                  />
                  {runMessage && (
                    <Typography sx={{ fontSize: "0.75rem", color: "#475569", mt: 1 }}>
                      {runMessage}
                    </Typography>
                  )}
                  {taskId && (
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        color: "#94a3b8",
                        mt: 1,
                        fontFamily: "monospace",
                      }}
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
                  {runMessage || "Run complete."} The row below has been updated.
                </Alert>
              )}

              {phase === "error" && (
                <Alert
                  severity="error"
                  icon={<ErrorOutlineIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  {runMessage || "Run failed."}
                </Alert>
              )}
            </Box>
          )}
        </Box>

        {/* ── Recent runs ── */}
        <Box
          sx={{
            bgcolor: "#fff",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            mb: 5,
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              px: 2.5,
              py: 1.5,
              borderBottom: "1px solid #e2e8f0",
              bgcolor: "#f8fafc",
              flexWrap: "wrap",
            }}
          >
            <HistoryIcon sx={{ color: "#0891b2", fontSize: 20 }} />
            <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.92rem" }}>
              Recent Runs
            </Typography>
            <Chip
              label={`${records.length} total`}
              size="small"
              sx={{
                bgcolor: "#ecfeff",
                color: "#0891b2",
                border: "1px solid #bae6fd",
                fontWeight: 700,
                fontSize: "0.65rem",
                height: 22,
              }}
            />
            <Box sx={{ ml: "auto" }}>
              <TextField
                size="small"
                placeholder="Search ticker or company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#94a3b8", fontSize: 17 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: 280,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                    bgcolor: "#fff",
                    fontSize: "0.82rem",
                  },
                }}
              />
            </Box>
          </Box>

          {listLoading ? (
            <Box sx={{ py: 5, display: "flex", justifyContent: "center" }}>
              <CircularProgress sx={{ color: "#0891b2" }} />
            </Box>
          ) : visible.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography sx={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                {records.length === 0
                  ? "No runs yet. Enter a ticker + company name above and click Run."
                  : "No runs match your search."}
              </Typography>
            </Box>
          ) : (
            <Box>
              {visible.map((rec) => {
                const isOpen = expandedId === rec.id;
                const busy = !!rowRefreshing[rec.ticker];
                return (
                  <Box key={rec.id} sx={{ borderBottom: "1px solid #f1f5f9" }}>
                    <Box
                      onClick={() => setExpandedId(isOpen ? null : rec.id)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        px: 2.5,
                        py: 1.8,
                        cursor: "pointer",
                        bgcolor: isOpen ? "#f0fdff" : "transparent",
                        borderLeft: isOpen
                          ? "3px solid #0891b2"
                          : "3px solid transparent",
                        "&:hover": { bgcolor: isOpen ? "#f0fdff" : "#fafbfc" },
                      }}
                    >
                      <IconButton size="small" sx={{ color: "#0891b2" }}>
                        {isOpen ? (
                          <KeyboardArrowUpIcon fontSize="small" />
                        ) : (
                          <KeyboardArrowDownIcon fontSize="small" />
                        )}
                      </IconButton>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: "#0891b2",
                          fontSize: "0.9rem",
                          minWidth: 90,
                          letterSpacing: 0.4,
                        }}
                      >
                        {rec.ticker}
                      </Typography>
                      <Typography
                        sx={{
                          color: "#0f172a",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          flex: 1,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {rec.company_name || "—"}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap" }}
                      >
                        {new Date(rec.updated_at).toLocaleString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                      <Tooltip title={busy ? "Running…" : "Re-run this ticker"} arrow>
                        <span>
                          <IconButton
                            size="small"
                            disabled={busy}
                            onClick={(e) => {
                              e.stopPropagation();
                              refreshSingle(rec.ticker, rec.company_name || "");
                            }}
                            sx={{
                              color: "#94a3b8",
                              "&:hover": { color: "#0891b2", bgcolor: "#ecfeff" },
                              "&.Mui-disabled": { color: "#0891b2" },
                            }}
                          >
                            {busy ? (
                              <CircularProgress size={16} sx={{ color: "#0891b2" }} />
                            ) : (
                              <RefreshIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Delete" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(rec.id, rec.ticker);
                          }}
                          sx={{
                            color: "#94a3b8",
                            "&:hover": { color: "#dc2626", bgcolor: "#fef2f2" },
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Collapse in={isOpen} timeout={250} unmountOnExit>
                      <Box
                        sx={{
                          p: { xs: 2, md: 3 },
                          bgcolor: "#f5f7fa",
                          borderTop: "1px solid #e2e8f0",
                          width: "100%",
                          minWidth: 0,
                          boxSizing: "border-box",
                        }}
                      >
                        {rec.json_data && rec.json_data.length > 0 ? (
                          <BlockRenderer blocks={rec.json_data} />
                        ) : (
                          <Alert severity="warning">No blocks found.</Alert>
                        )}
                      </Box>
                    </Collapse>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IpoGatorRunDashboard;
