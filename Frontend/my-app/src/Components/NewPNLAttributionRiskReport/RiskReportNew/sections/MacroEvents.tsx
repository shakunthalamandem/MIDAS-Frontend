import React from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  data: any;
}

const sensitivityColor = (level: string): string => {
  const l = level?.toUpperCase() || "";
  if (l.includes("CRITICAL")) return "#dc2626";
  if (l.includes("HIGH")) return "#ea580c";
  if (l.includes("MEDIUM")) return "#d97706";
  return "#64748b";
};

const MacroEvents: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const events: any[] = Array.isArray(data) ? data : data.events || data.items || data.calendar || [];
  const metrics: any[] = data.metrics || data.metric_cards || [];
  const scenario = data.scenario || data.most_dangerous_scenario || data.worst_case;

  const headers = ["DATE", "EVENT", "SENSITIVITY", "PORTFOLIO IMPACT"];

  return (
    <Box>
      {/* Events Table */}
      {events.length > 0 && (
        <Box
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            overflow: "hidden",
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "0.8fr 1.5fr 0.8fr 1.5fr",
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            {headers.map((h) => (
              <Typography
                key={h}
                sx={{
                  px: 2,
                  py: 1.2,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: "#475569",
                }}
              >
                {h}
              </Typography>
            ))}
          </Box>

          {events.map((evt: any, i: number) => (
            <Box
              key={i}
              sx={{
                display: "grid",
                gridTemplateColumns: "0.8fr 1.5fr 0.8fr 1.5fr",
                borderBottom: i < events.length - 1 ? "1px solid #f1f5f9" : "none",
                alignItems: "center",
                "&:hover": { backgroundColor: "#fafbfc" },
              }}
            >
              <Typography
                sx={{ px: 2, py: 1.5, fontSize: 13, fontWeight: 600, color: "#1e293b" }}
              >
                {evt.date}
              </Typography>
              <Typography
                sx={{ px: 2, py: 1.5, fontSize: 13, color: "#2563eb", fontWeight: 500 }}
              >
                {evt.event}
              </Typography>
              <Typography
                sx={{
                  px: 2,
                  py: 1.5,
                  fontSize: 13,
                  fontWeight: 700,
                  color: sensitivityColor(evt.sensitivity),
                }}
              >
                {evt.sensitivity}
              </Typography>
              <Typography
                sx={{ px: 2, py: 1.5, fontSize: 13, color: "#475569" }}
              >
                {evt.portfolio_impact || evt.impact}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Metric Cards */}
      {metrics.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(metrics.length, 3)}, 1fr)`,
            gap: 2,
            mb: 3,
          }}
        >
          {metrics.map((m: any, i: number) => {
            const isNegative =
              m.value?.startsWith("-") || m.value?.startsWith("−");
            const bgColor = i === 0 ? "#fffbeb" : isNegative ? "#fef2f2" : "#f8fafc";
            return (
              <Box
                key={i}
                sx={{
                  backgroundColor: bgColor,
                  border: "1px solid #e2e8f0",
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: 1,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    mb: 0.5,
                  }}
                >
                  {m.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: isNegative ? "#dc2626" : "#1e293b",
                    fontFamily: "monospace",
                    mb: 0.5,
                  }}
                >
                  {m.value}
                </Typography>
                {m.interpretation && (
                  <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                    {m.interpretation}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Dangerous Scenario */}
      {scenario && (
        <Box
          sx={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 2,
            p: 2.5,
          }}
        >
          <Typography
            sx={{ fontWeight: 700, fontSize: 14, color: "#dc2626", mb: 1 }}
          >
            {scenario.title || "Most Dangerous Scenario"}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
            {typeof scenario === "string" ? scenario : scenario.content || scenario.description || scenario.text}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MacroEvents;
