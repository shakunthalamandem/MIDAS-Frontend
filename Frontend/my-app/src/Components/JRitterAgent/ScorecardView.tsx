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

  return (
    <Box>
      {/* Tab bar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2, borderBottom: "2px solid #e2e8f0" }}>
        {availableTabs.map((t) => (
          <Box
            key={t}
            onClick={() => setTab(t)}
            sx={{
              px: 2, py: 1,
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: tab === t ? 800 : 500,
              color: tab === t ? "#0891b2" : "#64748b",
              borderBottom: tab === t ? "3px solid #0891b2" : "3px solid transparent",
              mb: "-2px",
              transition: "all 0.15s",
              "&:hover": { color: "#0891b2" },
            }}
          >
            {t}{t === "Dimensions" && ` (${dims.length})`}
          </Box>
        ))}
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

/* ═══ Dimensions Grid (Gator-style cards) ═══ */
const DimensionsGrid: React.FC<{ dims: any[] }> = ({ dims }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 1.5 }}>
    {dims.map((dim: any) => {
      const pct = dim.max_score > 0 ? (dim.score / dim.max_score) * 100 : 0;
      const s = signalStyle(dim.signal);
      const barColor = pct >= 70 ? "#10B981" : pct >= 40 ? "#F59E0B" : "#EF4444";
      return (
        <Box key={dim.id} sx={{
          p: 2, bgcolor: "#fff", borderRadius: 2.5,
          border: `2px solid ${s.color}20`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          "&:hover": { boxShadow: `0 2px 12px ${s.color}15` },
          transition: "box-shadow 0.2s",
        }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: "#1E293B", textTransform: "uppercase", letterSpacing: 0.5, lineHeight: 1.3, flex: 1, pr: 1 }}>
              {dim.label}
            </Typography>
            <Chip
              label={dim.signal}
              size="small"
              sx={{ fontWeight: 800, fontSize: "0.6rem", height: 20, bgcolor: s.bg, color: s.color, textTransform: "capitalize" }}
            />
          </Box>

          {/* Score + bar */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
            <Typography sx={{ fontSize: "0.68rem", color: "#94A3B8", fontWeight: 600 }}>
              Score
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 900, color: pct >= 70 ? "#059669" : pct >= 40 ? "#D97706" : "#DC2626" }}>
              {dim.score}/{dim.max_score}
            </Typography>
          </Box>
          <Box sx={{ width: "100%", height: 7, bgcolor: "#E5E7EB", borderRadius: 4, overflow: "hidden", mb: 1 }}>
            <Box sx={{
              width: `${pct}%`, height: "100%", borderRadius: 4,
              background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
              transition: "width 0.6s ease-out",
            }} />
          </Box>

          {/* Data point */}
          {dim.data_point && (
            <Typography sx={{ fontSize: "0.68rem", color: "#555", lineHeight: 1.5, mt: 0.5 }}>
              {dim.data_point}
            </Typography>
          )}
          {dim.ritter_benchmark && (
            <Typography sx={{ fontSize: "0.62rem", color: "#94A3B8", lineHeight: 1.4, mt: 0.5, fontStyle: "italic" }}>
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

      return (
        <Box key={f.key} sx={{ p: 1.5, bgcolor: "#fff", borderRadius: 2, border: "1px solid #E2E8F0" }}>
          <Typography sx={{ fontSize: "0.62rem", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, mb: 0.3 }}>
            {f.label}
          </Typography>
          <Typography sx={{
            fontSize: "0.88rem", fontWeight: 800,
            color: f.type === "bool" ? (val ? "#059669" : "#DC2626") : "#1E293B",
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
    <TableContainer sx={{ bgcolor: "#fff", borderRadius: 2, border: "1px solid #E2E8F0" }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "#F8FAFC" }}>
            {["Name", "Role", "CM Rank"].map((h) => (
              <TableCell key={h} sx={{
                fontWeight: 800, fontSize: "0.68rem", color: "#475569",
                textTransform: "uppercase", letterSpacing: 0.6, py: 1.2, borderBottom: "2px solid #e2e8f0",
              }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {underwriters.map((uw: any, i: number) => (
            <TableRow key={i} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
              <TableCell sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#1E293B", py: 1 }}>
                {uw.name}
              </TableCell>
              <TableCell sx={{ py: 1 }}>
                <Chip
                  label={uw.role?.replace(/_/g, " ")}
                  size="small"
                  sx={{
                    fontSize: "0.62rem", height: 22, fontWeight: 700, textTransform: "capitalize",
                    bgcolor: uw.role === "lead_left" ? "#E0F2FE" : uw.role === "lead" ? "#EDE9FE" : "#F1F5F9",
                    color: uw.role === "lead_left" ? "#0369A1" : uw.role === "lead" ? "#6D28D9" : "#475569",
                  }}
                />
              </TableCell>
              <TableCell sx={{ py: 1 }}>
                <Chip
                  label={uw.cm_rank}
                  size="small"
                  sx={{
                    fontWeight: 900, fontSize: "0.75rem", height: 26, minWidth: 30,
                    bgcolor: (uw.cm_rank || 0) >= 9 ? "#ECFDF5" : (uw.cm_rank || 0) >= 7 ? "#FFFBEB" : "#F1F5F9",
                    color: (uw.cm_rank || 0) >= 9 ? "#059669" : (uw.cm_rank || 0) >= 7 ? "#D97706" : "#475569",
                    border: `1.5px solid ${(uw.cm_rank || 0) >= 9 ? "#059669" : (uw.cm_rank || 0) >= 7 ? "#D97706" : "#CBD5E1"}30`,
                  }}
                />
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
