import React from "react";
import { Box, Typography, Chip, Divider } from "@mui/material";

interface Props {
  item: any;
}

const urgencyBadge = (urgency: string) => {
  const key = urgency?.toLowerCase() || "";
  if (key.includes("immediate") || key.includes("now"))
    return { bg: "rgba(239,68,68,0.08)", color: "#ef4444", dot: "#ef4444" };
  if (key.includes("24") || key.includes("today"))
    return { bg: "rgba(249,115,22,0.08)", color: "#f97316", dot: "#f97316" };
  if (key.includes("48"))
    return { bg: "rgba(245,158,11,0.08)", color: "#f59e0b", dot: "#f59e0b" };
  return { bg: "rgba(168,85,247,0.08)", color: "#a855f7", dot: "#a855f7" };
};

const ImmediateDecisionCard: React.FC<Props> = ({ item }) => {
  const badge = urgencyBadge(
    item.urgency || item.time_sensitivity || item.timeline || ""
  );

  const fields = [
    { label: "Base Model Breach", value: item.base_model_breach },
    { label: "News Risk", value: item.news_risk },
    { label: "Capital at Risk", value: item.capital_at_risk || item.capital_impact },
    { label: "Recommended Action", value: item.recommended_action || item.action },
    { label: "Technical Condition", value: item.technical_condition || item.technical },
    { label: "Model Integrity Impact", value: item.model_integrity_impact || item.impact },
    { label: "Description", value: item.description || item.rationale },
    { label: "Severity", value: item.severity_score },
  ].filter((field) => field.value);

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 2.5,
        p: 2,
        backdropFilter: "blur(12px)",
        background: "linear-gradient(145deg, #ffffff, #f8fafc)",
        border: "1px solid rgba(99,102,241,0.15)",
        boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 8px 20px rgba(0,0,0,0.07)",
        },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: 0.3,
            }}
          >
            {item.ticker || item.title || item.name}
          </Typography>

          {(item.score != null || item.severity_score != null) && (
            <Chip
              label={`${item.severity_score ?? item.score}/10`}
              size="small"
              sx={{
                background:
                  "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 11,
                height: 22,
                borderRadius: "999px",
                boxShadow: "0 2px 8px rgba(168,85,247,0.25)",
              }}
            />
          )}
        </Box>

        {(item.urgency || item.time_sensitivity || item.timeline) && (
          <Chip
            label={item.urgency || item.time_sensitivity || item.timeline}
            size="small"
            sx={{
              backgroundColor: badge.bg,
              color: badge.color,
              fontWeight: 600,
              fontSize: 11,
              height: 22,
              borderRadius: "999px",
              px: 0.5,
            }}
          />
        )}
      </Box>

      <Divider sx={{ mb: 1.5, opacity: 0.3 }} />

      {/* CONTENT GRID — compact */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 1,
        }}
      >
        {fields.map((field, index) => {
          const isAction = field.label === "Recommended Action";

          return (
            <Box
              key={index}
              sx={{
                borderRadius: 2,
                px: 1.5,
                py: 1,
                background: isAction
                  ? "linear-gradient(135deg, rgba(239,68,68,0.06), rgba(220,38,38,0.03))"
                  : "rgba(248,250,252,0.6)",
                border: isAction
                  ? "1px solid rgba(239,68,68,0.2)"
                  : "1px solid rgba(148,163,184,0.12)",
              }}
            >
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: "#64748b",
                  mb: 0.3,
                }}
              >
                {field.label}
              </Typography>

              <Typography
                sx={{
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  color: isAction ? "#dc2626" : "#0f172a",
                  fontWeight: isAction ? 700 : 500,
                }}
              >
                {field.value}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default ImmediateDecisionCard;