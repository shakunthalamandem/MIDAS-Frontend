import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import GenericDataRenderer from "./GenericDataRenderer";

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
  for (const [k, v] of Object.entries(urgencyStyles)) {
    if (key.includes(k)) return v;
  }
  return urgencyStyles["week"];
};

const CIODecisionBrief: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  if (typeof data === "string") {
    return (
      <Box sx={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 2.5, p: 2.5 }}>
        <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{data}</Typography>
      </Box>
    );
  }

  const items: any[] = Array.isArray(data) ? data : data.directives || data.items || data.actions || data.decisions || data.briefs || data.rows || [];

  if (items.length === 0) {
    return <GenericDataRenderer data={data} accentColor="#f97316" />;
  }

  return (
    <Box>
      {items.map((item: any, i: number) => {
        const style = getUrgencyStyle(item.urgency || item.execution_window || item.timeline || item.time_sensitivity || "");
        return (
          <Box key={i} sx={{
            backgroundColor: "#fff", border: "1px solid #e2e8f0", borderLeft: `4px solid ${style.dot}`,
            borderRadius: 2, p: 2.5, mb: 2, display: "flex", alignItems: "flex-start", gap: 2,
            transition: "all 0.2s", "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.06)", transform: "translateY(-1px)" },
          }}>
            <Box sx={{ width: 34, height: 34, minWidth: 34, borderRadius: "50%",
              background: "linear-gradient(135deg, #f97316, #ec4899)",
              display: "flex", alignItems: "center", justifyContent: "center", mt: 0.3 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>
                {item.severity_emoji || item.priority || i + 1}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1e293b", mb: 0.5 }}>
                {item.title || item.action || item.name || item.ticker}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#64748b", mb: 1, lineHeight: 1.6 }}>
                {item.description || item.rationale || item.content || item.text || item.detail}
              </Typography>
              {item.base_model_tie_in && (
                <Typography sx={{ fontSize: 12, color: "#64748b", mb: 1, lineHeight: 1.5, fontStyle: "italic" }}>
                  {item.base_model_tie_in}
                </Typography>
              )}
              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                {(item.capital_impact_formatted || item.capital || item.capital_impact) && (
                  <Typography sx={{ fontSize: 12, color: "#475569" }}>
                    Capital: <Box component="span" sx={{ fontWeight: 600, fontFamily: "monospace", color: "#1e293b" }}>{item.capital_impact_formatted || item.capital || item.capital_impact}</Box>
                  </Typography>
                )}
                {(item.responsible_role || item.responsible) && (
                  <Typography sx={{ fontSize: 12, color: "#475569" }}>
                    Responsible: <Box component="span" sx={{ fontWeight: 600, color: "#1e293b" }}>{item.responsible_role || item.responsible}</Box>
                  </Typography>
                )}
                {item.severity_score && (
                  <Typography sx={{ fontSize: 12, color: "#475569" }}>
                    Severity: <Box component="span" sx={{ fontWeight: 600, color: "#dc2626" }}>{item.severity_score}</Box>
                  </Typography>
                )}
              </Box>
            </Box>
            {(item.urgency || item.execution_window || item.timeline || item.time_sensitivity) && (
              <Chip
                icon={<Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: style.dot, ml: 0.8 }} />}
                label={item.urgency || item.execution_window || item.timeline || item.time_sensitivity} size="small"
                sx={{ backgroundColor: style.bg, color: style.color, fontWeight: 600, fontSize: 11, height: 26, border: "none", "& .MuiChip-icon": { mr: -0.3 } }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default CIODecisionBrief;
