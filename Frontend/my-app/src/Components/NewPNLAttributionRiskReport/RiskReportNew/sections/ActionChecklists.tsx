import React from "react";
import { Box, Typography } from "@mui/material";
import GenericDataRenderer from "./GenericDataRenderer";

interface Props {
  data: any;
}

const modernFont = `'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;

const roleColors: Record<
  string,
  { border: string; title: string; bg: string; headerBg: string }
> = {
  cio: {
    border: "#bfdbfe",
    title: "#1e3a8a",
    bg: "#eff6ff",
    headerBg: "#eff6ff",
  },
  traders: {
    border: "#fbcfe8",
    title: "#9d174d",
    bg: "#fdf2f8",
    headerBg: "#fdf2f8",
  },
  risk_team: {
    border: "#bbf7d0",
    title: "#065f46",
    bg: "#ecfdf5",
    headerBg: "#ecfdf5",
  },
  risk: {
    border: "#bbf7d0",
    title: "#065f46",
    bg: "#ecfdf5",
    headerBg: "#ecfdf5",
  },
  stock_pickers: {
    border: "#c7d2fe",
    title: "#3730a3",
    bg: "#eef2ff",
    headerBg: "#eef2ff",
  },
  pm: {
    border: "#fde68a",
    title: "#92400e",
    bg: "#fffbeb",
    headerBg: "#fffbeb",
  },
  analyst: {
    border: "#ddd6fe",
    title: "#5b21b6",
    bg: "#faf5ff",
    headerBg: "#faf5ff",
  },
};

const getRoleColor = (key: string) => {
  const lower = key.toLowerCase().replace(/\s+/g, "_");
  for (const [k, v] of Object.entries(roleColors)) {
    if (lower.includes(k)) return v;
  }
  return {
    border: "#e5e7eb",
    title: "#111827",
    bg: "#f9fafb",
    headerBg: "#f9fafb",
  };
};

const ActionChecklists: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  if (typeof data === "string") {
    return (
      <Box
        sx={{
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: 3,
          p: 3,
          fontFamily: modernFont,
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            color: "#111827",
            lineHeight: 1.8,
            whiteSpace: "pre-wrap",
          }}
        >
          {data}
        </Typography>
      </Box>
    );
  }

  let roles: Array<{ title: string; items: string[] }> = [];

  if (Array.isArray(data)) {
    roles = data.map((r: any) => ({
      title: r.role || r.title || r.name || "",
      items: Array.isArray(
        r.items || r.actions || r.checklist || r.tasks
      )
        ? (r.items || r.actions || r.checklist || r.tasks).map(
            (v: any) =>
              typeof v === "string"
                ? v
                : v.text || v.action || v.description || JSON.stringify(v)
          )
        : [],
    }));
  } else if (typeof data === "object") {
    roles = Object.entries(data)
      .filter(
        ([key]) =>
          ![
            "badge",
            "overall",
            "section_number",
            "label",
            "key",
          ].includes(key)
      )
      .map(([key, val]: [string, any]) => ({
        title: key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        items: Array.isArray(val)
          ? val.map((v: any) =>
              typeof v === "string"
                ? v
                : v.text ||
                  v.action ||
                  v.description ||
                  JSON.stringify(v)
            )
          : typeof val === "object" && val !== null
          ? (
              val.items ||
              val.actions ||
              val.checklist ||
              val.tasks ||
              []
            ).map((v: any) =>
              typeof v === "string"
                ? v
                : v.text ||
                  v.action ||
                  v.description ||
                  JSON.stringify(v)
            )
          : typeof val === "string"
          ? [val]
          : [],
      }));
  }

  if (
    roles.length === 0 ||
    roles.every((r) => r.items.length === 0)
  ) {
    return (
      <GenericDataRenderer data={data} accentColor="#10b981" />
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 3,
        fontFamily: modernFont,
      }}
    >
      {roles.map((role, i) => {
        const colors = getRoleColor(role.title);

        return (
          <Box
            key={i}
            sx={{
              backgroundColor: "#ffffff",
              border: `1px solid ${colors.border}`,
              borderRadius: 3,
              overflow: "hidden",
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
              },
            }}
          >
            {/* Header */}
            <Box
              sx={{
                backgroundColor: colors.headerBg,
                px: 3,
                py: 2,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: colors.title,
                  letterSpacing: 0.2,
                }}
              >
                {role.title.startsWith("For ")
                  ? role.title
                  : `For ${role.title}`}
              </Typography>
            </Box>

            {/* Checklist */}
            <Box sx={{ p: 3 }}>
              <Box
                component="ol"
                sx={{
                  m: 0,
                  pl: 2.5,
                }}
              >
                {role.items.map((item: string, j: number) => (
                  <Typography
                    component="li"
                    key={j}
                    sx={{
                      fontSize: 14,
                      color: "#111827",
                      mb: 1.2,
                      lineHeight: 1.7,
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ActionChecklists;