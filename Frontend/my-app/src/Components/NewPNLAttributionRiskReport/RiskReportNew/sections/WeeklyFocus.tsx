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

const SKIP_KEYS = ["badge", "overall", "section_number", "label", "key"];

const formatHeader = (k: string) =>
  k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const renderDynamicTable = (
  items: any[],
  accentColor: string,
  hoverBg: string
) => {
  if (items.length === 0) return null;

  const keys = Object.keys(items[0]).filter(
    (k) => !SKIP_KEYS.includes(k)
  );
  if (keys.length === 0) return null;

  return (
    <Box
      sx={{
        border: "1px solid #e5e7eb",
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
          backgroundColor: "#f9fafb",
          borderBottom: `1px solid ${accentColor}`,
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
            {formatHeader(k)}
          </Typography>
        ))}
      </Box>

      {/* Rows */}
      {items.map((row: any, i: number) => (
        <Box
          key={i}
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${keys.length}, 1fr)`,
            borderBottom:
              i < items.length - 1 ? "1px solid #f1f5f9" : "none",
            alignItems: "center",
            transition: "background 0.2s ease",
            "&:hover": { backgroundColor: hoverBg },
          }}
        >
          {keys.map((k, j) => {
            const val = row[k];
            const displayVal =
              val === null || val === undefined
                ? "—"
                : typeof val === "object"
                ? JSON.stringify(val)
                : String(val);

            const isExit = displayVal.toLowerCase().includes("exit");

            return (
              <Typography
                key={k}
                sx={{
                  px: 2.5,
                  py: 1.8,
                  fontSize: 14,
                  fontWeight: j === 0 || isExit ? 600 : 400,
                  color: isExit ? "#dc2626" : "#111827",
                  fontFamily:
                    k.toLowerCase().includes("exposure") ||
                    k.toLowerCase().includes("capital") ||
                    k.toLowerCase().includes("price")
                      ? "monospace"
                      : modernFont,
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

const WeeklyFocus: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  if (typeof data === "string") {
    return (
      <Box
        sx={{
          backgroundColor: "#fefaf5",
          border: "1px solid #fde68a",
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

  const monitoring =
    data.immediate_monitoring || data.monitoring || data.alert;

  const earningsWatch: any[] = extractRows(
    data.earnings_watch || data.earnings || data.watch
  );

  const macroWatch =
    data.macro_watch || data.macro_monitoring || data.macro;

  const actionPlan: any[] = extractRows(
    data.action_plan ||
      data.weekly_action_plan ||
      data.actions ||
      data.rows
  );

  const hasStructuredData =
    monitoring ||
    earningsWatch.length > 0 ||
    actionPlan.length > 0 ||
    macroWatch;

  if (!hasStructuredData)
    return <GenericDataRenderer data={data} accentColor="#f97316" />;

  return (
    <Box sx={{ fontFamily: modernFont }}>
      {/* Immediate Monitoring */}
      {monitoring && (
        <Box
          sx={{
            backgroundColor: "#fff7ed",
            border: "1px solid #fdba74",
            borderRadius: 3,
            p: 3,
            mb: 4,
          }}
        >
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 600,
              color: "#ea580c",
              mb: 2,
              letterSpacing: 0.2,
            }}
          >
            Immediate Monitoring Items
          </Typography>

          <Typography
            sx={{
              fontSize: 14,
              color: "#111827",
              lineHeight: 1.8,
            }}
          >
            {typeof monitoring === "string"
              ? monitoring
              : monitoring.content ||
                monitoring.text ||
                monitoring.description}
          </Typography>
        </Box>
      )}

      {/* Earnings Watch */}
      {earningsWatch.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 600,
              mb: 2,
              color: "#111827",
              letterSpacing: 0.2,
            }}
          >
            Earnings Watch (This Week & Next)
          </Typography>

          {renderDynamicTable(
            earningsWatch,
            "#f97316",
            "#fff7ed"
          )}
        </Box>
      )}

      {/* Macro Watch */}
      {macroWatch && (
        <Box
          sx={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 3,
            p: 3,
            mb: 4,
          }}
        >
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 600,
              color: "#111827",
              mb: 2,
            }}
          >
            Macro Watch
          </Typography>

          <Typography
            sx={{
              fontSize: 14,
              color: "#111827",
              lineHeight: 1.8,
            }}
          >
            {typeof macroWatch === "string"
              ? macroWatch
              : macroWatch.content ||
                macroWatch.text ||
                macroWatch.description}
          </Typography>
        </Box>
      )}

      {/* Weekly Action Plan */}
      {actionPlan.length > 0 && (
        <Box>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 600,
              mb: 2,
              color: "#111827",
            }}
          >
            Weekly Action Plan
          </Typography>

          {renderDynamicTable(
            actionPlan,
            "#f97316",
            "#fff7ed"
          )}
        </Box>
      )}
    </Box>
  );
};

export default WeeklyFocus;