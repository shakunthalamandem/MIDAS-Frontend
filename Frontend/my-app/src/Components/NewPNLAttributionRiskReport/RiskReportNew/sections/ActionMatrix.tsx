import React from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  data: any;
}

const priorityDot = (priority: number | string): string => {
  const p = typeof priority === "string" ? parseInt(priority, 10) : priority;
  if (p <= 2) return "#ef4444";
  if (p <= 3) return "#f97316";
  if (p <= 4) return "#eab308";
  return "#10b981";
};

const ActionMatrix: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const items: any[] = Array.isArray(data) ? data : data.items || data.actions || data.matrix || [];

  // If we have items with known columns, render as table
  if (items.length > 0) {
    const hasColumns =
      items[0].action || items[0].priority || items[0].trigger || items[0].responsible;

    if (hasColumns) {
      return (
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

          {items.map((row: any, i: number) => (
            <Box
              key={i}
              sx={{
                display: "grid",
                gridTemplateColumns: "0.5fr 2fr 1.5fr 1fr",
                borderBottom: i < items.length - 1 ? "1px solid #f1f5f9" : "none",
                alignItems: "center",
                "&:hover": { backgroundColor: "#fafbfc" },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                  {row.priority}
                </Typography>
                {row.priority && (
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: priorityDot(row.priority),
                    }}
                  />
                )}
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
      );
    }

    // Fallback: generic list with keys from first item
    const keys = Object.keys(items[0]);
    return (
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
            gridTemplateColumns: `repeat(${keys.length}, 1fr)`,
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          {keys.map((k) => (
            <Typography
              key={k}
              sx={{
                px: 2,
                py: 1.2,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.8,
                color: "#475569",
                textTransform: "uppercase",
              }}
            >
              {k.replace(/_/g, " ")}
            </Typography>
          ))}
        </Box>

        {items.map((row: any, i: number) => (
          <Box
            key={i}
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${keys.length}, 1fr)`,
              borderBottom: i < items.length - 1 ? "1px solid #f1f5f9" : "none",
              "&:hover": { backgroundColor: "#fafbfc" },
            }}
          >
            {keys.map((k) => (
              <Typography
                key={k}
                sx={{ px: 2, py: 1.5, fontSize: 13, color: "#475569" }}
              >
                {typeof row[k] === "object" ? JSON.stringify(row[k]) : row[k]}
              </Typography>
            ))}
          </Box>
        ))}
      </Box>
    );
  }

  // Fallback for non-array data
  if (typeof data === "string") {
    return (
      <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 2.5 }}>
        <Typography sx={{ fontSize: 13, color: "#475569", whiteSpace: "pre-wrap" }}>
          {data}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 2.5 }}>
      <Typography sx={{ fontSize: 13, color: "#475569", whiteSpace: "pre-wrap" }}>
        {JSON.stringify(data, null, 2)}
      </Typography>
    </Box>
  );
};

export default ActionMatrix;
