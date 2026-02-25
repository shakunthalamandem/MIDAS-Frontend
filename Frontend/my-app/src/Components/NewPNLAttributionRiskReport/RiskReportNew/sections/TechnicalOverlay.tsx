import React from "react";
import { Box, Typography } from "@mui/material";
import GenericDataRenderer from "./GenericDataRenderer";

interface Props {
  data: any;
}

const extractRows = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (val.rows && Array.isArray(val.rows)) return val.rows;
  if (val.items && Array.isArray(val.items)) return val.items;
  return [];
};

const extractColumns = (val: any, rows: any[]): string[] => {
  if (val && Array.isArray(val.columns) && val.columns.length > 0) return val.columns;
  if (rows.length > 0) return Object.keys(rows[0]);
  return [];
};

const sectionColors: Record<string, { title: string; border: string; headerBg: string; hoverBg: string }> = {
  overbought: { title: "#dc2626", border: "#fecaca", headerBg: "linear-gradient(135deg, #fef2f2, #fff1f2)", hoverBg: "#fef2f2" },
  oversold: { title: "#059669", border: "#a7f3d0", headerBg: "linear-gradient(135deg, #ecfdf5, #f0fdf4)", hoverBg: "#ecfdf5" },
  resistance: { title: "#d97706", border: "#fde68a", headerBg: "linear-gradient(135deg, #fffbeb, #fef3c7)", hoverBg: "#fffbeb" },
  support: { title: "#2563eb", border: "#93c5fd", headerBg: "linear-gradient(135deg, #eff6ff, #dbeafe)", hoverBg: "#eff6ff" },
};

const getSectionColor = (title: string) => {
  const lower = title.toLowerCase();
  for (const [key, val] of Object.entries(sectionColors)) {
    if (lower.includes(key)) return val;
  }
  return { title: "#1e293b", border: "#c7d2fe", headerBg: "linear-gradient(135deg, #f0f7ff, #e0e7ff)", hoverBg: "#f0f7ff" };
};

const renderTable = (title: string, items: any) => {
  const rows = extractRows(items);
  if (rows.length === 0) return null;
  const keys = extractColumns(items, rows);
  if (keys.length === 0) return null;
  const colors = getSectionColor(title);

  return (
    <Box sx={{ mb: 3 }} key={title}>
      <Typography sx={{ fontWeight: 700, fontSize: 15, color: colors.title, mb: 1.5 }}>{title}</Typography>
      <Box sx={{ border: `1px solid ${colors.border}`, borderRadius: 2.5, overflow: "hidden" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${keys.length}, 1fr)`,
          backgroundColor: "#f8fafc", borderBottom: `2px solid ${colors.border}` }}>
          {keys.map((k) => (
            <Typography key={k} sx={{ px: 2, py: 1.2, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#475569", textTransform: "uppercase" }}>
              {k.replace(/_/g, " ")}
            </Typography>
          ))}
        </Box>
        {rows.map((row: any, i: number) => (
          <Box key={i} sx={{ display: "grid", gridTemplateColumns: `repeat(${keys.length}, 1fr)`,
            borderBottom: i < rows.length - 1 ? "1px solid #e0e7ff" : "none", "&:hover": { backgroundColor: colors.hoverBg } }}>
            {keys.map((k) => {
              const val = row[k];
              const displayVal = val === null || val === undefined ? "—" : typeof val === "object" ? JSON.stringify(val) : String(val);
              const isTicker = k.toLowerCase() === "ticker" || k.toLowerCase() === "name" || k.toLowerCase() === "symbol";
              return (
                <Typography key={k} sx={{ px: 2, py: 1.5, fontSize: 13,
                  color: isTicker ? "#1e293b" : "#334155", fontWeight: isTicker ? 700 : 400,
                  fontFamily: ["rsi", "price", "value"].some((s) => k.includes(s)) ? "monospace" : "inherit" }}>
                  {displayVal}
                </Typography>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

/** Check if a value looks like it has tabular data (array or {rows, columns} wrapper) */
const hasTableData = (val: any): boolean => {
  if (Array.isArray(val) && val.length > 0) return true;
  if (val && typeof val === "object" && Array.isArray(val.rows) && val.rows.length > 0) return true;
  return false;
};

const TechnicalOverlay: React.FC<Props> = ({ data }) => {
  if (!data) return null;
  if (typeof data === "string") {
    return (
      <Box sx={{ backgroundColor: "#f0f7ff", borderRadius: 2.5, p: 2.5 }}>
        <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{data}</Typography>
      </Box>
    );
  }
  if (Array.isArray(data)) return renderTable("Technical Positions", data);

  const overbought = data.overbought;
  const oversold = data.oversold;
  const nearResistance = data.near_resistance;
  const nearSupport = data.near_support;
  const hasKnownKeys = hasTableData(overbought) || hasTableData(oversold) || hasTableData(nearResistance) || hasTableData(nearSupport);

  /* Also check for string fields like breakdown_risks / breakout_candidates */
  const knownDataKeys = ["overbought", "oversold", "near_resistance", "near_support", "badge", "overall", "section_number", "label", "key"];
  const hasExtraKeys = Object.keys(data).some((k) => !knownDataKeys.includes(k) && (typeof data[k] === "string" || hasTableData(data[k])));

  if (!hasKnownKeys && !hasExtraKeys) return <GenericDataRenderer data={data} accentColor="#06b6d4" />;

  return (
    <Box>
      {renderTable("Overbought (RSI > 70)", overbought)}
      {renderTable("Oversold (RSI < 30)", oversold)}
      {renderTable("Near Resistance", nearResistance)}
      {renderTable("Near Support", nearSupport)}
      {Object.entries(data).map(([key, val]) => {
        if (knownDataKeys.includes(key)) return null;
        /* Table data: array or {rows, columns} wrapper */
        if (hasTableData(val)) return renderTable(key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), val);
        /* String narratives */
        if (typeof val === "string") return (
          <Box key={key} sx={{ backgroundColor: "#f0f7ff", borderRadius: 2, p: 2, mb: 2 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.8, mb: 0.5 }}>{key.replace(/_/g, " ")}</Typography>
            <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{val}</Typography>
          </Box>
        );
        return null;
      })}
    </Box>
  );
};

export default TechnicalOverlay;
