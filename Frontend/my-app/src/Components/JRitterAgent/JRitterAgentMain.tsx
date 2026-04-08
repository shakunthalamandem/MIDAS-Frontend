import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import PasteJsonDialog from "./PasteJsonDialog";
import ScorecardView from "./ScorecardView";

interface SavedRecord {
  id: number;
  ticker: string;
  company_name: string;
  json_data: any;
  created_at: string;
}

/* ── Score-tier helpers ── */
const tier = (s: number) => {
  if (s >= 75) return { color: "#10b981", bg: "rgba(16,185,129,0.08)", gradient: "linear-gradient(135deg, #10b981, #059669)", label: "Strong" };
  if (s >= 55) return { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", gradient: "linear-gradient(135deg, #f59e0b, #d97706)", label: "Moderate" };
  return { color: "#ef4444", bg: "rgba(239,68,68,0.08)", gradient: "linear-gradient(135deg, #ef4444, #dc2626)", label: "Weak" };
};

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
      setRecords(await res.json());
    } catch { setRecords([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${apiUrl}/api/jritter_agent/${id}/`, { method: "DELETE", headers: { Authorization: token ? `Bearer ${token}` : "" } });
      setRecords((p) => p.filter((r) => r.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch {}
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter((r) => r.ticker.toLowerCase().includes(q) || (r.company_name || "").toLowerCase().includes(q));
  }, [records, search]);

  const totalTickers = records.length;
  const avgScore = totalTickers > 0 ? Math.round(records.reduce((a, r) => a + (r.json_data?.ritter_scores?.composite_score || 0), 0) / totalTickers) : 0;
  const strongCount = records.filter((r) => (r.json_data?.ritter_scores?.composite_score || 0) >= 75).length;
  const weakCount = records.filter((r) => (r.json_data?.ritter_scores?.composite_score || 0) < 55).length;

  return (
    <Box sx={{ bgcolor: "#0f172a", minHeight: "100vh" }}>

      {/* ═══ HERO HEADER ═══ */}
      <Box sx={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        position: "relative",
        overflow: "hidden",
        pb: 5,
      }}>
        {/* Decorative grid pattern */}
        <Box sx={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        <Box sx={{ maxWidth: 1360, mx: "auto", px: { xs: 2, md: 5 }, pt: { xs: 3, md: 4 }, position: "relative", zIndex: 1 }}>
          {/* Title row */}
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} mb={4}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
                <Box sx={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                  boxShadow: "0 0 12px rgba(6,182,212,0.5)",
                }} />
                <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                  Ritter IPO Analysis
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: { xs: "1.6rem", md: "2rem" }, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                JRitter IPO Agent
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.88rem", mt: 0.5, maxWidth: 500 }}>
                Claude-generated Ritter IPO scorecards. Paste, store, and analyze academic-framework scoring across all your tracked IPOs.
              </Typography>
            </Box>

            <Button
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{
                background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                color: "#fff",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                px: 3.5,
                py: 1.3,
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(6,182,212,0.3)",
                "&:hover": { boxShadow: "0 6px 28px rgba(6,182,212,0.45)", transform: "translateY(-1px)" },
                transition: "all 0.2s ease",
              }}
            >
              Upload New JSON
            </Button>
          </Stack>

          {/* ── Glassmorphism Stat Cards ── */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
            <GlassCard label="Total Tickers" value={totalTickers} accent="#06b6d4" />
            <GlassCard label="Avg Score" value={`${avgScore}`} sub="/100" accent="#8b5cf6" />
            <GlassCard label="Strong (75+)" value={strongCount} accent="#10b981" />
            <GlassCard label="Below Avg (<55)" value={weakCount} accent="#ef4444" />
          </Box>
        </Box>
      </Box>

      {/* ═══ CONTENT AREA ═══ */}
      <Box sx={{
        maxWidth: 1360, mx: "auto", px: { xs: 2, md: 5 },
        mt: -2, position: "relative", zIndex: 2, pb: 6,
      }}>
        {/* Search bar */}
        <Stack direction="row" spacing={1.5} mb={3} alignItems="center">
          <TextField
            size="small"
            placeholder="Search ticker or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#475569", fontSize: 18 }} /></InputAdornment>,
            }}
            sx={{
              width: 340,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2, bgcolor: "#1e293b", border: "1px solid #334155",
                color: "#e2e8f0", fontSize: "0.85rem",
                "&:hover": { borderColor: "#475569" },
                "& fieldset": { border: "none" },
              },
              "& .MuiInputBase-input::placeholder": { color: "#475569", opacity: 1 },
            }}
          />
          <Tooltip title="Refresh" arrow>
            <IconButton onClick={fetchRecords} sx={{ bgcolor: "#1e293b", border: "1px solid #334155", color: "#94a3b8", "&:hover": { bgcolor: "#334155" } }}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Typography sx={{ color: "#475569", fontSize: "0.8rem" }}>
            {filtered.length} scorecard{filtered.length !== 1 ? "s" : ""}
          </Typography>
        </Stack>

        {/* Loading / Empty */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
            <CircularProgress sx={{ color: "#06b6d4" }} size={36} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 12, bgcolor: "#1e293b", borderRadius: 3, border: "1px solid #334155" }}>
            <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: "#334155", display: "inline-flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
              <SearchIcon sx={{ fontSize: 28, color: "#475569" }} />
            </Box>
            <Typography sx={{ color: "#94a3b8", fontWeight: 600, fontSize: "1rem" }}>
              {records.length === 0 ? "No scorecards yet" : "No matches found"}
            </Typography>
            <Typography sx={{ color: "#475569", fontSize: "0.82rem", mt: 0.5 }}>
              {records.length === 0 ? "Upload your first Ritter IPO JSON to get started" : "Try a different search term"}
            </Typography>
          </Box>
        ) : (
          /* ── Ticker Cards ── */
          <Stack spacing={1.5}>
            {filtered.map((rec) => {
              const d = rec.json_data;
              const scores = d?.ritter_scores || {};
              const composite = scores.composite_score ?? 0;
              const compositeMax = scores.composite_max ?? 100;
              const verdict = scores.verdict_label || scores.verdict || "";
              const market = d?.current_market || {};
              const dims = scores.dimensions || [];
              const t = tier(composite);
              const isExpanded = expandedId === rec.id;

              return (
                <Box key={rec.id} sx={{
                  bgcolor: "#1e293b",
                  borderRadius: 3,
                  border: isExpanded ? `1px solid ${t.color}44` : "1px solid #334155",
                  overflow: "hidden",
                  transition: "all 0.25s ease",
                  "&:hover": { borderColor: isExpanded ? `${t.color}44` : "#475569" },
                }}>
                  {/* ── Collapsed Row ── */}
                  <Box
                    onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                    sx={{ display: "flex", alignItems: "center", cursor: "pointer", px: 0 }}
                  >
                    {/* Left accent strip */}
                    <Box sx={{ width: 4, alignSelf: "stretch", background: t.gradient, borderRadius: "4px 0 0 4px", flexShrink: 0 }} />

                    {/* Score badge */}
                    <Box sx={{
                      width: 64, display: "flex", flexDirection: "column", alignItems: "center",
                      justifyContent: "center", py: 2, px: 1.5, flexShrink: 0,
                    }}>
                      <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: t.color, lineHeight: 1 }}>
                        {composite}
                      </Typography>
                      <Typography sx={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 600, mt: 0.2 }}>
                        /{compositeMax}
                      </Typography>
                    </Box>

                    {/* Ticker + Company */}
                    <Box sx={{ flex: 1, py: 2, pr: 2, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.3}>
                        <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#f1f5f9", letterSpacing: "-0.01em" }}>
                          {rec.ticker}
                        </Typography>
                        {d?.exchange && (
                          <Typography sx={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 600, bgcolor: "#334155", px: 0.8, py: 0.15, borderRadius: 1 }}>
                            {d.exchange}
                          </Typography>
                        )}
                        <Chip
                          label={verdict.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: "0.62rem", height: 20, bgcolor: t.bg, color: t.color, border: "none" }}
                        />
                      </Stack>
                      <Typography sx={{ color: "#94a3b8", fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {rec.company_name || "—"}
                      </Typography>

                      {/* Mini dimension gauges */}
                      {!isExpanded && dims.length > 0 && (
                        <Stack direction="row" spacing={0.5} mt={1.2} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                          {dims.slice(0, 8).map((dim: any) => {
                            const pct = dim.max_score > 0 ? (dim.score / dim.max_score) * 100 : 0;
                            const dt = tier(pct);
                            return (
                              <Tooltip key={dim.id} title={`${dim.label}: ${dim.score}/${dim.max_score}`} arrow placement="top">
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                                  <Box sx={{ width: 40, height: 4, bgcolor: "#334155", borderRadius: 2, overflow: "hidden" }}>
                                    <Box sx={{ width: `${pct}%`, height: "100%", background: dt.gradient, borderRadius: 2 }} />
                                  </Box>
                                  <Typography sx={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 600, minWidth: 14 }}>
                                    {dim.score}
                                  </Typography>
                                </Box>
                              </Tooltip>
                            );
                          })}
                          {dims.length > 8 && (
                            <Typography sx={{ fontSize: "0.55rem", color: "#475569" }}>+{dims.length - 8}</Typography>
                          )}
                        </Stack>
                      )}
                    </Box>

                    {/* Right metrics */}
                    <Stack direction="row" spacing={3} sx={{ display: { xs: "none", md: "flex" }, pr: 2, alignItems: "center" }}>
                      {d?.ipo_date && <MetricPill label="IPO" value={formatDate(d.ipo_date)} />}
                      {market.current_price !== undefined && <MetricPill label="Price" value={`$${market.current_price}`} />}
                      {market.return_vs_ipo_pct !== undefined && (
                        <MetricPill
                          label="vs IPO"
                          value={`${market.return_vs_ipo_pct > 0 ? "+" : ""}${market.return_vs_ipo_pct}%`}
                          valueColor={market.return_vs_ipo_pct >= 0 ? "#10b981" : "#ef4444"}
                        />
                      )}
                      {market.market_cap_b !== undefined && <MetricPill label="Mkt Cap" value={`$${market.market_cap_b}B`} />}
                    </Stack>

                    {/* Actions */}
                    <Stack direction="row" spacing={0.5} sx={{ pr: 2, alignItems: "center" }}>
                      <Typography sx={{ color: "#475569", fontSize: "0.68rem", display: { xs: "none", sm: "block" }, whiteSpace: "nowrap" }}>
                        {new Date(rec.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </Typography>
                      <Tooltip title="Delete" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleDelete(rec.id); }}
                          sx={{ color: "#475569", "&:hover": { color: "#ef4444", bgcolor: "rgba(239,68,68,0.1)" } }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Box sx={{
                        width: 28, height: 28, borderRadius: 1.5,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        bgcolor: isExpanded ? `${t.color}15` : "transparent",
                        color: isExpanded ? t.color : "#64748b",
                        transition: "all 0.2s",
                      }}>
                        {isExpanded ? <KeyboardArrowUpIcon sx={{ fontSize: 20 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />}
                      </Box>
                    </Stack>
                  </Box>

                  {/* ── Expanded Scorecard ── */}
                  <Collapse in={isExpanded} timeout={350}>
                    <Box sx={{ borderTop: "1px solid #334155", bgcolor: "#161e2e" }}>
                      <Box sx={{ p: { xs: 2, md: 3 } }}>
                        <ScorecardView data={d} />
                      </Box>
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      <PasteJsonDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaveSuccess={fetchRecords} />
    </Box>
  );
};

/* ═══ Helper Components ═══ */

const GlassCard: React.FC<{ label: string; value: string | number; sub?: string; accent: string }> = ({ label, value, sub, accent }) => (
  <Box sx={{
    bgcolor: "rgba(30,41,59,0.7)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(71,85,105,0.4)",
    borderRadius: 3,
    px: 2.5, py: 2,
    transition: "all 0.2s",
    "&:hover": { borderColor: `${accent}44`, bgcolor: "rgba(30,41,59,0.9)" },
  }}>
    <Typography sx={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", mb: 0.8 }}>
      {label}
    </Typography>
    <Stack direction="row" alignItems="baseline" spacing={0.5}>
      <Typography sx={{ fontSize: "1.8rem", fontWeight: 900, color: accent, lineHeight: 1, letterSpacing: "-0.02em" }}>
        {value}
      </Typography>
      {sub && <Typography sx={{ fontSize: "0.85rem", color: "#475569", fontWeight: 600 }}>{sub}</Typography>}
    </Stack>
  </Box>
);

const MetricPill: React.FC<{ label: string; value: string; valueColor?: string }> = ({ label, value, valueColor }) => (
  <Box sx={{ textAlign: "center", minWidth: 55 }}>
    <Typography sx={{ color: "#475569", fontSize: "0.58rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1.2 }}>
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 800, color: valueColor || "#e2e8f0", fontSize: "0.82rem", lineHeight: 1.3 }}>
      {value}
    </Typography>
  </Box>
);

const formatDate = (d: string) => {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch { return d; }
};

export default JRitterAgentMain;
