import React from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  data: any;
}

const MonthlyOutlook: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const weeks: any[] = Array.isArray(data) ? data : data.weeks || data.items || [];
  const actionPlan: any[] = data.action_plan || data.monthly_action_plan || [];
  const narrative = data.narrative || data.summary || data.overview;

  // If data is a flat string
  if (typeof data === "string") {
    return (
      <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 2.5 }}>
        <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
          {data}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Narrative Overview */}
      {narrative && (
        <Box
          sx={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            p: 2.5,
            mb: 3,
          }}
        >
          <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
            {typeof narrative === "string" ? narrative : narrative.content || narrative.text}
          </Typography>
        </Box>
      )}

      {/* Weekly Breakdowns */}
      {weeks.map((week: any, i: number) => (
        <Box
          key={i}
          sx={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            p: 2.5,
            mb: 2,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#2563eb", mb: 1 }}>
            {week.title || week.label || `Week ${i + 1}`}
          </Typography>
          {typeof week.content === "string" ? (
            <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {week.content}
            </Typography>
          ) : Array.isArray(week.content || week.items || week.bullets) ? (
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {(week.content || week.items || week.bullets).map(
                (bullet: string, j: number) => (
                  <Typography
                    component="li"
                    key={j}
                    sx={{ fontSize: 13, color: "#475569", mb: 0.5, lineHeight: 1.5 }}
                  >
                    {bullet}
                  </Typography>
                )
              )}
            </Box>
          ) : (
            <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
              {week.description || week.text || JSON.stringify(week.content)}
            </Typography>
          )}
        </Box>
      ))}

      {/* Monthly Action Plan Table */}
      {actionPlan.length > 0 && (
        <Box sx={{ mt: 3 }}>
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
                  "&:hover": { backgroundColor: "#fafbfc" },
                }}
              >
                <Typography
                  sx={{ px: 2, py: 1.5, fontSize: 13, fontWeight: 600, color: "#475569" }}
                >
                  {row.priority}
                </Typography>
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

export default MonthlyOutlook;
