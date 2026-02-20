import React from "react";
import { Box, Typography, Chip } from "@mui/material";

/**
 * Generic fallback renderer for section data when expected keys don't match.
 * Renders arrays as tables, objects as card grids, strings as text.
 */

const SKIP_KEYS = ["badge", "overall", "section_number", "label", "key"];

const formatKey = (key: string): string =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const cellColor = (value: string): string => {
  if (!value) return "#1e293b";
  const v = value.toLowerCase();
  if (v.includes("immediate") || v.includes("critical") || v.includes("exit") || v.includes("fail"))
    return "#dc2626";
  if (v.includes("high") || v.includes("warning") || v.includes("reduce"))
    return "#ea580c";
  if (v.includes("pass") || v.includes("strong") || v.includes("add"))
    return "#059669";
  return "#1e293b";
};

const renderValue = (val: any): string => {
  if (val === null || val === undefined) return "—";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (Array.isArray(val)) return val.map((v) => (typeof v === "string" ? v : JSON.stringify(v))).join(", ");
  return JSON.stringify(val);
};

/** Renders an array of objects as a styled table */
const renderArrayTable = (items: any[], accentColor?: string) => {
  if (items.length === 0) return null;

  const keys = Object.keys(items[0]).filter((k) => !SKIP_KEYS.includes(k));
  if (keys.length === 0) return null;

  return (
    <Box
      sx={{
        border: "1px solid #c7d2fe",
        borderRadius: 2,
        overflow: "hidden",
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${keys.length}, 1fr)`,
          backgroundColor: accentColor ? `${accentColor}08` : "#f0f7ff",
          borderBottom: "2px solid",
          borderColor: accentColor || "#c7d2fe",
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
              color: accentColor || "#1e293b",
              textTransform: "uppercase",
            }}
          >
            {formatKey(k)}
          </Typography>
        ))}
      </Box>

      {items.map((row: any, i: number) => (
        <Box
          key={i}
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${keys.length}, 1fr)`,
            borderBottom: i < items.length - 1 ? "1px solid #e0e7ff" : "none",
            "&:hover": { backgroundColor: "#f0f7ff" },
          }}
        >
          {keys.map((k, j) => (
            <Typography
              key={k}
              sx={{
                px: 2,
                py: 1.5,
                fontSize: 13,
                color: j === 0 ? "#1e293b" : cellColor(renderValue(row[k])),
                fontWeight: j === 0 ? 600 : 400,
                fontFamily:
                  k.includes("price") || k.includes("value") || k.includes("amount")
                    ? "monospace"
                    : "inherit",
              }}
            >
              {renderValue(row[k])}
            </Typography>
          ))}
        </Box>
      ))}
    </Box>
  );
};

/** Renders an array of strings as a styled list */
const renderStringList = (items: string[]) => (
  <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
    {items.map((item, i) => (
      <Typography
        component="li"
        key={i}
        sx={{ fontSize: 13, color: "#1e293b", mb: 0.5, lineHeight: 1.6 }}
      >
        {item}
      </Typography>
    ))}
  </Box>
);

/** Renders a single text block */
const renderText = (text: string) => (
  <Box sx={{ backgroundColor: "#f0f7ff", borderRadius: 2, p: 2.5 }}>
    <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
      {text}
    </Typography>
  </Box>
);

/** Renders nested object as labeled card grid */
const renderObjectCards = (data: Record<string, any>) => {
  const entries = Object.entries(data).filter(([k]) => !SKIP_KEYS.includes(k));
  if (entries.length === 0) return null;

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
      {entries.map(([key, val]) => (
        <Box
          key={key}
          sx={{
            backgroundColor: "#fff",
            border: "1px solid #c7d2fe",
            borderRadius: 2,
            p: 2,
            "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              mb: 1,
            }}
          >
            {formatKey(key)}
          </Typography>
          {typeof val === "string" ? (
            <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>
              {val}
            </Typography>
          ) : Array.isArray(val) && val.length > 0 ? (
            typeof val[0] === "string" ? (
              renderStringList(val)
            ) : typeof val[0] === "object" ? (
              renderArrayTable(val)
            ) : (
              <Typography sx={{ fontSize: 13, color: "#1e293b" }}>
                {val.join(", ")}
              </Typography>
            )
          ) : typeof val === "object" && val !== null ? (
            <Box>
              {Object.entries(val).map(([subKey, subVal]) => (
                <Typography key={subKey} sx={{ fontSize: 12, color: "#1e293b", mb: 0.3 }}>
                  <Box component="span" sx={{ fontWeight: 600, color: "#1e293b" }}>
                    {formatKey(subKey)}:
                  </Box>{" "}
                  {renderValue(subVal)}
                </Typography>
              ))}
            </Box>
          ) : (
            <Typography sx={{ fontSize: 13, color: "#1e293b" }}>{renderValue(val)}</Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

interface GenericDataRendererProps {
  data: any;
  accentColor?: string;
}

const GenericDataRenderer: React.FC<GenericDataRendererProps> = ({ data, accentColor }) => {
  if (!data) return null;

  // String
  if (typeof data === "string") return renderText(data);

  // Array of objects → table
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
    return renderArrayTable(data, accentColor);
  }

  // Array of strings → bullet list
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "string") {
    return renderStringList(data);
  }

  // Object → try to find arrays to render as tables, rest as cards
  if (typeof data === "object") {
    const arrayEntries = Object.entries(data).filter(
      ([k, v]) => !SKIP_KEYS.includes(k) && Array.isArray(v) && v.length > 0
    );
    const stringEntries = Object.entries(data).filter(
      ([k, v]) => !SKIP_KEYS.includes(k) && typeof v === "string"
    );
    const objectEntries = Object.entries(data).filter(
      ([k, v]) =>
        !SKIP_KEYS.includes(k) &&
        typeof v === "object" &&
        v !== null &&
        !Array.isArray(v)
    );

    return (
      <Box>
        {/* Render string values as info cards */}
        {stringEntries.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, mb: arrayEntries.length > 0 ? 3 : 0 }}>
            {stringEntries.map(([key, val]) => (
              <Box
                key={key}
                sx={{
                  backgroundColor: "#fff",
                  border: "1px solid #c7d2fe",
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.8,
                    color: "#475569",
                    textTransform: "uppercase",
                    mb: 0.5,
                  }}
                >
                  {formatKey(key)}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>
                  {val as string}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Render array values as tables */}
        {arrayEntries.map(([key, val]) => (
          <Box key={key} sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1e293b", mb: 1.5 }}>
              {formatKey(key)}
            </Typography>
            {typeof (val as any[])[0] === "object" ? (
              renderArrayTable(val as any[], accentColor)
            ) : (
              renderStringList(val as string[])
            )}
          </Box>
        ))}

        {/* Render nested objects as cards */}
        {objectEntries.length > 0 && renderObjectCards(Object.fromEntries(objectEntries))}
      </Box>
    );
  }

  return null;
};

export default GenericDataRenderer;
export { renderArrayTable, renderStringList, renderText, renderObjectCards, formatKey, renderValue };
