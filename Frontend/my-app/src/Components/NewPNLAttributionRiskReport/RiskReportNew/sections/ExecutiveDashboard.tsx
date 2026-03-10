import React from "react";
import { Box, Typography, Tooltip, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import GenericDataRenderer from "./GenericDataRenderer";

interface Props {
  data: any;
  variant?: "portfolio" | "risk";  // split view: portfolio shows performance, risk shows risk metrics
}

const cardColors: Record<string, { bg: string; border: string; dot: string; title: string; gradient: string }> = {
  positive: { bg: "#ecfdf5", border: "#d1fae5", dot: "#10b981", title: "#059669", gradient: "linear-gradient(135deg, #ecfdf5, #d1fae5)" },
  negative: { bg: "#fff7ed", border: "#ffedd5", dot: "#f97316", title: "#ea580c", gradient: "linear-gradient(135deg, #fff7ed, #ffedd5)" },
  risk: { bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", title: "#dc2626", gradient: "linear-gradient(135deg, #fef2f2, #fecaca)" },
  opportunity: { bg: "#ecfdf5", border: "#d1fae5", dot: "#10b981", title: "#059669", gradient: "linear-gradient(135deg, #ecfdf5, #d1fae5)" },
  neutral: { bg: "#f0f7ff", border: "#c7d2fe", dot: "#334155", title: "#1e293b", gradient: "linear-gradient(135deg, #f0f7ff, #c7d2fe)" },
};

const metricCardGradients = [
  { bg: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "#93c5fd" },
  { bg: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "#86efac" },
  { bg: "linear-gradient(135deg, #fef2f2, #fecaca)", border: "#fca5a5" },
  { bg: "linear-gradient(135deg, #faf5ff, #e9d5ff)", border: "#c4b5fd" },
  { bg: "linear-gradient(135deg, #fffbeb, #fef3c7)", border: "#fcd34d" },
  { bg: "linear-gradient(135deg, #ecfdf5, #d1fae5)", border: "#6ee7b7" },
  { bg: "linear-gradient(135deg, #fff1f2, #ffe4e6)", border: "#fda4af" },
];

const METRIC_INFO: Array<{ keywords: string[]; description: string }> = [
  {
    keywords: ['total long exposure'],
    description:
      'Total Long Exposure, expressed as a percentage of the $200M AUM, shows the portion of capital currently deployed.',
  },
  {
    keywords: ['weighted average beta', 'wtd avg beta'],
    description:
      'Weighted Average Beta, relative to 1.0 (market), measures the position-weighted market sensitivity.',
  },
  {
    keywords: ['capital at risk to stops', 'capital at risk'],
    description:
      'Capital at Risk, expressed as a percentage of the $200M NAV, shows the total potential loss if all positions decline to their stop levels.',
  },
  {
    keywords: ['capital gain potential to targets', 'gain potential'],
    description:
      'Gain Potential is the total expected profit to targets, calculated as (Target - Current Price) x Shares, summed across the portfolio and expressed as % of NAV.',
  },
  {
    keywords: ['beta-adj exposure', 'beta-adjusted exposure'],
    description:
      'Calculated as the sum of (Current $ Exposure x Beta) across all positions, expressed as a percentage of AUM to reflect the portfolios effective market exposure.',
  },
  {
    keywords: ['beta-adj impact spx -5%', 'spx -5% impact'],
    description:
      'Beta-Adjusted Exposure x (-5%), shown as % of NAV to estimate portfolio loss from a 5% market decline.',
  },
  {
    keywords: ['beta-adj impact spx -10%', 'spx -10% impact'],
    description:
      'Beta-Adjusted Exposure x (-10%), shown as % of NAV to estimate portfolio loss from a 10% market decline.',
  },
  {
    keywords: ['sector concentration risk'],
    description:
      'Sector Concentration Risk highlights the dominant sector exposure and its share of the portfolio, flagging diversification gaps.',
  },
  {
    keywords: ['dtd p&l'],
    description:
      'Day-to-date P&L shows how the portfolio has behaved so far during the current trading day.',
  },
  {
    keywords: ['cumulative gross p&l'],
    description:
      'Cumulative Gross P&L tallies realized and unrealized gains since the reporting start, before fees or adjustments.',
  },
];

const getMetricTooltip = (label: string): string | null => {
  const normalizedLabel = (label || '').toLowerCase().trim();
  for (const entry of METRIC_INFO) {
    if (entry.keywords.some((keyword) => normalizedLabel.includes(keyword))) {
      return entry.description;
    }
  }
  return null;
};

const metricValueColor = (value: string): string => {
  if (!value) return "#1e293b";
  if (value.startsWith("-") || value.startsWith("\u2212")) return "#dc2626";
  if (value.startsWith("+") || value.startsWith("$")) return "#059669";
  return "#1e293b";
};

// ── Variant filter helpers ──
const PORTFOLIO_CARD_KEYWORDS = ["winning", "losing", "opportunity", "going well"];
const RISK_CARD_KEYWORDS = ["hidden risk", "going wrong", "fearful"];
const PORTFOLIO_METRIC_KEYWORDS = ["exposure", "beta", "p&l", "pnl", "dtd", "cumulative"];
const RISK_METRIC_KEYWORDS = ["risk", "stop", "impact", "spx", "concentration", "sector", "gain potential"];

const matchesAny = (text: string, keywords: string[]): boolean => {
  const lower = (text || "").toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
};

const ExecutiveDashboard: React.FC<Props> = ({ data, variant }) => {
  if (!data) return null;

  const allQualCards: any[] = data.qualitative_cards || data.cards || [];
  const allMetricCards: any[] = data.metric_cards || data.metrics || [];
  const riskTableRaw: any[] = data.risk_table || data.risks || data.risk_metrics || [];
  const portfolioBias = data.portfolio_bias || data.bias;

  // Apply variant filtering
  let qualitativeCards = allQualCards;
  let metricCards = allMetricCards;
  let riskTable = riskTableRaw;
  let showPortfolioBias = true;

  if (variant === "portfolio") {
    qualitativeCards = allQualCards.filter((c: any) =>
      matchesAny(c.title || c.label || c.name || "", PORTFOLIO_CARD_KEYWORDS)
    );
    metricCards = allMetricCards.filter((c: any) =>
      matchesAny(c.label || c.title || c.name || "", PORTFOLIO_METRIC_KEYWORDS)
    );
    riskTable = []; // hide risk table on portfolio tab
    showPortfolioBias = true;
  } else if (variant === "risk") {
    qualitativeCards = allQualCards.filter((c: any) =>
      matchesAny(c.title || c.label || c.name || "", RISK_CARD_KEYWORDS)
    );
    metricCards = allMetricCards.filter((c: any) =>
      matchesAny(c.label || c.title || c.name || "", RISK_METRIC_KEYWORDS)
    );
    // riskTable stays as-is
    showPortfolioBias = false; // portfolio bias shown on portfolio tab only
  }

  const hasStructuredData = qualitativeCards.length > 0 || metricCards.length > 0 || riskTable.length > 0 || (showPortfolioBias && portfolioBias);

  if (!hasStructuredData) {
    return <GenericDataRenderer data={data} accentColor="#ec4899" />;
  }

  return (
    <Box>
      {qualitativeCards.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2,
            mb: 3,
          }}
        >
          {qualitativeCards.map((card: any, i: number) => {
            const colors = cardColors[card.type] || cardColors.neutral;

            return (
              <Box
                key={i}
                sx={{
                  // background: colors.gradient,
                  background: "#eff1fc",
                  border: `1px solid ${colors.border}`,
                  borderRadius: 2.5,
                  p: 2.5,
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: `0 4px 16px ${colors.dot}20`,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: colors.dot,
                    }}
                  />
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 16,
                      letterSpacing: 0.3,
                      color: colors.title,
                    }}
                  >
                    {card.title || card.label || card.name}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: "#0f172a",
                  }}
                >
                  {card.content ||
                    card.description ||
                    card.text ||
                    card.value}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}

      {/* METRIC CARDS — WITH INFO ICON RESTORED */}
      {metricCards.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(
              metricCards.length,
              4
            )}, 1fr)`,
            gap: 2,
            mb: 3,
          }}
        >
          {metricCards.map((card: any, i: number) => {
            const gradient = metricCardGradients[i % metricCardGradients.length];
            const cardLabel = card.label || card.title || card.name;
            const tooltipText = getMetricTooltip(cardLabel);
            return (
              <Box
                key={i}
                sx={{
                  background: gradient.bg,
                  border: `1px solid ${gradient.border}40`,
                  borderRadius: 2.5,
                  p: 2,
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {/* Header Row with Info Icon */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 0.8,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#332ba3",
                      textTransform: "uppercase",
                    }}
                  >
                    {cardLabel}
                  </Typography>
                  {tooltipText && (
                    <Tooltip
                      title={tooltipText}
                      arrow
                      placement="top"
                      enterTouchDelay={0}
                      leaveTouchDelay={3000}
                      slotProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: "#1e293b",
                            color: "#fff",
                            fontSize: 12,
                            lineHeight: 1.5,
                            maxWidth: 300,
                            p: 1.5,
                            borderRadius: 1.5,
                          },
                        },
                        arrow: { sx: { color: "#1e293b" } },
                      }}
                    >
                      <IconButton size="small" sx={{ p: 0.3, color: "#64748b", "&:hover": { color: "#334155" } }}>
                        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                <Typography
                  sx={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#0f172a",
                    fontFamily: "monospace",
                  }}
                >
                  {card.value}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#334155", lineHeight: 1.5 }}>
                  {card.interpretation || card.description || card.text}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}

      {/* PORTFOLIO BIAS */}
      {showPortfolioBias && portfolioBias && (
        <Box
          sx={{
            background: "linear-gradient(135deg, #faf5ff, #ede9fe)",
            border: "1px solid #c4b5fd",
            borderRadius: 2.5,
            p: 2.5,
            mb: 3,
            display: "inline-block",
            minWidth: 220,
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.3,
              color: "#6d28d9",
              textTransform: "uppercase",
              mb: 0.5,
            }}
          >
            {portfolioBias.label || "Portfolio Bias"}
          </Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#7c3aed", mb: 0.5 }}>
            {portfolioBias.value || (typeof portfolioBias === "string" ? portfolioBias : "")}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#000000", lineHeight: 1.5 }}>
            {portfolioBias.text || portfolioBias.description || portfolioBias.interpretation}
          </Typography>
        </Box>
      )}

      {/* RISK TABLE */}
      {riskTable.length > 0 && (
        <Box
          sx={{
            border: "1px solid #c7d2fe",
            borderRadius: 2.5,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              background: "linear-gradient(135deg, #f0f7ff, #e0e7ff)",
            }}
          >
            {["Metric", "Value", "Interpretation"].map((h) => (
              <Typography
                key={h}
                sx={{
                  px: 2,
                  py: 1.3,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: "#1e3a8a",
                }}
              >
                {h}
              </Typography>
            ))}
          </Box>

          {riskTable.map((row: any, i: number) => (
            <Box
              key={i}
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <Typography sx={{ px: 2, py: 1.5, fontWeight: 600 }}>
                {row.metric || row.label || row.name}
              </Typography>
              <Typography
                sx={{ px: 2, py: 1.5, fontFamily: "monospace" }}
              >
                {row.value}
              </Typography>
              <Typography sx={{ px: 2, py: 1.5, color: "#334155" }}>
                {row.interpretation ||
                  row.description ||
                  row.text}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ExecutiveDashboard;