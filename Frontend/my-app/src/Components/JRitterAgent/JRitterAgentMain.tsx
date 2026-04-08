import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PasteJsonDialog from "./PasteJsonDialog";
import ScorecardView from "./ScorecardView";

interface SavedRecord {
  id: number;
  ticker: string;
  company_name: string;
  json_data: any;
  created_at: string;
}

const scoreColor = (s: number) => (s >= 75 ? "#059669" : s >= 55 ? "#d97706" : "#dc2626");
const scoreBg = (s: number) => (s >= 75 ? "#ecfdf5" : s >= 55 ? "#fffbeb" : "#fef2f2");

const JRitterAgentMain: React.FC = () => {
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/jritter_agent/list/`, {
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
      });
      const data = await res.json();
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${apiUrl}/api/jritter_agent/${id}/`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch { /* ignore */ }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter(
      (r) =>
        r.ticker.toLowerCase().includes(q) ||
        (r.company_name || "").toLowerCase().includes(q)
    );
  }, [records, search]);

  // Stats
  const totalTickers = records.length;
  const avgScore = records.length > 0
    ? Math.round(records.reduce((s, r) => s + (r.json_data?.ritter_scores?.composite_score || 0), 0) / records.length)
    : 0;
  const latestDate = records.length > 0 ? new Date(records[0].created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <Box sx={{ bgcolor: "#e8eaf0", minHeight: "100vh" }}>
      {/* ── Header ── */}
      <Box sx={{ bgcolor: "#fff", borderBottom: "1px solid #c7d2fe", px: { xs: 2, md: 5 }, pt: { xs: 3, md: 4 }, pb: { xs: 4, md: 5 } }}>
        <Box sx={{ maxWidth: 1320, mx: "auto" }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{ width: 46, height: 46, borderRadius: 3, bgcolor: "#0e7490", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AssessmentOutlinedIcon sx={{ color: "#fff", fontSize: 26 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: { xs: "1.4rem", md: "1.65rem" }, fontWeight: 800, color: "#111827", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
                  JRitter IPO Agent
                </Typography>
                <Typography sx={{ color: "#374151", fontSize: "0.85rem", mt: 0.3 }}>
                  Claude-generated Ritter IPO scorecards &mdash; paste, store, analyze
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                px: 3,
                py: 1.1,
                borderRadius: 2.5,
                bgcolor: "#0e7490",
                boxShadow: "none",
                "&:hover": { bgcolor: "#0c5f73", boxShadow: "0 4px 12px rgba(14,116,144,0.25)" },
              }}
            >
              Upload New JSON
            </Button>
          </Stack>

          {/* ── Stat pills ── */}
          <Stack direction="row" spacing={2} mt={3.5} flexWrap="wrap">
            <StatPill icon={<AssessmentOutlinedIcon sx={{ color: "#0e7490", fontSize: 22 }} />} value={totalTickers} label="Total Tickers" bg="#ecfeff" border="#a5f3fc" labelColor="#164e63" />
            <StatPill icon={<TrendingUpIcon sx={{ color: "#059669", fontSize: 22 }} />} value={`${avgScore}/100`} label="Avg Score" bg="#ecfdf5" border="#d1fae5" labelColor="#064e3b" />
            <StatPill icon={<CalendarTodayIcon sx={{ color: "#7c3aed", fontSize: 22 }} />} value={latestDate} label="Latest Upload" bg="#f5f3ff" border="#ddd6fe" labelColor="#4c1d95" />
          </Stack>
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ maxWidth: 1320, mx: "auto", px: { xs: 2, md: 5 }, py: 3 }}>
        {/* Search + refresh bar */}
        <Stack direction="row" spacing={2} mb={3} alignItems="center">
          <TextField
            size="small"
            placeholder="Search ticker or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 320,
              "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "#fff" },
            }}
          />
          <Tooltip title="Refresh">
            <IconButton onClick={fetchRecords} sx={{ bgcolor: "#fff", border: "1px solid #e2e8f0", "&:hover": { bgcolor: "#f1f5f9" } }}>
              <RefreshIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </Typography>
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress sx={{ color: "#0e7490" }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Card sx={{ borderRadius: 3, textAlign: "center", py: 8, bgcolor: "#fff" }}>
            <AssessmentOutlinedIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "#94a3b8", fontWeight: 600 }}>
              {records.length === 0 ? "No scorecards yet" : "No results match your search"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#cbd5e1", mt: 0.5 }}>
              {records.length === 0 ? 'Click "Upload New JSON" to add your first Ritter scorecard' : "Try a different search term"}
            </Typography>
          </Card>
        ) : (
          <Stack spacing={2}>
            {filtered.map((rec) => {
              const d = rec.json_data;
              const scores = d?.ritter_scores || {};
              const composite = scores.composite_score ?? 0;
              const compositeMax = scores.composite_max ?? 100;
              const verdict = scores.verdict_label || scores.verdict || "";
              const market = d?.current_market || {};
              const isExpanded = expandedId === rec.id;

              return (
                <Card
                  key={rec.id}
                  sx={{
                    borderRadius: 3,
                    border: isExpanded ? "2px solid #0e7490" : "1px solid #e2e8f0",
                    boxShadow: isExpanded ? "0 4px 20px rgba(14,116,144,0.12)" : "0 1px 3px rgba(0,0,0,0.04)",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                    "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
                  }}
                >
                  {/* ── Collapsed header row ── */}
                  <CardContent
                    sx={{ p: 0, "&:last-child": { pb: 0 }, cursor: "pointer" }}
                    onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", px: 3, py: 2, gap: 2 }}>
                      {/* Mini score ring */}
                      <MiniRing score={composite} max={compositeMax} />

                      {/* Ticker + Company */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#111827" }}>
                            {rec.ticker}
                          </Typography>
                          {d?.exchange && (
                            <Chip label={d.exchange} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.65rem" }} />
                          )}
                          <Chip
                            label={verdict.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: "0.68rem",
                              height: 22,
                              bgcolor: scoreBg(composite),
                              color: scoreColor(composite),
                              border: "none",
                            }}
                          />
                        </Stack>
                        <Typography variant="body2" sx={{ color: "#64748b", mt: 0.2 }}>
                          {rec.company_name || "—"}
                        </Typography>
                      </Box>

                      {/* Key metrics */}
                      <Stack direction="row" spacing={3} sx={{ display: { xs: "none", md: "flex" } }}>
                        {d?.ipo_date && (
                          <MetricCell label="IPO Date" value={d.ipo_date} />
                        )}
                        {market.current_price !== undefined && (
                          <MetricCell label="Price" value={`$${market.current_price}`} />
                        )}
                        {market.return_vs_ipo_pct !== undefined && (
                          <MetricCell
                            label="vs IPO"
                            value={`${market.return_vs_ipo_pct > 0 ? "+" : ""}${market.return_vs_ipo_pct}%`}
                            color={market.return_vs_ipo_pct >= 0 ? "#059669" : "#dc2626"}
                          />
                        )}
                        {market.market_cap_b !== undefined && (
                          <MetricCell label="Mkt Cap" value={`$${market.market_cap_b}B`} />
                        )}
                      </Stack>

                      {/* Upload date */}
                      <Typography variant="caption" sx={{ color: "#94a3b8", whiteSpace: "nowrap", display: { xs: "none", sm: "block" } }}>
                        {new Date(rec.created_at).toLocaleDateString()}
                      </Typography>

                      {/* Delete + expand toggle */}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleDelete(rec.id); }}
                          sx={{ color: "#cbd5e1", "&:hover": { color: "#dc2626" } }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <IconButton size="small" sx={{ color: "#0e7490" }}>
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>

                    {/* ── Dimension summary chips (collapsed) ── */}
                    {!isExpanded && scores.dimensions && (
                      <Box sx={{ px: 3, pb: 2, display: "flex", gap: 0.8, flexWrap: "wrap" }}>
                        {(scores.dimensions as any[]).map((dim: any) => {
                          const pct = dim.max_score > 0 ? (dim.score / dim.max_score) * 100 : 0;
                          return (
                            <Chip
                              key={dim.id}
                              label={`${dim.id}: ${dim.score}/${dim.max_score}`}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: "0.68rem",
                                fontWeight: 600,
                                bgcolor: pct >= 70 ? "#ecfdf5" : pct >= 50 ? "#fffbeb" : "#fef2f2",
                                color: pct >= 70 ? "#059669" : pct >= 50 ? "#d97706" : "#dc2626",
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  </CardContent>

                  {/* ── Expanded full scorecard ── */}
                  <Collapse in={isExpanded} timeout={300}>
                    <Divider />
                    <Box sx={{ p: 3, bgcolor: "#f8fafc" }}>
                      <ScorecardView data={d} />
                    </Box>
                  </Collapse>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* ── Upload dialog ── */}
      <PasteJsonDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaveSuccess={fetchRecords}
      />
    </Box>
  );
};

/* ── Helper components ── */

const MiniRing: React.FC<{ score: number; max: number }> = ({ score, max }) => {
  const pct = max > 0 ? (score / max) * 100 : 0;
  const r = 22;
  const stroke = 4;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = scoreColor(score);

  return (
    <Box sx={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
      <svg width={56} height={56} viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#e8ecf0" strokeWidth={stroke} />
        <circle
          cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 28 28)"
        />
        <text x="28" y="31" textAnchor="middle" fontSize="14" fontWeight="800" fill={color}>
          {score}
        </text>
      </svg>
    </Box>
  );
};

const MetricCell: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <Box sx={{ textAlign: "center", minWidth: 60 }}>
    <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", fontSize: "0.65rem", lineHeight: 1.2 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 700, color: color || "#111827", fontSize: "0.82rem" }}>
      {value}
    </Typography>
  </Box>
);

const StatPill: React.FC<{
  icon: React.ReactNode;
  value: string | number;
  label: string;
  bg: string;
  border: string;
  labelColor: string;
}> = ({ icon, value, label, bg, border, labelColor }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      bgcolor: bg,
      border: `1px solid ${border}`,
      borderRadius: 3,
      px: 2.5,
      py: 1.5,
      minWidth: 170,
    }}
  >
    {icon}
    <Box>
      <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: "0.72rem", color: labelColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </Typography>
    </Box>
  </Box>
);

export default JRitterAgentMain;
