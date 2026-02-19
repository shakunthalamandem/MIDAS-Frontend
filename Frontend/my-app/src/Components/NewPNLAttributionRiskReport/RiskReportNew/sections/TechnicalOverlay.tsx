import React from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  data: any;
}

const normalizeRows = (items: any): any[] => {
  if (Array.isArray(items)) return items;
  if (items && typeof items === "object") {
    if (Array.isArray(items.items)) return items.items;
    if (Array.isArray(items.data)) return items.data;
    if (Array.isArray(items.rows)) return items.rows;
  }
  return [];
};

const renderTable = (title: string, items: any, color: string) => {
  const rows = normalizeRows(items);
  if (rows.length === 0) return null;

  const keys = Object.keys(rows[0] || {});
  if (keys.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 15, color, mb: 1.5 }}>
        {title}
      </Typography>
      <Box
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Header */}
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

        {/* Rows */}
        {rows.map((row: any, i: number) => (
          <Box
            key={i}
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${keys.length}, 1fr)`,
              borderBottom: i < rows.length - 1 ? "1px solid #f1f5f9" : "none",
              "&:hover": { backgroundColor: "#fafbfc" },
            }}
          >
            {keys.map((k) => (
              <Typography
                key={k}
                sx={{
                  px: 2,
                  py: 1.5,
                  fontSize: 13,
                  color: k === "ticker" ? "#1e293b" : "#475569",
                  fontWeight: k === "ticker" ? 700 : 400,
                  fontFamily: k === "rsi" || k === "price" ? "monospace" : "inherit",
                }}
              >
                {row[k]}
              </Typography>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const TechnicalOverlay: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const overbought: any[] = data.overbought || [];
  const oversold: any[] = data.oversold || [];
  const nearResistance: any[] = data.near_resistance || [];
  const nearSupport: any[] = data.near_support || [];

  // If data is an array, render as generic table
  if (Array.isArray(data)) {
    return renderTable("Technical Positions", data, "#1e293b");
  }

  return (
    <Box>
      {renderTable("Overbought (RSI > 70)", overbought, "#dc2626")}
      {renderTable("Oversold (RSI < 30)", oversold, "#059669")}
      {renderTable("Near Resistance", nearResistance, "#d97706")}
      {renderTable("Near Support", nearSupport, "#2563eb")}

      {/* Fallback for other keys */}
      {Object.entries(data).map(([key, val]) => {
        if (
          ["overbought", "oversold", "near_resistance", "near_support", "badge", "overall"].includes(key)
        )
          return null;
        if (Array.isArray(val) && val.length > 0) {
          return renderTable(
            key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            val,
            "#475569"
          );
        }
        if (typeof val === "string") {
          return (
            <Box
              key={key}
              sx={{
                backgroundColor: "#f8fafc",
                borderRadius: 2,
                p: 2,
                mb: 2,
              }}
            >
              <Typography sx={{ fontSize: 13, color: "#475569" }}>
                {val}
              </Typography>
            </Box>
          );
        }
        return null;
      })}
    </Box>
  );
};

export default TechnicalOverlay;
