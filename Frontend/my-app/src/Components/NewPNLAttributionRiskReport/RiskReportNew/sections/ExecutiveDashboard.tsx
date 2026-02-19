import React from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  data: any;
}

const cardColors: Record<string, { bg: string; border: string; dot: string; title: string }> = {
  positive: { bg: "#ecfdf5", border: "#d1fae5", dot: "#10b981", title: "#059669" },
  negative: { bg: "#fff7ed", border: "#ffedd5", dot: "#f97316", title: "#ea580c" },
  risk: { bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", title: "#dc2626" },
  opportunity: { bg: "#ecfdf5", border: "#d1fae5", dot: "#10b981", title: "#059669" },
};

const metricValueColor = (value: string): string => {
  if (!value) return "#1e293b";
  if (value.startsWith("-") || value.startsWith("−")) return "#dc2626";
  if (value.startsWith("+") || value.startsWith("$")) return "#059669";
  return "#1e293b";
};

const ExecutiveDashboard: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const qualitativeCards: any[] = data.qualitative_cards || [];
  const metricCards: any[] = data.metric_cards || [];
  const riskTable: any[] = data.risk_table || [];
  const portfolioBias = data.portfolio_bias;

  return (
    <Box>
      {/* Qualitative Cards - 2 column grid */}
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
            const colors = cardColors[card.type] || cardColors.positive;
            return (
              <Box
                key={i}
                sx={{
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 2,
                  p: 2.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: colors.dot,
                    }}
                  />
                  <Typography
                    sx={{ fontWeight: 700, fontSize: 15, color: colors.title }}
                  >
                    {card.title}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                  {card.content}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Metric Cards - 4 column grid */}
      {metricCards.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 2,
            mb: 3,
          }}
        >
          {metricCards.map((card: any, i: number) => (
            <Box
              key={i}
              sx={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                p: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: 1,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  mb: 0.5,
                }}
              >
                {card.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: metricValueColor(card.value),
                  fontFamily: "monospace",
                  mb: 0.5,
                }}
              >
                {card.value}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                {card.interpretation}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Portfolio Bias (standalone card if not in metric_cards) */}
      {portfolioBias && (
        <Box
          sx={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            p: 2,
            mb: 3,
            display: "inline-block",
          }}
        >
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1,
              color: "#94a3b8",
              textTransform: "uppercase",
              mb: 0.5,
            }}
          >
            {portfolioBias.label}
          </Typography>
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 700,
              color: "#7c3aed",
              mb: 0.5,
            }}
          >
            {portfolioBias.value}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#64748b" }}>
            {portfolioBias.text}
          </Typography>
        </Box>
      )}

      {/* Risk Table */}
      {riskTable.length > 0 && (
        <Box
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            {["METRIC", "VALUE", "INTERPRETATION"].map((h) => (
              <Typography
                key={h}
                sx={{
                  px: 2,
                  py: 1.2,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: "#475569",
                }}
              >
                {h}
              </Typography>
            ))}
          </Box>
          {/* Table Rows */}
          {riskTable.map((row: any, i: number) => (
            <Box
              key={i}
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                borderBottom: i < riskTable.length - 1 ? "1px solid #f1f5f9" : "none",
                "&:hover": { backgroundColor: "#fafbfc" },
              }}
            >
              <Typography
                sx={{ px: 2, py: 1.5, fontSize: 13, fontWeight: 600, color: "#1e293b" }}
              >
                {row.metric}
              </Typography>
              <Typography
                sx={{ px: 2, py: 1.5, fontSize: 13, color: "#475569", fontFamily: "monospace" }}
              >
                {row.value}
              </Typography>
              <Typography sx={{ px: 2, py: 1.5, fontSize: 13, color: "#64748b" }}>
                {row.interpretation}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ExecutiveDashboard;
