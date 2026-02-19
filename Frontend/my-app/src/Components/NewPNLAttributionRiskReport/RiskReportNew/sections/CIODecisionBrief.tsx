import React from "react";
import { Box, Typography, Chip } from "@mui/material";

interface Props {
  data: any;
}

const urgencyStyles: Record<string, { bg: string; color: string; dot: string }> = {
  immediate: { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  "24 hours": { bg: "#fff7ed", color: "#ea580c", dot: "#f97316" },
  "48 hours": { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
  week: { bg: "#ecfdf5", color: "#059669", dot: "#10b981" },
};

const getUrgencyStyle = (urgency: string) => {
  const key = urgency?.toLowerCase() || "";
  return urgencyStyles[key] || urgencyStyles["week"];
};

const CIODecisionBrief: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const items: any[] = Array.isArray(data) ? data : data.items || data.actions || [];

  return (
    <Box>
      {items.map((item: any, i: number) => {
        const style = getUrgencyStyle(item.urgency || item.timeline || "");
        return (
          <Box
            key={i}
            sx={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              p: 2.5,
              mb: 2,
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            {/* Number badge */}
            <Box
              sx={{
                width: 32,
                height: 32,
                minWidth: 32,
                borderRadius: "50%",
                backgroundColor: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mt: 0.3,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#475569" }}>
                {item.priority || i + 1}
              </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1e293b", mb: 0.5 }}>
                {item.title || item.action}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1 }}>
                {item.description || item.rationale}
              </Typography>
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {(item.capital || item.capital_impact) && (
                  <Typography sx={{ fontSize: 12, color: "#475569" }}>
                    Capital:{" "}
                    <Box component="span" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                      {item.capital || item.capital_impact}
                    </Box>
                  </Typography>
                )}
                {item.responsible && (
                  <Typography sx={{ fontSize: 12, color: "#475569" }}>
                    Responsible:{" "}
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      {item.responsible}
                    </Box>
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Urgency Badge */}
            {(item.urgency || item.timeline) && (
              <Chip
                icon={
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: style.dot,
                      ml: 0.8,
                    }}
                  />
                }
                label={item.urgency || item.timeline}
                size="small"
                sx={{
                  backgroundColor: style.bg,
                  color: style.color,
                  fontWeight: 600,
                  fontSize: 11,
                  height: 26,
                  border: "none",
                  "& .MuiChip-icon": { mr: -0.3 },
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default CIODecisionBrief;
