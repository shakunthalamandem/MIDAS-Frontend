import React, { useState } from "react";
import {
  Box,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { NormalizedData, normalizeJson } from "./normalizeJson";

interface ScorecardViewProps {
  normalized?: NormalizedData;
  data?: any; // legacy fallback
}

/* ── Signal colors ── */
const signalStyle = (signal: string) => {
  const map: Record<string, { color: string; bg: string; barColor: string }> = {
    positive:        { color: "#059669", bg: "#F0FDF4", barColor: "#10B981" },
    strong_positive: { color: "#047857", bg: "#ECFDF5", barColor: "#059669" },
    moderate:        { color: "#D97706", bg: "#FFFBEB", barColor: "#F59E0B" },
    neutral:         { color: "#64748B", bg: "#F1F5F9", barColor: "#94A3B8" },
    neutral_to_negative: { color: "#EA580C", bg: "#FFF7ED", barColor: "#F97316" },
    caution:         { color: "#EA580C", bg: "#FFF7ED", barColor: "#F97316" },
    negative:        { color: "#DC2626", bg: "#FEF2F2", barColor: "#EF4444" },
  };
  return map[signal] || map.neutral;
};

/* ── Tabs ── */
const ALL_TABS = ["Dimensions", "Strengths & Concerns", "IPO Data", "Fundamentals", "Underwriters"] as const;
type TabName = typeof ALL_TABS[number];

const TAB_COLORS: Record<string, { active: string; light: string }> = {
  Dimensions:              { active: "#0891b2", light: "#ecfeff" },
  "Strengths & Concerns":  { active: "#7c3aed", light: "#f5f3ff" },
  "IPO Data":              { active: "#4f46e5", light: "#eef2ff" },
  Fundamentals:            { active: "#7c3aed", light: "#f5f3ff" },
  Underwriters:            { active: "#0f766e", light: "#f0fdfa" },
};

const ScorecardView: React.FC<ScorecardViewProps> = ({ normalized, data }) => {
  const n = normalized || (data ? normalizeJson(data) : null);
  if (!n) return null;

  const [tab, setTab] = useState<TabName>("Dimensions");

  const availableTabs = ALL_TABS.filter((t) => {
    if (t === "Dimensions") return n.dimensions.length > 0;
    if (t === "Strengths & Concerns") return n.strengths.length > 0 || n.concerns.length > 0;
    if (t === "IPO Data") return Object.values(n.ipo_data).some((v) => v != null);
    if (t === "Fundamentals") return Object.values(n.fundamentals).some((v) => v != null);
    if (t === "Underwriters") return n.underwriters.length > 0;
    return true;
  });

  return (
    <Box>
      {/* Tab bar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5, flexWrap: "wrap" }}>
        {availableTabs.map((t) => {
          const tc = TAB_COLORS[t] || { active: "#0891b2", light: "#ecfeff" };
          const isActive = tab === t;
          return (
            <Box
              key={t}
              onClick={() => setTab(t)}
              sx={{
                px: 2.2, py: 0.75, cursor: "pointer", fontSize: "0.78rem",
                fontWeight: isActive ? 800 : 600, color: isActive ? tc.active : "#64748b",
                borderRadius: 5, bgcolor: isActive ? tc.light : "transparent",
                border: isActive ? `1.5px solid ${tc.active}40` : "1.5px solid transparent",
                transition: "all 0.18s", letterSpacing: 0.2,
                "&:hover": { color: tc.active, bgcolor: tc.light },
              }}
            >
              {t}{t === "Dimensions" && ` (${n.dimensions.length})`}
            </Box>
          );
        })}
      </Box>

      {/* Tab content */}
      {tab === "Dimensions" && <DimensionsGrid dims={n.dimensions} />}
      {tab === "Strengths & Concerns" && <StrengthsConcerns strengths={n.strengths} concerns={n.concerns} />}
      {tab === "IPO Data" && <KVGrid data={n.ipo_data} config={IPO_FIELDS} accent="#4f46e5" />}
      {tab === "Fundamentals" && <KVGrid data={n.fundamentals} config={FUND_FIELDS} accent="#7c3aed" />}
      {tab === "Underwriters" && <UnderwritersTable underwriters={n.underwriters} leadRank={n.lead_underwriter_cm_rank} />}

      {/* Disclaimer / Methodology */}
      {(n.disclaimer || n.methodology) && (
        <Box sx={{ mt: 2.5, pt: 1.5, borderTop: "1px solid #e2e8f0" }}>
          {n.methodology && (
            <Typography sx={{ fontSize: "0.68rem", color: "#64748b", lineHeight: 1.6, mb: 0.5 }}>
              <strong>Methodology:</strong> {n.methodology}
            </Typography>
          )}
          {n.disclaimer && (
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
              <InfoOutlinedIcon sx={{ fontSize: 13, color: "#aaa", mt: 0.2 }} />
              <Typography sx={{ fontSize: "0.65rem", color: "#94a3b8", lineHeight: 1.6, fontStyle: "italic" }}>
                {n.disclaimer}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

/* ═══ Dimensions Grid ═══ */
const DimensionsGrid: React.FC<{ dims: any[] }> = ({ dims }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
    {dims.map((dim: any) => {
      const pct = dim.max_score > 0 ? (dim.score / dim.max_score) * 100 : 0;
      const s = signalStyle(dim.signal);
      return (
        <Box key={dim.id} sx={{
          p: 2.5, bgcolor: s.bg, borderRadius: 2.5,
          border: `1.5px solid ${s.color}30`,
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
          "&:hover": { boxShadow: `0 4px 16px ${s.color}20`, borderColor: `${s.color}60` },
          transition: "all 0.2s",
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#1E293B", textTransform: "uppercase", letterSpacing: 0.6, lineHeight: 1.3, flex: 1, pr: 1 }}>
              {dim.label}
            </Typography>
            <Chip label={dim.signal?.replace(/_/g, " ")} size="small" sx={{
              fontWeight: 800, fontSize: "0.6rem", height: 22,
              bgcolor: "#fff", color: s.color, border: `1px solid ${s.color}60`, textTransform: "capitalize",
            }} />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.6 }}>
            <Typography sx={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>Score</Typography>
            <Typography sx={{ fontSize: "0.88rem", fontWeight: 900, color: s.color }}>
              {dim.score}/{dim.max_score}
            </Typography>
          </Box>
          <Box sx={{ width: "100%", height: 6, bgcolor: `${s.color}20`, borderRadius: 4, overflow: "hidden", mb: 1.5 }}>
            <Box sx={{ width: `${pct}%`, height: "100%", borderRadius: 4, bgcolor: s.barColor, transition: "width 0.6s ease-out" }} />
          </Box>

          {dim.rating && (
            <Chip label={dim.rating} size="small" sx={{ mb: 1, fontSize: "0.58rem", height: 18, fontWeight: 700, bgcolor: "#fff", color: s.color, border: `1px solid ${s.color}40` }} />
          )}

          {dim.data_point && (
            <Typography sx={{ fontSize: "0.7rem", color: "#334155", lineHeight: 1.55, mt: 0.5 }}>
              {dim.data_point}
            </Typography>
          )}
          {dim.ritter_benchmark && (
            <Typography sx={{ fontSize: "0.63rem", color: "#94A3B8", lineHeight: 1.45, mt: 0.6, fontStyle: "italic", borderTop: `1px solid ${s.color}20`, pt: 0.5 }}>
              {dim.ritter_benchmark}
            </Typography>
          )}
        </Box>
      );
    })}
  </Box>
);

/* ═══ Strengths & Concerns ═══ */
const StrengthsConcerns: React.FC<{ strengths: string[]; concerns: string[] }> = ({ strengths, concerns }) => (
  <Grid container spacing={2.5}>
    {strengths.length > 0 && (
      <Grid item xs={12} md={6}>
        <Box sx={{ bgcolor: "#F0FDF4", borderRadius: 2.5, border: "1.5px solid #BBF7D0", p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <CheckCircleOutlineIcon sx={{ color: "#059669", fontSize: 20 }} />
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#065F46", textTransform: "uppercase", letterSpacing: 0.8 }}>
              Strengths ({strengths.length})
            </Typography>
          </Box>
          {strengths.map((s, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1, mb: 1.2, alignItems: "flex-start" }}>
              <Typography sx={{ color: "#059669", fontWeight: 800, fontSize: "0.75rem", lineHeight: 1.6, flexShrink: 0 }}>+</Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#1E293B", lineHeight: 1.6 }}>{s}</Typography>
            </Box>
          ))}
        </Box>
      </Grid>
    )}
    {concerns.length > 0 && (
      <Grid item xs={12} md={6}>
        <Box sx={{ bgcolor: "#FEF2F2", borderRadius: 2.5, border: "1.5px solid #FECACA", p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <WarningAmberIcon sx={{ color: "#DC2626", fontSize: 20 }} />
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "#991B1B", textTransform: "uppercase", letterSpacing: 0.8 }}>
              Concerns ({concerns.length})
            </Typography>
          </Box>
          {concerns.map((c, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1, mb: 1.2, alignItems: "flex-start" }}>
              <Typography sx={{ color: "#DC2626", fontWeight: 800, fontSize: "0.75rem", lineHeight: 1.6, flexShrink: 0 }}>!</Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#1E293B", lineHeight: 1.6 }}>{c}</Typography>
            </Box>
          ))}
        </Box>
      </Grid>
    )}
  </Grid>
);

/* ═══ KV Grid ═══ */
interface FieldConfig { key: string; label: string; prefix?: string; suffix?: string; type?: "bool" }

const IPO_FIELDS: FieldConfig[] = [
  { key: "offer_price", label: "Offer Price", prefix: "$" },
  { key: "ipo_range_low", label: "Range Low", prefix: "$" },
  { key: "ipo_range_high", label: "Range High", prefix: "$" },
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
  { key: "price_to_sales", label: "P/S Multiple" },
];

const KVGrid: React.FC<{ data: any; config: FieldConfig[]; accent: string }> = ({ data, config, accent }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" }, gap: 1.5 }}>
    {config.map((f) => {
      const val = data[f.key];
      if (val === undefined || val === null) return null;
      let display: string;
      if (f.type === "bool") display = val ? "Yes" : "No";
      else if (typeof val === "string") display = val.replace(/_/g, " ");
      else display = `${f.prefix || ""}${typeof val === "number" ? val.toLocaleString() : val}${f.suffix || ""}`;

      const boolColor = f.type === "bool" ? (val ? "#059669" : "#DC2626") : undefined;
      const boolBg = f.type === "bool" ? (val ? "#F0FDF4" : "#FEF2F2") : "#fff";

      return (
        <Box key={f.key} sx={{ p: 1.5, bgcolor: boolBg, borderRadius: 2, border: "1px solid #E2E8F0", borderLeft: `3px solid ${boolColor || accent}` }}>
          <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.9, mb: 0.4 }}>
            {f.label}
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, color: boolColor || "#1E293B" }}>
            {display}
          </Typography>
        </Box>
      );
    })}
  </Box>
);

/* ═══ Underwriters Table ═══ */
const UnderwritersTable: React.FC<{ underwriters: any[]; leadRank?: number }> = ({ underwriters, leadRank }) => (
  <Box>
    <TableContainer sx={{ bgcolor: "#fff", borderRadius: 2, border: "1px solid #E2E8F0", overflow: "hidden" }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
            {["Name", "Role", "CM Rank"].map((h) => (
              <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.67rem", color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, py: 1.4 }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {underwriters.map((uw: any, i: number) => (
            <TableRow key={i} sx={{ "&:hover": { bgcolor: "#f8fafc" }, "&:last-child td": { borderBottom: 0 } }}>
              <TableCell sx={{ fontSize: "0.83rem", fontWeight: 600, color: "#1E293B", py: 1.2 }}>{uw.name}</TableCell>
              <TableCell sx={{ py: 1.2 }}>
                <Chip label={uw.role?.replace(/_/g, " ")} size="small" sx={{
                  fontSize: "0.62rem", height: 22, fontWeight: 700, textTransform: "capitalize",
                  bgcolor: uw.role === "lead_left" ? "#E0F2FE" : uw.role === "lead" ? "#EDE9FE" : "#F1F5F9",
                  color: uw.role === "lead_left" ? "#0369A1" : uw.role === "lead" ? "#6D28D9" : "#475569",
                }} />
              </TableCell>
              <TableCell sx={{ py: 1.2 }}>
                <Chip label={uw.cm_rank} size="small" sx={{
                  fontWeight: 900, fontSize: "0.75rem", height: 26, minWidth: 30,
                  bgcolor: (uw.cm_rank || 0) >= 9 ? "#ECFDF5" : (uw.cm_rank || 0) >= 7 ? "#FFFBEB" : "#F1F5F9",
                  color: (uw.cm_rank || 0) >= 9 ? "#059669" : (uw.cm_rank || 0) >= 7 ? "#D97706" : "#475569",
                  border: `1.5px solid ${(uw.cm_rank || 0) >= 9 ? "#059669" : (uw.cm_rank || 0) >= 7 ? "#D97706" : "#CBD5E1"}30`,
                }} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    {leadRank !== undefined && (
      <Typography sx={{ color: "#64748b", fontSize: "0.72rem", mt: 1.5 }}>
        Lead Underwriter CM Rank: <Typography component="span" sx={{ fontWeight: 900, color: "#1E293B" }}>{leadRank}</Typography>
      </Typography>
    )}
  </Box>
);

export default ScorecardView;
