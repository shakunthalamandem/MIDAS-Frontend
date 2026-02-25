import React from "react";
import { Box, Typography } from "@mui/material";
import GenericDataRenderer from "./GenericDataRenderer";

interface Props {
  data: any;
}

const SKIP_KEYS = ["badge", "overall", "section_number", "label", "key"];
const formatHeader = (k: string) => k.replace(/_/g, " ").toUpperCase();

const extractRows = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (val.rows && Array.isArray(val.rows)) return val.rows;
  if (val.items && Array.isArray(val.items)) return val.items;
  return [];
};

const sensitivityColor = (level: string): string => {
  const l = (level || "").toUpperCase();
  if (l.includes("CRITICAL")) return "#dc2626";
  if (l.includes("HIGH")) return "#ea580c";
  if (l.includes("MEDIUM")) return "#d97706";
  return "#1e293b";
};

const formatCurrency = (val: number): string => {
  const absVal = Math.abs(val);
  const formatted = absVal >= 1_000_000
    ? `$${(absVal / 1_000_000).toFixed(2)}M`
    : absVal >= 1_000
    ? `$${(absVal / 1_000).toFixed(0)}K`
    : `$${absVal.toFixed(0)}`;
  return val < 0 ? `-${formatted}` : formatted;
};

const MacroEvents: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  if (typeof data === "string") {
    return (
      <Box sx={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 2.5, p: 2.5 }}>
        <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{data}</Typography>
      </Box>
    );
  }

  const events: any[] = Array.isArray(data)
    ? data
    : extractRows(data.events || data.items || data.calendar);
  const sensitivity = data.portfolio_sensitivity || data.volatility_sensitivity || data.sensitivity_analysis;
  const scenario = data.scenario || data.most_dangerous_scenario || data.worst_case || data.dangerous_scenario;
  const hasStructuredData = events.length > 0 || sensitivity || scenario;

  if (!hasStructuredData) {
    return <GenericDataRenderer data={data} accentColor="#3b82f6" />;
  }

  // Dynamic columns for events table
  const eventKeys = events.length > 0 ? Object.keys(events[0]).filter((k) => !SKIP_KEYS.includes(k)) : [];

  return (
    <Box>
      {events.length > 0 && eventKeys.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1.5, color: "#1e293b" }}>Upcoming High-Impact Events</Typography>
          <Box sx={{ border: "1px solid #c7d2fe", borderRadius: 2.5, overflow: "hidden" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${eventKeys.length}, 1fr)`,
                backgroundColor: "#f8fafc",
                borderBottom: "2px solid #bfdbfe",
              }}
            >
              {eventKeys.map((k) => (
                <Typography key={k} sx={{ px: 2, py: 1.2, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#475569", textTransform: "uppercase" }}>
                  {formatHeader(k)}
                </Typography>
              ))}
            </Box>
            {events.map((evt: any, i: number) => (
              <Box
                key={i}
                sx={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${eventKeys.length}, 1fr)`,
                  borderBottom: i < events.length - 1 ? "1px solid #e0e7ff" : "none",
                  alignItems: "center",
                  "&:hover": { backgroundColor: "#eff6ff" },
                }}
              >
                {eventKeys.map((k, j) => {
                  const val = evt[k];
                  const displayVal = val === null || val === undefined ? "—" : typeof val === "object" ? JSON.stringify(val) : String(val);
                  const isSensitivity = k.toLowerCase().includes("sensitivity") || k.toLowerCase().includes("level") || k.toLowerCase().includes("risk");
                  return (
                    <Typography
                      key={k}
                      sx={{
                        px: 2,
                        py: 1.5,
                        fontSize: 13,
                        fontWeight: j === 0 ? 600 : isSensitivity ? 700 : 400,
                        color: isSensitivity ? sensitivityColor(displayVal) : j === 0 ? "#1e293b" : "#334155",
                      }}
                    >
                      {displayVal}
                    </Typography>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {sensitivity && (
        <Box sx={{ background: "linear-gradient(135deg, #f0f7ff, #eff6ff)", border: "1px solid #bfdbfe", borderRadius: 2.5, p: 2.5, mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1e293b", mb: 1 }}>Portfolio Sensitivity to Volatility Increase</Typography>
          {typeof sensitivity === "string" ? (
            <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7 }}>{sensitivity}</Typography>
          ) : (
            <Box>
              {(sensitivity.current_vix != null || sensitivity.scenario_vix != null) && (
                <Box sx={{ display: "flex", gap: 3, mb: 1.5, flexWrap: "wrap" }}>
                  {sensitivity.current_vix != null && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Typography sx={{ fontSize: 12, color: "#334155", fontWeight: 600 }}>Current VIX:</Typography>
                      <Typography sx={{ fontSize: 14, color: "#1e293b", fontWeight: 700, fontFamily: "monospace" }}>{sensitivity.current_vix}</Typography>
                    </Box>
                  )}
                  {sensitivity.scenario_vix != null && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Typography sx={{ fontSize: 12, color: "#334155", fontWeight: 600 }}>Scenario VIX:</Typography>
                      <Typography sx={{ fontSize: 14, color: "#ea580c", fontWeight: 700, fontFamily: "monospace" }}>{sensitivity.scenario_vix}</Typography>
                    </Box>
                  )}
                </Box>
              )}
              {sensitivity.scenario_description && (
                <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, mb: 1.5 }}>
                  {sensitivity.scenario_description}
                </Typography>
              )}
              {(sensitivity.estimated_portfolio_loss_dollars != null || sensitivity.estimated_portfolio_loss_pct_nav != null) && (
                <Box sx={{ background: "linear-gradient(135deg, #fef2f2, #fff1f2)", border: "1px solid #fecaca", borderRadius: 2, p: 2, display: "flex", gap: 3, flexWrap: "wrap", alignItems: "center" }}>
                  <Typography sx={{ fontSize: 12, color: "#dc2626", fontWeight: 700 }}>Estimated Portfolio Loss:</Typography>
                  {sensitivity.estimated_portfolio_loss_dollars != null && (
                    <Typography sx={{ fontSize: 15, color: "#dc2626", fontWeight: 700, fontFamily: "monospace" }}>
                      {formatCurrency(sensitivity.estimated_portfolio_loss_dollars)}
                    </Typography>
                  )}
                  {sensitivity.estimated_portfolio_loss_pct_nav != null && (
                    <Typography sx={{ fontSize: 14, color: "#dc2626", fontWeight: 600, fontFamily: "monospace" }}>
                      ({sensitivity.estimated_portfolio_loss_pct_nav}% NAV)
                    </Typography>
                  )}
                </Box>
              )}
              {/* Fallback for other string-like fields */}
              {!sensitivity.current_vix && !sensitivity.scenario_description && !sensitivity.estimated_portfolio_loss_dollars && (
                <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7 }}>
                  {sensitivity.content || sensitivity.description || sensitivity.text || JSON.stringify(sensitivity)}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
      {scenario && (
        <Box sx={{ background: "linear-gradient(135deg, #fef2f2, #fff1f2)", border: "1px solid #fecaca", borderRadius: 2.5, p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#dc2626", mb: 1 }}>Most Dangerous Scenario Next 30 Days</Typography>
          <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7 }}>
            {typeof scenario === "string" ? scenario : scenario.content || scenario.description || scenario.text}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MacroEvents;
