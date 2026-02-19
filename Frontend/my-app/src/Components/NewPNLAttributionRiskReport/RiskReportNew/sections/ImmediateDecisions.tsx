import React from "react";
import { Box, Typography, Chip } from "@mui/material";

interface Props {
  data: any;
}

const urgencyBadge = (urgency: string) => {
  const key = urgency?.toLowerCase() || "";
  if (key.includes("immediate"))
    return { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" };
  if (key.includes("24"))
    return { bg: "#fff7ed", color: "#ea580c", dot: "#f97316" };
  return { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" };
};

const ImmediateDecisions: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const items: any[] = Array.isArray(data) ? data : data.items || data.decisions || [];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 2,
      }}
    >
      {items.map((item: any, i: number) => {
        const badge = urgencyBadge(item.urgency || item.timeline || "");
        return (
          <Box
            key={i}
            sx={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              p: 2.5,
              "&:hover": { boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
            }}
          >
            {/* Header row: ticker, score, urgency */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: "#1e293b",
                    letterSpacing: 0.5,
                  }}
                >
                  {item.ticker}
                </Typography>
                {(item.score !== undefined && item.score !== null) && (
                  <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                    Score: <strong>{item.score}/10</strong>
                  </Typography>
                )}
              </Box>
              {(item.urgency || item.timeline) && (
                <Chip
                  icon={
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: badge.dot,
                        ml: 0.8,
                      }}
                    />
                  }
                  label={item.urgency || item.timeline}
                  size="small"
                  sx={{
                    backgroundColor: badge.bg,
                    color: badge.color,
                    fontWeight: 600,
                    fontSize: 11,
                    height: 26,
                    "& .MuiChip-icon": { mr: -0.3 },
                  }}
                />
              )}
            </Box>

            {/* Info grid: 2x2 */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1.5,
              }}
            >
              {[
                { label: "BASE MODEL BREACH", value: item.base_model_breach },
                { label: "NEWS RISK", value: item.news_risk },
                { label: "CAPITAL AT RISK", value: item.capital_at_risk },
                { label: "RECOMMENDED ACTION", value: item.recommended_action },
              ]
                .filter((f) => f.value)
                .map((field, j) => (
                  <Box
                    key={j}
                    sx={{
                      backgroundColor: "#f8fafc",
                      borderRadius: 1.5,
                      p: 1.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: 0.8,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        mb: 0.5,
                      }}
                    >
                      {field.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color:
                          field.label === "RECOMMENDED ACTION"
                            ? "#dc2626"
                            : "#475569",
                        fontWeight:
                          field.label === "RECOMMENDED ACTION" ? 600 : 400,
                        lineHeight: 1.4,
                      }}
                    >
                      {field.value}
                    </Typography>
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
