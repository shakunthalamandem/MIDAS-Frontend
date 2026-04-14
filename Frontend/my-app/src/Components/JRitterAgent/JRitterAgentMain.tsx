import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
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
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import ScorecardView from "./ScorecardView";
import { normalizeJson } from "./normalizeJson";

interface SavedRecord {
  id: number;
  ticker: string;
  company_name: string;
  json_data: any;
  created_at: string;
}

interface MarketOutlook {
  report_date: string;
  market_temperature: string;
  rolling_180d_avg_first_day_return: number | null;
  ipo_volume_90d: number;
  ipo_volume_vs_3yr_median: number | null;
  price_revision_above_high_pct: number | null;
  price_revision_sentiment: string;
  post_ipo_first_week_above_day1_pct: number | null;
  first_week_breadth_signal: string;
  market_commentary: string;
  generated_at: string;
}

interface ApiResponse {
  market_outlook: MarketOutlook;
  jritter_agents: SavedRecord[];
}

/* ── Signal / verdict config ── */
const VERDICT_CONFIG: Record<string, { bg: string; color: string; glow: string }> = {
  strong_favorable:   { bg: "#ecfdf5", color: "#065f46", glow: "rgba(6,95,70,0.15)" },
  moderate_favorable: { bg: "#ecfdf5", color: "#047857", glow: "rgba(4,120,87,0.12)" },
  favorable:          { bg: "#ecfdf5", color: "#065f46", glow: "rgba(6,95,70,0.15)" },
  neutral:            { bg: "#fffbeb", color: "#92400e", glow: "rgba(146,64,14,0.15)" },
  moderate_cautious:  { bg: "#fffbeb", color: "#92400e", glow: "rgba(146,64,14,0.15)" },
  cautious:           { bg: "#fff1f2", color: "#9f1239", glow: "rgba(159,18,57,0.15)" },
  below_average:      { bg: "#fff1f2", color: "#9f1239", glow: "rgba(159,18,57,0.15)" },
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
const getScoreBg   = (s: number) => (s >= 70 ? "#ECFDF5" : s >= 50 ? "#FFFBEB" : "#FFF1F2");

/* ── Metric cards config ── */
const STAT_CARDS = [
  {
    key: "total",
    label: "Total IPOs Scored",
    icon: "📊",
    gradient: "linear-gradient(135deg,#0369a1 0%,#0891b2 100%)",
    glow: "rgba(8,145,178,0.35)",
  },
  {
    key: "avg_score",
    label: "Average Composite Score",
    icon: "📈",
    gradient: "linear-gradient(135deg,#4f46e5 0%,#818cf8 100%)",
    glow: "rgba(79,70,229,0.35)",
  },
  {
    key: "strong",
    label: "Strong (75+)",
    icon: "✅",
    gradient: "linear-gradient(135deg,#047857 0%,#10b981 100%)",
    glow: "rgba(16,185,129,0.35)",
  },
  {
    key: "weak",
    label: "Below Avg (<55)",
    icon: "⚠️",
    gradient: "linear-gradient(135deg,#be123c 0%,#f43f5e 100%)",
    glow: "rgba(244,63,94,0.35)",
  },
];

type SortField = "ticker" | "company_name" | "sector" | "days" | "composite" | "tier" | "signal" | "verdict";

const TIER_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  tier1: { bg: "#ecfdf5", color: "#065f46", label: "Tier 1" },
  tier2: { bg: "#fffbeb", color: "#92400e", label: "Tier 2" },
  tier3: { bg: "#fff1f2", color: "#9f1239", label: "Tier 3" },
};
const getTierConfig = (tier: string) => {
  const key = tier.toLowerCase().replace(/[\s-]+/g, "");
  return TIER_CONFIG[key] || { bg: "#f1f5f9", color: "#475569", label: tier || "—" };
};

const JRitterAgentMain: React.FC = () => {
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [marketOutlook, setMarketOutlook] = useState<MarketOutlook | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
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
      const data: ApiResponse = await res.json();
      setMarketOutlook(data.market_outlook);
      setRecords(data.jritter_agents);
    } catch {
      setRecords([]);
      setMarketOutlook(null);
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(); }, []);

  // Enriched records — normalize both JSON formats
  const enriched = useMemo(() => records.map((r) => {
    const n = normalizeJson(r.json_data);
    return {
      ...r,
      normalized: n,
      composite: n.composite_score,
      compositeMax: n.composite_max,
      verdict: n.verdict,
      sector: n.sector || "—",
      daysSince: n.days_since_ipo,
      exchange: n.exchange,
      price: n.key_metrics.current_price ?? n.key_metrics.current_price_apr7_2026,
      returnPct: n.key_metrics.return_vs_ipo_pct ?? n.key_metrics.current_return_vs_ipo_pct,
      mktCap: n.key_metrics.market_cap_b ?? n.key_metrics.market_cap_approx_usd,
      ipoDate: n.ipo_date,
      grade: n.composite_grade,
      tier: n.composite_tier,
      signal: n.composite_signal,
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
      else if (sortField === "company_name") { av = (a.company_name || "").toLowerCase(); bv = (b.company_name || "").toLowerCase(); }
      else if (sortField === "sector") { av = a.sector.toLowerCase(); bv = b.sector.toLowerCase(); }
      else if (sortField === "days") { av = a.daysSince; bv = b.daysSince; }
      else if (sortField === "composite") { av = a.composite; bv = b.composite; }
      else if (sortField === "tier") { av = a.tier?.toLowerCase() || ""; bv = b.tier?.toLowerCase() || ""; }
      else if (sortField === "signal") { av = a.signal?.toLowerCase() || ""; bv = b.signal?.toLowerCase() || ""; }
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
      <Box sx={{ background: "linear-gradient(160deg,#0f2d4a 0%,#0e5a80 50%,#0891b2 100%)", pb: 5.5 }}>
        <Box sx={{ maxWidth: 1400, mx: "auto", px: PX }}>

          {/* Top bar */}
          {/* <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", pt: 2.5, pb: 1 }}>
            <Typography sx={{
              color: "#ffffff", fontSize: "0.7rem",
              textTransform: "uppercase", fontWeight: 700,
              fontFamily: "'Inter', 'Roboto', sans-serif",justifyContent: "center", alignItems: "center", 
            }}>
              Academic IPO analysis applying established research frameworks, focusing on pricing, underpricing, and long-term performance of US IPOs.
            </Typography>
          </Box> */}

          {/* Centered Title */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography sx={{
              color: "#fff", fontWeight: 900,
              fontSize: { xs: "1.7rem", md: "2.3rem" },
              letterSpacing: -1,
              fontFamily: "'Inter', 'Roboto', sans-serif",
              textShadow: "0 2px 20px rgba(0,0,0,0.25)",
            }}>
              Gator IPO Agent
            </Typography>
            {/* <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 1,
              px: 2.2, py: 0.7, borderRadius: 5, mt: 1.5,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(12px)",
            }}>
              <AutoGraphIcon sx={{ fontSize: 14, color: "#67e8f9" }} />
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#e0f7fa", letterSpacing: 0.5 }}>
                Gator Analyst
              </Typography>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#4ade80", boxShadow: "0 0 10px #4ade80" }} />
            </Box> */}
            <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", fontWeight: 500, mt: 1.5 }}>
              {enriched.length} scored · {counts.STRONG} strong · {counts.MODERATE} moderate · {counts.WEAK} below average
            </Typography>
          </Box>

          {/* Market Outlook Section */}
          {marketOutlook && (
            <Box sx={{
              bgcolor: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 3,
              p: 3,
              backdropFilter: "blur(12px)",
              mb: 4,
              mt: 4,
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Typography sx={{
                  color: "#fff", fontWeight: 900,
                  fontSize: "0.9rem", letterSpacing: 2, textTransform: "uppercase",
                  fontFamily: "'Inter', 'Roboto', sans-serif",
                }}>
                  Market Outlook
                </Typography>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 3 }}>
                <Box>
                  <Typography sx={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.6 }}>
                    {marketOutlook.market_commentary}
                  </Typography>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  {marketOutlook.rolling_180d_avg_first_day_return !== null && marketOutlook.rolling_180d_avg_first_day_return !== undefined && (
                    <Box sx={{ px: 1.5, py: 1.5, bgcolor: "rgba(8,145,178,0.2)", borderRadius: 2, border: "1px solid rgba(8,145,178,0.3)" }}>
                      <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", fontWeight: 700, mb: 0.5 }}>
                        180-Day Avg
                      </Typography>
                      <Typography sx={{ fontSize: "1.2rem", fontWeight: 900, color: "#67e8f9" }}>
                        {((marketOutlook.rolling_180d_avg_first_day_return ?? 0) * 100).toFixed(2)}%
                      </Typography>
                    </Box>
                  )}
                  {marketOutlook.ipo_volume_vs_3yr_median !== null && marketOutlook.ipo_volume_vs_3yr_median !== undefined && (
                    <Box sx={{ px: 1.5, py: 1.5, bgcolor: "rgba(16,185,129,0.2)", borderRadius: 2, border: "1px solid rgba(16,185,129,0.3)" }}>
                      <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", fontWeight: 700, mb: 0.5 }}>
                        Volume vs 3yr
                      </Typography>
                      <Typography sx={{ fontSize: "1.2rem", fontWeight: 900, color: "#4ade80" }}>
                        {((marketOutlook.ipo_volume_vs_3yr_median ?? 0).toFixed(2))}x
                      </Typography>
                    </Box>
                  )}
                  {marketOutlook.price_revision_above_high_pct !== null && marketOutlook.price_revision_above_high_pct !== undefined && (
                    <Box sx={{ px: 1.5, py: 1.5, bgcolor: "rgba(244,63,94,0.2)", borderRadius: 2, border: "1px solid rgba(244,63,94,0.3)" }}>
                      <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", fontWeight: 700, mb: 0.5 }}>
                        Priced Above
                      </Typography>
                      <Typography sx={{ fontSize: "1.2rem", fontWeight: 900, color: "#f43f5e" }}>
                        {(((marketOutlook.price_revision_above_high_pct ?? 0) * 100).toFixed(1))}%
                      </Typography>
                    </Box>
                  )}
                  {marketOutlook.market_temperature && (
                    <Box sx={{ px: 1.5, py: 1.5, bgcolor: "rgba(251,146,60,0.2)", borderRadius: 2, border: "1px solid rgba(251,146,60,0.3)" }}>
                      <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", fontWeight: 700, mb: 0.5 }}>
                        Temperature
                      </Typography>
                      <Typography sx={{ fontSize: "1.2rem", fontWeight: 900, color: "#fb923c", textTransform: "uppercase" }}>
                        {marketOutlook.market_temperature}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )}

          {/* Metric Cards */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2.5 }}>
            {STAT_CARDS.map((card) => (
              <Box key={card.key} sx={{
                px: 2.5, py: 2.5, borderRadius: 3.5,
                background: card.gradient,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.15)",
                minHeight: 90,
                boxShadow: `0 8px 24px ${card.glow}`,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: -20, right: -20,
                  width: 80, height: 80,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                },
              }}>
                <Typography sx={{ fontSize: "1.3rem", mb: 0.5 }}>{card.icon}</Typography>
                <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                  {statValues[card.key]}
                </Typography>
                <Typography sx={{ fontSize: "0.57rem", color: "rgba(255,255,255,0.85)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, mt: 0.5, textAlign: "center" }}>
                  {card.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ═══ CONTENT ═══ */}
      <Box sx={{ maxWidth: 1400, mx: "auto", px: PX, mt: -2.5 }}>

        {/* Filter pills + Search */}
        <Box sx={{
          display: "flex", alignItems: "center", gap: 1.5, mb: 3, flexWrap: "wrap",
          bgcolor: "#fff", px: 2.5, py: 1.5, borderRadius: 3,
          boxShadow: "0 4px 16px rgba(0,0,0,0.07)", border: "1px solid #e8ecf0",
        }}>
          {(["ALL", "STRONG", "MODERATE", "WEAK"] as const).map((f) => {
            const colors: Record<string, { active: string; text: string }> = {
              ALL:      { active: "#0891b2", text: "#fff" },
              STRONG:   { active: "#047857", text: "#fff" },
              MODERATE: { active: "#d97706", text: "#fff" },
              WEAK:     { active: "#be123c", text: "#fff" },
            };
            const c = colors[f];
            return (
              <Chip
                key={f}
                label={`${f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()} ${counts[f]}`}
                size="small"
                onClick={() => setFilter(f)}
                sx={{
                  fontWeight: 700, fontSize: "0.74rem", px: 0.5, height: 30, borderRadius: 2,
                  bgcolor: filter === f ? c.active : "#f1f5f9",
                  color: filter === f ? c.text : "#475569",
                  border: filter === f ? "none" : "1px solid #e2e8f0",
                  fontFamily: "'Inter', 'Roboto', sans-serif",
                  "&:hover": { bgcolor: filter === f ? c.active : "#e2e8f0" },
                  transition: "all 0.15s",
                }}
              />
            );
          })}
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
                  borderRadius: 2.5, bgcolor: "#f8fafc", fontSize: "0.82rem",
                  fontFamily: "'Inter', 'Roboto', sans-serif",
                  "& fieldset": { borderColor: "#e2e8f0" },
                  "&:hover fieldset": { borderColor: "#0891b2" },
                },
              }}
            />
          </Box>
        </Box>

        {/* ═══ TABLE ═══ */}
        <Box sx={{ bgcolor: "#fff", borderRadius: 3, border: "1px solid #e2e8f0", mb: 5, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <TableContainer>
            <Table size="small" sx={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: 40 }} />
                <col style={{ width: 100 }} />
                <col style={{ width: 200 }} />
                <col style={{ width: 280 }} />
                <col style={{ width: 70 }} />
                <col style={{ width: 100 }} />
                <col style={{ width: 100 }} />
                <col style={{ width: 200 }} />
                <col />
              </colgroup>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <TableCell sx={{ py: 1.5, px: 1.5 }} />
                  <TableCell sx={thStyle}>
                    <TableSortLabel active={sortField === "ticker"} direction={sortField === "ticker" ? sortDir : "asc"} onClick={() => handleSort("ticker")}>
                      Ticker
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={thStyle}>
                    <TableSortLabel active={sortField === "company_name"} direction={sortField === "company_name" ? sortDir : "asc"} onClick={() => handleSort("company_name")}>
                      Issuer
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={thStyle}>
                    <TableSortLabel active={sortField === "sector"} direction={sortField === "sector" ? sortDir : "asc"} onClick={() => handleSort("sector")}>
                      Sector
                    </TableSortLabel>
                  </TableCell>
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
                    <TableSortLabel active={sortField === "tier"} direction={sortField === "tier" ? sortDir : "asc"} onClick={() => handleSort("tier")}>
                      Tier
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={thStyle} align="left">
                    <TableSortLabel active={sortField === "signal"} direction={sortField === "signal" ? sortDir : "asc"} onClick={() => handleSort("signal")}>
                      Signal
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={thStyle} align="left">
                    <TableSortLabel active={sortField === "verdict"} direction={sortField === "verdict" ? sortDir : "asc"} onClick={() => handleSort("verdict")}>
                      Verdict
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: "center", py: 10 }}>
                      <Typography sx={{ color: "#94a3b8", fontWeight: 500, fontSize: "0.88rem" }}>
                        {enriched.length === 0 ? 'No scorecards yet. Go to Upload JSON to start.' : "No results match your filter."}
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
                          <Typography sx={{ fontWeight: 800, color: "#0891b2", fontSize: "0.9rem", letterSpacing: 0.5 }}>
                            {rec.ticker}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ ...tdStyle, whiteSpace: "normal", wordBreak: "break-word" }}>
                          {rec.company_name || "—"}
                        </TableCell>
                        <TableCell sx={{ ...tdStyle, whiteSpace: "normal", wordBreak: "break-word" }}>
                          <Typography sx={{ fontSize: "0.78rem", color: "#000000" }}>{rec.sector}</Typography>
                        </TableCell>
                        <TableCell sx={tdStyle} align="center">
                          <Typography sx={{ fontSize: "0.82rem", color: "#000000", fontWeight: 600 }}>{rec.daysSince}d</Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5, px: 1.5 }}>
                          <Box sx={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            px: 1.4, py: 0.5, borderRadius: 2,
                            bgcolor: getScoreBg(rec.composite),
                            border: `1.5px solid ${getScoreColor(rec.composite)}40`,
                            minWidth: 48,
                          }}>
                            <Typography sx={{ fontWeight: 900, fontSize: "0.85rem", color: getScoreColor(rec.composite) }}>
                              {rec.composite}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 1.5, px: 1.5 }}>
                          {rec.tier ? (() => {
                            const tc = getTierConfig(rec.tier);
                            return (
                              <Chip
                                label={tc.label}
                                size="small"
                                sx={{
                                  fontWeight: 700, fontSize: "0.68rem", height: 24,
                                  bgcolor: tc.bg, color: tc.color,
                                  border: `1px solid ${tc.color}50`,
                                  fontFamily: "'Inter', 'Roboto', sans-serif",
                                }}
                              />
                            );
                          })() : <Typography sx={{ fontSize: "0.78rem", color: "#cbd5e1" }}>—</Typography>}
                        </TableCell>
                        <TableCell sx={{ py: 1.5, px: 1.5, whiteSpace: "normal", wordBreak: "break-word" }}>
                          {rec.signal ? (
                            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#334155" }}>
                              {rec.signal}
                            </Typography>
                          ) : <Typography sx={{ fontSize: "0.78rem", color: "#cbd5e1" }}>—</Typography>}
                        </TableCell>
                        <TableCell sx={{ py: 1.5, px: 1.5 }}>
                          <Chip
                            label={verdictLabel}
                            size="small"
                            sx={{
                              fontWeight: 700, fontSize: "0.68rem", height: 24, maxWidth: "100%",
                              bgcolor: vc.bg, color: vc.color,
                              border: `1px solid ${vc.color}50`,
                              fontFamily: "'Inter', 'Roboto', sans-serif",
                              "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
                            }}
                          />
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
    </Box>
  );
};

/* ═══ Expanded Detail ═══ */
const ExpandedDetail: React.FC<{ record: any }> = ({ record }) => {
  const n = record.normalized || normalizeJson(record.json_data);

  return (
    <Box sx={{ px: 3, py: 3, bgcolor: "#f5f7fa" }}>
      {/* Header card */}
      <Box sx={{
        mb: 2, px: 2.5, py: 1.8, bgcolor: "#fff", borderRadius: 2.5,
        border: "1px solid #e8ecf0", boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
        display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap",
      }}>
        <Typography sx={{ fontSize: "1rem", fontWeight: 900, color: "#0891b2", letterSpacing: 0.4 }}>
          {n.ticker}
        </Typography>
        <Typography sx={{ fontSize: "0.88rem", color: "#334155", fontWeight: 600 }}>
          {n.company_name}
        </Typography>
        {n.sector && (
          <Box sx={{ px: 1.2, py: 0.25, bgcolor: "#f1f5f9", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
            <Typography sx={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500 }}>{n.sector}</Typography>
          </Box>
        )}
        {n.days_since_ipo > 0 && (
          <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>
            {n.days_since_ipo}d since IPO
          </Typography>
        )}
        {n.composite_grade && (
          <Box sx={{ ml: "auto" }}>
            <Chip
              label={`Grade ${n.composite_grade}`}
              size="small"
              sx={{
                fontSize: "0.72rem", fontWeight: 900, height: 26,
                bgcolor: getScoreBg(n.composite_score),
                color: getScoreColor(n.composite_score),
                border: `1.5px solid ${getScoreColor(n.composite_score)}40`,
              }}
            />
          </Box>
        )}
      </Box>

      {/* Scorecard */}
      <Box sx={{ bgcolor: "#fff", borderRadius: 2.5, border: "1px solid #e8ecf0", p: 2.5, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <ScorecardView normalized={n} />
      </Box>
    </Box>
  );
};


/* ═══ Table styles ═══ */
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

export default JRitterAgentMain;
