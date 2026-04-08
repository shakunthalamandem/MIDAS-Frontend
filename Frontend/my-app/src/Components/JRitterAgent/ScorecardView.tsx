import React, { useState } from "react";
import {
  Box,
  Chip,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

interface ScorecardViewProps {
  data: any;
}

/* ── Color helpers ── */
const signalStyle = (signal: string) => {
  const map: Record<string, { color: string; bg: string; gradient: string }> = {
    positive: { color: "#10b981", bg: "rgba(16,185,129,0.1)", gradient: "linear-gradient(90deg, #10b981, #34d399)" },
    moderate: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", gradient: "linear-gradient(90deg, #f59e0b, #fbbf24)" },
    caution:  { color: "#f97316", bg: "rgba(249,115,22,0.1)", gradient: "linear-gradient(90deg, #f97316, #fb923c)" },
    negative: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", gradient: "linear-gradient(90deg, #ef4444, #f87171)" },
  };
  return map[signal] || { color: "#64748b", bg: "rgba(100,116,139,0.1)", gradient: "linear-gradient(90deg, #64748b, #94a3b8)" };
};

const ringColor = (pct: number) => (pct >= 75 ? "#10b981" : pct >= 55 ? "#f59e0b" : "#ef4444");

/* ── Tabs ── */
const TABS = ["Dimensions", "IPO Data", "Fundamentals", "Underwriters"] as const;
type TabName = typeof TABS[number];

const ScorecardView: React.FC<ScorecardViewProps> = ({ data }) => {
  const [tab, setTab] = useState<TabName>("Dimensions");
  const scores = data.ritter_scores || {};
  const dims = scores.dimensions || [];
  const market = data.current_market || {};
  const ipo = data.ipo_data || {};
  const fundamentals = data.company_fundamentals || {};
  const underwriters = data.underwriters || [];
  const meta = data.meta || {};

  const composite = scores.composite_score ?? 0;
  const compositeMax = scores.composite_max ?? 100;
  const pct = compositeMax > 0 ? (composite / compositeMax) * 100 : 0;
  const verdict = scores.verdict_label || scores.verdict || "";

  // Filter tabs to only show those with data
  const availableTabs = TABS.filter((t) => {
    if (t === "Dimensions") return dims.length > 0;
    if (t === "IPO Data") return Object.keys(ipo).length > 0;
    if (t === "Fundamentals") return Object.keys(fundamentals).length > 0;
    if (t === "Underwriters") return underwriters.length > 0;
    return true;
  });

  return (
    <Box>
      {/* ── Top: Score ring + Company info ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, md: 4 }, mb: 3 }}>
        {/* Ring */}
        <ScoreRing score={composite} max={compositeMax} size={100} />

        {/* Info */}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
            <Typography sx={{ fontSize: "1.4rem", fontWeight: 900, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
              {data.ticker}
            </Typography>
            {data.exchange && (
              <Typography sx={{ fontSize: "0.6rem", color: "#64748b", fontWeight: 600, bgcolor: "#334155", px: 0.8, py: 0.15, borderRadius: 1 }}>
                {data.exchange}
              </Typography>
            )}
            {verdict && (
              <Chip
                label={verdict.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                size="small"
                sx={{
                  fontWeight: 700, fontSize: "0.65rem", height: 22,
                  bgcolor: `${ringColor(pct)}15`, color: ringColor(pct),
                }}
              />
            )}
          </Stack>
          <Typography sx={{ color: "#94a3b8", fontSize: "0.88rem", mb: 1 }}>
            {data.company_name || "—"}
          </Typography>

          {/* Quick metrics row */}
          <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap" }}>
            {market.current_price !== undefined && <QuickMetric label="Price" value={`$${market.current_price}`} />}
            {market.market_cap_b !== undefined && <QuickMetric label="Mkt Cap" value={`$${market.market_cap_b}B`} />}
            {market.return_vs_ipo_pct !== undefined && (
              <QuickMetric label="vs IPO" value={`${market.return_vs_ipo_pct > 0 ? "+" : ""}${market.return_vs_ipo_pct}%`}
                valueColor={market.return_vs_ipo_pct >= 0 ? "#10b981" : "#ef4444"} />
            )}
            {data.ipo_date && <QuickMetric label="IPO Date" value={data.ipo_date} />}
            {data.days_since_ipo !== undefined && <QuickMetric label="Days Since" value={`${data.days_since_ipo}d`} />}
          </Stack>
        </Box>
      </Box>

      {/* ── Tab Bar ── */}
      <Stack direction="row" spacing={0.5} mb={3} sx={{ borderBottom: "1px solid #334155", pb: 0 }}>
        {availableTabs.map((t) => (
          <Box
            key={t}
            onClick={() => setTab(t)}
            sx={{
              px: 2, py: 1.2,
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: tab === t ? 700 : 500,
              color: tab === t ? "#06b6d4" : "#64748b",
              borderBottom: tab === t ? "2px solid #06b6d4" : "2px solid transparent",
              transition: "all 0.15s",
              "&:hover": { color: tab === t ? "#06b6d4" : "#94a3b8" },
            }}
          >
            {t}
            {t === "Dimensions" && <Typography component="span" sx={{ fontSize: "0.65rem", color: "#475569", ml: 0.5 }}>({dims.length})</Typography>}
          </Box>
        ))}
      </Stack>

      {/* ── Tab Content ── */}
      {tab === "Dimensions" && <DimensionsTab dims={dims} />}
      {tab === "IPO Data" && <KeyValuePanel data={ipo} config={IPO_FIELDS} />}
      {tab === "Fundamentals" && <KeyValuePanel data={fundamentals} config={FUND_FIELDS} />}
      {tab === "Underwriters" && <UnderwritersTab underwriters={underwriters} leadRank={data.lead_underwriter_cm_rank} />}

      {/* Disclaimer */}
      {meta.disclaimer && (
        <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #334155" }}>
          <Typography sx={{ color: "#475569", fontSize: "0.68rem", lineHeight: 1.6, fontStyle: "italic" }}>
            {meta.disclaimer}
          </Typography>
          {meta.framework_version && (
            <Typography sx={{ color: "#334155", fontSize: "0.62rem", mt: 0.5 }}>
              Framework v{meta.framework_version} &middot; {meta.scored_by || "Claude"}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

/* ═══ Score Ring ═══ */
const ScoreRing: React.FC<{ score: number; max: number; size?: number }> = ({ score, max, size = 100 }) => {
  const pct = max > 0 ? (score / max) * 100 : 0;
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const c = ringColor(pct);
  const half = size / 2;

  return (
    <Box sx={{ flexShrink: 0, position: "relative" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={half} cy={half} r={r} fill="none" stroke="#334155" strokeWidth={6} />
        <circle
          cx={half} cy={half} r={r} fill="none" stroke={c} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${half} ${half})`}
          filter="url(#glow)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text x={half} y={half - 4} textAnchor="middle" fontSize={size * 0.28} fontWeight="900" fill={c}>
          {score}
        </text>
        <text x={half} y={half + 16} textAnchor="middle" fontSize={size * 0.11} fill="#64748b">
          / {max}
        </text>
      </svg>
    </Box>
  );
};

/* ═══ Quick Metric ═══ */
const QuickMetric: React.FC<{ label: string; value: string; valueColor?: string }> = ({ label, value, valueColor }) => (
  <Box>
    <Typography sx={{ fontSize: "0.58rem", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: valueColor || "#e2e8f0" }}>
      {value}
    </Typography>
  </Box>
);

/* ═══ Dimensions Tab ═══ */
const DimensionsTab: React.FC<{ dims: any[] }> = ({ dims }) => (
  <Grid container spacing={1.5}>
    {dims.map((dim: any) => {
      const pct = dim.max_score > 0 ? (dim.score / dim.max_score) * 100 : 0;
      const s = signalStyle(dim.signal);
      return (
        <Grid item xs={12} md={6} key={dim.id}>
          <Box sx={{
            bgcolor: "#1e293b", borderRadius: 2.5, p: 2,
            border: "1px solid #334155",
            transition: "all 0.2s",
            "&:hover": { borderColor: `${s.color}33`, bgcolor: "#1e293b" },
          }}>
            {/* Title row */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.2}>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#e2e8f0", flex: 1, lineHeight: 1.3, pr: 1 }}>
                {dim.label}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.8}>
                <Chip
                  label={dim.signal}
                  size="small"
                  sx={{
                    fontWeight: 700, fontSize: "0.58rem", height: 20,
                    bgcolor: s.bg, color: s.color, textTransform: "capitalize",
                  }}
                />
                <Typography sx={{ fontWeight: 900, color: s.color, fontSize: "0.88rem", minWidth: 32, textAlign: "right" }}>
                  {dim.score}<Typography component="span" sx={{ fontSize: "0.65rem", color: "#475569" }}>/{dim.max_score}</Typography>
                </Typography>
              </Stack>
            </Stack>

            {/* Gauge bar */}
            <Box sx={{ height: 6, bgcolor: "#334155", borderRadius: 3, overflow: "hidden", mb: 1.2 }}>
              <Box sx={{
                width: `${pct}%`, height: "100%",
                background: s.gradient,
                borderRadius: 3,
                transition: "width 0.6s ease",
                boxShadow: `0 0 8px ${s.color}40`,
              }} />
            </Box>

            {/* Data point */}
            {dim.data_point && (
              <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8", lineHeight: 1.5 }}>
                {dim.data_point}
              </Typography>
            )}
            {dim.ritter_benchmark && (
              <Typography sx={{ fontSize: "0.65rem", color: "#475569", mt: 0.5, lineHeight: 1.4, fontStyle: "italic" }}>
                {dim.ritter_benchmark}
              </Typography>
            )}
          </Box>
        </Grid>
      );
    })}
  </Grid>
);

/* ═══ Key-Value Panel ═══ */
interface FieldConfig { key: string; label: string; prefix?: string; suffix?: string; type?: "bool" | "num" | "str" }

const IPO_FIELDS: FieldConfig[] = [
  { key: "offer_price", label: "Offer Price", prefix: "$" },
  { key: "file_range_low", label: "File Range Low", prefix: "$" },
  { key: "file_range_high", label: "File Range High", prefix: "$" },
  { key: "shares_offered", label: "Shares Offered" },
  { key: "shares_with_overallot", label: "Shares (w/ Overallot)" },
  { key: "gross_proceeds_m", label: "Gross Proceeds", prefix: "$", suffix: "M" },
  { key: "net_proceeds_m", label: "Net Proceeds", prefix: "$", suffix: "M" },
  { key: "first_day_open", label: "1st Day Open", prefix: "$" },
  { key: "first_day_close", label: "1st Day Close", prefix: "$" },
  { key: "first_day_return_pct", label: "1st Day Return", suffix: "%" },
  { key: "overallotment_exercised", label: "Overallotment Exercised", type: "bool" },
  { key: "priced_at_top_of_range", label: "Priced at Top", type: "bool" },
  { key: "upsize_pct", label: "Upsize", suffix: "%" },
];

const FUND_FIELDS: FieldConfig[] = [
  { key: "revenue_m", label: "Revenue", prefix: "$", suffix: "M" },
  { key: "net_income_m", label: "Net Income", prefix: "$", suffix: "M" },
  { key: "net_margin_pct", label: "Net Margin", suffix: "%" },
  { key: "profitable_at_ipo", label: "Profitable at IPO", type: "bool" },
  { key: "founding_year", label: "Founded" },
  { key: "age_at_ipo_years", label: "Age at IPO", suffix: " yrs" },
  { key: "sector", label: "Sector" },
  { key: "is_reit", label: "Is REIT", type: "bool" },
  { key: "sponsor_type", label: "Sponsor Type" },
];

const KeyValuePanel: React.FC<{ data: any; config: FieldConfig[] }> = ({ data, config }) => (
  <Grid container spacing={1.5}>
    {config.map((f) => {
      const val = data[f.key];
      if (val === undefined || val === null) return null;
      let display: string;
      if (f.type === "bool") display = val ? "Yes" : "No";
      else if (typeof val === "string") display = val.replace(/_/g, " ");
      else display = `${f.prefix || ""}${typeof val === "number" ? val.toLocaleString() : val}${f.suffix || ""}`;

      return (
        <Grid item xs={6} sm={4} md={3} key={f.key}>
          <Box sx={{ bgcolor: "#1e293b", borderRadius: 2, p: 1.5, border: "1px solid #334155", height: "100%" }}>
            <Typography sx={{ fontSize: "0.6rem", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.3 }}>
              {f.label}
            </Typography>
            <Typography sx={{
              fontSize: "0.88rem", fontWeight: 700,
              color: f.type === "bool" ? (val ? "#10b981" : "#ef4444") : "#e2e8f0",
            }}>
              {display}
            </Typography>
          </Box>
        </Grid>
      );
    })}
  </Grid>
);

/* ═══ Underwriters Tab ═══ */
const UnderwritersTab: React.FC<{ underwriters: any[]; leadRank?: number }> = ({ underwriters, leadRank }) => (
  <Box>
    <TableContainer sx={{ bgcolor: "#1e293b", borderRadius: 2.5, border: "1px solid #334155" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {["Name", "Role", "CM Rank"].map((h) => (
              <TableCell key={h} sx={{
                fontWeight: 700, fontSize: "0.68rem", color: "#64748b",
                borderBottom: "1px solid #334155", py: 1.2, px: 2,
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {underwriters.map((uw: any, i: number) => (
            <TableRow key={i} sx={{ "&:hover": { bgcolor: "rgba(6,182,212,0.03)" } }}>
              <TableCell sx={{ color: "#e2e8f0", fontSize: "0.8rem", fontWeight: 600, borderBottom: "1px solid #334155", py: 1, px: 2 }}>
                {uw.name}
              </TableCell>
              <TableCell sx={{ borderBottom: "1px solid #334155", py: 1, px: 2 }}>
                <Chip
                  label={uw.role?.replace(/_/g, " ")}
                  size="small"
                  sx={{
                    fontSize: "0.62rem", height: 20, fontWeight: 600,
                    bgcolor: uw.role === "lead_left" ? "rgba(6,182,212,0.12)" : uw.role === "lead" ? "rgba(139,92,246,0.12)" : "#334155",
                    color: uw.role === "lead_left" ? "#06b6d4" : uw.role === "lead" ? "#8b5cf6" : "#94a3b8",
                    textTransform: "capitalize",
                  }}
                />
              </TableCell>
              <TableCell sx={{ borderBottom: "1px solid #334155", py: 1, px: 2 }}>
                <Box sx={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 28, height: 28, borderRadius: 1.5,
                  bgcolor: (uw.cm_rank || 0) >= 9 ? "rgba(16,185,129,0.12)" : (uw.cm_rank || 0) >= 7 ? "rgba(245,158,11,0.12)" : "#334155",
                  color: (uw.cm_rank || 0) >= 9 ? "#10b981" : (uw.cm_rank || 0) >= 7 ? "#f59e0b" : "#94a3b8",
                  fontWeight: 800, fontSize: "0.78rem",
                }}>
                  {uw.cm_rank}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    {leadRank !== undefined && (
      <Typography sx={{ color: "#475569", fontSize: "0.7rem", mt: 1.5 }}>
        Lead Underwriter CM Rank: <Typography component="span" sx={{ fontWeight: 800, color: "#e2e8f0" }}>{leadRank}</Typography>
      </Typography>
    )}
  </Box>
);

export default ScorecardView;
