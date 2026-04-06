import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Divider,
} from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import StorageIcon from "@mui/icons-material/Storage";

const apiUrl = process.env.REACT_APP_API_URL;

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  return { Authorization: `Bearer ${token}` };
};

type TransferState = "idle" | "transferring" | "success" | "error";

interface StatusResponse {
  state: TransferState;
  message: string;
  started_at: string | null;
  completed_at: string | null;
  rows_transferred: number | null;
  start_date: string | null;
  error: string | null;
  logs: string[];
}

const BADGE_CONFIG: Record<
  TransferState,
  { label: string; color: string; bg: string; pulse: boolean }
> = {
  idle:        { label: "Idle",           color: "#6b7280", bg: "#f3f4f6", pulse: false },
  transferring:{ label: "Transferring...", color: "#1d4ed8", bg: "#dbeafe", pulse: true  },
  success:     { label: "Success",         color: "#065f46", bg: "#d1fae5", pulse: false },
  error:       { label: "Failed",          color: "#991b1b", bg: "#fee2e2", pulse: false },
};

const S3DataTransfer: React.FC = () => {
  const [status, setStatus] = useState<StatusResponse>({
    state: "idle",
    message: "",
    started_at: null,
    completed_at: null,
    rows_transferred: null,
    start_date: null,
    error: null,
    logs: [],
  });
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [alreadyRunningWarning, setAlreadyRunningWarning] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/s3_transfer/status/`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`Status check failed (${res.status})`);
      const data: StatusResponse = await res.json();
      setStatus(data);
      setNetworkError(null);
      if (data.state !== "transferring") stopPolling();
    } catch (err: any) {
      setNetworkError(err.message || "Failed to fetch transfer status");
    }
  }, []);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const startPolling = useCallback(() => {
    stopPolling();
    pollingRef.current = setInterval(() => {
      fetchStatus();
    }, 3000);
  }, [fetchStatus]);

  // On mount: fetch status once to restore any in-progress state
  useEffect(() => {
    fetchStatus().then(() => {
      setStatus((prev) => {
        if (prev.state === "transferring") startPolling();
        return prev;
      });
    });
    return () => stopPolling();
  }, []);

  // Start polling whenever state becomes transferring
  useEffect(() => {
    if (status.state === "transferring" && !pollingRef.current) {
      startPolling();
    }
  }, [status.state, startPolling]);

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [status.logs]);

  const handleStartTransfer = async () => {
    setAlreadyRunningWarning(false);
    setNetworkError(null);
    try {
      const res = await fetch(`${apiUrl}/api/s3_transfer/`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (res.status === 409) {
        setAlreadyRunningWarning(true);
        return;
      }
      if (!res.ok) throw new Error(`Transfer failed to start (${res.status})`);
      // Immediately update state to transferring and begin polling
      setStatus((prev) => ({ ...prev, state: "transferring" }));
      fetchStatus();
      startPolling();
    } catch (err: any) {
      setNetworkError(err.message || "Network error — could not start transfer");
    }
  };

  const badge = BADGE_CONFIG[status.state];
  const isTransferring = status.state === "transferring";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f0f2f7",
        px: { xs: 2, sm: 4 },
        py: { xs: 3, sm: 5 },
      }}
    >
      <Box sx={{ maxWidth: 820, mx: "auto" }}>

        {/* ── Header ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <StorageIcon sx={{ color: "#4f46e5", fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
            S3 Data Transfer
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "#6b7280", mb: 3, ml: "44px" }}>
          Sync Monashee S3 data from SQL Server → MIDAS database
        </Typography>

        {/* ── Alerts ── */}
        {alreadyRunningWarning && (
          <Alert
            severity="warning"
            onClose={() => setAlreadyRunningWarning(false)}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            A transfer is already running.
          </Alert>
        )}
        {networkError && (
          <Alert
            severity="error"
            onClose={() => setNetworkError(null)}
            sx={{ mb: 2, borderRadius: 2 }}
          >
            {networkError}
          </Alert>
        )}

        {/* ── Trigger Button ── */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            disabled={isTransferring}
            onClick={handleStartTransfer}
            startIcon={
              isTransferring ? (
                <CircularProgress size={16} sx={{ color: "rgba(255,255,255,0.7)" }} />
              ) : (
                <SyncIcon />
              )
            }
            sx={{
              backgroundColor: isTransferring ? "#6366f1" : "#4f46e5",
              "&:hover": { backgroundColor: "#4338ca" },
              "&.Mui-disabled": { backgroundColor: "#6366f1", color: "rgba(255,255,255,0.7)" },
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
              fontSize: 14,
            }}
          >
            {isTransferring ? "Transferring..." : "Start Transfer"}
          </Button>
        </Box>

        {/* ── Status Card ── */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: 3,
            p: 3,
            mb: 3,
            backgroundColor: "#fff",
            boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#111827" }}>
              Transfer Status
            </Typography>

            {/* Status Badge */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {status.state === "transferring" && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: "#3b82f6",
                    "@keyframes pulse": {
                      "0%, 100%": { opacity: 1, transform: "scale(1)" },
                      "50%": { opacity: 0.5, transform: "scale(1.5)" },
                    },
                    animation: "pulse 1.4s ease-in-out infinite",
                  }}
                />
              )}
              {status.state === "success" && (
                <CheckCircleIcon sx={{ fontSize: 16, color: "#059669" }} />
              )}
              {status.state === "error" && (
                <ErrorIcon sx={{ fontSize: 16, color: "#dc2626" }} />
              )}
              <Chip
                label={badge.label}
                size="small"
                sx={{
                  backgroundColor: badge.bg,
                  color: badge.color,
                  fontWeight: 600,
                  fontSize: 12,
                  height: 24,
                  borderRadius: "6px",
                }}
              />
            </Box>
          </Box>

          {status.message && (
            <Typography variant="body2" sx={{ color: "#374151", mb: 2 }}>
              {status.message}
            </Typography>
          )}

          <Divider sx={{ mb: 2 }} />

          {/* Details grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <StatusField label="Started At" value={status.started_at || "—"} />
            <StatusField label="Completed At" value={status.completed_at || "—"} />
            <StatusField
              label="Rows Transferred"
              value={
                status.rows_transferred != null
                  ? status.rows_transferred.toLocaleString()
                  : "—"
              }
            />
            <StatusField label="Data From Date" value={status.start_date || "—"} />
          </Box>

          {/* Error detail */}
          {status.state === "error" && status.error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
              {status.error}
            </Alert>
          )}
        </Paper>

        {/* ── Live Logs Panel ── */}
        {status.state !== "idle" && (
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #374151",
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
            }}
          >
            {/* Terminal header bar */}
            <Box
              sx={{
                backgroundColor: "#1f2937",
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              {["#ef4444", "#f59e0b", "#10b981"].map((c) => (
                <Box
                  key={c}
                  sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: c }}
                />
              ))}
              <Typography
                sx={{
                  ml: 1.5,
                  fontSize: 12,
                  color: "#9ca3af",
                  fontFamily: "monospace",
                  userSelect: "none",
                }}
              >
                transfer.log
              </Typography>
            </Box>

            {/* Log output */}
            <Box
              sx={{
                backgroundColor: "#111827",
                px: 2.5,
                py: 2,
                minHeight: 180,
                maxHeight: 340,
                overflowY: "auto",
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: 13,
                lineHeight: 1.7,
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-track": { background: "#1f2937" },
                "&::-webkit-scrollbar-thumb": { background: "#374151", borderRadius: 3 },
              }}
            >
              {status.logs.length === 0 ? (
                <Typography
                  sx={{
                    color: "#4b5563",
                    fontFamily: "monospace",
                    fontSize: 13,
                  }}
                >
                  Waiting for logs...
                </Typography>
              ) : (
                status.logs.map((line, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 1 }}>
                    <Typography
                      component="span"
                      sx={{ color: "#6ee7b7", fontFamily: "monospace", fontSize: 13, flexShrink: 0 }}
                    >
                      &gt;
                    </Typography>
                    <Typography
                      component="span"
                      sx={{ color: "#e5e7eb", fontFamily: "monospace", fontSize: 13, wordBreak: "break-word" }}
                    >
                      {line}
                    </Typography>
                  </Box>
                ))
              )}
              <div ref={logsEndRef} />
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

/* Small helper for status card fields */
const StatusField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box>
    <Typography variant="caption" sx={{ color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ color: "#111827", fontWeight: 500, mt: 0.25 }}>
      {value}
    </Typography>
  </Box>
);

export default S3DataTransfer;
