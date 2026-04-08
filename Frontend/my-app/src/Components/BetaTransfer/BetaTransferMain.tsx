import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Box,
  Typography,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Backdrop,
  Fade,
} from "@mui/material";
import { motion, AnimatePresence as FramerAP } from "framer-motion";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import DeleteSweepRoundedIcon from "@mui/icons-material/DeleteSweepRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

// AnimatePresence type workaround for framer-motion v11 + React 18
const AnimatePresence = FramerAP as React.FC<{
  children?: React.ReactNode;
  mode?: "wait" | "sync" | "popLayout";
  initial?: boolean;
}>;

const Div = motion.div;
const apiUrl = process.env.REACT_APP_API_URL;

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Types ───────────────────────────────────────────────────────────────────

type TransferStatus = "idle" | "transferring" | "success" | "error";

interface StatusData {
  status: TransferStatus;
  started_at: string | null;
  completed_at: string | null;
  rows_deleted: number | null;
  rows_inserted: number | null;
  trading_days: string[];
  logs: string[];
  error_message: string | null;
}

const EMPTY_STATUS: StatusData = {
  status: "idle",
  started_at: null,
  completed_at: null,
  rows_deleted: null,
  rows_inserted: null,
  trading_days: [],
  logs: [],
  error_message: null,
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_META: Record<
  TransferStatus,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  idle: {
    label: "No transfer triggered yet",
    color: "#90a4ae",
    bg: "rgba(144,164,174,0.12)",
    border: "rgba(144,164,174,0.25)",
    icon: <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 15 }} />,
  },
  transferring: {
    label: "Transfer in progress...",
    color: "#448aff",
    bg: "rgba(68,138,255,0.12)",
    border: "rgba(68,138,255,0.3)",
    icon: <HourglassTopRoundedIcon sx={{ fontSize: 15 }} />,
  },
  success: {
    label: "Completed successfully",
    color: "#69f0ae",
    bg: "rgba(105,240,174,0.12)",
    border: "rgba(105,240,174,0.3)",
    icon: <CheckCircleRoundedIcon sx={{ fontSize: 15 }} />,
  },
  error: {
    label: "Transfer failed",
    color: "#ef5350",
    bg: "rgba(239,83,80,0.12)",
    border: "rgba(239,83,80,0.3)",
    icon: <ErrorRoundedIcon sx={{ fontSize: 15 }} />,
  },
};

// Normalise whatever string the API sends into our known keys
function normaliseStatus(raw: string): TransferStatus {
  if (raw === "running" || raw === "in_progress") return "transferring";
  if (raw === "completed" || raw === "done") return "success";
  if (raw === "failed") return "error";
  if ((STATUS_META as Record<string, unknown>)[raw]) return raw as TransferStatus;
  return "idle";
}

const StatusBadge: React.FC<{ status: TransferStatus; errorMsg?: string | null }> = ({
  status,
  errorMsg,
}) => {
  const m = STATUS_META[status] ?? STATUS_META.idle;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      {/* Pulsing dot */}
      <Box sx={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: m.color,
            position: "relative",
            zIndex: 1,
          }}
        />
        {status === "transferring" && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `2px solid ${m.color}`,
              animation: "pulseRing 1.4s ease-out infinite",
              "@keyframes pulseRing": {
                "0%": { transform: "scale(1)", opacity: 0.9 },
                "100%": { transform: "scale(2.5)", opacity: 0 },
              },
            }}
          />
        )}
      </Box>

      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          px: "12px",
          py: "5px",
          borderRadius: "20px",
          background: m.bg,
          border: `1px solid ${m.border}`,
          color: m.color,
          fontSize: "0.8rem",
          fontWeight: 600,
        }}
      >
        {status === "transferring" ? (
          <CircularProgress size={12} sx={{ color: m.color }} />
        ) : (
          m.icon
        )}
        {status === "error" && errorMsg ? errorMsg : m.label}
      </Box>
    </Box>
  );
};

// ─── Stat Tile ────────────────────────────────────────────────────────────────

const StatTile: React.FC<{
  label: string;
  value: string | number | null;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, icon, color }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 0,
      p: "14px 16px",
      borderRadius: "12px",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      display: "flex",
      flexDirection: "column",
      gap: 0.5,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <Box sx={{ color, display: "flex", opacity: 0.8 }}>{icon}</Box>
      <Typography
        variant="caption"
        sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", letterSpacing: "0.04em", textTransform: "uppercase" }}
      >
        {label}
      </Typography>
    </Box>
    <Typography
      sx={{
        color: value !== null ? "#fff" : "rgba(255,255,255,0.2)",
        fontWeight: 700,
        fontSize: "0.92rem",
        fontFamily: value !== null && typeof value === "string" && value.includes("T") ? "monospace" : "inherit",
      }}
    >
      {value != null ? value.toLocaleString() : "—"}
    </Typography>
  </Box>
);

// ─── Trading Day Pill ─────────────────────────────────────────────────────────

const TradingDayPill: React.FC<{ date: string; index: number }> = ({ date, index }) => (
  <Div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.06, duration: 0.25 }}
  >
    <Chip
      size="small"
      icon={<CalendarTodayRoundedIcon sx={{ fontSize: "12px !important" }} />}
      label={date}
      sx={{
        height: 26,
        borderRadius: "8px",
        background: "rgba(68,138,255,0.1)",
        border: "1px solid rgba(68,138,255,0.25)",
        color: "#90caf9",
        fontSize: "0.72rem",
        fontWeight: 600,
        fontFamily: "monospace",
        "& .MuiChip-icon": { color: "#90caf9" },
      }}
    />
  </Div>
);

// ─── Log Panel ────────────────────────────────────────────────────────────────

const LogPanel: React.FC<{
  logs: string[];
  isTransferring: boolean;
  onRefresh: () => void;
}> = ({ logs, isTransferring, onRefresh }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom during transfer
  useEffect(() => {
    if (isTransferring && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isTransferring]);

  return (
    <Box>
      {/* Panel header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: isTransferring ? "#69f0ae" : "#546e7a",
              boxShadow: isTransferring ? "0 0 8px #69f0ae" : "none",
              animation: isTransferring ? "logPulse 1s ease-in-out infinite" : "none",
              "@keyframes logPulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.3 },
              },
            }}
          />
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase" }}
          >
            Live Transfer Log
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onRefresh}
          sx={{
            color: "rgba(255,255,255,0.3)",
            "&:hover": { color: "#fff", background: "rgba(255,255,255,0.06)" },
            transition: "all 0.2s",
          }}
        >
          <RefreshRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      {/* Terminal */}
      <Box
        ref={scrollRef}
        sx={{
          background: "#0d0d1f",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          p: "16px",
          maxHeight: 320,
          overflowY: "auto",
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "12px",
          lineHeight: 1.7,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,0.08)",
            borderRadius: 3,
            "&:hover": { background: "rgba(255,255,255,0.15)" },
          },
        }}
      >
        {logs.length === 0 ? (
          <Typography
            sx={{
              color: "rgba(255,255,255,0.2)",
              fontSize: "12px",
              fontFamily: "monospace",
              fontStyle: "italic",
            }}
          >
            {"// No logs yet. Trigger a transfer to see live output."}
          </Typography>
        ) : (
          logs.map((line, i) => {
            const isError =
              /error|fail|exception|traceback/i.test(line);
            const isWarning = /warn|skip/i.test(line);
            const isSuccess = /success|complet|done|insert/i.test(line);
            const color = isError
              ? "#ff5252"
              : isWarning
              ? "#ffab40"
              : isSuccess
              ? "#69f0ae"
              : "#00e676";

            return (
              <Div
                key={i}
                initial={i === logs.length - 1 ? { opacity: 0, x: -4 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                style={{ display: "block" }}
              >
                <span style={{ color: "rgba(255,255,255,0.2)", marginRight: 8 }}>
                  {String(i + 1).padStart(3, "0")}
                </span>
                <span style={{ color }}>{line}</span>
              </Div>
            );
          })
        )}
        {isTransferring && (
          <Div
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ display: "inline-block", color: "#00e676" }}
          >
            ▋
          </Div>
        )}
      </Box>
    </Box>
  );
};

// ─── Confirm Modal ────────────────────────────────────────────────────────────

const ConfirmModal: React.FC<{
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ open, onCancel, onConfirm }) => (
  <AnimatePresence>
    {open && (
      <>
        <Backdrop
          open={open}
          onClick={onCancel}
          sx={{
            zIndex: 1300,
            backdropFilter: "blur(6px)",
            background: "rgba(0,0,0,0.6)",
          }}
        />
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1301,
            pointerEvents: "none",
          }}
        >
          <Fade in={open}>
            <Box
              sx={{
                pointerEvents: "all",
                width: { xs: "90vw", sm: 460 },
                background: "linear-gradient(135deg, #12122a 0%, #0f1f2e 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "20px",
                p: 4,
                boxShadow: "0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
              }}
            >
              {/* Icon */}
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "14px",
                  background: "rgba(255,183,77,0.1)",
                  border: "1px solid rgba(255,183,77,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2.5,
                }}
              >
                <WarningAmberRoundedIcon sx={{ color: "#ffb74d", fontSize: 26 }} />
              </Box>

              <Typography
                sx={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", mb: 1 }}
              >
                Confirm Beta Transfer
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.85rem",
                  lineHeight: 1.65,
                  mb: 3.5,
                }}
              >
                This will <span style={{ color: "#ff7043", fontWeight: 600 }}>delete all existing beta data</span> and
                re-import the last 5 trading days from MMLS SQL Server → MIDAS PostgreSQL.
                This action cannot be undone.
              </Typography>

              {/* Actions */}
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <motion.button
                  onClick={onCancel}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={onConfirm}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #1565c0, #1976d2)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: "0 4px 20px rgba(25,118,210,0.4)",
                  }}
                >
                  Yes, Transfer
                </motion.button>
              </Box>
            </Box>
          </Fade>
        </Box>
      </>
    )}
  </AnimatePresence>
);

// ─── Transfer Button ──────────────────────────────────────────────────────────

const TransferButton: React.FC<{
  isTransferring: boolean;
  onClick: () => void;
}> = ({ isTransferring, onClick }) => (
  <motion.button
    onClick={() => !isTransferring && onClick()}
    whileHover={!isTransferring ? { scale: 1.03 } : undefined}
    whileTap={!isTransferring ? { scale: 0.97 } : undefined}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "11px 22px",
      borderRadius: "12px",
      border: "none",
      background: isTransferring
        ? "rgba(255,255,255,0.06)"
        : "linear-gradient(135deg, #1565c0, #1976d2)",
      color: isTransferring ? "rgba(255,255,255,0.35)" : "#fff",
      fontWeight: 700,
      fontSize: "0.88rem",
      cursor: isTransferring ? "not-allowed" : "pointer",
      letterSpacing: "0.02em",
      boxShadow: isTransferring ? "none" : "0 4px 24px rgba(25,118,210,0.45)",
      transition: "all 0.3s ease",
      fontFamily: "inherit",
      whiteSpace: "nowrap",
    }}
  >
    {isTransferring ? (
      <>
        <CircularProgress size={14} sx={{ color: "rgba(255,255,255,0.35)" }} />
        Running...
      </>
    ) : (
      <>
        <SyncRoundedIcon style={{ fontSize: 18 }} />
        Transfer Now
      </>
    )}
  </motion.button>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const BetaTransferMain: React.FC = () => {
  const [statusData, setStatusData] = useState<StatusData>(EMPTY_STATUS);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [inlineWarning, setInlineWarning] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; severity: "success" | "error" } | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isTransferring = statusData.status === "transferring";

  // ── Fetch status ────────────────────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/beta_transfer/status/`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Status fetch failed");
      const raw = await res.json();
      const data: StatusData = {
        ...EMPTY_STATUS,
        ...raw,
        status: normaliseStatus(raw?.status ?? ""),
        rows_deleted: raw?.rows_deleted ?? null,
        rows_inserted: raw?.rows_inserted ?? null,
        trading_days: raw?.trading_days ?? [],
        logs: raw?.logs ?? [],
      };
      setStatusData(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  // ── Polling ─────────────────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      const data = await fetchStatus();
      if (data && data.status !== "transferring") {
        stopPolling();
        if (data.status === "success") {
          setToast({
            msg: `Transfer completed — ${data.rows_inserted?.toLocaleString() ?? 0} rows inserted`,
            severity: "success",
          });
        } else if (data.status === "error") {
          setToast({
            msg: data.error_message ?? "Transfer failed",
            severity: "error",
          });
        }
      }
    }, 3000);
  }, [fetchStatus, stopPolling]);

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const data = await fetchStatus();
      setLoading(false);
      if (data?.status === "transferring") startPolling();
    })();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Trigger transfer ─────────────────────────────────────────────────────────
  const handleConfirmTransfer = useCallback(async () => {
    setModalOpen(false);
    setInlineWarning(null);

    try {
      const res = await fetch(`${apiUrl}/api/beta_transfer/`, {
        method: "POST",
        headers: authHeaders(),
      });

      if (res.status === 409) {
        setInlineWarning("Transfer already running. Please wait for it to complete.");
        return;
      }
      if (res.status === 202 || res.ok) {
        await fetchStatus();
        startPolling();
      } else {
        const d = await res.json().catch(() => ({})) as Record<string, string>;
        setToast({ msg: d.error || `Error ${res.status}`, severity: "error" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setToast({ msg, severity: "error" });
    }
  }, [fetchStatus, startPolling]);

  // ── Format datetime ──────────────────────────────────────────────────────────
  const formatDt = (iso: string | null) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #080814 0%, #0a0f1a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: "#448aff" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #080814 0%, #0a0f1a 60%, #080f0b 100%)",
        p: { xs: 2, md: "32px 40px" },
      }}
    >
      {/* ── Header Bar ──────────────────────────────────────────────────────── */}
      <Div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{ marginBottom: 32 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            pb: 3,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "13px",
                background: "linear-gradient(135deg, #1565c0, #1976d2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 28px rgba(25,118,210,0.5)",
                flexShrink: 0,
              }}
            >
              <SyncRoundedIcon sx={{ color: "#fff", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: { xs: "1.2rem", md: "1.45rem" },
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                Beta Updates Transfer
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.78rem", mt: 0.3 }}
              >
                Sync last 5 trading days&nbsp;&nbsp;
                <span style={{ color: "rgba(255,255,255,0.2)" }}>MMLS SQL Server</span>
                &nbsp;→&nbsp;
                <span style={{ color: "rgba(255,255,255,0.2)" }}>MIDAS PostgreSQL</span>
              </Typography>
            </Box>
          </Box>

          <TransferButton
            isTransferring={isTransferring}
            onClick={() => setModalOpen(true)}
          />
        </Box>
      </Div>

      {/* ── Inline Warning ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {inlineWarning && (
          <Div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: 20 }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: "12px 16px",
                borderRadius: "12px",
                background: "rgba(255,183,77,0.08)",
                border: "1px solid rgba(255,183,77,0.25)",
              }}
            >
              <WarningAmberRoundedIcon sx={{ color: "#ffb74d", fontSize: 18, flexShrink: 0 }} />
              <Typography sx={{ color: "#ffb74d", fontSize: "0.83rem", flex: 1 }}>
                {inlineWarning}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setInlineWarning(null)}
                sx={{ color: "rgba(255,183,77,0.5)", "&:hover": { color: "#ffb74d" } }}
              >
                <CloseRoundedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Box>
          </Div>
        )}
      </AnimatePresence>

      {/* ── Status Card ──────────────────────────────────────────────────────── */}
      <Div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        style={{ marginBottom: 24 }}
      >
        <Box
          sx={{
            borderRadius: "18px",
            background: "linear-gradient(135deg, #0e0e22 0%, #0b1a2e 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            p: { xs: 2.5, md: 3.5 },
            boxShadow: isTransferring
              ? "0 0 40px rgba(68,138,255,0.15), 0 8px 32px rgba(0,0,0,0.5)"
              : "0 8px 32px rgba(0,0,0,0.4)",
            transition: "box-shadow 0.5s ease",
          }}
        >
          {/* Status badge */}
          <StatusBadge status={statusData.status} errorMsg={statusData.error_message} />

          {/* Stats row */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              mt: 3,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <StatTile
              label="Started At"
              value={formatDt(statusData.started_at)}
              icon={<AccessTimeRoundedIcon sx={{ fontSize: 14 }} />}
              color="#90caf9"
            />
            <StatTile
              label="Completed At"
              value={formatDt(statusData.completed_at)}
              icon={<CheckCircleRoundedIcon sx={{ fontSize: 14 }} />}
              color="#69f0ae"
            />
            <StatTile
              label="Rows Deleted"
              value={statusData.rows_deleted}
              icon={<DeleteSweepRoundedIcon sx={{ fontSize: 14 }} />}
              color="#ff7043"
            />
            <StatTile
              label="Rows Inserted"
              value={statusData.rows_inserted}
              icon={<AddCircleOutlineRoundedIcon sx={{ fontSize: 14 }} />}
              color="#69f0ae"
            />
          </Box>

          {/* Trading days */}
          {statusData.trading_days.length > 0 && (
            <Box sx={{ mt: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <StorageRoundedIcon sx={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }} />
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", letterSpacing: "0.05em", textTransform: "uppercase" }}
                >
                  Trading Days Synced
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {statusData.trading_days.map((d, i) => (
                  <TradingDayPill key={d} date={d} index={i} />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Div>

      {/* ── Log Panel ─────────────────────────────────────────────────────────── */}
      <Div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
      >
        <Box
          sx={{
            borderRadius: "18px",
            background: "linear-gradient(135deg, #0e0e22 0%, #0b1a2e 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            p: { xs: 2.5, md: 3 },
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <LogPanel
            logs={statusData.logs}
            isTransferring={isTransferring}
            onRefresh={fetchStatus}
          />
        </Box>
      </Div>

      {/* ── Confirm Modal ──────────────────────────────────────────────────────── */}
      <ConfirmModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleConfirmTransfer}
      />

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
      <Snackbar
        open={!!toast}
        autoHideDuration={5000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity={toast?.severity ?? "success"}
          variant="filled"
          sx={{
            borderRadius: "12px",
            fontWeight: 600,
            fontSize: "0.83rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {toast?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BetaTransferMain;
