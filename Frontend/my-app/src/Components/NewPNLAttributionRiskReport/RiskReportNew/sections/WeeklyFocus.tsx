import React from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  data: any;
}

const priorityDot = (priority: number | string): string => {
  const p = typeof priority === "string" ? parseInt(priority, 10) : priority;
  if (p <= 2) return "#ef4444";
  if (p <= 3) return "#f97316";
  return "#eab308";
};

const WeeklyFocus: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const monitoring = data.immediate_monitoring || data.monitoring;
  const earningsWatch: any[] = data.earnings_watch || [];
  const actionPlan: any[] = data.action_plan || data.weekly_action_plan || [];

  return (
    <Box>
      {/* Immediate Monitoring Alert */}
      {monitoring && (
        <Box
          sx={{
            backgroundColor: "#fff7ed",
            border: "1px solid #fed7aa",
            borderRadius: 2,
            p: 2.5,
            mb: 3,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#ea580c", mb: 0.5 }}>
            Immediate Monitoring
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
            {typeof monitoring === "string"
              ? monitoring
              : monitoring.content || monitoring.text || monitoring.description}
          </Typography>
        </Box>
      )}

      {/* Earnings Watch Table */}
      {earningsWatch.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1.5 }}>
            Earnings Watch
          </Typography>
          <Box
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "0.7fr 0.7fr 0.8fr 1.5fr 1.5fr",
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {["DATE", "TICKER", "EXPOSURE", "KEY RISK", "PREPARATION"].map((h) => (
                <Typography
                  key={h}
                  sx={{
                    px: 2,
                    py: 1.2,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    color: "#475569",
                  }}
                >
                  {h}
                </Typography>
              ))}
            </Box>

            {earningsWatch.map((row: any, i: number) => (
              <Box
                key={i}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "0.7fr 0.7fr 0.8fr 1.5fr 1.5fr",
                  borderBottom: i < earningsWatch.length - 1 ? "1px solid #f1f5f9" : "none",
                  "&:hover": { backgroundColor: "#fafbfc" },
                }}
              >
                <Typography
                  sx={{ px: 2, py: 1.5, fontSize: 13, fontWeight: 600, color: "#1e293b" }}
                >
                  {row.date}
                </Typography>
                <Typography
                  sx={{ px: 2, py: 1.5, fontSize: 13, fontWeight: 700, color: "#2563eb" }}
                >
                  {row.ticker}
                </Typography>
                <Typography
                  sx={{
                    px: 2,
                    py: 1.5,
                    fontSize: 13,
                    color: "#475569",
                    fontFamily: "monospace",
                  }}
                >
                  {row.exposure}
                </Typography>
                <Typography sx={{ px: 2, py: 1.5, fontSize: 13, color: "#475569" }}>
                  {row.key_risk}
                </Typography>
                <Typography
                  sx={{
                    px: 2,
                    py: 1.5,
                    fontSize: 13,
                    color: row.preparation?.toLowerCase?.().includes("exit")
                      ? "#dc2626"
                      : "#475569",
                    fontWeight: row.preparation?.toLowerCase?.().includes("exit")
                      ? 600
                      : 400,
                  }}
                >
                  {row.preparation}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Weekly Action Plan */}
      {actionPlan.length > 0 && (
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1.5 }}>
            Weekly Action Plan
          </Typography>
          <Box
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "0.5fr 2fr 1.5fr 1fr",
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {["PRIORITY", "ACTION", "TRIGGER", "RESPONSIBLE"].map((h) => (
                <Typography
                  key={h}
                  sx={{
                    px: 2,
                    py: 1.2,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    color: "#475569",
                  }}
                >
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
                  borderBottom: i < actionPlan.length - 1 ? "1px solid #f1f5f9" : "none",
                  alignItems: "center",
                  "&:hover": { backgroundColor: "#fafbfc" },
                }}
              >
                <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                    {row.priority}
                  </Typography>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: priorityDot(row.priority),
                    }}
                  />
                </Box>
                <Typography
                  sx={{ px: 2, py: 1.5, fontSize: 13, color: "#1e293b", fontWeight: 500 }}
                >
                  {row.action}
                </Typography>
                <Typography sx={{ px: 2, py: 1.5, fontSize: 13, color: "#475569" }}>
                  {row.trigger}
                </Typography>
                <Typography sx={{ px: 2, py: 1.5, fontSize: 13, color: "#64748b" }}>
                  {row.responsible}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default WeeklyFocus;
