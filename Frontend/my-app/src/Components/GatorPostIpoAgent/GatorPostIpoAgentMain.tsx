import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import BlockRenderer, { GatorBlock } from "./BlockRenderer";
import RunTickerDialog from "./RunTickerDialog";

interface SavedRecord {
  id: number;
  ticker: string;
  company_name: string | null;
  headline: string | null;
  json_data: GatorBlock[];
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  records: SavedRecord[];
}

type SortField = "ticker" | "company_name" | "score" | "sentiment" | "updated_at";

/* ── Derive score + sentiment from the first "gauge" card (typically the first card) ── */
const deriveMetaFromBlocks = (blocks: GatorBlock[] = []) => {
  let score: number | null = null;
  let sentiment = "";
  let horizon = "";
  let confidence = "";
  let crowding = "";

  for (const b of blocks) {
    if (b.type === "card" && typeof b.title === "string") {
      const titleLower = b.title.toLowerCase();
      if (score === null && /score/.test(titleLower)) {
        const m = b.title.match(/([+\-]?\d+(?:\.\d+)?)/);
        if (m) score = parseFloat(m[1]);
        sentiment = (b.subtitle || "").trim();
      } else if (!horizon && /horizon/.test(titleLower)) {
        horizon = `${b.title}${b.subtitle ? " · " + b.subtitle : ""}`;
      } else if (!confidence && /confidence/.test(titleLower)) {
        confidence = b.subtitle || b.title;
      } else if (!crowding && /crowd/.test(titleLower)) {
        crowding = b.subtitle || b.title;
      }
    }
  }
  return { score, sentiment, horizon, confidence, crowding };
};

const getScoreColor = (s: number | null) => {
  if (s === null) return "#64748b";
  if (s >= 50) return "#047857";
  if (s >= 20) return "#0891b2";
  if (s >= -20) return "#b45309";
  return "#b91c1c";
};
const getScoreBg = (s: number | null) => {
  if (s === null) return "#f1f5f9";
  if (s >= 50) return "#ecfdf5";
  if (s >= 20) return "#ecfeff";
  if (s >= -20) return "#fffbeb";
  return "#fef2f2";
};

const getSentimentConfig = (sentiment: string) => {
  const s = sentiment.toLowerCase();
  if (/bullish|strong|positive|favorable/.test(s))
    return { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" };
  if (/bearish|weak|negative|cautious/.test(s))
    return { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" };
  if (/neutral|moderate|mixed/.test(s))
    return { bg: "#fffbeb", color: "#b45309", border: "#fde68a" };
  return { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
};

const thStyle = {
  fontWeight: 700,
  fontSize: "0.8rem",
  color: "#002060",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  py: 2,
  px: 2,
  fontFamily: "'Inter', 'Roboto', sans-serif",
};
const tdStyle = {
  fontSize: "0.85rem",
  color: "#000000",
  py: 2,
  px: 2,
  fontWeight: 500,
  fontFamily: "'Inter', 'Roboto', sans-serif",
};

const GatorPostIpoAgentMain: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Run-Ticker dialog state
  const [runDialogOpen, setRunDialogOpen] = useState(false);
  const [autoRunTicker, setAutoRunTicker] = useState<string | undefined>(undefined);
  // Per-row refresh state: ticker → true while that row's refresh is in flight
  const [rowRefreshing, setRowRefreshing] = useState<Record<string, boolean>>({});

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/gator_post_ipo/list/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data: ApiResponse = await res.json();
      setRecords(data.records || []);
    } catch {
      setRecords([]);
      setSnackbar({
        open: true,
        message: "Failed to load Gator Post-IPO records",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const enriched = useMemo(
    () =>
      records.map((r) => {
        const meta = deriveMetaFromBlocks(r.json_data || []);
        return { ...r, ...meta };
      }),
    [records],
  );

  const counts = useMemo(() => {
    const c = { ALL: enriched.length, BULLISH: 0, NEUTRAL: 0, BEARISH: 0 };
    enriched.forEach((r) => {
      const s = (r.sentiment || "").toLowerCase();
      if (/bullish|strong|positive|favorable/.test(s)) c.BULLISH++;
      else if (/bearish|weak|negative|cautious/.test(s)) c.BEARISH++;
      else c.NEUTRAL++;
    });
    return c;
  }, [enriched]);

  const visible = useMemo(() => {
    let list = [...enriched];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.ticker.toLowerCase().includes(q) ||
          (r.company_name || "").toLowerCase().includes(q) ||
          (r.headline || "").toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => {
      let av: any;
      let bv: any;
      if (sortField === "ticker") {
        av = a.ticker.toLowerCase();
        bv = b.ticker.toLowerCase();
      } else if (sortField === "company_name") {
        av = (a.company_name || "").toLowerCase();
        bv = (b.company_name || "").toLowerCase();
      } else if (sortField === "score") {
        av = a.score ?? -Infinity;
        bv = b.score ?? -Infinity;
      } else if (sortField === "sentiment") {
        av = (a.sentiment || "").toLowerCase();
        bv = (b.sentiment || "").toLowerCase();
      } else {
        av = new Date(a.updated_at).getTime();
        bv = new Date(b.updated_at).getTime();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [enriched, search, sortField, sortDir]);

  const handleSort = (f: SortField) => {
    if (sortField === f) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(f);
      setSortDir("desc");
    }
  };

  const handleDelete = async (id: number, ticker: string) => {
    if (!window.confirm(`Delete ${ticker} Post-IPO record? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${apiUrl}/api/gator_post_ipo/${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) throw new Error("Delete failed");
      setSnackbar({
        open: true,
        message: `${ticker} deleted successfully`,
        severity: "success",
      });
      fetchRecords();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to delete",
        severity: "error",
      });
    }
  };

  /**
   * Kick off a Gator POST IPO sync for a single ticker and poll until it
   * completes. Updates `rowRefreshing[ticker]` so the row shows a spinner.
   */
  const refreshSingleTicker = useCallback(
    async (ticker: string) => {
      if (!ticker) return;
      setRowRefreshing((prev) => ({ ...prev, [ticker]: true }));
      const tokenNow = localStorage.getItem("access_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(tokenNow ? { Authorization: `Bearer ${tokenNow}` } : {}),
      };
      try {
        const startRes = await fetch(`${apiUrl}/api/gator_post_ipo/run/`, {
          method: "POST",
          headers,
          body: JSON.stringify({ ticker }),
        });
        const startData = await startRes.json();
        if (!startRes.ok) throw new Error(startData.error || "Failed to start run");

        const taskId = startData.task_id as string;
        const deadline = Date.now() + 8 * 60 * 1000; // 8-min ceiling

        // Poll every 3s until ready / deadline
        while (Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, 3000));
          const statusRes = await fetch(
            `${apiUrl}/api/gator_post_ipo/run-status/${taskId}/?ticker=${encodeURIComponent(ticker)}`,
            { headers },
          );
          const statusData = await statusRes.json();
          if (!statusRes.ok) throw new Error(statusData.error || "Status poll failed");
          if (statusData.ready) {
            if (statusData.successful) {
              setSnackbar({
                open: true,
                message: `${ticker} report refreshed`,
                severity: "success",
              });
              await fetchRecords();
            } else {
              throw new Error(statusData.error || "Task failed");
            }
            return;
          }
        }
        throw new Error("Timed out waiting for task to finish");
      } catch (err: any) {
        setSnackbar({
          open: true,
          message: `${ticker}: ${err.message || "Refresh failed"}`,
          severity: "error",
        });
      } finally {
        setRowRefreshing((prev) => {
          const next = { ...prev };
          delete next[ticker];
          return next;
        });
      }
    },
    [apiUrl, fetchRecords],
  );

  const handleDialogRunComplete = useCallback(
    (ticker: string) => {
      setSnackbar({
        open: true,
        message: `${ticker} report refreshed`,
        severity: "success",
      });
      fetchRecords();
    },
    [fetchRecords],
  );

  const PX = { xs: 2, sm: 3, md: 5, lg: 8 };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <CircularProgress sx={{ color: "#0891b2" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f0f4f8" }}>
      {/* ═══ HEADER ═══ */}
      <Box
        sx={{
          background:
            "linear-gradient(160deg,#0f2d4a 0%,#0e5a80 50%,#0891b2 100%)",
          pb: 5,
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: "auto", px: PX }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              pt: 3,
              mb: 3,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  letterSpacing: -1,
                  fontFamily: "'Inter', 'Roboto', sans-serif",
                  textShadow: "0 2px 20px rgba(0,0,0,0.25)",
                }}
              >
                Gator POST IPO
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.82rem",
                  mt: 0.8,
                  fontWeight: 400,
                }}
              >
                Post-IPO performance signal reports — Ritter framework, Day 1–40 horizon.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                startIcon={<PlayArrowOutlinedIcon />}
                onClick={() => {
                  setAutoRunTicker(undefined);
                  setRunDialogOpen(true);
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  px: 3,
                  py: 1.1,
                  borderRadius: 2.5,
                  background: "#ffffff",
                  color: "#0891b2",
                  border: "1px solid rgba(255,255,255,0.3)",
                  boxShadow: "0 4px 12px rgba(8,145,178,0.2)",
                  "&:hover": { background: "#f0fdff" },
                }}
              >
                Run Ticker
              </Button>
              <Button
                variant="contained"
                startIcon={<CloudUploadOutlinedIcon />}
                onClick={() => navigate("/gator_post_ipo/upload")}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  px: 3,
                  py: 1.1,
                  borderRadius: 2.5,
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  backdropFilter: "blur(8px)",
                  "&:hover": { background: "rgba(255,255,255,0.25)" },
                }}
              >
                Upload JSON
              </Button>
            </Box>
          </Box>

          {/* Stat cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: 2.5,
            }}
          >
            {[
              {
                label: "Total Reports",
                value: counts.ALL,
                icon: "📊",
                gradient: "linear-gradient(135deg,#0369a1 0%,#0891b2 100%)",
                glow: "rgba(8,145,178,0.35)",
              },
              {
                label: "Bullish",
                value: counts.BULLISH,
                icon: "🟢",
                gradient: "linear-gradient(135deg,#047857 0%,#10b981 100%)",
                glow: "rgba(16,185,129,0.35)",
              },
              {
                label: "Neutral / Mixed",
                value: counts.NEUTRAL,
                icon: "🟡",
                gradient: "linear-gradient(135deg,#ca8a04 0%,#eab308 100%)",
                glow: "rgba(234,179,8,0.35)",
              },
              {
                label: "Bearish",
                value: counts.BEARISH,
                icon: "🔴",
                gradient: "linear-gradient(135deg,#be123c 0%,#f43f5e 100%)",
                glow: "rgba(244,63,94,0.35)",
              },
            ].map((card) => (
              <Box
                key={card.label}
                sx={{
                  px: 2.5,
                  py: 2.5,
                  borderRadius: 3.5,
                  background: card.gradient,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255,255,255,0.15)",
                  minHeight: 90,
                  boxShadow: `0 8px 24px ${card.glow}`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Typography sx={{ fontSize: "1.3rem", mb: 0.5 }}>{card.icon}</Typography>
                <Typography
                  sx={{
                    fontSize: "1.5rem",
                    fontWeight: 900,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  {card.value}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.6rem",
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    mt: 0.5,
                    textAlign: "center",
                  }}
                >
                  {card.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ═══ CONTENT ═══ */}
      <Box sx={{ maxWidth: 1400, mx: "auto", px: PX, mt: -2.5 }}>
        {/* Search */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 3,
            flexWrap: "wrap",
            bgcolor: "#fff",
            px: 2.5,
            py: 1.5,
            borderRadius: 3,
            boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
            border: "1px solid #e8ecf0",
          }}
        >
          <TrendingUpIcon sx={{ color: "#0891b2" }} />
          <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
            Saved Post-IPO Reports
          </Typography>
          <Box sx={{ ml: "auto" }}>
            <TextField
              size="small"
              placeholder="Search ticker, issuer, headline..."
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
                width: 320,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: "#f8fafc",
                  fontSize: "0.82rem",
                  "& fieldset": { borderColor: "#e2e8f0" },
                  "&:hover fieldset": { borderColor: "#0891b2" },
                },
              }}
            />
          </Box>
        </Box>

        {/* Table */}
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
          <TableContainer>
            <Table
              size="small"
              sx={{ tableLayout: "auto", width: "100%" }}
            >
              <TableHead>
                <TableRow
                  sx={{ bgcolor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}
                >
                  <TableCell sx={{ py: 1.5, px: 1.5 }} />
                  <TableCell sx={thStyle}>
                    <TableSortLabel
                      active={sortField === "ticker"}
                      direction={sortField === "ticker" ? sortDir : "asc"}
                      onClick={() => handleSort("ticker")}
                    >
                      Ticker
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={thStyle}>
                    <TableSortLabel
                      active={sortField === "company_name"}
                      direction={sortField === "company_name" ? sortDir : "asc"}
                      onClick={() => handleSort("company_name")}
                    >
                      Issuer
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={thStyle} align="center">
                    <TableSortLabel
                      active={sortField === "score"}
                      direction={sortField === "score" ? sortDir : "asc"}
                      onClick={() => handleSort("score")}
                    >
                      Score
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={thStyle}>
                    <TableSortLabel
                      active={sortField === "sentiment"}
                      direction={sortField === "sentiment" ? sortDir : "asc"}
                      onClick={() => handleSort("sentiment")}
                    >
                      Sentiment
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={thStyle}>Horizon</TableCell>
                  <TableCell sx={thStyle}>Confidence</TableCell>
                  <TableCell sx={thStyle}>
                    <TableSortLabel
                      active={sortField === "updated_at"}
                      direction={sortField === "updated_at" ? sortDir : "asc"}
                      onClick={() => handleSort("updated_at")}
                    >
                      Updated
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={thStyle} align="right">
                    {" "}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: "center", py: 10 }}>
                      <Typography
                        sx={{ color: "#94a3b8", fontWeight: 500, fontSize: "0.88rem" }}
                      >
                        {enriched.length === 0
                          ? "No Post-IPO reports yet. Click Upload JSON to start."
                          : "No results match your search."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  visible.map((rec) => {
                    const isOpen = expandedId === rec.id;
                    const sc = getSentimentConfig(rec.sentiment || "");
                    return (
                      <React.Fragment key={rec.id}>
                        <TableRow
                          onClick={() => setExpandedId(isOpen ? null : rec.id)}
                          sx={{
                            cursor: "pointer",
                            bgcolor: isOpen ? "#f0fdfa" : "#fff",
                            borderLeft: isOpen
                              ? "3px solid #0891b2"
                              : "3px solid transparent",
                            "&:hover": { bgcolor: isOpen ? "#f0fdfa" : "#f8fafc" },
                          }}
                        >
                          <TableCell sx={{ py: 1.5, px: 1.5 }}>
                            <IconButton
                              size="small"
                              sx={{
                                color: "#0891b2",
                                bgcolor: isOpen ? "#e0f7fa" : "transparent",
                                "&:hover": { bgcolor: "#e0f7fa" },
                              }}
                            >
                              {isOpen ? (
                                <KeyboardArrowUpIcon fontSize="small" />
                              ) : (
                                <KeyboardArrowDownIcon fontSize="small" />
                              )}
                            </IconButton>
                          </TableCell>
                          <TableCell sx={tdStyle}>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                color: "#0891b2",
                                fontSize: "0.9rem",
                                letterSpacing: 0.5,
                                lineHeight: 1.2,
                              }}
                            >
                              {rec.ticker}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              ...tdStyle,
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                            }}
                          >
                            {rec.company_name || "—"}
                          </TableCell>
                          <TableCell align="center" sx={{ py: 1.5, px: 1.5 }}>
                            {rec.score !== null ? (
                              <Box
                                sx={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  px: 1.4,
                                  py: 0.5,
                                  borderRadius: 2,
                                  bgcolor: getScoreBg(rec.score),
                                  border: `1.5px solid ${getScoreColor(rec.score)}40`,
                                  minWidth: 52,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: 900,
                                    fontSize: "0.85rem",
                                    color: getScoreColor(rec.score),
                                  }}
                                >
                                  {rec.score > 0 ? `+${rec.score}` : rec.score}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography sx={{ fontSize: "0.78rem", color: "#cbd5e1" }}>
                                —
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell sx={{ py: 1.5, px: 1.5 }}>
                            {rec.sentiment ? (
                              <Chip
                                label={rec.sentiment}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.68rem",
                                  height: 24,
                                  bgcolor: sc.bg,
                                  color: sc.color,
                                  border: `1px solid ${sc.border}`,
                                }}
                              />
                            ) : (
                              <Typography sx={{ fontSize: "0.78rem", color: "#cbd5e1" }}>
                                —
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell
                            sx={{
                              ...tdStyle,
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              fontSize: "0.78rem",
                            }}
                          >
                            {rec.horizon || "—"}
                          </TableCell>
                          <TableCell
                            sx={{
                              ...tdStyle,
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              fontSize: "0.78rem",
                            }}
                          >
                            {rec.confidence || "—"}
                          </TableCell>
                          <TableCell sx={tdStyle}>
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: "#334155",
                              }}
                            >
                              {new Date(rec.updated_at).toLocaleDateString("en-US", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ py: 1.5, px: 1.5 }}>
                            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.2 }}>
                              <Tooltip title={rowRefreshing[rec.ticker] ? "Running…" : "Refresh this ticker"} arrow>
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={!!rowRefreshing[rec.ticker]}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      refreshSingleTicker(rec.ticker);
                                    }}
                                    sx={{
                                      color: "#94a3b8",
                                      "&:hover": { color: "#0891b2", bgcolor: "#ecfeff" },
                                      "&.Mui-disabled": { color: "#0891b2" },
                                    }}
                                  >
                                    {rowRefreshing[rec.ticker] ? (
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
                          </TableCell>
                        </TableRow>

                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Expanded detail — rendered OUTSIDE the table so it inherits page width, not table cell width */}
        {(() => {
          const activeRec = visible.find((r) => r.id === expandedId);
          if (!activeRec) return null;
          return (
            <Box
              sx={{
                bgcolor: "#fff",
                borderRadius: 3,
                border: "1px solid #bae6fd",
                borderLeft: "4px solid #0891b2",
                mb: 5,
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(8,145,178,0.08)",
                width: "100%",
                minWidth: 0,
                boxSizing: "border-box",
              }}
            >
              {/* Detail header */}
              <Box
                sx={{
                  px: { xs: 2, md: 3 },
                  py: 2,
                  borderBottom: "1px solid #e0f2fe",
                  bgcolor: "#f0fdff",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: "1rem",
                    color: "#0891b2",
                    letterSpacing: 0.4,
                  }}
                >
                  {activeRec.ticker}
                </Typography>
                <Typography sx={{ fontSize: "0.88rem", color: "#0f172a", fontWeight: 600 }}>
                  {activeRec.company_name || "—"}
                </Typography>
                {activeRec.sentiment && (
                  <Chip
                    label={activeRec.sentiment}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.68rem",
                      height: 22,
                      bgcolor: getSentimentConfig(activeRec.sentiment).bg,
                      color: getSentimentConfig(activeRec.sentiment).color,
                      border: `1px solid ${getSentimentConfig(activeRec.sentiment).border}`,
                    }}
                  />
                )}
                <Box sx={{ ml: "auto" }}>
                  <Button
                    size="small"
                    onClick={() => setExpandedId(null)}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      color: "#0891b2",
                      fontSize: "0.78rem",
                    }}
                  >
                    Close
                  </Button>
                </Box>
              </Box>

              {/* Detail body */}
              <Box
                sx={{
                  p: { xs: 2, md: 3 },
                  bgcolor: "#f5f7fa",
                  width: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                }}
              >
                {activeRec.json_data && activeRec.json_data.length > 0 ? (
                  <BlockRenderer blocks={activeRec.json_data} />
                ) : (
                  <Alert severity="warning">No blocks found for this record.</Alert>
                )}
              </Box>
            </Box>
          );
        })()}
      </Box>

      <RunTickerDialog
        open={runDialogOpen}
        onClose={() => setRunDialogOpen(false)}
        onRunComplete={handleDialogRunComplete}
        autoRunTicker={autoRunTicker}
        suggestions={records.map((r) => ({
          ticker: r.ticker,
          company_name: r.company_name,
        }))}
      />

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

export default GatorPostIpoAgentMain;
