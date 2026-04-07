import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import StorageIcon       from "@mui/icons-material/Storage";
import ArrowForwardIcon  from "@mui/icons-material/ArrowForward";
import SearchIcon        from "@mui/icons-material/Search";
import CheckCircleIcon   from "@mui/icons-material/CheckCircle";
import CheckIcon         from "@mui/icons-material/Check";
import ErrorIcon         from "@mui/icons-material/Error";
import WarningAmberIcon  from "@mui/icons-material/WarningAmber";
import ExpandMoreIcon    from "@mui/icons-material/ExpandMore";
import ExpandLessIcon    from "@mui/icons-material/ExpandLess";
import RefreshIcon       from "@mui/icons-material/Refresh";
import EmailIcon         from "@mui/icons-material/Email";
import ReplayIcon        from "@mui/icons-material/Replay";
import TableChartIcon    from "@mui/icons-material/TableChart";
import SwapHorizIcon     from "@mui/icons-material/SwapHoriz";
import LockIcon          from "@mui/icons-material/Lock";
import InfoOutlinedIcon  from "@mui/icons-material/InfoOutlined";

const apiUrl = process.env.REACT_APP_API_URL;

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
};

// ── Types ──────────────────────────────────────────────────────────────────────

type DumpState = "idle" | "running" | "success" | "error";

interface TableFailure { table: string; error: string; }

interface DumpStatus {
  state: DumpState;
  source: string;
  destination: string;
  tables_succeeded: string[];
  tables_failed: TableFailure[];
  started_at: string | null;
  completed_at: string | null;
  logs: string[];
  error: string | null;
  email_sent: boolean;
}

// ── Environment colour helper ──────────────────────────────────────────────────

const getEnvStyle = (key: string, label = "") => {
  const k = (key + label).toLowerCase();
  if (k.includes("prod"))
    return { color: "#dc2626", bg: "#fee2e2", border: "#fca5a5", dot: "#ef4444",
             gradient: "linear-gradient(135deg,#dc2626,#b91c1c)", label: "Production" };
  if (k.includes("test") || k.includes("stag") || k.includes("uat"))
    return { color: "#d97706", bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b",
             gradient: "linear-gradient(135deg,#d97706,#b45309)", label: "Test" };
  return { color: "#059669", bg: "#ecfdf5", border: "#6ee7b7", dot: "#10b981",
           gradient: "linear-gradient(135deg,#059669,#047857)", label: "Development" };
};

// ── Animated Step Tracker ──────────────────────────────────────────────────────

const StepTracker: React.FC<{ activeStep: number }> = ({ activeStep }) => {
  const steps = [
    { label: "Environments", icon: <SwapHorizIcon sx={{ fontSize: 14 }} /> },
    { label: "Tables",       icon: <TableChartIcon sx={{ fontSize: 14 }} /> },
    { label: "Run Dump",     icon: <StorageIcon sx={{ fontSize: 14 }} /> },
  ];
  return (
    <Box
      sx={{
        display: "flex", alignItems: "center",
        bgcolor: "#fff", border: "1px solid #e0e7ff",
        borderRadius: 3, px: 3, py: 2, mb: 3,
        boxShadow: "0 2px 12px rgba(26,35,126,0.07)",
      }}
    >
      {steps.map((s, i) => {
        const done   = i < activeStep;
        const active = i === activeStep;
        return (
          <React.Fragment key={i}>
            {/* Step node */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  bgcolor: done ? "#059669" : active ? "#1a237e" : "#f3f4f6",
                  transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: active
                    ? "0 0 0 5px rgba(26,35,126,0.15), 0 2px 8px rgba(26,35,126,0.3)"
                    : done
                    ? "0 0 0 5px rgba(5,150,105,0.12)"
                    : "none",
                  "@keyframes stepPop": {
                    "0%": { transform: "scale(0.8)" },
                    "60%": { transform: "scale(1.15)" },
                    "100%": { transform: "scale(1)" },
                  },
                  animation: (done || active) ? "stepPop 0.4s ease" : "none",
                }}
              >
                {done
                  ? <CheckIcon sx={{ fontSize: 16, color: "#fff" }} />
                  : <Typography sx={{
                      color: active ? "#fff" : "#9ca3af",
                      fontSize: 12, fontWeight: 800, lineHeight: 1,
                    }}>{i + 1}</Typography>
                }
              </Box>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography sx={{
                  fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em",
                  fontWeight: done || active ? 700 : 500,
                  color: done ? "#059669" : active ? "#1a237e" : "#9ca3af",
                  transition: "color 0.3s ease",
                }}>
                  {s.label}
                </Typography>
              </Box>
            </Box>

            {/* Connector line */}
            {i < 2 && (
              <Box sx={{ flex: 1, mx: { xs: 1, sm: 2 }, height: 2, borderRadius: 1, overflow: "hidden", bgcolor: "#f3f4f6" }}>
                <Box sx={{
                  height: "100%", borderRadius: 1,
                  background: "linear-gradient(90deg,#059669,#10b981)",
                  width: done ? "100%" : "0%",
                  transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                }} />
              </Box>
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};

// ── Section Card ───────────────────────────────────────────────────────────────

const SectionCard: React.FC<{
  step: number; label: string; active: boolean; done: boolean;
  badge?: React.ReactNode; children: React.ReactNode;
}> = ({ step, label, active, done, badge, children }) => (
  <Box
    sx={{
      borderRadius: 3, overflow: "hidden", mb: 3, bgcolor: "#fff",
      border: `1.5px solid ${done ? "#bbf7d0" : active ? "#c7d2fe" : "#e5e7eb"}`,
      boxShadow: active
        ? "0 8px 32px rgba(26,35,126,0.12), 0 2px 8px rgba(26,35,126,0.06)"
        : done
        ? "0 2px 12px rgba(5,150,105,0.08)"
        : "0 1px 6px rgba(0,0,0,0.04)",
      transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
      transform: active ? "translateY(-2px)" : "none",
    }}
  >
    {/* Top accent bar */}
    <Box sx={{
      height: 4,
      background: done
        ? "linear-gradient(90deg,#059669,#34d399)"
        : active
        ? "linear-gradient(90deg,#1a237e,#3949ab,#5c6bc0)"
        : "#f3f4f6",
      transition: "background 0.5s ease",
    }} />

    <Box sx={{ p: { xs: 2.5, md: 3 } }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            bgcolor: done ? "#ecfdf5" : active ? "#e8eaf6" : "#f9fafb",
            border: `2px solid ${done ? "#059669" : active ? "#1a237e" : "#e5e7eb"}`,
            transition: "all 0.3s ease",
          }}>
            {done
              ? <CheckIcon sx={{ fontSize: 14, color: "#059669" }} />
              : <Typography sx={{ color: active ? "#1a237e" : "#9ca3af", fontSize: 12, fontWeight: 800, lineHeight: 1 }}>{step}</Typography>
            }
          </Box>
          <Typography sx={{
            fontWeight: 700, fontSize: "0.95rem",
            color: done ? "#059669" : active ? "#1a237e" : "#374151",
            transition: "color 0.3s ease",
          }}>
            {label}
          </Typography>
          {done && (
            <Chip
              label="Done"
              size="small"
              sx={{ bgcolor: "#ecfdf5", color: "#059669", fontWeight: 700, fontSize: 11, height: 20, borderRadius: "5px" }}
            />
          )}
        </Box>
        {badge}
      </Box>
      {children}
    </Box>
  </Box>
);

// ── Environment Pill (in menu items & summary) ─────────────────────────────────

const EnvPill: React.FC<{ envKey: string; envLabel: string; small?: boolean }> = ({ envKey, envLabel, small }) => {
  // Guard: envLabel must always be a plain string before rendering
  const safeLabel = typeof envLabel === "string" ? envLabel : String(envLabel ?? envKey);
  const st = getEnvStyle(envKey, safeLabel);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: small ? 8 : 10, height: small ? 8 : 10, borderRadius: "50%", bgcolor: st.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: small ? "0.8rem" : "0.875rem", fontWeight: 600, color: st.color }}>
        {safeLabel}
      </Typography>
    </Box>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const DataDump: React.FC = () => {
  // Environments
  const [environments, setEnvironments]   = useState<Record<string, string>>({});
  const [envsLoading, setEnvsLoading]     = useState(true);
  const [envsError, setEnvsError]         = useState<string | null>(null);
  const [source, setSource]               = useState("");
  const [destination, setDestination]     = useState("");

  // Tables
  const [tables, setTables]               = useState<string[]>([]);
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [tableSearch, setTableSearch]     = useState("");
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tablesError, setTablesError]     = useState<string | null>(null);

  // Dump
  const [dumpStatus, setDumpStatus]       = useState<DumpStatus | null>(null);
  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [triggering, setTriggering]       = useState(false);
  const [logsExpanded, setLogsExpanded]   = useState(true);
  const [alreadyRunning, setAlreadyRunning] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean; message: string; severity: "success" | "error" | "warning";
  }>({ open: false, message: "", severity: "success" });

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // ── Polling ──────────────────────────────────────────────────────────────────

  const stopPolling = useCallback(() => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/db_dump_status/`, { headers: getAuthHeaders() });
      if (!res.ok) return;
      const raw = await res.json();
      // Normalise API field names → internal DumpStatus shape.
      // API returns: success_tables[], failed_tables[], errors{table:msg}
      const errorsMap: Record<string, string> = (raw.errors && typeof raw.errors === "object") ? raw.errors : {};
      const failedNames: string[] = Array.isArray(raw.failed_tables) ? raw.failed_tables : [];
      const data: DumpStatus = {
        state: raw.state ?? "idle",
        source: raw.source ?? "",
        destination: raw.destination ?? "",
        tables_succeeded: Array.isArray(raw.success_tables) ? raw.success_tables : [],
        tables_failed: failedNames.map((t) => ({ table: t, error: errorsMap[t] ?? "" })),
        started_at: raw.started_at ?? null,
        completed_at: raw.completed_at ?? null,
        logs: Array.isArray(raw.logs) ? raw.logs : [],
        error: raw.error ?? null,
        email_sent: raw.email_sent ?? false,
      };
      setDumpStatus(data);
      if (data.state !== "running") stopPolling();
    } catch { /* silent */ }
  }, [stopPolling]);

  const startPolling = useCallback(() => {
    stopPolling();
    pollingRef.current = setInterval(fetchStatus, 2000);
  }, [fetchStatus, stopPolling]);

  // ── Mount ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const loadEnvs = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/db_dump_environments/`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(`Could not load environments (${res.status})`);
        const raw = await res.json();
        // Normalise to a flat Record<string,string>.
        // Handles both { dev:"Development",... } and { data:{ dev:"Development",... } }
        let flat: Record<string, string> = {};
        if (raw && typeof raw === "object" && !Array.isArray(raw)) {
          const values = Object.values(raw);
          if (values.every((v) => typeof v === "string")) {
            // Already flat: { dev: "Development", ... }
            flat = raw as Record<string, string>;
          } else if (values.length > 0 && typeof values[0] === "object" && values[0] !== null) {
            // One level of nesting: { environments: { dev: "Development", ... } }
            flat = values[0] as Record<string, string>;
          }
        }
        setEnvironments(flat);
      } catch (err: any) {
        setEnvsError(err.message || "Could not load environments");
      } finally {
        setEnvsLoading(false);
      }
    };
    loadEnvs();
    fetchStatus();
    return () => stopPolling();
  }, [fetchStatus, stopPolling]);

  useEffect(() => {
    if (dumpStatus?.state === "running" && !pollingRef.current) startPolling();
  }, [dumpStatus?.state, startPolling]);

  // ── Load tables ──────────────────────────────────────────────────────────────

  const loadTables = useCallback(async (env: string) => {
    if (!env) return;
    setTablesLoading(true);
    setTablesError(null);
    setTables([]);
    setSelectedTables(new Set());
    try {
      const res = await fetch(`${apiUrl}/api/db_dump_tables/?environment=${env}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`Could not load tables (${res.status})`);
      const data = await res.json();
      setTables(Array.isArray(data) ? data : (data.tables ?? []));
    } catch (err: any) {
      setTablesError(err.message || "Could not load tables");
    } finally {
      setTablesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (source) loadTables(source);
    else { setTables([]); setSelectedTables(new Set()); setTablesError(null); }
  }, [source, loadTables]);

  // ── Auto-scroll logs ─────────────────────────────────────────────────────────

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dumpStatus?.logs]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const sameEnvError = !!(source && destination && source === destination);
  const destIsProd   = destination ? getEnvStyle(destination, environments[destination] ?? "").color === "#dc2626" : false;
  const filteredTables = tables.filter((t) => t.toLowerCase().includes(tableSearch.toLowerCase()));

  const toggleTable = (t: string) =>
    setSelectedTables((prev) => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });

  const handleConfirmDump = async () => {
    setConfirmOpen(false);
    setTriggering(true);
    setAlreadyRunning(false);
    try {
      const res = await fetch(`${apiUrl}/api/db_dump_trigger/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ source, destination, tables: Array.from(selectedTables) }),
      });
      if (res.status === 409) {
        setAlreadyRunning(true); fetchStatus(); startPolling(); return;
      }
      if (res.status === 400) {
        const d = await res.json();
        setSnackbar({ open: true, message: d.detail || "Validation error.", severity: "error" }); return;
      }
      if (res.status === 503) {
        setSnackbar({ open: true, message: `Could not connect to ${environments[source] || source} database.`, severity: "error" }); return;
      }
      if (!res.ok) throw new Error(`Trigger failed (${res.status})`);
      setDumpStatus({ state: "running", source, destination, tables_succeeded: [], tables_failed: [], started_at: null, completed_at: null, logs: [], error: null, email_sent: false });
      fetchStatus();
      startPolling();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Request failed. Check connection.", severity: "error" });
    } finally {
      setTriggering(false);
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────────

  const envOptions   = Object.entries(environments);
  const isRunning    = dumpStatus?.state === "running" || triggering;
  const showProgress = dumpStatus !== null && dumpStatus.state !== "idle";
  const canDump      = selectedTables.size > 0 && !!source && !!destination && !sameEnvError && !isRunning;

  // Step index for StepTracker (0,1,2)
  const activeStep = !source || !destination || sameEnvError ? 0
    : selectedTables.size === 0 ? 1
    : canDump ? 2
    : 2; // dump running/done = still on 2

  const stepDone = [
    !!(source && destination && !sameEnvError),
    selectedTables.size > 0,
    showProgress && (dumpStatus?.state === "success" || dumpStatus?.state === "error"),
  ];

  const srcStyle  = source      ? getEnvStyle(source,      environments[source]      ?? "") : null;
  const destStyle = destination ? getEnvStyle(destination, environments[destination] ?? "") : null;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#eef0f7", px: { xs: 2, sm: 4 }, py: { xs: 3, sm: 5 } }}>
      <Box sx={{ maxWidth: 920, mx: "auto" }}>

        {/* ── Page header ── */}
        <Box
          sx={{
            background: "linear-gradient(135deg,#1a237e 0%,#283593 60%,#3949ab 100%)",
            borderRadius: 4, p: { xs: 2.5, md: 3.5 }, mb: 3,
            boxShadow: "0 8px 32px rgba(26,35,126,0.25)",
            position: "relative", overflow: "hidden",
          }}
        >
          {/* Decorative orb */}
          <Box sx={{
            position: "absolute", top: -40, right: -40,
            width: 180, height: 180, borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }} />
          <Box sx={{
            position: "absolute", bottom: -30, left: "40%",
            width: 120, height: 120, borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }} />

          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{
                width: 48, height: 48, borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.2)",
              }}>
                <StorageIcon sx={{ color: "#fff", fontSize: 26 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.6rem" }, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                  Data Dump
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.8rem", mt: 0.4 }}>
                  Copy data safely between database environments
                </Typography>
              </Box>
            </Stack>

            {/* Live status badge */}
            {showProgress && (
              <Chip
                icon={
                  dumpStatus!.state === "running" ? (
                    <Box sx={{
                      width: 8, height: 8, borderRadius: "50%", bgcolor: "#60a5fa",
                      "@keyframes hdrPulse": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
                      animation: "hdrPulse 1.2s ease infinite", ml: 1,
                    }} />
                  ) : dumpStatus!.state === "success" ? (
                    <CheckCircleIcon sx={{ fontSize: 14, color: "#34d399 !important", ml: 0.5 }} />
                  ) : (
                    <ErrorIcon sx={{ fontSize: 14, color: "#f87171 !important", ml: 0.5 }} />
                  )
                }
                label={dumpStatus!.state === "running" ? "Running…" : dumpStatus!.state === "success" ? "Success" : "Failed"}
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontWeight: 700, fontSize: 13,
                  border: "1px solid rgba(255,255,255,0.25)",
                  backdropFilter: "blur(8px)",
                  height: 32,
                }}
              />
            )}
          </Stack>
        </Box>

        {/* ── Banners ── */}
        {alreadyRunning && (
          <Alert severity="warning" onClose={() => setAlreadyRunning(false)} sx={{ mb: 2, borderRadius: 2 }}>
            A dump is already running. See the status panel below.
          </Alert>
        )}

        {destIsProd && source && destination && !sameEnvError && (
          <Box
            sx={{
              mb: 2, p: 2, borderRadius: 2.5,
              background: "linear-gradient(135deg,#fee2e2,#fef2f2)",
              border: "1.5px solid #fca5a5",
              display: "flex", alignItems: "center", gap: 1.5,
              "@keyframes warnPulse": {
                "0%,100%": { borderColor: "#fca5a5" },
                "50%": { borderColor: "#ef4444" },
              },
              animation: "warnPulse 2s ease infinite",
            }}
          >
            <WarningAmberIcon sx={{ color: "#dc2626", fontSize: 22, flexShrink: 0 }} />
            <Typography sx={{ color: "#991b1b", fontWeight: 700, fontSize: "0.875rem" }}>
              You are about to overwrite <strong>Production</strong> data. Proceed with extreme caution.
            </Typography>
          </Box>
        )}

        {/* ── Step Tracker ── */}
        <StepTracker activeStep={activeStep} />

        {/* ── STEP 1: Environments ── */}
        <SectionCard step={1} label="Select Environments" active={activeStep === 0} done={stepDone[0]}>
          {envsLoading ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
              <Skeleton variant="rectangular" height={58} sx={{ flex: 1, borderRadius: 2 }} />
              <Skeleton variant="circular" width={36} height={36} />
              <Skeleton variant="rectangular" height={58} sx={{ flex: 1, borderRadius: 2 }} />
            </Stack>
          ) : envsError ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{envsError}</Alert>
          ) : (
            <>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
                {/* Source */}
                <FormControl fullWidth>
                  <InputLabel sx={{ fontWeight: 600 }}>Source Environment</InputLabel>
                  <Select
                    value={source}
                    label="Source Environment"
                    onChange={(e) => setSource(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      ...(srcStyle && {
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: srcStyle.border, borderWidth: 1.5 },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: srcStyle.color },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: srcStyle.color },
                      }),
                    }}
                    renderValue={(val) => {
                      if (!val) return <span />;
                      const lbl = environments[val];
                      return <EnvPill envKey={val} envLabel={typeof lbl === "string" ? lbl : val} />;
                    }}
                  >
                    {envOptions.map(([key, label]) => (
                      <MenuItem key={key} value={key} sx={{ gap: 1.5, py: 1.2 }}>
                        <EnvPill envKey={key} envLabel={typeof label === "string" ? label : key} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Arrow */}
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
                  <Box sx={{
                    width: 40, height: 40, borderRadius: "50%",
                    bgcolor: source && destination && !sameEnvError ? "#1a237e" : "#f3f4f6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s ease",
                    boxShadow: source && destination && !sameEnvError ? "0 4px 12px rgba(26,35,126,0.3)" : "none",
                  }}>
                    <ArrowForwardIcon sx={{
                      color: source && destination && !sameEnvError ? "#fff" : "#9ca3af",
                      fontSize: 20, transition: "color 0.3s",
                    }} />
                  </Box>
                </Box>

                {/* Destination */}
                <FormControl fullWidth>
                  <InputLabel sx={{ fontWeight: 600 }}>Destination Environment</InputLabel>
                  <Select
                    value={destination}
                    label="Destination Environment"
                    onChange={(e) => setDestination(e.target.value)}
                    sx={{
                      borderRadius: 2,
                      ...(destStyle && {
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: destStyle.border, borderWidth: 1.5 },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: destStyle.color },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: destStyle.color },
                      }),
                    }}
                    renderValue={(val) => {
                      if (!val) return <span />;
                      const lbl = environments[val];
                      return <EnvPill envKey={val} envLabel={typeof lbl === "string" ? lbl : val} />;
                    }}
                  >
                    {envOptions.map(([key, label]) => (
                      <MenuItem key={key} value={key} sx={{ gap: 1.5, py: 1.2 }}>
                        <EnvPill envKey={key} envLabel={typeof label === "string" ? label : key} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {/* Validation: same env */}
              {sameEnvError && (
                <Box sx={{
                  mt: 2, p: 1.5, borderRadius: 2,
                  bgcolor: "#fef2f2", border: "1px solid #fecaca",
                  display: "flex", alignItems: "center", gap: 1,
                }}>
                  <ErrorIcon sx={{ color: "#dc2626", fontSize: 18 }} />
                  <Typography sx={{ color: "#dc2626", fontSize: "0.825rem", fontWeight: 600 }}>
                    Source and destination cannot be the same environment.
                  </Typography>
                </Box>
              )}

              {/* Selected summary pills */}
              {source && destination && !sameEnvError && (
                <Box
                  sx={{
                    mt: 2, p: 1.5, borderRadius: 2,
                    bgcolor: "#f0f4ff", border: "1px solid #c7d2fe",
                    display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap",
                    "@keyframes summaryFade": { from: { opacity: 0, transform: "translateY(4px)" }, to: { opacity: 1, transform: "translateY(0)" } },
                    animation: "summaryFade 0.3s ease",
                  }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 16, color: "#3949ab" }} />
                  <Typography sx={{ fontSize: "0.8rem", color: "#3949ab", fontWeight: 600 }}>
                    Data will be copied from
                  </Typography>
                  <Chip label={environments[source] || source} size="small"
                    sx={{ bgcolor: srcStyle?.bg, color: srcStyle?.color, fontWeight: 700, fontSize: 11, height: 22, border: `1px solid ${srcStyle?.border}` }} />
                  <Typography sx={{ fontSize: "0.8rem", color: "#3949ab", fontWeight: 600 }}>→</Typography>
                  <Chip label={environments[destination] || destination} size="small"
                    sx={{ bgcolor: destStyle?.bg, color: destStyle?.color, fontWeight: 700, fontSize: 11, height: 22, border: `1px solid ${destStyle?.border}` }} />
                  <Typography sx={{ fontSize: "0.8rem", color: "#3949ab", fontWeight: 600 }}>
                    (destination tables will be TRUNCATED)
                  </Typography>
                </Box>
              )}
            </>
          )}
        </SectionCard>

        {/* ── STEP 2: Tables ── */}
        <Collapse in={!!(source && destination && !sameEnvError)} timeout={350}>
          <SectionCard
            step={2} label="Select Tables"
            active={activeStep === 1}
            done={stepDone[1]}
            badge={
              selectedTables.size > 0 ? (
                <Chip
                  label={`${selectedTables.size} of ${tables.length} selected`}
                  size="small"
                  sx={{
                    bgcolor: "#e8eaf6", color: "#1a237e", fontWeight: 700,
                    fontSize: 12, height: 22, borderRadius: "6px",
                    border: "1px solid #c5cae9",
                  }}
                />
              ) : undefined
            }
          >
            {tablesLoading ? (
              <Box>
                <Skeleton variant="rectangular" height={44} sx={{ mb: 1.5, borderRadius: 2 }} />
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={38}
                    sx={{ mb: 0.5, borderRadius: 1.5, opacity: 1 - i * 0.1 }} />
                ))}
              </Box>
            ) : tablesError ? (
              <Box sx={{
                textAlign: "center", py: 6,
                border: "1.5px dashed #fca5a5", borderRadius: 2,
                bgcolor: "#fff5f5",
              }}>
                <ErrorIcon sx={{ color: "#dc2626", fontSize: 44, mb: 1 }} />
                <Typography sx={{ color: "#374151", mb: 2.5, fontWeight: 500 }}>{tablesError}</Typography>
                <Button
                  startIcon={<RefreshIcon />} variant="outlined"
                  onClick={() => loadTables(source)}
                  sx={{ textTransform: "none", borderRadius: 2, borderColor: "#1a237e", color: "#1a237e", fontWeight: 600 }}
                >
                  Retry
                </Button>
              </Box>
            ) : (
              <>
                {/* Toolbar */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} mb={1.5} alignItems={{ sm: "center" }}>
                  <TextField
                    size="small" placeholder="Search tables…"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} /></InputAdornment>,
                      sx: { borderRadius: 2, bgcolor: "#fafafa" },
                    }}
                  />
                  <Stack direction="row" spacing={1} flexShrink={0}>
                    <Button size="small" variant="outlined"
                      onClick={() => setSelectedTables(new Set(filteredTables))}
                      sx={{ textTransform: "none", borderRadius: 2, borderColor: "#c7d2fe", color: "#1a237e", fontWeight: 600, whiteSpace: "nowrap", fontSize: "0.78rem" }}
                    >
                      Select All
                    </Button>
                    <Button size="small" variant="outlined"
                      onClick={() => setSelectedTables(new Set())}
                      sx={{ textTransform: "none", borderRadius: 2, borderColor: "#e5e7eb", color: "#6b7280", fontWeight: 600, whiteSpace: "nowrap", fontSize: "0.78rem" }}
                    >
                      Clear
                    </Button>
                  </Stack>
                </Stack>

                {/* Validation: no selection */}
                {!tablesLoading && tables.length > 0 && selectedTables.size === 0 && (
                  <Box sx={{
                    mb: 1.5, px: 1.5, py: 1, borderRadius: 1.5,
                    bgcolor: "#fffbeb", border: "1px solid #fde68a",
                    display: "flex", alignItems: "center", gap: 1,
                  }}>
                    <WarningAmberIcon sx={{ color: "#d97706", fontSize: 15 }} />
                    <Typography sx={{ color: "#92400e", fontSize: "0.78rem", fontWeight: 600 }}>
                      Select at least one table to proceed.
                    </Typography>
                  </Box>
                )}

                {/* Table list */}
                <Box sx={{
                  maxHeight: 400, overflowY: "auto",
                  border: "1.5px solid #e5e7eb", borderRadius: 2,
                  "&::-webkit-scrollbar": { width: 6 },
                  "&::-webkit-scrollbar-thumb": { bgcolor: "#c7d2fe", borderRadius: 3 },
                }}>
                  {filteredTables.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 5 }}>
                      <TableChartIcon sx={{ color: "#c7d2fe", fontSize: 36, mb: 1 }} />
                      <Typography sx={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                        {tableSearch ? "No tables match your search." : "No tables available."}
                      </Typography>
                    </Box>
                  ) : (
                    filteredTables.map((t, idx) => {
                      const checked = selectedTables.has(t);
                      return (
                        <Box
                          key={t}
                          onClick={() => toggleTable(t)}
                          sx={{
                            display: "flex", alignItems: "center", gap: 1.5,
                            px: 2, py: 0.9, cursor: "pointer",
                            borderBottom: "1px solid #f3f4f6",
                            borderLeft: `3px solid ${checked ? "#1a237e" : "transparent"}`,
                            bgcolor: checked ? "#f0f4ff" : "transparent",
                            "&:hover": { bgcolor: checked ? "#e8edf8" : "#f9fafb" },
                            "&:last-child": { borderBottom: "none" },
                            transition: "all 0.15s ease",
                            "@keyframes rowSlide": {
                              from: { opacity: 0, transform: "translateX(-8px)" },
                              to:   { opacity: 1, transform: "translateX(0)" },
                            },
                            animation: `rowSlide 0.2s ease both`,
                            animationDelay: `${Math.min(idx * 0.025, 0.4)}s`,
                          }}
                        >
                          <Checkbox
                            checked={checked} size="small"
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleTable(t)}
                            sx={{ p: 0, color: "#c7d2fe", "&.Mui-checked": { color: "#1a237e" } }}
                          />
                          <TableChartIcon sx={{ fontSize: 14, color: checked ? "#1a237e" : "#9ca3af", transition: "color 0.15s" }} />
                          <Typography sx={{
                            fontSize: "0.85rem", fontFamily: "monospace",
                            color: checked ? "#1a237e" : "#374151",
                            fontWeight: checked ? 600 : 400,
                            transition: "all 0.15s",
                          }}>
                            {t}
                          </Typography>
                          {checked && (
                            <Chip label="✓" size="small"
                              sx={{ ml: "auto", height: 18, bgcolor: "#e8eaf6", color: "#1a237e", fontWeight: 700, fontSize: 10 }} />
                          )}
                        </Box>
                      );
                    })
                  )}
                </Box>
              </>
            )}
          </SectionCard>
        </Collapse>

        {/* ── STEP 3: Dump Button ── */}
        <Collapse in={!!(source && destination && !sameEnvError && !tablesLoading && tables.length > 0)} timeout={350}>
          <SectionCard step={3} label="Run Dump" active={activeStep === 2} done={stepDone[2]}>
            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} spacing={2}>
              <Tooltip
                title={
                  selectedTables.size === 0
                    ? "Select at least one table first"
                    : isRunning
                    ? "A dump is already running"
                    : ""
                }
                disableHoverListener={canDump}
              >
                <span>
                  <Button
                    variant="contained"
                    disabled={!canDump}
                    onClick={() => setConfirmOpen(true)}
                    startIcon={triggering ? <CircularProgress size={16} sx={{ color: "rgba(255,255,255,0.7)" }} /> : undefined}
                    sx={{
                      fontWeight: 700, px: 5, py: 1.4,
                      borderRadius: 2.5, textTransform: "none",
                      fontSize: "0.95rem", boxShadow: "none",
                      background: canDump
                        ? (destIsProd
                          ? "linear-gradient(135deg,#dc2626,#b91c1c)"
                          : "linear-gradient(135deg,#1a237e,#3949ab)")
                        : "#e5e7eb",
                      color: canDump ? "#fff" : "#9ca3af",
                      transition: "all 0.3s ease",
                      ...(canDump && {
                        "@keyframes dumpGlow": {
                          "0%,100%": { boxShadow: destIsProd ? "0 0 0 0 rgba(220,38,38,0)" : "0 0 0 0 rgba(26,35,126,0)" },
                          "50%": { boxShadow: destIsProd ? "0 0 20px 4px rgba(220,38,38,0.35)" : "0 0 20px 4px rgba(26,35,126,0.3)" },
                        },
                        animation: "dumpGlow 2.5s ease infinite",
                        "&:hover": {
                          background: destIsProd ? "linear-gradient(135deg,#b91c1c,#991b1b)" : "linear-gradient(135deg,#283593,#1a237e)",
                          boxShadow: destIsProd ? "0 6px 20px rgba(220,38,38,0.4)" : "0 6px 20px rgba(26,35,126,0.4)",
                          transform: "translateY(-1px)",
                        },
                      }),
                    }}
                  >
                    {triggering ? "Triggering…" : isRunning ? "Dump in Progress…" : "Dump Data"}
                  </Button>
                </span>
              </Tooltip>

              {/* Selection summary */}
              {selectedTables.size > 0 && !isRunning && (
                <Box sx={{
                  display: "flex", alignItems: "center", gap: 1,
                  "@keyframes selFade": { from: { opacity: 0 }, to: { opacity: 1 } },
                  animation: "selFade 0.3s ease",
                }}>
                  <CheckCircleIcon sx={{ fontSize: 16, color: "#059669" }} />
                  <Typography sx={{ color: "#374151", fontSize: "0.85rem", fontWeight: 500 }}>
                    <strong style={{ color: "#1a237e" }}>{selectedTables.size}</strong> table{selectedTables.size !== 1 ? "s" : ""} ready to dump
                    {destIsProd && <span style={{ color: "#dc2626", fontWeight: 700 }}> to Production</span>}
                  </Typography>
                </Box>
              )}
            </Stack>
          </SectionCard>
        </Collapse>

        {/* ── Progress / Status Panel ── */}
        {showProgress && (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3, mb: 3, overflow: "hidden",
              border: `1.5px solid ${
                dumpStatus!.state === "running" ? "#c7d2fe"
                : dumpStatus!.state === "success" ? "#bbf7d0"
                : "#fecaca"
              }`,
              boxShadow: `0 4px 24px ${
                dumpStatus!.state === "running" ? "rgba(26,35,126,0.10)"
                : dumpStatus!.state === "success" ? "rgba(5,150,105,0.10)"
                : "rgba(220,38,38,0.10)"
              }`,
              "@keyframes panelIn": { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } },
              animation: "panelIn 0.4s ease",
            }}
          >
            {/* Progress bar header */}
            <Box sx={{
              height: 5,
              background: dumpStatus!.state === "running"
                ? "linear-gradient(90deg,#1a237e,#3949ab)"
                : dumpStatus!.state === "success"
                ? "linear-gradient(90deg,#059669,#34d399)"
                : "linear-gradient(90deg,#dc2626,#ef4444)",
              ...(dumpStatus!.state === "running" && {
                "@keyframes barSlide": {
                  "0%":   { backgroundPosition: "0% 50%" },
                  "100%": { backgroundPosition: "200% 50%" },
                },
                backgroundSize: "200% 100%",
                animation: "barSlide 2s linear infinite",
              }),
            }} />

            <Box sx={{ p: 3 }}>
              {/* Running */}
              {dumpStatus!.state === "running" && (
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <CircularProgress size={22} sx={{ color: "#1a237e", flexShrink: 0 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: "#1a237e", fontSize: "1rem" }}>
                      Dump in progress…
                    </Typography>
                    <Typography sx={{ color: "#6b7280", fontSize: "0.78rem", mt: 0.3 }}>
                      {environments[dumpStatus!.source] || dumpStatus!.source}
                      {" → "}
                      {environments[dumpStatus!.destination] || dumpStatus!.destination}
                    </Typography>
                  </Box>
                </Stack>
              )}

              {/* Success */}
              {dumpStatus!.state === "success" && (
                <SuccessPanel status={dumpStatus!} environments={environments} onDumpAgain={() => { setDumpStatus(null); setSelectedTables(new Set()); stopPolling(); }} />
              )}

              {/* Error */}
              {dumpStatus!.state === "error" && (
                <ErrorResultPanel status={dumpStatus!} onDumpAgain={() => { setDumpStatus(null); setSelectedTables(new Set()); stopPolling(); }} />
              )}
            </Box>
          </Paper>
        )}

        {/* ── Live Logs ── */}
        {showProgress && dumpStatus!.state === "running" && (
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #374151", borderRadius: 3,
              overflow: "hidden", mb: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            {/* Terminal bar */}
            <Box
              onClick={() => setLogsExpanded((v) => !v)}
              sx={{
                bgcolor: "#1f2937", px: 2.5, py: 1.1,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", "&:hover": { bgcolor: "#111827" }, userSelect: "none",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                {["#ef4444", "#f59e0b", "#10b981"].map((c) => (
                  <Box key={c} sx={{ width: 11, height: 11, borderRadius: "50%", bgcolor: c }} />
                ))}
                <Typography sx={{ ml: 1, fontSize: 12, color: "#9ca3af", fontFamily: "monospace", fontWeight: 600 }}>
                  dump.log
                </Typography>
                <Box sx={{
                  width: 6, height: 6, borderRadius: "50%", bgcolor: "#10b981", ml: 1,
                  "@keyframes logDot": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.2 } },
                  animation: "logDot 1s ease infinite",
                }} />
              </Stack>
              {logsExpanded
                ? <ExpandLessIcon sx={{ color: "#6b7280", fontSize: 18 }} />
                : <ExpandMoreIcon sx={{ color: "#6b7280", fontSize: 18 }} />
              }
            </Box>

            <Collapse in={logsExpanded}>
              <Box sx={{
                bgcolor: "#0d1117", px: 3, py: 2.5,
                minHeight: 160, maxHeight: 320, overflowY: "auto",
                fontFamily: '"JetBrains Mono","Fira Code","Courier New",monospace',
                fontSize: 12.5, lineHeight: 1.8,
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-track": { bgcolor: "#1f2937" },
                "&::-webkit-scrollbar-thumb": { bgcolor: "#374151", borderRadius: 3 },
              }}>
                {!dumpStatus?.logs?.length ? (
                  <Typography sx={{ color: "#4b5563", fontFamily: "inherit", fontSize: "inherit" }}>
                    Waiting for logs…
                  </Typography>
                ) : (
                  dumpStatus!.logs.map((line, i) => (
                    <Box key={i} sx={{
                      display: "flex", gap: 1.5,
                      "@keyframes logLine": { from: { opacity: 0, x: -6 }, to: { opacity: 1, x: 0 } },
                      animation: "logLine 0.2s ease",
                    }}>
                      <Typography component="span" sx={{ color: "#10b981", fontFamily: "inherit", fontSize: "inherit", flexShrink: 0 }}>●</Typography>
                      <Typography component="span" sx={{ color: "#d1d5db", fontFamily: "inherit", fontSize: "inherit", wordBreak: "break-all" }}>
                        {line}
                      </Typography>
                    </Box>
                  ))
                )}
                <div ref={logsEndRef} />
              </Box>
            </Collapse>
          </Paper>
        )}
      </Box>

      {/* ── Confirmation Modal ── */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4, overflow: "hidden",
            border: "1.5px solid #e5e7eb",
            boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
          },
        }}
      >
        {/* Modal accent bar */}
        <Box sx={{
          height: 5,
          background: destIsProd
            ? "linear-gradient(90deg,#dc2626,#ef4444)"
            : "linear-gradient(90deg,#1a237e,#3949ab)",
        }} />

        <DialogTitle sx={{ pt: 2.5, pb: 1, fontWeight: 800, color: "#111827", display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: 2,
            bgcolor: destIsProd ? "#fee2e2" : "#e8eaf6",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <WarningAmberIcon sx={{ color: destIsProd ? "#dc2626" : "#1a237e", fontSize: 22 }} />
          </Box>
          Confirm Data Dump
        </DialogTitle>

        <DialogContent sx={{ pt: 0 }}>
          <Divider sx={{ mb: 2.5 }} />

          {/* Summary */}
          <Box sx={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: "8px 16px", mb: 2.5 }}>
            <Typography sx={{ color: "#6b7280", fontSize: "0.82rem", fontWeight: 600, pt: 0.25 }}>Source:</Typography>
            <Box><EnvPill envKey={source} envLabel={typeof environments[source] === "string" ? environments[source] : source} /></Box>

            <Typography sx={{ color: "#6b7280", fontSize: "0.82rem", fontWeight: 600, pt: 0.25 }}>Destination:</Typography>
            <Box><EnvPill envKey={destination} envLabel={typeof environments[destination] === "string" ? environments[destination] : destination} /></Box>

            <Typography sx={{ color: "#6b7280", fontSize: "0.82rem", fontWeight: 600, pt: 0.25 }}>Tables:</Typography>
            <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "0.875rem" }}>{selectedTables.size} selected</Typography>
          </Box>

          {/* Selected tables */}
          <Box sx={{
            bgcolor: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: 2, p: 2, mb: 2.5,
            maxHeight: 180, overflowY: "auto",
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "#c7d2fe", borderRadius: 2 },
          }}>
            {Array.from(selectedTables).map((t) => (
              <Box key={t} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.3 }}>
                <TableChartIcon sx={{ fontSize: 12, color: "#9ca3af" }} />
                <Typography sx={{ fontSize: "0.78rem", fontFamily: "monospace", color: "#374151" }}>{t}</Typography>
              </Box>
            ))}
          </Box>

          {/* Warning */}
          <Box sx={{ p: 1.5, bgcolor: "#fffbeb", border: "1px solid #fde68a", borderRadius: 2, mb: destIsProd ? 1.5 : 0 }}>
            <Typography sx={{ color: "#92400e", fontSize: "0.82rem", fontWeight: 600 }}>
              ⚠ This will <strong>TRUNCATE</strong> all destination tables and replace with source data.
            </Typography>
          </Box>

          {destIsProd && (
            <Box sx={{
              p: 1.5, borderRadius: 2,
              background: "linear-gradient(135deg,#fee2e2,#fef2f2)",
              border: "1.5px solid #fca5a5",
            }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LockIcon sx={{ color: "#dc2626", fontSize: 18 }} />
                <Typography sx={{ color: "#991b1b", fontWeight: 800, fontSize: "0.85rem" }}>
                  This will overwrite PRODUCTION data! This action cannot be undone.
                </Typography>
              </Stack>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            sx={{ textTransform: "none", borderRadius: 2, color: "#374151", fontWeight: 600, px: 2.5 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDump}
            sx={{
              textTransform: "none", fontWeight: 700, borderRadius: 2.5,
              boxShadow: "none", px: 3.5, py: 1.1,
              background: destIsProd
                ? "linear-gradient(135deg,#dc2626,#b91c1c)"
                : "linear-gradient(135deg,#1a237e,#3949ab)",
              "&:hover": {
                background: destIsProd ? "linear-gradient(135deg,#b91c1c,#991b1b)" : "linear-gradient(135deg,#283593,#1a237e)",
                boxShadow: destIsProd ? "0 4px 16px rgba(220,38,38,0.4)" : "0 4px 16px rgba(26,35,126,0.4)",
              },
            }}
          >
            {destIsProd ? "Yes, Overwrite Production" : "Yes, Dump it"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 3, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// ── Success Panel ──────────────────────────────────────────────────────────────

const SuccessPanel: React.FC<{
  status: DumpStatus;
  environments: Record<string, string>;
  onDumpAgain: () => void;
}> = ({ status, environments, onDumpAgain }) => (
  <Box>
    <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
      <Box sx={{
        width: 44, height: 44, borderRadius: "50%",
        background: "linear-gradient(135deg,#059669,#34d399)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 16px rgba(5,150,105,0.35)",
        "@keyframes successPop": { "0%": { transform: "scale(0)" }, "70%": { transform: "scale(1.2)" }, "100%": { transform: "scale(1)" } },
        animation: "successPop 0.5s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <CheckIcon sx={{ color: "#fff", fontSize: 24 }} />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 800, color: "#059669", fontSize: "1.1rem" }}>Dump Completed</Typography>
        <Typography sx={{ color: "#6b7280", fontSize: "0.78rem" }}>
          {environments[status.source] || status.source} → {environments[status.destination] || status.destination}
        </Typography>
      </Box>
    </Stack>

    {/* Stats row */}
    <Stack direction="row" spacing={2} mb={2.5} flexWrap="wrap">
      <Box sx={{ px: 2, py: 1.2, bgcolor: "#ecfdf5", border: "1px solid #bbf7d0", borderRadius: 2 }}>
        <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "#059669", lineHeight: 1 }}>{status.tables_succeeded.length}</Typography>
        <Typography sx={{ fontSize: "0.72rem", color: "#064e3b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Succeeded</Typography>
      </Box>
      {status.tables_failed.length > 0 && (
        <Box sx={{ px: 2, py: 1.2, bgcolor: "#fee2e2", border: "1px solid #fecaca", borderRadius: 2 }}>
          <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "#dc2626", lineHeight: 1 }}>{status.tables_failed.length}</Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "#7f1d1d", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Failed</Typography>
        </Box>
      )}
    </Stack>

    {/* Timing */}
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 2 }}>
      {status.started_at && <TimeField label="Started" value={status.started_at} />}
      {status.completed_at && <TimeField label="Completed" value={status.completed_at} />}
    </Box>

    {/* Email notice */}
    {status.email_sent && (
      <Stack direction="row" alignItems="center" spacing={0.75} mb={2}>
        <EmailIcon sx={{ fontSize: 15, color: "#6b7280" }} />
        <Typography sx={{ fontSize: "0.78rem", color: "#6b7280" }}>
          Email notification sent to ranjith &amp; charan
        </Typography>
      </Stack>
    )}

    {/* Table lists */}
    {status.tables_succeeded.length > 0 && (
      <TableResultList title="Succeeded" items={status.tables_succeeded.map((t) => ({ table: t, error: "" }))} success />
    )}
    {status.tables_failed.length > 0 && (
      <TableResultList title="Failed" items={status.tables_failed} success={false} />
    )}

    <Button
      variant="outlined" startIcon={<ReplayIcon />} onClick={onDumpAgain}
      sx={{ mt: 1, textTransform: "none", borderRadius: 2, borderColor: "#1a237e", color: "#1a237e", fontWeight: 600 }}
    >
      Dump Again
    </Button>
  </Box>
);

// ── Error Result Panel ─────────────────────────────────────────────────────────

const ErrorResultPanel: React.FC<{ status: DumpStatus; onDumpAgain: () => void }> = ({ status, onDumpAgain }) => (
  <Box>
    <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
      <Box sx={{
        width: 44, height: 44, borderRadius: "50%",
        background: "linear-gradient(135deg,#dc2626,#ef4444)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 16px rgba(220,38,38,0.3)",
      }}>
        <ErrorIcon sx={{ color: "#fff", fontSize: 24 }} />
      </Box>
      <Typography sx={{ fontWeight: 800, color: "#dc2626", fontSize: "1.1rem" }}>Dump Failed</Typography>
    </Stack>

    {status.error && <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>{status.error}</Alert>}

    {status.tables_succeeded.length > 0 && (
      <TableResultList title="Succeeded" items={status.tables_succeeded.map((t) => ({ table: t, error: "" }))} success />
    )}
    {status.tables_failed.length > 0 && (
      <TableResultList title="Failed" items={status.tables_failed} success={false} />
    )}

    <Button
      variant="outlined" startIcon={<ReplayIcon />} onClick={onDumpAgain}
      sx={{ mt: 1, textTransform: "none", borderRadius: 2, borderColor: "#1a237e", color: "#1a237e", fontWeight: 600 }}
    >
      Dump Again
    </Button>
  </Box>
);

// ── Small helpers ──────────────────────────────────────────────────────────────

const TableResultList: React.FC<{ title: string; items: { table: string; error: string }[]; success: boolean }> = ({ title, items, success }) => (
  <Box mb={1.5}>
    <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: success ? "#059669" : "#dc2626", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {title} ({items.length})
    </Typography>
    {items.map((item) => (
      <Box key={item.table} sx={{ mb: success ? 0.25 : 0.75 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {success
            ? <CheckCircleIcon sx={{ fontSize: 13, color: "#059669", flexShrink: 0 }} />
            : <ErrorIcon sx={{ fontSize: 13, color: "#dc2626", flexShrink: 0 }} />
          }
          <Typography sx={{ fontSize: "0.8rem", fontFamily: "monospace", color: "#111827" }}>{item.table}</Typography>
        </Box>
        {!success && item.error && (
          <Typography sx={{ fontSize: "0.74rem", color: "#dc2626", ml: 2.5, mt: 0.2 }}>{item.error}</Typography>
        )}
      </Box>
    ))}
  </Box>
);

const TimeField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ bgcolor: "#f8fafc", borderRadius: 1.5, px: 1.5, py: 1 }}>
    <Typography sx={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</Typography>
    <Typography sx={{ fontSize: "0.8rem", color: "#111827", fontWeight: 600, mt: 0.25 }}>{value}</Typography>
  </Box>
);

export default DataDump;
