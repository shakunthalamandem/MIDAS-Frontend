import React from "react";
import { Box, Typography } from "@mui/material";
import GenericDataRenderer from "./GenericDataRenderer";

interface Props {
  data: any;
}

const extractRows = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (val.rows && Array.isArray(val.rows)) return val.rows;
  if (val.items && Array.isArray(val.items)) return val.items;
  return [];
};

const priorityDot = (priority: number | string): string => {
  const p = typeof priority === "string" ? parseInt(priority, 10) : priority;
  if (p <= 2) return "#ef4444";
  if (p <= 3) return "#f97316";
  return "#eab308";
};

const SKIP_KEYS = ["badge", "overall", "section_number", "label", "key"];
const formatHeader = (k: string) => k.replace(/_/g, " ").toUpperCase();

const renderDynamicTable = (items: any[], accentColor: string, hoverBg: string) => {
  if (items.length === 0) return null;
  const keys = Object.keys(items[0]).filter((k) => !SKIP_KEYS.includes(k));
  if (keys.length === 0) return null;

  return (
    <Box sx={{ border: `1px solid ${accentColor}40`, borderRadius: 2.5, overflow: "hidden" }}>
      <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${keys.length}, 1fr)`,
        backgroundColor: "#f8fafc", borderBottom: `2px solid ${accentColor}` }}>
        {keys.map((k) => (
          <Typography key={k} sx={{ px: 2, py: 1.2, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#475569", textTransform: "uppercase" }}>
            {formatHeader(k)}
          </Typography>
        ))}
      </Box>
      {items.map((row: any, i: number) => (
        <Box key={i} sx={{ display: "grid", gridTemplateColumns: `repeat(${keys.length}, 1fr)`,
          borderBottom: i < items.length - 1 ? "1px solid #e0e7ff" : "none", alignItems: "center", "&:hover": { backgroundColor: hoverBg } }}>
          {keys.map((k, j) => {
            const val = row[k];
            const displayVal = val === null || val === undefined ? "—" : typeof val === "object" ? JSON.stringify(val) : String(val);
            const isExit = displayVal.toLowerCase().includes("exit");
            return (
              <Typography key={k} sx={{ px: 2, py: 1.5, fontSize: 13,
                fontWeight: j === 0 ? 600 : isExit ? 600 : 400,
                color: isExit ? "#dc2626" : j === 0 ? "#1e293b" : "#334155",
                fontFamily: k.includes("exposure") || k.includes("capital") || k.includes("price") ? "monospace" : "inherit",
              }}>
                {displayVal}
              </Typography>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

const WeeklyFocus: React.FC<Props> = ({ data }) => {
  if (!data) return null;
  if (typeof data === "string") {
    return (<Box sx={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 2.5, p: 2.5 }}>
      <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{data}</Typography>
    </Box>);
  }

  const monitoring = data.immediate_monitoring || data.monitoring || data.alert;
  const earningsWatch: any[] = extractRows(data.earnings_watch || data.earnings || data.watch);
  const macroWatch = data.macro_watch || data.macro_monitoring || data.macro;
  const actionPlan: any[] = extractRows(data.action_plan || data.weekly_action_plan || data.actions || data.rows);
  const hasStructuredData = monitoring || earningsWatch.length > 0 || actionPlan.length > 0 || macroWatch;
  if (!hasStructuredData) return <GenericDataRenderer data={data} accentColor="#f97316" />;

  return (
    <Box>
      {monitoring && (
        <Box sx={{ background: "linear-gradient(135deg, #fff7ed, #ffedd5)", border: "1px solid #fdba74", borderRadius: 2.5, p: 2.5, mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#ea580c", mb: 1 }}>Immediate Monitoring Items</Typography>
          <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7 }}>
            {typeof monitoring === "string" ? monitoring : monitoring.content || monitoring.text || monitoring.description}
          </Typography>
        </Box>
      )}
      {earningsWatch.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1.5, color: "#1e293b" }}>Earnings Watch (This Week and Next)</Typography>
          {renderDynamicTable(earningsWatch, "#f97316", "#fff7ed")}
        </Box>
      )}
      {macroWatch && (
        <Box sx={{ background: "linear-gradient(135deg, #f0f7ff, #e0e7ff)", border: "1px solid #c7d2fe", borderRadius: 2.5, p: 2.5, mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1e293b", mb: 1 }}>Macro Watch</Typography>
          <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7 }}>
            {typeof macroWatch === "string" ? macroWatch : macroWatch.content || macroWatch.text || macroWatch.description}
          </Typography>
        </Box>
      )}
      {actionPlan.length > 0 && (
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1.5, color: "#1e293b" }}>Weekly Action Plan</Typography>
          {renderDynamicTable(actionPlan, "#f97316", "#fff7ed")}
        </Box>
      )}
    </Box>
  );
};

export default WeeklyFocus;
