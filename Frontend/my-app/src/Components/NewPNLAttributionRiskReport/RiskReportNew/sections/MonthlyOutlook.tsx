import React from "react";
import { Box, Typography } from "@mui/material";
import GenericDataRenderer from "./GenericDataRenderer";

interface Props {
  data: any;
}

const weekColors = [
  { border: "#93c5fd", bg: "linear-gradient(135deg, #fff, #eff6ff)", title: "#2563eb" },
  { border: "#c4b5fd", bg: "linear-gradient(135deg, #fff, #faf5ff)", title: "#7c3aed" },
  { border: "#86efac", bg: "linear-gradient(135deg, #fff, #f0fdf4)", title: "#059669" },
  { border: "#fdba74", bg: "linear-gradient(135deg, #fff, #fff7ed)", title: "#ea580c" },
];

const narrativeSections: { key: string; label: string; bg: string; border: string; color: string }[] = [
  { key: "risk_budget_rebalance", label: "RISK BUDGET REBALANCE", bg: "#fef2f2", border: "#fecaca", color: "#dc2626" },
  { key: "tactical_allocation_shifts", label: "TACTICAL ALLOCATION SHIFTS", bg: "#eff6ff", border: "#bfdbfe", color: "#2563eb" },
  { key: "capital_allocation_adjustment", label: "CAPITAL ALLOCATION ADJUSTMENT", bg: "#fffbeb", border: "#fde68a", color: "#d97706" },
  { key: "model_integrity_reinforcement", label: "MODEL INTEGRITY REINFORCEMENT", bg: "#faf5ff", border: "#d8b4fe", color: "#7c3aed" },
];

const MonthlyOutlook: React.FC<Props> = ({ data }) => {
  if (!data) return null;
  if (typeof data === "string") {
    return (<Box sx={{ backgroundColor: "#f0f7ff", borderRadius: 2.5, p: 2.5 }}>
      <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{data}</Typography>
    </Box>);
  }

  // Extract phases: try monthly_strategic_plan.phases first, then direct phases, then weeks
  const weeks: any[] = Array.isArray(data)
    ? data
    : data.monthly_strategic_plan?.phases || data.phases || data.weeks || data.items || data.rows || [];

  const actionPlan: any[] = data.action_plan || data.monthly_action_plan || data.actions || [];
  const narrative = data.narrative || data.summary || data.overview || data.description || data.risk_budget_rebalance;

  // Check if any of the top-level narrative fields exist
  const hasNarrativeSections = narrativeSections.some(({ key }) => data[key]);

  const hasStructuredData = weeks.length > 0 || actionPlan.length > 0 || narrative || hasNarrativeSections;
  if (!hasStructuredData) return <GenericDataRenderer data={data} accentColor="#f97316" />;

  return (
    <Box>
      {narrative && (
        <Box sx={{ background: "linear-gradient(135deg, #f0f7ff, #e0e7ff)", border: "1px solid #c7d2fe", borderRadius: 2.5, p: 2.5, mb: 3 }}>
          <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {typeof narrative === "string" ? narrative : narrative.content || narrative.text}
          </Typography>
        </Box>
      )}
      {weeks.map((week: any, i: number) => {
        const color = weekColors[i % weekColors.length];
        const phaseTitle = week.phase_label || week.title || week.label || `Week ${i + 1}`;
        const phaseContent = week.actions || week.content;
        const phaseSubtitle = week.capital_adjustment || week.capital;
        return (
          <Box key={i} sx={{ background: color.bg, border: `1px solid ${color.border}40`, borderLeft: `4px solid ${color.border}`,
            borderRadius: 2, p: 2.5, mb: 2, transition: "all 0.2s", "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.06)" } }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: color.title, mb: 0.5 }}>{phaseTitle}</Typography>
            {phaseSubtitle && (
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#334155", mb: 1, fontFamily: "monospace" }}>
                {phaseSubtitle}
              </Typography>
            )}
            {typeof phaseContent === "string" ? (
              <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{phaseContent}</Typography>
            ) : Array.isArray(phaseContent || week.items || week.bullets) ? (
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {(phaseContent || week.items || week.bullets).map((bullet: any, j: number) => (
                  <Typography component="li" key={j} sx={{ fontSize: 13, color: "#1e293b", mb: 0.5, lineHeight: 1.5 }}>
                    {typeof bullet === "string" ? bullet : bullet?.text || bullet?.description || JSON.stringify(bullet)}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>
                {week.description || week.text || (typeof phaseContent === "object" && phaseContent !== null ? JSON.stringify(phaseContent) : "")}
              </Typography>
            )}
          </Box>
        );
      })}
      {actionPlan.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1.5, color: "#ea580c" }}>Monthly Action Plan</Typography>
          <Box sx={{ border: "1px solid #fed7aa", borderRadius: 2.5, overflow: "hidden" }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "0.5fr 2fr 1.5fr 1fr",
              background: "linear-gradient(135deg, #fff7ed, #ffedd5)", borderBottom: "2px solid #f97316" }}>
              {["PRIORITY", "ACTION", "TRIGGER", "RESPONSIBLE"].map((h) => (
                <Typography key={h} sx={{ px: 2, py: 1.2, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#ea580c" }}>{h}</Typography>
              ))}
            </Box>
            {actionPlan.map((row: any, i: number) => (
              <Box key={i} sx={{ display: "grid", gridTemplateColumns: "0.5fr 2fr 1.5fr 1fr",
                borderBottom: i < actionPlan.length - 1 ? "1px solid #e0e7ff" : "none", "&:hover": { backgroundColor: "#fff7ed" } }}>
                <Typography sx={{ px: 2, py: 1.5, fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{row.priority}</Typography>
                <Typography sx={{ px: 2, py: 1.5, fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{row.action}</Typography>
                <Typography sx={{ px: 2, py: 1.5, fontSize: 13, color: "#1e293b" }}>{row.trigger}</Typography>
                <Typography sx={{ px: 2, py: 1.5, fontSize: 13, color: "#334155" }}>{row.responsible}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {/* Render top-level narrative sections */}
      {hasNarrativeSections && (
        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          {narrativeSections.map(({ key, label, bg, border, color }) => {
            const value = data[key];
            if (!value || (key === "risk_budget_rebalance" && narrative === value)) return null;
            return (
              <Box key={key} sx={{ backgroundColor: bg, border: `1px solid ${border}`, borderRadius: 2, p: 2 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color, textTransform: "uppercase", mb: 0.5 }}>
                  {label}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {typeof value === "string" ? value : JSON.stringify(value)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default MonthlyOutlook;
