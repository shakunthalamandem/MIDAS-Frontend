import React, { useState } from "react";
import {
  Box,
  Chip,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface ScorecardViewProps {
  data: any;
}

/* ── Signal colors (matches Gator style) ── */
const signalStyle = (signal: string) => {
  const map: Record<string, { color: string; bg: string; barColor: string }> = {
    positive: { color: "#059669", bg: "#F0FDF4", barColor: "#10B981" },
    moderate: { color: "#D97706", bg: "#FFFBEB", barColor: "#F59E0B" },
    caution:  { color: "#EA580C", bg: "#FFF7ED", barColor: "#F97316" },
    negative: { color: "#DC2626", bg: "#FEF2F2", barColor: "#EF4444" },
  };
  return map[signal] || { color: "#64748B", bg: "#F1F5F9", barColor: "#94A3B8" };
};

/* ── Tabs ── */
const TABS = ["Dimensions", "IPO Data", "Fundamentals", "Underwriters"] as const;
type TabName = typeof TABS[number];

const ScorecardView: React.FC<ScorecardViewProps> = ({ data }) => {
  const [tab, setTab] = useState<TabName>("Dimensions");
  const scores = data?.ritter_scores || {};
  const dims = scores.dimensions || [];
  const ipo = data?.ipo_data || {};
  const fundamentals = data?.company_fundamentals || {};
  const underwriters = data?.underwriters || [];
  const meta = data?.meta || {};

  const availableTabs = TABS.filter((t) => {
    if (t === "Dimensions") return dims.length > 0;
    if (t === "IPO Data") return Object.keys(ipo).length > 0;
    if (t === "Fundamentals") return Object.keys(fundamentals).length > 0;
    if (t === "Underwriters") return underwriters.length > 0;
    return true;
  });

  const TAB_COLORS: Record<string, { active: string; light: string }> = {
    Dimensions:   { active: "#0891b2", light: "#ecfeff" },
    "IPO Data":   { active: "#4f46e5", light: "#eef2ff" },
    Fundamentals: { active: "#7c3aed", light: "#f5f3ff" },
    Underwriters: { active: "#0f766e", light: "#f0fdfa" },
  };

  return (
    <Box>
      {/* Tab bar — pill style */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5, flexWrap: "wrap" }}>
        {availableTabs.map((t) => {
          const tc = TAB_COLORS[t] || { active: "#0891b2", light: "#ecfeff" };
          const isActive = tab === t;
          return (
            <Box
              key={t}
              onClick={() => setTab(t)}
              sx={{
                px: 2.2, py: 0.75,
                cursor: "pointer",
                fontSize: "0.78rem",
                fontWeight: isActive ? 800 : 600,
                color: isActive ? tc.active : "#64748b",
                borderRadius: 5,
                bgcolor: isActive ? tc.light : "transparent",
                border: isActive ? `1.5px solid ${tc.active}40` : "1.5px solid transparent",
                transition: "all 0.18s",
                fontFamily: "'Inter', 'Roboto', sans-serif",
                letterSpacing: 0.2,
                "&:hover": { color: tc.active, bgcolor: tc.light },
              }}
            >
              {t}{t === "Dimensions" && ` (${dims.length})`}
            </Box>
          );
        })}
      </Box>

      {/* Tab content */}
      {tab === "Dimensions" && <DimensionsGrid dims={dims} />}
      {tab === "IPO Data" && <KVGrid data={ipo} config={IPO_FIELDS} accent="#0891b2" />}
      {tab === "Fundamentals" && <KVGrid data={fundamentals} config={FUND_FIELDS} accent="#7c3aed" />}
      {tab === "Underwriters" && <UnderwritersTable underwriters={underwriters} leadRank={data?.lead_underwriter_cm_rank} />}

      {/* Disclaimer */}
      {meta.disclaimer && (
        <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid #e2e8f0" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}>
            <InfoOutlinedIcon sx={{ fontSize: 13, color: "#aaa" }} />
            <Typography sx={{ fontSize: "0.62rem", fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Disclaimer
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "0.68rem", color: "#94a3b8", lineHeight: 1.6, fontStyle: "italic" }}>
            {meta.disclaimer}
          </Typography>
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
      const barColor = s.barColor;
      return (
        <Box key={dim.id} sx={{
          p: 2.5, bgcolor: s.bg, borderRadius: 2.5,
          border: `1.5px solid ${s.color}30`,
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
          "&:hover": { boxShadow: `0 4px 16px ${s.color}20`, borderColor: `${s.color}60` },
          transition: "all 0.2s",
        }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#1E293B", textTransform: "uppercase", letterSpacing: 0.6, lineHeight: 1.3, flex: 1, pr: 1 }}>
              {dim.label}
            </Typography>
            <Chip
              label={dim.signal}
              size="small"
              sx={{
                fontWeight: 800, fontSize: "0.6rem", height: 22,
                bgcolor: "#fff", color: s.color,
                border: `1px solid ${s.color}60`,
                textTransform: "capitalize",
              }}
            />
          </Box>

          {/* Score + bar */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.6 }}>
            <Typography sx={{ fontSize: "0.68rem", color: "#64748b", fontWeight: 600 }}>
              Score
            </Typography>
            <Typography sx={{ fontSize: "0.88rem", fontWeight: 900, color: s.color }}>
              {dim.score}/{dim.max_score}
            </Typography>
          </Box>
          <Box sx={{ width: "100%", height: 6, bgcolor: `${s.color}20`, borderRadius: 4, overflow: "hidden", mb: 1.5 }}>
            <Box sx={{
              width: `${pct}%`, height: "100%", borderRadius: 4,
              bgcolor: barColor,
              transition: "width 0.6s ease-out",
            }} />
          </Box>

          {/* Data point */}
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

/* ═══ KV Grid (IPO Data / Fundamentals) ═══ */
interface FieldConfig { key: string; label: string; prefix?: string; suffix?: string; type?: "bool" }

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
      const boolBg   = f.type === "bool" ? (val ? "#F0FDF4" : "#FEF2F2") : "#fff";

      return (
        <Box key={f.key} sx={{
          p: 1.5, bgcolor: boolBg, borderRadius: 2,
          border: "1px solid #E2E8F0",
          borderLeft: `3px solid ${boolColor || accent}`,
        }}>
          <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.9, mb: 0.4 }}>
            {f.label}
          </Typography>
          <Typography sx={{
            fontSize: "0.9rem", fontWeight: 800,
            color: boolColor || "#1E293B",
          }}>
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
              <TableCell key={h} sx={{
                fontWeight: 700, fontSize: "0.67rem", color: "#64748b",
                textTransform: "uppercase", letterSpacing: 0.8, py: 1.4,
              }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {underwriters.map((uw: any, i: number) => (
            <TableRow key={i} sx={{ "&:hover": { bgcolor: "#f8fafc" }, "&:last-child td": { borderBottom: 0 } }}>
              <TableCell sx={{ fontSize: "0.83rem", fontWeight: 600, color: "#1E293B", py: 1.2 }}>
                {uw.name}
              </TableCell>
              <TableCell sx={{ py: 1.2 }}>
                <Chip
                  label={uw.role?.replace(/_/g, " ")}
                  size="small"
                  sx={{
                    fontSize: "0.63rem", height: 22, fontWeight: 700, textTransform: "capitalize",
                    bgcolor: uw.role === "lead_left" ? "#E0F2FE" : uw.role === "lead" ? "#EDE9FE" : "#F1F5F9",
                    color: uw.role === "lead_left" ? "#0369A1" : uw.role === "lead" ? "#6D28D9" : "#475569",
                    border: "none",
                  }}
                />
              </TableCell>
              <TableCell sx={{ py: 1.2 }}>
                <Box sx={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  px: 1.2, py: 0.4, borderRadius: 1.5, minWidth: 36,
                  bgcolor: (uw.cm_rank || 0) >= 9 ? "#ECFDF5" : (uw.cm_rank || 0) >= 7 ? "#FFFBEB" : "#F1F5F9",
                  border: `1.5px solid ${(uw.cm_rank || 0) >= 9 ? "#059669" : (uw.cm_rank || 0) >= 7 ? "#D97706" : "#CBD5E1"}40`,
                }}>
                  <Typography sx={{
                    fontWeight: 900, fontSize: "0.78rem",
                    color: (uw.cm_rank || 0) >= 9 ? "#059669" : (uw.cm_rank || 0) >= 7 ? "#D97706" : "#475569",
                  }}>
                    {uw.cm_rank}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    {leadRank !== undefined && (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5, px: 0.5 }}>
        <Typography sx={{ color: "#64748b", fontSize: "0.73rem" }}>
          Lead Underwriter CM Rank:
        </Typography>
        <Box sx={{
          px: 1.2, py: 0.3, borderRadius: 1.5, bgcolor: leadRank >= 9 ? "#ECFDF5" : "#F1F5F9",
          border: `1.5px solid ${leadRank >= 9 ? "#05966930" : "#CBD5E140"}`,
        }}>
          <Typography sx={{ fontWeight: 900, fontSize: "0.8rem", color: leadRank >= 9 ? "#059669" : "#1E293B" }}>
            {leadRank}
          </Typography>
        </Box>
      </Box>
    )}
  </Box>
);

export default ScorecardView;
