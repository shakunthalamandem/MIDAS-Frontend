import React from "react";
import { Box, Typography } from "@mui/material";
import GenericDataRenderer from "./GenericDataRenderer";

interface Props {
  data: any;
}

const modernFont = `'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;

const extractRows = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (val.rows && Array.isArray(val.rows)) return val.rows;
  if (val.items && Array.isArray(val.items)) return val.items;
  return [];
};

const extractColumns = (val: any, rows: any[]): string[] => {
  if (val && Array.isArray(val.columns) && val.columns.length > 0)
    return val.columns;
  if (rows.length > 0) return Object.keys(rows[0]);
  return [];
};

const sectionColors: Record<
  string,
  { border: string; headerBg: string; hoverBg: string }
> = {
  overbought: {
    border: "#fecaca",
    headerBg: "#fef2f2",
    hoverBg: "#fff5f5",
  },
  oversold: {
    border: "#bbf7d0",
    headerBg: "#ecfdf5",
    hoverBg: "#f0fdf4",
  },
  resistance: {
    border: "#fde68a",
    headerBg: "#fffbeb",
    hoverBg: "#fefce8",
  },
  support: {
    border: "#bfdbfe",
    headerBg: "#eff6ff",
    hoverBg: "#f8fbff",
  },
};

const getSectionColor = (title: string) => {
  const lower = title.toLowerCase();
  for (const [key, val] of Object.entries(sectionColors)) {
    if (lower.includes(key)) return val;
  }
  return {
    border: "#e5e7eb",
    headerBg: "#f9fafb",
    hoverBg: "#f3f4f6",
  };
};

const renderTable = (title: string, items: any) => {
  const rows = extractRows(items);
  if (rows.length === 0) return null;

  const keys = extractColumns(items, rows);
  if (keys.length === 0) return null;

  const colors = getSectionColor(title);

  return (
    <Box sx={{ mb: 4 }} key={title}>
      {/* Section Title - Modern */}
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 600,
          color: "#111827",
          mb: 2,
          fontFamily: modernFont,
          letterSpacing: 0.2,
        }}
      >
        {title}
      </Typography>

      <Box
        sx={{
          border: `1px solid ${colors.border}`,
          borderRadius: 3,
          overflow: "hidden",
          fontFamily: modernFont,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${keys.length}, 1fr)`,
            backgroundColor: colors.headerBg,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          {keys.map((k) => (
            <Typography
              key={k}
              sx={{
                px: 2.5,
                py: 1.8,
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {k.replace(/_/g, " ")}
            </Typography>
          ))}
        </Box>

        {/* Rows */}
        {rows.map((row: any, i: number) => (
          <Box
            key={i}
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${keys.length}, 1fr)`,
              borderBottom:
                i < rows.length - 1 ? "1px solid #f1f5f9" : "none",
              transition: "background 0.2s ease",
              "&:hover": {
                backgroundColor: colors.hoverBg,
              },
            }}
          >
            {keys.map((k) => {
              const val = row[k];
              const displayVal =
                val === null || val === undefined
                  ? "—"
                  : typeof val === "object"
                  ? JSON.stringify(val)
                  : String(val);

              const isTicker =
                k.toLowerCase() === "ticker" ||
                k.toLowerCase() === "name" ||
                k.toLowerCase() === "symbol";

              const isNumeric = ["rsi", "price", "value"].some((s) =>
                k.toLowerCase().includes(s)
              );

              return (
                <Typography
                  key={k}
                  sx={{
                    px: 2.5,
                    py: 1.8,
                    fontSize: 14,
                    color: "#111827",
                    fontWeight: isTicker ? 600 : 400,
                    fontFamily: isNumeric ? "monospace" : modernFont,
                  }}
                >
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

const hasTableData = (val: any): boolean => {
  if (Array.isArray(val) && val.length > 0) return true;
  if (
    val &&
    typeof val === "object" &&
    Array.isArray(val.rows) &&
    val.rows.length > 0
  )
    return true;
  return false;
};

const TechnicalOverlay: React.FC<Props> = ({ data }) => {
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

  if (Array.isArray(data))
    return renderTable("Technical Positions", data);

  const overbought = data.overbought;
  const oversold = data.oversold;
  const nearResistance = data.near_resistance;
  const nearSupport = data.near_support;

  const hasKnownKeys =
    hasTableData(overbought) ||
    hasTableData(oversold) ||
    hasTableData(nearResistance) ||
    hasTableData(nearSupport);

  const knownDataKeys = [
    "overbought",
    "oversold",
    "near_resistance",
    "near_support",
    "badge",
    "overall",
    "section_number",
    "label",
    "key",
  ];

  const hasExtraKeys = Object.keys(data).some(
    (k) =>
      !knownDataKeys.includes(k) &&
      (typeof data[k] === "string" || hasTableData(data[k]))
  );

  if (!hasKnownKeys && !hasExtraKeys)
    return <GenericDataRenderer data={data} accentColor="#06b6d4" />;

  return (
    <Box sx={{ fontFamily: modernFont }}>
      {renderTable("Overbought (RSI > 70)", overbought)}
      {renderTable("Oversold (RSI < 30)", oversold)}
      {renderTable("Near Resistance", nearResistance)}
      {renderTable("Near Support", nearSupport)}

      {Object.entries(data).map(([key, val]) => {
        if (knownDataKeys.includes(key)) return null;

        if (hasTableData(val))
          return renderTable(
            key
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            val
          );

        if (typeof val === "string")
          return (
            <Box
              key={key}
              sx={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 3,
                p: 3,
                mb: 3,
                fontFamily: modernFont,
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  mb: 1,
                }}
              >
                {key.replace(/_/g, " ")}
              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  color: "#111827",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                }}
              >
                {val}
              </Typography>
            </Box>
          );

        return null;
      })}
    </Box>
  );
};

export default TechnicalOverlay;