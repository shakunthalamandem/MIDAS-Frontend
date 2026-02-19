import React from "react";
import { Box, Typography } from "@mui/material";
import GenericDataRenderer from "./GenericDataRenderer";

interface Props {
  data: any;
}

const cardColors: Record<string, { bg: string; border: string; dot: string; title: string; gradient: string }> = {
  positive: { bg: "#ecfdf5", border: "#d1fae5", dot: "#10b981", title: "#059669", gradient: "linear-gradient(135deg, #ecfdf5, #d1fae5)" },
  negative: { bg: "#fff7ed", border: "#ffedd5", dot: "#f97316", title: "#ea580c", gradient: "linear-gradient(135deg, #fff7ed, #ffedd5)" },
  risk: { bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", title: "#dc2626", gradient: "linear-gradient(135deg, #fef2f2, #fecaca)" },
  opportunity: { bg: "#ecfdf5", border: "#d1fae5", dot: "#10b981", title: "#059669", gradient: "linear-gradient(135deg, #ecfdf5, #d1fae5)" },
  neutral: { bg: "#f8fafc", border: "#e2e8f0", dot: "#64748b", title: "#475569", gradient: "linear-gradient(135deg, #f8fafc, #e2e8f0)" },
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

const metricValueColor = (value: string): string => {
  if (!value) return "#1e293b";
  if (value.startsWith("-") || value.startsWith("\u2212")) return "#dc2626";
  if (value.startsWith("+") || value.startsWith("$")) return "#059669";
  return "#1e293b";
};

const ExecutiveDashboard: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const qualitativeCards: any[] = data.qualitative_cards || data.cards || [];
  const metricCards: any[] = data.metric_cards || data.metrics || [];
  const riskTable: any[] = data.risk_table || data.risks || data.risk_metrics || [];
  const portfolioBias = data.portfolio_bias || data.bias;

  const hasStructuredData = qualitativeCards.length > 0 || metricCards.length > 0 || riskTable.length > 0 || portfolioBias;

  if (!hasStructuredData) {
    return <GenericDataRenderer data={data} accentColor="#ec4899" />;
  }

  return (
    <Box>
      {qualitativeCards.length > 0 && (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, mb: 3 }}>
          {qualitativeCards.map((card: any, i: number) => {
            const colors = cardColors[card.type] || cardColors.neutral;
            return (
              <Box
                key={i}
                sx={{
                  background: colors.gradient,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 2.5,
                  p: 2.5,
                  transition: "all 0.2s",
                  "&:hover": { boxShadow: `0 4px 16px ${colors.dot}20`, transform: "translateY(-1px)" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: colors.dot, boxShadow: `0 0 8px ${colors.dot}60` }} />
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: colors.title }}>
                    {card.title || card.label || card.name}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                  {card.content || card.description || card.text || card.value}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}

      {metricCards.length > 0 && (
        <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(metricCards.length, 4)}, 1fr)`, gap: 2, mb: 3 }}>
          {metricCards.map((card: any, i: number) => {
            const gradient = metricCardGradients[i % metricCardGradients.length];
            return (
              <Box key={i} sx={{
                background: gradient.bg, border: `1px solid ${gradient.border}40`,
                borderRadius: 2.5, p: 2, transition: "all 0.2s",
                "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.06)", transform: "translateY(-1px)" },
              }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: "#64748b", textTransform: "uppercase", mb: 0.5 }}>
                  {card.label || card.title || card.name}
                </Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 700, color: metricValueColor(String(card.value || "")), fontFamily: "monospace", mb: 0.5 }}>
                  {card.value}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                  {card.interpretation || card.description || card.text}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}

      {portfolioBias && (
        <Box sx={{
          background: "linear-gradient(135deg, #faf5ff, #ede9fe)", border: "1px solid #c4b5fd",
          borderRadius: 2.5, p: 2.5, mb: 3, display: "inline-block", minWidth: 220,
        }}>
          <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: "#7c3aed", textTransform: "uppercase", mb: 0.5 }}>
            {portfolioBias.label || "PORTFOLIO BIAS"}
          </Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#7c3aed", mb: 0.5 }}>
            {portfolioBias.value || (typeof portfolioBias === "string" ? portfolioBias : "")}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
            {portfolioBias.text || portfolioBias.description || portfolioBias.interpretation}
          </Typography>
        </Box>
      )}

      {riskTable.length > 0 && (
        <Box sx={{ border: "1px solid #e2e8f0", borderRadius: 2.5, overflow: "hidden" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            background: "linear-gradient(135deg, #f8fafc, #f1f5f9)", borderBottom: "2px solid #ec4899" }}>
            {["METRIC", "VALUE", "INTERPRETATION"].map((h) => (
              <Typography key={h} sx={{ px: 2, py: 1.2, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#be185d" }}>{h}</Typography>
            ))}
          </Box>
          {riskTable.map((row: any, i: number) => (
            <Box key={i} sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              borderBottom: i < riskTable.length - 1 ? "1px solid #f1f5f9" : "none", "&:hover": { backgroundColor: "#fdf2f8" } }}>
              <Typography sx={{ px: 2, py: 1.5, fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{row.metric || row.label || row.name}</Typography>
              <Typography sx={{ px: 2, py: 1.5, fontSize: 13, color: "#475569", fontFamily: "monospace" }}>{row.value}</Typography>
              <Typography sx={{ px: 2, py: 1.5, fontSize: 13, color: "#64748b" }}>{row.interpretation || row.description || row.text}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ExecutiveDashboard;
