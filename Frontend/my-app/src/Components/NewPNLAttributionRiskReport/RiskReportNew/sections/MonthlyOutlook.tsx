import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import GenericDataRenderer from "./GenericDataRenderer";

interface Props {
  data: any;
}

const weekColors = [
  { border: "#2563eb", bg: "linear-gradient(135deg, #fff, #eff6ff)", title: "#2563eb" },
  { border: "#7c3aed", bg: "linear-gradient(135deg, #fff, #faf5ff)", title: "#7c3aed" },
  { border: "#059669", bg: "linear-gradient(135deg, #fff, #f0fdf4)", title: "#059669" },
  { border: "#ea580c", bg: "linear-gradient(135deg, #fff, #fff7ed)", title: "#ea580c" },
];

const narrativeSections = [
  { key: "risk_budget_rebalance", label: "Risk Budget Rebalance", bg: "#fef2f2", border: "#fecaca", color: "#dc2626" },
  { key: "tactical_allocation_shifts", label: "Tactical Allocation Shifts", bg: "#eff6ff", border: "#bfdbfe", color: "#2563eb" },
  { key: "capital_allocation_adjustment", label: "Capital Allocation Adjustment", bg: "#fffbeb", border: "#fde68a", color: "#d97706" },
  { key: "model_integrity_reinforcement", label: "Model Integrity Reinforcement", bg: "#faf5ff", border: "#d8b4fe", color: "#7c3aed" },
];

const MonthlyOutlook: React.FC<Props> = ({ data }) => {
  const [expandedWeek, setExpandedWeek] = useState<number | null>();

  if (!data) return null;

  if (typeof data === "string") {
    return (
      <Box sx={{ backgroundColor: "#f0f7ff", borderRadius: 2.5, p: 3 }}>
        <Typography sx={{ fontSize: 15, color: "#1e293b", lineHeight: 1.8, whiteSpace: "pre-wrap", fontWeight: 400 }}>
          {data}
        </Typography>
      </Box>
    );
  }

  const weeks: any[] = Array.isArray(data)
    ? data
    : data.monthly_strategic_plan?.phases || data.phases || data.weeks || data.items || data.rows || [];

  const actionPlan: any[] = data.action_plan || data.monthly_action_plan || data.actions || [];
  const narrative = data.narrative || data.summary || data.overview || data.description || data.risk_budget_rebalance;

  const hasNarrativeSections = narrativeSections.some(({ key }) => data[key]);
  const hasStructuredData = weeks.length > 0 || actionPlan.length > 0 || narrative || hasNarrativeSections;

  if (!hasStructuredData) return <GenericDataRenderer data={data} accentColor="#f97316" />;

  return (
    <Box>
      {narrative && (
        <Box sx={{ background: "linear-gradient(135deg, #f0f7ff, #e0e7ff)", border: "1px solid #c7d2fe", borderRadius: 2.5, p: 3, mb: 3 }}>
          <Typography sx={{ fontSize: 15, color: "#1e293b", lineHeight: 1.9, whiteSpace: "pre-wrap", fontWeight: 400 }}>
            {typeof narrative === "string" ? narrative : narrative.content || narrative.text}
          </Typography>
        </Box>
      )}

      {weeks.map((week: any, i: number) => {
        const color = weekColors[i % weekColors.length];
        const phaseTitle = week.phase_label || week.title || week.label || `Week ${i + 1}`;
        const phaseContent = week.actions || week.content;
        const phaseSubtitle = week.capital_adjustment || week.capital;
        const phaseHighlight = week.summary || week.note || week.key_message;
        const isExpanded = expandedWeek === i;

        return (
          <Box
            key={i}
            sx={{
              background: color.bg,
              border: `1px solid ${color.border}40`,
              borderLeft: `4px solid ${color.border}`,
              borderRadius: 2,
              p: 3,
              mb: 2,
              transition: "all 0.2s",
              "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: phaseSubtitle || phaseHighlight ? 1.2 : 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 17, color: color.title, letterSpacing: 0.3 }}>
                {phaseTitle}
              </Typography>

              <Button
                size="small"
                variant="contained"
                disableElevation
                onClick={() => setExpandedWeek(isExpanded ? null : i)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: 99,
                  minWidth: 130,
                }}
              >
                {isExpanded ? "Hide Details" : "View Details"}
              </Button>
            </Box>

            {phaseSubtitle && (
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#475569", mb: 1.2 }}>
                {phaseSubtitle}
              </Typography>
            )}

            {!isExpanded && phaseHighlight && (
              <Typography sx={{ fontSize: 14, color: "#475569", mb: 1.5, fontStyle: "italic", lineHeight: 1.7 }}>
                {phaseHighlight}
              </Typography>
            )}

            {isExpanded && (
              typeof phaseContent === "string" ? (
                <Typography sx={{ fontSize: 14, color: "#1e293b", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {phaseContent}
                </Typography>
              ) : Array.isArray(phaseContent || week.items || week.bullets) ? (
                <Box component="ul" sx={{ m: 0, pl: 3 }}>
                  {(phaseContent || week.items || week.bullets).map((bullet: any, j: number) => (
                    <Typography component="li" key={j} sx={{ fontSize: 14, color: "#1e293b", mb: 0.8, lineHeight: 1.7 }}>
                      {typeof bullet === "string" ? bullet : bullet?.text || bullet?.description || JSON.stringify(bullet)}
                    </Typography>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ fontSize: 14, color: "#1e293b", lineHeight: 1.8 }}>
                  {week.description || week.text || (typeof phaseContent === "object" && phaseContent !== null ? JSON.stringify(phaseContent) : "")}
                </Typography>
              )
            )}
          </Box>
        );
      })}

      {actionPlan.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 2, color: "#ea580c" }}>
            Monthly Action Plan
          </Typography>

          <Box sx={{ border: "1px solid #fed7aa", borderRadius: 2.5, overflow: "hidden" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "0.5fr 2fr 1.5fr 1fr",
                background: "linear-gradient(135deg, #fff7ed, #ffedd5)",
              }}
            >
              {["Priority", "Action", "Trigger", "Responsible"].map((h) => (
                <Typography key={h} sx={{ px: 2, py: 1.5, fontSize: 13, fontWeight: 600, color: "#ea580c" }}>
                  {h}
                </Typography>
              ))}
            </Box>

            {actionPlan.map((row: any, i: number) => (
              <Box
                key={i}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "0.5fr 2fr 1.5fr 1fr",
                  borderBottom: i < actionPlan.length - 1 ? "1px solid #e0e7ff" : "none",
                }}
              >
                <Typography sx={{ px: 2, py: 1.6, fontSize: 14, fontWeight: 600 }}>
                  {row.priority}
                </Typography>
                <Typography sx={{ px: 2, py: 1.6, fontSize: 14 }}>
                  {row.action}
                </Typography>
                <Typography sx={{ px: 2, py: 1.6, fontSize: 14 }}>
                  {row.trigger}
                </Typography>
                <Typography sx={{ px: 2, py: 1.6, fontSize: 14, color: "#475569" }}>
                  {row.responsible}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {hasNarrativeSections && (
        <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2 }}>
          {narrativeSections.map(({ key, label, bg, border, color }) => {
            const value = data[key];
            if (!value || (key === "risk_budget_rebalance" && narrative === value)) return null;

            return (
              <Box key={key} sx={{ backgroundColor: bg, border: `1px solid ${border}`, borderRadius: 2, p: 3 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color, mb: 1 }}>
                  {label}
                </Typography>
                <Typography sx={{ fontSize: 15, color: "#1e293b", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
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