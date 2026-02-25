import React from "react";
import { Box } from "@mui/material";

const actionColors: Record<string, { bg: string; color: string; border: string }> = {
  buy: { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
  "buy more": { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
  hold: { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  reduce: { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  sell: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  "sell down": { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

const defaultColor = { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" };

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
