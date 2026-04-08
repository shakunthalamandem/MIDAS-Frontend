import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BusinessIcon from "@mui/icons-material/Business";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface ScorecardViewProps {
  data: any;
}

// ── Color helpers ───────────────────────────────────────────────────
const signalColor = (signal: string) => {
  switch (signal) {
    case "positive":
      return { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7" };
    case "moderate":
      return { bg: "#fff3e0", text: "#e65100", border: "#ffcc80" };
    case "caution":
      return { bg: "#fff8e1", text: "#f57f17", border: "#ffe082" };
    case "negative":
      return { bg: "#ffebee", text: "#c62828", border: "#ef9a9a" };
    default:
      return { bg: "#f5f5f5", text: "#616161", border: "#e0e0e0" };
  }
};

const scoreRingColor = (pct: number) => {
  if (pct >= 75) return "#2e7d32";
  if (pct >= 55) return "#ed6c02";
  return "#d32f2f";
};

// ── Composite ring (SVG) ────────────────────────────────────────────
const CompositeRing: React.FC<{ score: number; max: number; verdict?: string }> = ({
  score,
  max,
  verdict,
}) => {
  const pct = max > 0 ? (score / max) * 100 : 0;
  const radius = 70;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = scoreRingColor(pct);

  return (
    <Box sx={{ textAlign: "center" }}>
      <svg width={180} height={180} viewBox="0 0 180 180">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#e8ecf0"
          strokeWidth={stroke}
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text
          x="90"
          y="82"
          textAnchor="middle"
          fontSize="36"
          fontWeight="800"
          fill={color}
        >
          {score}
        </text>
        <text x="90" y="105" textAnchor="middle" fontSize="13" fill="#888">
          / {max}
        </text>
      </svg>
      {verdict && (
        <Chip
          label={verdict.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          size="small"
          sx={{
            mt: 1,
            fontWeight: 600,
            backgroundColor: color,
            color: "#fff",
            fontSize: "0.75rem",
          }}
        />
      )}
    </Box>
  );
};

// ── Dimension bar ───────────────────────────────────────────────────
const DimensionBar: React.FC<{ dim: any }> = ({ dim }) => {
  const pct = dim.max_score > 0 ? (dim.score / dim.max_score) * 100 : 0;
  const sc = signalColor(dim.signal);

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: `1px solid ${sc.border}`,
        boxShadow: "none",
        mb: 1.5,
        "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: "#1a2d4a", fontSize: "0.82rem" }}
            >
              {dim.label}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={dim.signal}
              size="small"
              sx={{
                backgroundColor: sc.bg,
                color: sc.text,
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 22,
                textTransform: "capitalize",
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, color: sc.text, minWidth: 40, textAlign: "right" }}
            >
              {dim.score}/{dim.max_score}
            </Typography>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "#e8ecf0",
            mb: 1,
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              backgroundColor: sc.text,
            },
          }}
        />

        {dim.data_point && (
          <Typography variant="caption" sx={{ color: "#555", display: "block", lineHeight: 1.4 }}>
            {dim.data_point}
          </Typography>
        )}

        {dim.ritter_benchmark && (
          <Typography
            variant="caption"
            sx={{ color: "#999", display: "block", mt: 0.5, fontStyle: "italic", lineHeight: 1.3 }}
          >
            {dim.ritter_benchmark}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// ── Key-Value row helper ────────────────────────────────────────────
const KVRow: React.FC<{ label: string; value: any; prefix?: string; suffix?: string }> = ({
  label,
  value,
  prefix = "",
  suffix = "",
}) => {
  if (value === null || value === undefined) return null;
  const display =
    typeof value === "boolean" ? (value ? "Yes" : "No") : `${prefix}${value}${suffix}`;
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.4 }}>
      <Typography variant="caption" sx={{ color: "#888" }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 600, color: "#333" }}>
        {display}
      </Typography>
    </Box>
  );
};

// ── Main Scorecard ──────────────────────────────────────────────────
const ScorecardView: React.FC<ScorecardViewProps> = ({ data }) => {
  const scores = data.ritter_scores || {};
  const dims = scores.dimensions || [];
  const market = data.current_market || {};
  const ipo = data.ipo_data || {};
  const fundamentals = data.company_fundamentals || {};
  const underwriters = data.underwriters || [];
  const meta = data.meta || {};

  return (
    <Box>
      {/* Header card: composite ring + company info */}
      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
              <CompositeRing
                score={scores.composite_score ?? 0}
                max={scores.composite_max ?? 100}
                verdict={scores.verdict_label || scores.verdict}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#1a2d4a" }}>
                  {data.ticker}
                </Typography>
                {data.exchange && (
                  <Chip label={data.exchange} size="small" variant="outlined" />
                )}
              </Box>
              <Typography variant="h6" sx={{ color: "#555", fontWeight: 500, mb: 1 }}>
                {data.company_name || ""}
              </Typography>

              <Grid container spacing={2}>
                {/* Current market */}
                {market.current_price !== undefined && (
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: "#999" }}>
                      Price
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      ${market.current_price}
                    </Typography>
                  </Grid>
                )}
                {market.market_cap_b !== undefined && (
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: "#999" }}>
                      Mkt Cap
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      ${market.market_cap_b}B
                    </Typography>
                  </Grid>
                )}
                {market.return_vs_ipo_pct !== undefined && (
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: "#999" }}>
                      vs IPO
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: market.return_vs_ipo_pct >= 0 ? "#2e7d32" : "#d32f2f",
                      }}
                    >
                      {market.return_vs_ipo_pct > 0 ? "+" : ""}
                      {market.return_vs_ipo_pct}%
                    </Typography>
                  </Grid>
                )}
                {data.ipo_date && (
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: "#999" }}>
                      IPO Date
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {data.ipo_date}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {data.days_since_ipo !== undefined && (
                <Typography variant="caption" sx={{ color: "#aaa", mt: 1, display: "block" }}>
                  {data.days_since_ipo} days since IPO &middot; Generated{" "}
                  {data.score_generated_at
                    ? new Date(data.score_generated_at).toLocaleDateString()
                    : "—"}
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dimensions */}
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 700, color: "#1a2d4a", mb: 2, display: "flex", alignItems: "center", gap: 1 }}
      >
        <TrendingUpIcon fontSize="small" /> Ritter Dimensions ({dims.length})
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {dims.map((dim: any) => (
          <Grid item xs={12} md={6} key={dim.id}>
            <DimensionBar dim={dim} />
          </Grid>
        ))}
      </Grid>

      {/* Info panels: IPO Data, Fundamentals, Underwriters */}
      <Grid container spacing={3}>
        {/* IPO Data */}
        {Object.keys(ipo).length > 0 && (
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", height: "100%" }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <AccountBalanceIcon fontSize="small" sx={{ color: "#005166" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1a2d4a" }}>
                    IPO Data
                  </Typography>
                </Box>
                <Divider sx={{ mb: 1 }} />
                <KVRow label="Offer Price" value={ipo.offer_price} prefix="$" />
                <KVRow
                  label="File Range"
                  value={
                    ipo.file_range_low !== undefined
                      ? `$${ipo.file_range_low} – $${ipo.file_range_high}`
                      : undefined
                  }
                />
                <KVRow label="Shares Offered" value={ipo.shares_offered?.toLocaleString()} />
                <KVRow label="Gross Proceeds" value={ipo.gross_proceeds_m} prefix="$" suffix="M" />
                <KVRow label="1st Day Open" value={ipo.first_day_open} prefix="$" />
                <KVRow label="1st Day Close" value={ipo.first_day_close} prefix="$" />
                <KVRow label="1st Day Return" value={ipo.first_day_return_pct} suffix="%" />
                <KVRow label="Overallotment" value={ipo.overallotment_exercised} />
                <KVRow label="Priced at Top" value={ipo.priced_at_top_of_range} />
                <KVRow label="Upsize" value={ipo.upsize_pct} suffix="%" />
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Fundamentals */}
        {Object.keys(fundamentals).length > 0 && (
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", height: "100%" }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <BusinessIcon fontSize="small" sx={{ color: "#005166" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1a2d4a" }}>
                    Company Fundamentals
                  </Typography>
                </Box>
                <Divider sx={{ mb: 1 }} />
                <KVRow label="Revenue" value={fundamentals.revenue_m} prefix="$" suffix="M" />
                <KVRow label="Net Income" value={fundamentals.net_income_m} prefix="$" suffix="M" />
                <KVRow label="Net Margin" value={fundamentals.net_margin_pct} suffix="%" />
                <KVRow label="Profitable at IPO" value={fundamentals.profitable_at_ipo} />
                <KVRow label="Founded" value={fundamentals.founding_year} />
                <KVRow label="Age at IPO" value={fundamentals.age_at_ipo_years} suffix=" yrs" />
                <KVRow label="Sector" value={fundamentals.sector} />
                <KVRow label="Is REIT" value={fundamentals.is_reit} />
                <KVRow
                  label="Sponsor Type"
                  value={fundamentals.sponsor_type?.replace(/_/g, " ")}
                />
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Underwriters */}
        {underwriters.length > 0 && (
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", height: "100%" }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <AccountBalanceIcon fontSize="small" sx={{ color: "#005166" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1a2d4a" }}>
                    Underwriters
                  </Typography>
                </Box>
                <Divider sx={{ mb: 1 }} />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.7rem", py: 0.5, px: 1 }}>
                          Name
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.7rem", py: 0.5, px: 1 }}>
                          Role
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: 700, fontSize: "0.7rem", py: 0.5, px: 1 }}
                          align="center"
                        >
                          CM
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {underwriters.map((uw: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell sx={{ fontSize: "0.72rem", py: 0.3, px: 1 }}>
                            {uw.name}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.72rem", py: 0.3, px: 1 }}>
                            {uw.role?.replace(/_/g, " ")}
                          </TableCell>
                          <TableCell
                            sx={{ fontSize: "0.72rem", py: 0.3, px: 1, fontWeight: 700 }}
                            align="center"
                          >
                            {uw.cm_rank}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {data.lead_underwriter_cm_rank !== undefined && (
                  <Typography variant="caption" sx={{ color: "#888", mt: 1, display: "block" }}>
                    Lead CM Rank: {data.lead_underwriter_cm_rank}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Meta / Disclaimer */}
      {meta.disclaimer && (
        <Paper
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            backgroundColor: "#f9fafb",
            border: "1px solid #e8ecf0",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <InfoOutlinedIcon fontSize="small" sx={{ color: "#999" }} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: "#888" }}>
              Disclaimer
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: "#999", lineHeight: 1.5 }}>
            {meta.disclaimer}
          </Typography>
          {meta.framework_version && (
            <Typography variant="caption" sx={{ color: "#bbb", display: "block", mt: 0.5 }}>
              Framework v{meta.framework_version} &middot; Scored by {meta.scored_by || "Claude"}
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default ScorecardView;
