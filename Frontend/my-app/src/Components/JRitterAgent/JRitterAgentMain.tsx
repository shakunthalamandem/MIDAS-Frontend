import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import PasteJsonDialog from "./PasteJsonDialog";
import ScorecardView from "./ScorecardView";

interface SavedRecord {
  id: number;
  ticker: string;
  company_name: string;
  json_data: any;
  created_at: string;
}

/* ── Signal / verdict config ── */
const VERDICT_CONFIG: Record<string, { bg: string; color: string; glow: string }> = {
  strong_favorable:   { bg: "#e8f5e9", color: "#1b5e20", glow: "rgba(27,94,32,0.15)" },
  moderate_favorable: { bg: "#e8f5e9", color: "#2e7d32", glow: "rgba(46,125,50,0.12)" },
  favorable:          { bg: "#e8f5e9", color: "#1b5e20", glow: "rgba(27,94,32,0.15)" },
  neutral:            { bg: "#fff8e1", color: "#e65100", glow: "rgba(230,81,0,0.15)" },
  moderate_cautious:  { bg: "#fff8e1", color: "#e65100", glow: "rgba(230,81,0,0.15)" },
  cautious:           { bg: "#fce4ec", color: "#b71c1c", glow: "rgba(183,28,28,0.15)" },
  below_average:      { bg: "#fce4ec", color: "#b71c1c", glow: "rgba(183,28,28,0.15)" },
};

const getVerdictConfig = (verdict: string) => {
  const key = verdict.toLowerCase().replace(/[\s-]+/g, "_");
  for (const [k, v] of Object.entries(VERDICT_CONFIG)) {
    if (key.includes(k)) return v;
  }
  if (key.includes("above") || key.includes("favorable") || key.includes("strong")) return VERDICT_CONFIG.favorable;
  if (key.includes("below") || key.includes("weak") || key.includes("cautious")) return VERDICT_CONFIG.below_average;
  return VERDICT_CONFIG.neutral;
};

const getScoreColor = (s: number) => (s >= 70 ? "#059669" : s >= 50 ? "#D97706" : "#DC2626");

/* ── Metric cards config ── */
const STAT_CARDS = [
  { key: "total", label: "Total IPOs Scored", icon: "📊", gradient: "linear-gradient(135deg,#0891b2,#06b6d4)" },
  { key: "avg_score", label: "Average Composite Score", icon: "📈", gradient: "linear-gradient(135deg,#5e35b1,#9575cd)" },
  { key: "strong", label: "Strong (75+)", icon: "✅", gradient: "linear-gradient(135deg,#00897b,#4db8a8)" },
  { key: "weak", label: "Below Avg (<55)", icon: "⚠️", gradient: "linear-gradient(135deg,#c62828,#e57373)" },
];

type SortField = "ticker" | "composite" | "days" | "verdict";

const JRitterAgentMain: React.FC = () => {
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("composite");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<"ALL" | "STRONG" | "MODERATE" | "WEAK">("ALL");

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

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`${apiUrl}/api/jritter_agent/${id}/`, { method: "DELETE", headers: { Authorization: token ? `Bearer ${token}` : "" } });
      setRecords((p) => p.filter((r) => r.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch {}
  };

  // Enriched records
  const enriched = useMemo(() => records.map((r) => {
    const s = r.json_data?.ritter_scores || {};
    return {
      ...r,
      composite: s.composite_score ?? 0,
      compositeMax: s.composite_max ?? 100,
      verdict: s.verdict_label || s.verdict || "",
      sector: r.json_data?.company_fundamentals?.sector || "—",
      daysSince: r.json_data?.days_since_ipo ?? 0,
      exchange: r.json_data?.exchange || "",
      price: r.json_data?.current_market?.current_price,
      returnPct: r.json_data?.current_market?.return_vs_ipo_pct,
      mktCap: r.json_data?.current_market?.market_cap_b,
      ipoDate: r.json_data?.ipo_date || "",
    };
  }), [records]);

  // Counts
  const counts = useMemo(() => {
    const c = { ALL: enriched.length, STRONG: 0, MODERATE: 0, WEAK: 0 };
    enriched.forEach((r) => { if (r.composite >= 75) c.STRONG++; else if (r.composite >= 55) c.MODERATE++; else c.WEAK++; });
    return c;
  }, [enriched]);

  // Filter + search + sort
  const visible = useMemo(() => {
    let list = filter === "ALL" ? enriched : enriched.filter((r) => {
      if (filter === "STRONG") return r.composite >= 75;
      if (filter === "MODERATE") return r.composite >= 55 && r.composite < 75;
      return r.composite < 55;
    });
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.ticker.toLowerCase().includes(q) || (r.company_name || "").toLowerCase().includes(q) || r.sector.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      let av: any, bv: any;
      if (sortField === "ticker") { av = a.ticker.toLowerCase(); bv = b.ticker.toLowerCase(); }
      else if (sortField === "composite") { av = a.composite; bv = b.composite; }
      else if (sortField === "days") { av = a.daysSince; bv = b.daysSince; }
      else { av = a.verdict.toLowerCase(); bv = b.verdict.toLowerCase(); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [enriched, filter, search, sortField, sortDir]);

  const handleSort = (f: SortField) => {
    if (sortField === f) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDir("desc"); }
  };

  // Stats
  const avgScore = enriched.length > 0 ? Math.round(enriched.reduce((a, r) => a + r.composite, 0) / enriched.length) : 0;
  const statValues: Record<string, string | number> = {
    total: enriched.length,
    avg_score: `${avgScore}/100`,
    strong: counts.STRONG,
    weak: counts.WEAK,
  };

  const PX = { xs: 2, sm: 3, md: 5, lg: 8 };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
      <CircularProgress sx={{ color: "#0891b2" }} />
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f0f4f8" }}>

      {/* ═══ HEADER ═══ */}
      <Box sx={{ background: "linear-gradient(160deg,#0c3d4a 0%,#0e6b85 50%,#0891b2 100%)", pb: 5 }}>
        <Box sx={{ maxWidth: 1400, mx: "auto", px: PX }}>

          {/* Top bar */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 2.5, pb: 1 }}>
            <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.68rem", letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>
              Ritter Academic Framework · Claude-Generated Scorecards
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{
                bgcolor: "rgba(255,255,255,0.12)", color: "#fff", textTransform: "none", fontWeight: 700,
                fontSize: "0.78rem", px: 2.5, py: 0.9, borderRadius: 2.5,
                border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(4px)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.22)", borderColor: "rgba(255,255,255,0.4)" },
              }}
            >
              Upload New JSON
            </Button>
          </Box>

          {/* Centered Title */}
          <Box sx={{ textAlign: "center", mt: 2, mb: 3.5 }}>
            <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: { xs: "1.6rem", md: "2.1rem" }, letterSpacing: -0.5 }}>
              JRitter IPO Analysis
            </Typography>
            <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 0.8,
              px: 2, py: 0.6, borderRadius: 5, mt: 1,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.25)",
              backdropFilter: "blur(8px)",
            }}>
              <SmartToyOutlinedIcon sx={{ fontSize: 15, color: "#b2ebf2" }} />
              <Typography sx={{ fontSize: "0.73rem", fontWeight: 700, color: "#e0f7fa", letterSpacing: 0.3 }}>
                Ritter Analyst
              </Typography>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#69f0ae", boxShadow: "0 0 8px #69f0ae" }} />
            </Box>
            <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.73rem", fontWeight: 500, mt: 1.2 }}>
              {enriched.length} scored · {counts.STRONG} strong · {counts.MODERATE} moderate · {counts.WEAK} below average
            </Typography>
          </Box>

          {/* Metric Cards */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
            {STAT_CARDS.map((card) => (
              <Box key={card.key} sx={{
                px: 2.5, py: 2, borderRadius: 3, background: card.gradient,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.18)", minHeight: 82,
                boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              }}>
                <Typography sx={{ fontSize: "1.15rem", mb: 0.4 }}>{card.icon}</Typography>
                <Typography sx={{ fontSize: "1.35rem", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                  {statValues[card.key]}
                </Typography>
                <Typography sx={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.8)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, mt: 0.4, textAlign: "center" }}>
                  {card.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ═══ CONTENT ═══ */}
      <Box sx={{ maxWidth: 1400, mx: "auto", px: PX, mt: -2 }}>

        {/* Filter pills + Search */}
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1.5, mb: 2.5, flexWrap: "wrap",
          bgcolor: "#fff", px: 2.5, py: 1.5, borderRadius: 2.5,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #e8ecf0",
        }}>
          {(["ALL", "STRONG", "MODERATE", "WEAK"] as const).map((f) => (
            <Chip
              key={f}
              label={`${f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()} ${counts[f]}`}
              size="small"
              onClick={() => setFilter(f)}
              sx={{
                fontWeight: 700, fontSize: "0.75rem", px: 0.5, height: 28, borderRadius: 1.5,
                bgcolor: filter === f ? "#0891b2" : "#f1f5f9",
                color: filter === f ? "#fff" : "#475569",
                border: "none",
                "&:hover": { bgcolor: filter === f ? "#0e7490" : "#e2e8f0" },
                transition: "all 0.15s",
              }}
            />
          ))}
          <Box sx={{ ml: "auto" }}>
            <TextField
              size="small"
              placeholder="Search ticker, issuer, sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#94a3b8", fontSize: 17 }} /></InputAdornment>,
              }}
              sx={{
                width: 290,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2, bgcolor: "#f8fafc", fontSize: "0.82rem",
                  "& fieldset": { borderColor: "#e2e8f0" },
                  "&:hover fieldset": { borderColor: "#0891b2" },
                },
              }}
            />
          </Box>
        </Box>

        {/* ═══ TABLE ═══ */}
        <Box sx={{ bgcolor: "#fff", borderRadius: 2.5, border: "1px solid #e2e8f0", mb: 4, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <TableContainer>
            <Table size="small" sx={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: 44 }} />
                <col style={{ width: 90 }} />
                <col style={{ width: 160 }} />
                <col style={{ width: 180 }} />
                <col style={{ width: 70 }} />
                <col style={{ width: 80 }} />
                <col style={{ width: 220 }} />
                <col />
                <col style={{ width: 44 }} />
              </colgroup>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <TableCell sx={{ py: 1.5, px: 1.5 }} />
                  <TableCell sx={thStyle}>
                    <TableSortLabel active={sortField === "ticker"} direction={sortField === "ticker" ? sortDir : "asc"} onClick={() => handleSort("ticker")}>
                      Ticker
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={thStyle}>Issuer</TableCell>
                  <TableCell sx={thStyle}>Sector</TableCell>
                  <TableCell sx={thStyle} align="center">
                    <TableSortLabel active={sortField === "days"} direction={sortField === "days" ? sortDir : "asc"} onClick={() => handleSort("days")}>
                      Days
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={thStyle} align="center">
                    <TableSortLabel active={sortField === "composite"} direction={sortField === "composite" ? sortDir : "asc"} onClick={() => handleSort("composite")}>
                      Score
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={thStyle} align="left">
                    <TableSortLabel active={sortField === "verdict"} direction={sortField === "verdict" ? sortDir : "asc"} onClick={() => handleSort("verdict")}>
                      Verdict
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={thStyle}>Action Summary</TableCell>
                  <TableCell sx={{ py: 1.5, px: 1.5 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: "center", py: 8 }}>
                      <Typography sx={{ color: "#94a3b8", fontWeight: 500, fontSize: "0.88rem" }}>
                        {enriched.length === 0 ? 'No scorecards yet. Click "Upload New JSON" to start.' : "No results match your filter."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : visible.map((rec) => {
                  const isOpen = expandedId === rec.id;
                  const vc = getVerdictConfig(rec.verdict);
                  const verdictLabel = rec.verdict.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

                  return (
                    <React.Fragment key={rec.id}>
                      <TableRow
                        onClick={() => setExpandedId(isOpen ? null : rec.id)}
                        sx={{
                          cursor: "pointer",
                          bgcolor: isOpen ? "#f0fdfa" : "#fff",
                          borderLeft: isOpen ? "3px solid #0891b2" : "3px solid transparent",
                          "&:hover": { bgcolor: isOpen ? "#f0fdfa" : "#f8fafc" },
                          transition: "background 0.15s, border-color 0.15s",
                        }}
                      >
                        <TableCell sx={{ py: 1.5, px: 1.5 }}>
                          <IconButton size="small" sx={{ color: "#0891b2", bgcolor: isOpen ? "#e0f7fa" : "transparent", "&:hover": { bgcolor: "#e0f7fa" } }}>
                            {isOpen ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                          </IconButton>
                        </TableCell>
                        <TableCell sx={tdStyle}>
                          <Typography sx={{ fontWeight: 800, color: "#0891b2", fontSize: "0.9rem", letterSpacing: 0.2 }}>
                            {rec.ticker}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ ...tdStyle, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {rec.company_name || "—"}
                        </TableCell>
                        <TableCell sx={{ ...tdStyle, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>{rec.sector}</Typography>
                        </TableCell>
                        <TableCell sx={tdStyle} align="center">
                          <Typography sx={{ fontSize: "0.82rem", color: "#64748b", fontWeight: 600 }}>{rec.daysSince}d</Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5, px: 1.5 }}>
                          <Box sx={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            px: 1.2, py: 0.4, borderRadius: 1.5,
                            bgcolor: rec.composite >= 70 ? "#ECFDF5" : rec.composite >= 50 ? "#FFFBEB" : "#FEF2F2",
                            border: `1.5px solid ${getScoreColor(rec.composite)}40`,
                            minWidth: 46,
                          }}>
                            <Typography sx={{ fontWeight: 900, fontSize: "0.82rem", color: getScoreColor(rec.composite) }}>
                              {rec.composite}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, px: 1.5 }}>
                          <Chip
                            label={verdictLabel}
                            size="small"
                            sx={{
                              fontWeight: 700, fontSize: "0.68rem", height: 24, maxWidth: "100%",
                              bgcolor: vc.bg, color: vc.color,
                              border: `1px solid ${vc.color}50`,
                              "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.5, px: 1.5 }}>
                          <Typography sx={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.4 }}>
                            {verdictLabel} — Score {rec.composite}/{rec.compositeMax}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, px: 1.5 }}>
                          <Tooltip title="Delete" arrow>
                            <IconButton size="small" onClick={(e) => handleDelete(rec.id, e)} sx={{ color: "#cbd5e1", "&:hover": { color: "#DC2626", bgcolor: "#fef2f2" } }}>
                              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>

                      {/* ── Expanded Detail ── */}
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell colSpan={9} sx={{ py: 0, px: 0, borderBottom: isOpen ? "2px solid #e2e8f0" : "none", borderLeft: "3px solid #0891b2" }}>
                          <Collapse in={isOpen} timeout={300}>
                            <ExpandedDetail record={rec} />
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      <PasteJsonDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaveSuccess={fetchRecords} />
    </Box>
  );
};

/* ═══ Expanded Detail ═══ */
const ExpandedDetail: React.FC<{ record: any }> = ({ record }) => {
  const d = record.json_data;
  const scores = d?.ritter_scores || {};
  const market = d?.current_market || {};
  const ipo = d?.ipo_data || {};
  const vc = getVerdictConfig(record.verdict);

  const formatPrice = (v?: number) => v != null ? `$${v}` : "—";

  return (
    <Box sx={{ px: 3, py: 3, bgcolor: "#f8fafc" }}>
      {/* Header card */}
      <Box sx={{
        mb: 2.5, p: 2.5, bgcolor: "#fff", borderRadius: 2.5,
        border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: "1.05rem", fontWeight: 900, color: "#0891b2", letterSpacing: 0.3 }}>
            {record.ticker}
          </Typography>
          <Typography sx={{ fontSize: "0.88rem", color: "#334155", fontWeight: 600 }}>
            {record.company_name}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", px: 1.5, py: 0.3, bgcolor: "#f1f5f9", borderRadius: 1 }}>
            {record.sector}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8" }}>
            {record.daysSince}d since IPO
          </Typography>
          <Box sx={{ ml: "auto" }}>
            <Chip
              label={record.verdict.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
              size="small"
              sx={{
                fontSize: "0.73rem", fontWeight: 800, height: 28, px: 0.5,
                bgcolor: vc.bg, color: vc.color,
                border: `1.5px solid ${vc.color}60`,
              }}
            />
          </Box>
        </Box>

        {/* Stat cards row */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 1.5 }}>
          {ipo.offer_price != null && <StatCard label="Offer Price" value={formatPrice(ipo.offer_price)} />}
          {market.market_cap_b != null && <StatCard label="Market Cap" value={`$${market.market_cap_b}B`} />}
          {ipo.first_day_return_pct != null && (
            <StatCard
              label="First-Day Pop"
              value={`${ipo.first_day_return_pct > 0 ? "+" : ""}${ipo.first_day_return_pct}%`}
              color={ipo.first_day_return_pct >= 10 ? "#059669" : ipo.first_day_return_pct >= 0 ? "#D97706" : "#DC2626"}
              bgColor={ipo.first_day_return_pct >= 10 ? "#F0FDF4" : ipo.first_day_return_pct >= 0 ? "#FFFBEB" : "#FEF2F2"}
            />
          )}
          <StatCard label="Composite Score" value={`${scores.composite_score ?? 0}/100`} color={getScoreColor(scores.composite_score ?? 0)} bgColor={scores.composite_score >= 70 ? "#F0FDF4" : scores.composite_score >= 50 ? "#FFFBEB" : "#FEF2F2"} />
          {market.current_price != null && <StatCard label="Current Price" value={formatPrice(market.current_price)} />}
          {market.return_vs_ipo_pct != null && (
            <StatCard
              label="Return vs IPO"
              value={`${market.return_vs_ipo_pct > 0 ? "+" : ""}${market.return_vs_ipo_pct}%`}
              color={market.return_vs_ipo_pct >= 0 ? "#059669" : "#DC2626"}
              bgColor={market.return_vs_ipo_pct >= 0 ? "#F0FDF4" : "#FEF2F2"}
            />
          )}
        </Box>
      </Box>

      {/* Full scorecard with tabs */}
      <Box sx={{ bgcolor: "#fff", borderRadius: 2.5, border: "1px solid #e2e8f0", p: 2.5, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <ScorecardView data={d} />
      </Box>
    </Box>
  );
};

/* ═══ StatCard ═══ */
const StatCard: React.FC<{ label: string; value: React.ReactNode; color?: string; bgColor?: string }> = ({
  label, value, color = "#1E293B", bgColor = "#F8FAFC",
}) => (
  <Box sx={{
    p: 1.5, bgcolor: bgColor, borderRadius: 2,
    border: "1px solid #E2E8F0",
    borderTop: `3px solid ${color}30`,
  }}>
    <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, mb: 0.4 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: "0.92rem", fontWeight: 800, color }}>
      {value}
    </Typography>
  </Box>
);

/* ═══ Table styles ═══ */
const thStyle = {
  fontWeight: 700,
  fontSize: "0.68rem",
  color: "#64748b",
  textTransform: "uppercase" as const,
  letterSpacing: "0.07em",
  py: 1.5,
  px: 1.5,
};

const tdStyle = {
  fontSize: "0.83rem",
  color: "#334155",
  py: 1.5,
  px: 1.5,
  fontWeight: 500,
};

export default JRitterAgentMain;
