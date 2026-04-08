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
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fc" }}>

      {/* ═══ HEADER ═══ */}
      <Box sx={{ background: "linear-gradient(160deg,#0e4f5c 0%,#0891b2 55%,#0e7490 100%)", pb: 4 }}>
        <Box sx={{ maxWidth: 1400, mx: "auto", px: PX }}>

          {/* Top bar */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 2, pb: 1 }}>
            <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: "0.7rem", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>
              Ritter Academic Framework · Claude-Generated Scorecards
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{
                bgcolor: "rgba(255,255,255,0.1)", color: "#fff", textTransform: "none", fontWeight: 700,
                fontSize: "0.78rem", px: 2.5, py: 0.8, borderRadius: 2,
                border: "1px solid rgba(255,255,255,0.2)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              }}
            >
              Upload New JSON
            </Button>
          </Box>

          {/* Centered Title */}
          <Box sx={{ textAlign: "center", mt: 1.5, mb: 3 }}>
            <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: { xs: "1.5rem", md: "2rem" }, letterSpacing: -0.5 }}>
              JRitter IPO Analysis
            </Typography>
            <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 0.8,
              px: 1.8, py: 0.55, borderRadius: 5, mt: 0.8,
              background: "linear-gradient(135deg, rgba(6,182,212,0.35), rgba(255,255,255,0.15))",
              border: "1px solid rgba(6,182,212,0.5)",
            }}>
              <SmartToyOutlinedIcon sx={{ fontSize: 16, color: "#e0f7fa" }} />
              <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: "#fff", letterSpacing: 0.3 }}>
                Ritter Analyst
              </Typography>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#69f0ae", boxShadow: "0 0 6px #69f0ae" }} />
            </Box>
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.73rem", fontWeight: 500, mt: 1 }}>
              {enriched.length} scored · {counts.STRONG} strong · {counts.MODERATE} moderate · {counts.WEAK} below average
            </Typography>
          </Box>

          {/* Metric Cards 2x2 */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1.5 }}>
            {STAT_CARDS.map((card) => (
              <Box key={card.key} sx={{
                px: 2, py: 1.5, borderRadius: 2.5, background: card.gradient,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.15)", minHeight: 75,
              }}>
                <Typography sx={{ fontSize: "1.1rem", mb: 0.3 }}>{card.icon}</Typography>
                <Typography sx={{ fontSize: "1.3rem", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                  {statValues[card.key]}
                </Typography>
                <Typography sx={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.85)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, mt: 0.3, textAlign: "center" }}>
                  {card.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ═══ CONTENT ═══ */}
      <Box sx={{ maxWidth: 1400, mx: "auto", px: PX, mt: -1 }}>

        {/* Filter pills + Search */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
          {(["ALL", "STRONG", "MODERATE", "WEAK"] as const).map((f) => (
            <Chip
              key={f}
              label={`${f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()} ${counts[f]}`}
              size="small"
              onClick={() => setFilter(f)}
              sx={{
                fontWeight: 700, fontSize: "0.75rem", px: 0.5,
                bgcolor: filter === f ? "#0891b2" : "#fff",
                color: filter === f ? "#fff" : "#555",
                border: filter === f ? "none" : "1px solid #e0e0e0",
                "&:hover": { bgcolor: filter === f ? "#0891b2" : "#f5f5f5" },
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
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#aaa", fontSize: 18 }} /></InputAdornment>,
              }}
              sx={{
                width: 280,
                "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff", fontSize: "0.82rem" },
              }}
            />
          </Box>
        </Box>

        {/* ═══ TABLE ═══ */}
        <TableContainer sx={{ bgcolor: "#fff", borderRadius: 2.5, border: "2px solid #e8ecf0", mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                <TableCell sx={{ width: 40 }} />
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
                <TableCell sx={thStyle} align="center">
                  <TableSortLabel active={sortField === "verdict"} direction={sortField === "verdict" ? sortDir : "asc"} onClick={() => handleSort("verdict")}>
                    Verdict
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={thStyle}>Action Summary</TableCell>
                <TableCell sx={{ ...thStyle, width: 40 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: "center", py: 6 }}>
                    <Typography sx={{ color: "#aaa", fontWeight: 500 }}>
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
                        "&:hover": { bgcolor: isOpen ? "#f0fdfa" : "#f8fafc" },
                        transition: "background 0.15s",
                      }}
                    >
                      <TableCell sx={{ py: 1.2, px: 1 }}>
                        <IconButton size="small" sx={{ color: "#0891b2" }}>
                          {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell sx={tdStyle}>
                        <Typography sx={{ fontWeight: 800, color: "#0891b2", fontSize: "0.88rem" }}>
                          {rec.ticker}
                        </Typography>
                      </TableCell>
                      <TableCell sx={tdStyle}>
                        {rec.company_name || "—"}
                      </TableCell>
                      <TableCell sx={tdStyle}>
                        {rec.sector}
                      </TableCell>
                      <TableCell sx={tdStyle} align="center">
                        {rec.daysSince}d
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.2, px: 1 }}>
                        <Chip
                          label={`${rec.composite}`}
                          size="small"
                          sx={{
                            fontWeight: 900, fontSize: "0.78rem", height: 26, minWidth: 36,
                            bgcolor: rec.composite >= 70 ? "#ECFDF5" : rec.composite >= 50 ? "#FFFBEB" : "#FEF2F2",
                            color: getScoreColor(rec.composite),
                            border: `1.5px solid ${getScoreColor(rec.composite)}30`,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.2, px: 1 }}>
                        <Chip
                          label={verdictLabel}
                          size="small"
                          sx={{
                            fontWeight: 800, fontSize: "0.68rem", height: 24,
                            bgcolor: vc.bg, color: vc.color,
                            border: `1.5px solid ${vc.color}`,
                            boxShadow: `0 0 8px ${vc.glow}`,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ ...tdStyle, maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <Typography sx={{ fontSize: "0.75rem", color: "#555" }}>
                          {verdictLabel} &mdash; Score {rec.composite}/{rec.compositeMax}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.2, px: 1 }}>
                        <Tooltip title="Delete" arrow>
                          <IconButton size="small" onClick={(e) => handleDelete(rec.id, e)} sx={{ color: "#ccc", "&:hover": { color: "#DC2626" } }}>
                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>

                    {/* ── Expanded Detail ── */}
                    <TableRow>
                      <TableCell colSpan={9} sx={{ py: 0, px: 0, borderBottom: isOpen ? "3px solid #e0e5f0" : "none" }}>
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

      <PasteJsonDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaveSuccess={fetchRecords} />
    </Box>
  );
};

/* ═══ Expanded Detail (matches Gator layout) ═══ */
const ExpandedDetail: React.FC<{ record: any }> = ({ record }) => {
  const d = record.json_data;
  const scores = d?.ritter_scores || {};
  const market = d?.current_market || {};
  const ipo = d?.ipo_data || {};
  const vc = getVerdictConfig(record.verdict);

  const formatPrice = (v?: number) => v != null ? `$${v}` : "—";

  return (
    <Box sx={{ px: 3, py: 2.5, bgcolor: "#f5f7fb", borderTop: "3px solid #e0e5f0" }}>

      {/* Header: Ticker + Key Stats */}
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
          <Typography sx={{ fontSize: "1rem", fontWeight: 900, color: "#1E293B" }}>
            {record.ticker}
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", color: "#64748B", fontWeight: 500 }}>
            — {record.company_name}
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>
            {record.sector} · {record.daysSince}d since IPO
          </Typography>
          <Box sx={{ ml: "auto" }}>
            <Chip
              label={record.verdict.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
              size="small"
              sx={{
                fontSize: "0.72rem", fontWeight: 900, height: 26,
                bgcolor: vc.bg, color: vc.color,
                border: `2px solid ${vc.color}`,
                boxShadow: `0 0 12px ${vc.glow}`,
              }}
            />
          </Box>
        </Box>

        {/* Stat cards row */}
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
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
          <StatCard label="Composite Score" value={`${scores.composite_score ?? 0}/100`} color={getScoreColor(scores.composite_score ?? 0)} />
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
      <ScorecardView data={d} />
    </Box>
  );
};

/* ═══ StatCard (matches Gator) ═══ */
const StatCard: React.FC<{ label: string; value: React.ReactNode; color?: string; bgColor?: string }> = ({
  label, value, color = "#1E293B", bgColor = "#F8FAFC",
}) => (
  <Box sx={{ p: 1.5, bgcolor: bgColor, borderRadius: 2, border: "1px solid #E2E8F0", minWidth: 100, flex: 1 }}>
    <Typography sx={{ fontSize: "0.62rem", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, mb: 0.3 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, color }}>
      {value}
    </Typography>
  </Box>
);

/* ═══ Table styles ═══ */
const thStyle = {
  fontWeight: 800,
  fontSize: "0.7rem",
  color: "#475569",
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  py: 1.2,
  px: 1.5,
  borderBottom: "2px solid #e2e8f0",
};

const tdStyle = {
  fontSize: "0.82rem",
  color: "#334155",
  py: 1.2,
  px: 1.5,
  fontWeight: 500,
};

export default JRitterAgentMain;
