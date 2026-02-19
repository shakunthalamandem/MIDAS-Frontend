import React from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  data: any;
}

const roleColors: Record<string, { border: string; title: string }> = {
  cio: { border: "#dbeafe", title: "#1e40af" },
  traders: { border: "#fce7f3", title: "#be185d" },
  risk_team: { border: "#d1fae5", title: "#065f46" },
  stock_pickers: { border: "#e0e7ff", title: "#3730a3" },
  pm: { border: "#fef3c7", title: "#92400e" },
};

const getRoleColor = (key: string) => {
  const lower = key.toLowerCase().replace(/\s+/g, "_");
  for (const [k, v] of Object.entries(roleColors)) {
    if (lower.includes(k)) return v;
  }
  return { border: "#e2e8f0", title: "#1e293b" };
};

const ActionChecklists: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  // Data can be an object with role keys or an array of role objects
  let roles: Array<{ title: string; items: string[] }> = [];

  if (Array.isArray(data)) {
    roles = data.map((r: any) => ({
      title: r.role || r.title || r.name,
      items: r.items || r.actions || r.checklist || [],
    }));
  } else if (typeof data === "object") {
    roles = Object.entries(data)
      .filter(([key]) => !["badge", "overall"].includes(key))
      .map(([key, val]: [string, any]) => ({
        title: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        items: Array.isArray(val)
          ? val.map((v: any) => (typeof v === "string" ? v : v.text || v.action || JSON.stringify(v)))
          : typeof val === "object" && val !== null
            ? val.items || val.actions || val.checklist || []
            : [],
      }));
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 2,
      }}
    >
      {roles.map((role, i) => {
        const colors = getRoleColor(role.title);
        return (
          <Box
            key={i}
            sx={{
              backgroundColor: "#fff",
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
              p: 2.5,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 15,
                color: colors.title,
                mb: 1.5,
              }}
            >
              {role.title.startsWith("For ") ? role.title : `For ${role.title}`}
            </Typography>
            <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
              {role.items.map((item: string, j: number) => (
                <Typography
                  component="li"
                  key={j}
                  sx={{
                    fontSize: 13,
                    color: "#475569",
                    mb: 0.8,
                    lineHeight: 1.5,
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ActionChecklists;
