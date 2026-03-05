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
        borderRadius: 4,
        p: 3,
        mt: 3,
        backdropFilter: "blur(12px)",
        background: "linear-gradient(145deg, #ffffff, #f8fafc)",
        border: "1px solid rgba(99,102,241,0.15)",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow:
            "0 18px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.7)",
        },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 20,
              letterSpacing: 0.5,
              // background: "linear-gradient(90deg,#1e293b,#6366f1)",
              // WebkitBackgroundClip: "text",
              // WebkitTextFillColor: "transparent",
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
                fontSize: 12,
                height: 26,
                borderRadius: "999px",
                boxShadow: "0 4px 12px rgba(168,85,247,0.3)",
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
              fontSize: 12,
              borderRadius: "999px",
              px: 1,
            }}
          />
        )}
      </Box>

      <Divider sx={{ mb: 2.5, opacity: 0.4 }} />

      {/* CONTENT GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 2,
        }}
      >
        {fields.map((field, index) => {
          const isAction = field.label === "Recommended Action";

          return (
            <Box
              key={index}
              sx={{
                borderRadius: 3,
                p: 2,
                background: isAction
                  ? "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(220,38,38,0.05))"
                  : "rgba(248,250,252,0.7)",
                border: isAction
                  ? "1px solid rgba(239,68,68,0.25)"
                  : "1px solid rgba(148,163,184,0.15)",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  // letterSpacing: 1,
                  color: "#001068",
                  mb: 0.8,
                }}
              >
                {field.label}
              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  lineHeight: 1.6,
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