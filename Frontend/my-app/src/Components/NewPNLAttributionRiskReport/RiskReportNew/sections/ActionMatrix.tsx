import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import GenericDataRenderer from "./GenericDataRenderer";

interface Props {
  data: any;
}

const SKIP_KEYS = ["badge", "overall", "section_number", "label", "key", "urgency_emoji"];

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

const priorityColor = (priority: number | string): string => {
  const p = typeof priority === "string" ? parseInt(priority, 10) : priority;
  if (p <= 1) return "#dc2626";
  if (p <= 2) return "#ef4444";
  if (p <= 3) return "#f97316";
  if (p <= 4) return "#eab308";
  return "#10b981";
};

const sensitivityColor = (val: string): string => {
  const v = (val || "").toLowerCase();
  if (v.includes("immediate") || v.includes("critical") || v.includes("exit") || v.includes("fail")) return "#dc2626";
  if (v.includes("high") || v.includes("24 hour") || v.includes("warning") || v.includes("breach")) return "#ea580c";
  if (v.includes("week") || v.includes("medium")) return "#d97706";
  return "#1e293b";
};

const formatHeader = (k: string) => k.replace(/_/g, " ").toUpperCase();

/** Enforce column order: Priority → Ticker → Action → Capital Impact → Severity → Time → Urgency → rest */
const PREFERRED_ORDER: { keywords: string[]; index: number }[] = [
  { keywords: ["priority"], index: 0 },
  { keywords: ["ticker", "symbol", "stock", "name"], index: 1 },
  { keywords: ["action", "recommended_action"], index: 2 },
  { keywords: ["capital_impact", "capital", "impact"], index: 3 },
  { keywords: ["severity", "severity_score", "score"], index: 4 },
  { keywords: ["time", "time_sensitivity", "timeline"], index: 5 },
  { keywords: ["urgency", "urgency_level"], index: 6 },
];

const getColumnOrder = (key: string): number => {
  const lower = key.toLowerCase();
  for (const entry of PREFERRED_ORDER) {
    if (entry.keywords.some((kw) => lower === kw || lower.includes(kw))) return entry.index;
  }
  return 100; // unknown columns go to the end
};

const sortColumns = (keys: string[]): string[] => {
  return [...keys].sort((a, b) => getColumnOrder(a) - getColumnOrder(b));
};

const ActionMatrix: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  if (typeof data === "string") {
    return (
      <Box sx={{ backgroundColor: "#f0f7ff", borderRadius: 2, p: 2.5 }}>
        <Typography sx={{ fontSize: 13, color: "#1e293b", whiteSpace: "pre-wrap" }}>{data}</Typography>
      </Box>
    );
  }

  const rawSource = data.rows || data.items || data.actions || data.matrix || data;
  const items: any[] = Array.isArray(data) ? data : extractRows(rawSource);

  if (items.length === 0) {
    return <GenericDataRenderer data={data} accentColor="#7c3aed" />;
  }

  // Get columns, filter skipped keys, then enforce preferred order
  const dynamicKeys = sortColumns(extractColumns(rawSource, items).filter((k) => !SKIP_KEYS.includes(k)));

  if (dynamicKeys.length === 0) {
    return <GenericDataRenderer data={items} accentColor="#7c3aed" />;
  }

  const priorityKey = dynamicKeys.find((k) => k.toLowerCase() === "priority");
  const tickerKey = dynamicKeys.find((k) => ["ticker", "name", "stock", "symbol"].includes(k.toLowerCase()));
  const urgencyKey = dynamicKeys.find((k) => ["urgency", "time_sensitivity", "time", "window", "timeline"].includes(k.toLowerCase()));
  const severityKey = dynamicKeys.find((k) => ["severity", "severity_score", "score", "risk_level"].includes(k.toLowerCase()));

  return (
    <Box sx={{ border: "1px solid #c7d2fe", borderRadius: 2.5, overflow: "hidden" }}>
      {/* Table Header */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${dynamicKeys.length}, 1fr)`,
          background: "linear-gradient(135deg, #1e293b, #334155)",
          borderBottom: "2px solid #a855f7",
        }}
      >
        {dynamicKeys.map((k) => (
          <Typography
            key={k}
            sx={{
              px: 2,
              py: 1.2,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.8,
              color: "#fff",
              textTransform: "uppercase",
            }}
          >
            {formatHeader(k)}
          </Typography>
        ))}
      </Box>

      {/* Table Rows */}
      {items.map((row: any, i: number) => (
        <Box
          key={i}
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${dynamicKeys.length}, 1fr)`,
            borderBottom: i < items.length - 1 ? "1px solid #e0e7ff" : "none",
            alignItems: "center",
            "&:hover": { backgroundColor: "#f0f7ff" },
          }}
        >
          {dynamicKeys.map((k) => {
            const val = row[k];
            const displayVal = val === null || val === undefined ? "—" : typeof val === "object" ? JSON.stringify(val) : String(val);
            const isPriority = k === priorityKey;
            const isTicker = k === tickerKey;
            const isUrgency = k === urgencyKey;
            const isSeverity = k === severityKey;

            if (isPriority) {
              return (
                <Box key={k} sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: priorityColor(val),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{val}</Typography>
                  </Box>
                </Box>
              );
            }

            if (isTicker) {
              return (
                <Typography key={k} sx={{ px: 2, py: 1.5, fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                  {displayVal}
                </Typography>
              );
            }

            if (isUrgency) {
              return (
                <Box key={k} sx={{ px: 2, py: 1.5 }}>
                  {row.urgency_emoji && (
                    <Box component="span" sx={{ mr: 0.5 }}>{row.urgency_emoji}</Box>
                  )}
                  <Typography component="span" sx={{ fontSize: 13, fontWeight: 600, color: sensitivityColor(displayVal) }}>
                    {displayVal}
                  </Typography>
                </Box>
              );
            }

            if (isSeverity) {
              return (
                <Typography key={k} sx={{ px: 2, py: 1.5, fontSize: 13, fontWeight: 600, color: "#1e293b", textAlign: "center" }}>
                  {displayVal}
                </Typography>
              );
            }

            return (
              <Typography
                key={k}
                sx={{
                  px: 2,
                  py: 1.5,
                  fontSize: 13,
                  color: sensitivityColor(displayVal) !== "#1e293b" ? sensitivityColor(displayVal) : "#1e293b",
                  fontWeight: displayVal.toLowerCase().includes("exit") ? 600 : 400,
                  fontFamily: k.toLowerCase().includes("capital") || k.toLowerCase().includes("impact") ? "monospace" : "inherit",
                }}
              >
                {displayVal}
              </Typography>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

export default ActionMatrix;
