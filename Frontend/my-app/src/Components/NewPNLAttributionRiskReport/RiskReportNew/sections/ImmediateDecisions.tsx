import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import GenericDataRenderer from "./GenericDataRenderer";

interface Props {
  data: any;
}

const urgencyBadge = (urgency: string) => {
  const key = urgency?.toLowerCase() || "";
  if (key.includes("immediate") || key.includes("now")) return { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" };
  if (key.includes("24") || key.includes("today")) return { bg: "#fff7ed", color: "#ea580c", dot: "#f97316" };
  if (key.includes("48")) return { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" };
  return { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" };
};

const ImmediateDecisions: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  if (typeof data === "string") {
    return (
      <Box sx={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 2.5, p: 2.5 }}>
        <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{data}</Typography>
      </Box>
    );
  }

  const items: any[] = Array.isArray(data) ? data : data.flagged_positions || data.items || data.decisions || data.rows || data.actions || [];

  if (items.length === 0) {
    return <GenericDataRenderer data={data} accentColor="#ec4899" />;
  }

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
      {items.map((item: any, i: number) => {
        const badge = urgencyBadge(item.urgency || item.time_sensitivity || item.timeline || "");
        return (
          <Box key={i} sx={{
            backgroundColor: "#fff", border: "1px solid #c7d2fe", borderTop: `3px solid ${badge.dot}`,
            borderRadius: 2, p: 2.5, transition: "all 0.2s",
            "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transform: "translateY(-1px)" },
          }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 18, color: "#1e293b", letterSpacing: 0.5 }}>
                  {item.time_sensitivity_emoji ? `${item.time_sensitivity_emoji} ` : ""}{item.ticker || item.title || item.name}
                </Typography>
                {(item.score != null || item.severity_score != null) && (
                  <Chip label={`${item.severity_score ?? item.score}/10`} size="small"
                    sx={{ background: "linear-gradient(135deg, #ec4899, #a855f7)", color: "#fff", fontWeight: 700, fontSize: 11, height: 24 }} />
                )}
              </Box>
              {(item.urgency || item.time_sensitivity || item.timeline) && (
                <Chip
                  icon={<Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: badge.dot, ml: 0.8 }} />}
                  label={item.urgency || item.time_sensitivity || item.timeline} size="small"
                  sx={{ backgroundColor: badge.bg, color: badge.color, fontWeight: 600, fontSize: 11, height: 26, "& .MuiChip-icon": { mr: -0.3 } }}
                />
              )}
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              {[
                { label: "BASE MODEL BREACH", value: item.base_model_breach },
                { label: "NEWS RISK", value: item.news_risk },
                { label: "CAPITAL AT RISK", value: item.capital_at_risk || item.capital_impact },
                { label: "RECOMMENDED ACTION", value: item.recommended_action || item.action },
                { label: "TECHNICAL CONDITION", value: item.technical_condition || item.technical },
                { label: "MODEL INTEGRITY IMPACT", value: item.model_integrity_impact || item.impact },
                { label: "DESCRIPTION", value: item.description || item.rationale },
                { label: "SEVERITY", value: item.severity_score },
              ].filter((f) => f.value).map((field, j) => (
                <Box key={j} sx={{ backgroundColor: "#f0f7ff", borderRadius: 1.5, p: 1.5 }}>
                  <Typography sx={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.8, color: "#475569", textTransform: "uppercase", mb: 0.5 }}>
                    {field.label}
                  </Typography>
                  <Typography sx={{
                    fontSize: 12, lineHeight: 1.4,
                    color: field.label === "RECOMMENDED ACTION" ? "#dc2626" : "#1e293b",
                    fontWeight: field.label === "RECOMMENDED ACTION" ? 600 : 400,
                  }}>{field.value}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ImmediateDecisions;
