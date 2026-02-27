import React from "react";
import { Box } from "@mui/material";

const actionColors: Record<string, { bg: string; color: string; border: string }> = {
  buy: { bg: "#059669", color: "#fff", border: "#059669" },
  "buy more": { bg: "#059669", color: "#fff", border: "#059669" },
  hold: { bg: "#2563eb", color: "#fff", border: "#2563eb" },
  reduce: { bg: "#ea580c", color: "#fff", border: "#ea580c" },
  sell: { bg: "#dc2626", color: "#fff", border: "#dc2626" },
  "sell down": { bg: "#dc2626", color: "#fff", border: "#dc2626" },
};

const defaultColor = { bg: "#64748b", color: "#fff", border: "#64748b" };

interface ActionBadgeProps {
  action: string;
}

export const ActionBadge: React.FC<ActionBadgeProps> = ({ action }) => {
  const normalized = action?.toLowerCase().trim() ?? "";
  const cfg = actionColors[normalized] || defaultColor;

  return (
    <Box
      component="span"
      sx={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        px: 1.5,
        py: 0.4,
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {action}
    </Box>
  );
};
