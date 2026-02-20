import React from "react";
import { Box, Typography } from "@mui/material";
import GenericDataRenderer from "./GenericDataRenderer";

interface Props {
  data: any;
}

const roleColors: Record<string, { border: string; title: string; bg: string; headerBg: string }> = {
  cio: { border: "#93c5fd", title: "#1e40af", bg: "#eff6ff", headerBg: "linear-gradient(135deg, #eff6ff, #dbeafe)" },
  traders: { border: "#f9a8d4", title: "#be185d", bg: "#fdf2f8", headerBg: "linear-gradient(135deg, #fdf2f8, #fce7f3)" },
  risk_team: { border: "#6ee7b7", title: "#065f46", bg: "#ecfdf5", headerBg: "linear-gradient(135deg, #ecfdf5, #d1fae5)" },
  risk: { border: "#6ee7b7", title: "#065f46", bg: "#ecfdf5", headerBg: "linear-gradient(135deg, #ecfdf5, #d1fae5)" },
  stock_pickers: { border: "#a5b4fc", title: "#3730a3", bg: "#eef2ff", headerBg: "linear-gradient(135deg, #eef2ff, #e0e7ff)" },
  pm: { border: "#fcd34d", title: "#92400e", bg: "#fffbeb", headerBg: "linear-gradient(135deg, #fffbeb, #fef3c7)" },
  analyst: { border: "#c4b5fd", title: "#5b21b6", bg: "#faf5ff", headerBg: "linear-gradient(135deg, #faf5ff, #ede9fe)" },
};

const getRoleColor = (key: string) => {
  const lower = key.toLowerCase().replace(/\s+/g, "_");
  for (const [k, v] of Object.entries(roleColors)) {
    if (lower.includes(k)) return v;
  }
  return { border: "#c7d2fe", title: "#1e293b", bg: "#f0f7ff", headerBg: "linear-gradient(135deg, #f0f7ff, #e0e7ff)" };
};

const ActionChecklists: React.FC<Props> = ({ data }) => {
  if (!data) return null;
  if (typeof data === "string") {
    return (<Box sx={{ backgroundColor: "#f0f7ff", borderRadius: 2.5, p: 2.5 }}>
      <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{data}</Typography>
    </Box>);
  }

  let roles: Array<{ title: string; items: string[] }> = [];
  if (Array.isArray(data)) {
    roles = data.map((r: any) => ({
      title: r.role || r.title || r.name || "",
      items: Array.isArray(r.items || r.actions || r.checklist || r.tasks)
        ? (r.items || r.actions || r.checklist || r.tasks).map((v: any) => typeof v === "string" ? v : v.text || v.action || v.description || JSON.stringify(v))
        : [],
    }));
  } else if (typeof data === "object") {
    roles = Object.entries(data)
      .filter(([key]) => !["badge", "overall", "section_number", "label", "key"].includes(key))
      .map(([key, val]: [string, any]) => ({
        title: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        items: Array.isArray(val)
          ? val.map((v: any) => typeof v === "string" ? v : v.text || v.action || v.description || JSON.stringify(v))
          : typeof val === "object" && val !== null
            ? (val.items || val.actions || val.checklist || val.tasks || []).map((v: any) => typeof v === "string" ? v : v.text || v.action || v.description || JSON.stringify(v))
            : typeof val === "string" ? [val] : [],
      }));
  }

  if (roles.length === 0 || roles.every((r) => r.items.length === 0)) {
    return <GenericDataRenderer data={data} accentColor="#10b981" />;
  }

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
      {roles.map((role, i) => {
        const colors = getRoleColor(role.title);
        return (
          <Box key={i} sx={{ backgroundColor: "#fff", border: `1px solid ${colors.border}`, borderRadius: 2.5, overflow: "hidden",
            transition: "all 0.2s", "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.06)" } }}>
            <Box sx={{ background: colors.headerBg, px: 2.5, py: 1.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: colors.title }}>
                {role.title.startsWith("For ") ? role.title : `For ${role.title}`}
              </Typography>
            </Box>
            <Box sx={{ p: 2.5 }}>
              <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
                {role.items.map((item: string, j: number) => (
                  <Typography component="li" key={j} sx={{ fontSize: 13, color: "#1e293b", mb: 0.8, lineHeight: 1.5 }}>{item}</Typography>
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
