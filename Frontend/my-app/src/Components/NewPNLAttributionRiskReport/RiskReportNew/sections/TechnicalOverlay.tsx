import React from "react";
import { Box, Typography } from "@mui/material";
import GenericDataRenderer, { renderArrayTable } from "./GenericDataRenderer";

interface Props {
  data: any;
}

const modernFont = `'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;

const formatColumnLabel = (column: string): string =>
  column
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const normalizeRowObject = (row: any, columns: string[]): Record<string, any> | null => {
  if (!row) return null;
  if (Array.isArray(row)) {
    return columns.reduce<Record<string, any>>((acc, col, idx) => {
      acc[col] = row[idx];
      return acc;
    }, {});
  }
  if (typeof row === "object") {
    return row;
  }
  return { value: row };
};

const getRowCellValue = (row: Record<string, any>, column: string): any => {
  if (column in row) return row[column];
  const normalizedColumn = column.replace(/_/g, "").toLowerCase();
  const matchingKey = Object.keys(row).find(
    (key) => key.replace(/_/g, "").toLowerCase() === normalizedColumn
  );
  if (matchingKey) return row[matchingKey];
  return row[column];
};

const formatStructuredValue = (value: any): string => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  return String(value);
};

const isTickerColumn = (column: string): boolean => {
  const normalized = column.replace(/_/g, "").toLowerCase();
  return ["ticker", "symbol", "name"].includes(normalized);
};

const isNumericColumn = (column: string): boolean => {
  const lower = column.toLowerCase();
  return (
    lower.includes("score") ||
    lower.includes("value") ||
    lower.includes("pct") ||
    lower.includes("return") ||
    lower.includes("impact")
  );
};

const renderStructuredTable = (
  title: string,
  columns: string[] = [],
  rows: any[] = [],
  accentColor: string = "#0ea5e9"
) => {
  if (!rows || rows.length === 0) return null;
  const headers = columns.length > 0 ? columns : Object.keys(rows[0] || {});
  if (headers.length === 0) return null;

  const normalizedRows = rows
    .map((row) => normalizeRowObject(row, headers))
    .filter((row): row is Record<string, any> => row !== null);
  if (normalizedRows.length === 0) return null;

  const borderColor = accentColor;
  const headerBg = `${accentColor}11`;
  const hoverBg = "#f0f9ff";

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 700,
          color: "#0f172a",
          mb: 2,
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          border: `1px solid ${borderColor}`,
          borderRadius: 3,
          overflow: "hidden",
          fontFamily: modernFont,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
            backgroundColor: headerBg,
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          {headers.map((col) => (
            <Typography
              key={col}
              sx={{
                px: 2.5,
                py: 1.6,
                fontSize: 12,
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {formatColumnLabel(col)}
            </Typography>
          ))}
        </Box>

        {normalizedRows.map((row, rowIndex) => (
          <Box
            key={`${title}-${rowIndex}`}
            sx={{
              display: "grid",
              gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
              borderBottom:
                rowIndex < normalizedRows.length - 1 ? "1px solid #e2e8f0" : "none",
              backgroundColor: rowIndex % 2 === 0 ? "#fff" : "#f8fafc",
              "&:hover": {
                backgroundColor: hoverBg,
              },
            }}
          >
            {headers.map((col, colIndex) => {
              const val = getRowCellValue(row, col);
              const displayVal = formatStructuredValue(val);
              const isTicker = isTickerColumn(col);
              const isNumeric = isNumericColumn(col);

              return (
                <Typography
                  key={`${title}-${rowIndex}-${col}`}
                  sx={{
                    px: 2.5,
                    py: 1.6,
                    fontSize: 14,
                    fontWeight: isTicker ? 600 : 400,
                    color: isTicker ? "#111827" : "#1e293b",
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

const renderMethodologyBlock = (methodology: any) => {
  if (!methodology) return null;
  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 700,
          color: "#0f172a",
          mb: 1.5,
          fontFamily: modernFont,
        }}
      >
        Technical Methodology
      </Typography>
      {methodology.description && (
        <Typography
          sx={{
            fontSize: 14,
            color: "#1e293b",
            mb: 0.4,
          }}
        >
          {methodology.description}
        </Typography>
      )}
      {methodology.scoring_scale && (
        <Typography sx={{ fontSize: 13, color: "#475569", mb: 1 }}>
          Scale: {methodology.scoring_scale}
        </Typography>
      )}
      {Array.isArray(methodology.factors) && methodology.factors.length > 0 && (
        <Box sx={{ mt: 3 }}>
          {renderArrayTable(methodology.factors, "#06b6d4")}
        </Box>
      )}
      {methodology.note && (
        <Typography sx={{ fontSize: 13, color: "#475569", mt: 2, fontStyle: "italic" }}>
          Note: {methodology.note}
        </Typography>
      )}
    </Box>
  );
};

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

  if (Array.isArray(data)) {
    return renderTable("Technical Positions", data);
  }

  const isModernTechnicalPayload =
    typeof data === "object" &&
    !Array.isArray(data) &&
    (data.stock_scores || data.methodology || data.portfolio_summary);

  if (isModernTechnicalPayload) {
    const stockScores = data.stock_scores || { columns: [], rows: [] };
    const portfolioSummary = data.portfolio_summary;

    return (
      <Box sx={{ fontFamily: modernFont }}>
        {renderMethodologyBlock(data.methodology)}
        {renderStructuredTable(
          "Technical Stock Scores",
          stockScores.columns || [],
          stockScores.rows || [],
          "#0891b2"
        )}
        {portfolioSummary && (
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: "#0f172a",
                mb: 1,
              }}
            >
              Portfolio Technical Summary
            </Typography>
            <GenericDataRenderer data={portfolioSummary} accentColor="#0891b2" />
          </Box>
        )}
      </Box>
    );
  }

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
