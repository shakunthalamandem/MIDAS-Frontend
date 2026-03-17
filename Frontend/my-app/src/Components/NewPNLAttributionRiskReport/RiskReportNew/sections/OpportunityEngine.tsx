import React from "react";
import { Box, Typography } from "@mui/material";
import GenericDataRenderer from "./GenericDataRenderer";

interface Props {
  data: any;
}

const SKIP_KEYS = ["badge", "overall", "section_number", "label", "key"];
const formatHeader = (k: string) =>
  k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

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

const OpportunityEngine: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const modernFont = `'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;

  if (typeof data === "string") {
    return (
      <Box
        sx={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: 3,
          p: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
            color: "#111827",
            lineHeight: 1.8,
            fontFamily: modernFont,
            fontWeight: 400,
          }}
        >
          {data}
        </Typography>
      </Box>
    );
  }

  const ipoPipeline =
    data.ipo_fo_pipeline || data.ipo_pipeline || data.fo_pipeline;

  const capitalRaw =
    data.capital_freed_if_stops_triggered || data.capital_freed || null;

  const capitalNarrative =
    data.capital_freed_narrative ||
    data.capital_freed_text ||
    data.capital_freed_description ||
    data.capital_summary ||
    (capitalRaw && typeof capitalRaw === "object"
      ? capitalRaw.description
      : null) ||
    (typeof capitalRaw === "string" ? capitalRaw : null);

  const capitalTotalDollars =
    capitalRaw && typeof capitalRaw === "object"
      ? capitalRaw.total_freed_dollars
      : null;

  const capitalTotalPctAum =
    capitalRaw && typeof capitalRaw === "object"
      ? capitalRaw.total_freed_pct_aum
      : null;

  const upsideRaw =
    data.upside_table ||
    data.highest_risk_adjusted_upside ||
    data.upside ||
    data.rows ||
    null;

  const upsideTable: any[] = extractRows(upsideRaw);
  const upsideKeys = extractColumns(upsideRaw, upsideTable).filter(
    (k) => !SKIP_KEYS.includes(k)
  );

  const rotationIdeas =
    data.rotation_ideas || data.sector_rotation_ideas;

  const hasStructuredData =
    capitalNarrative ||
    capitalTotalDollars ||
    upsideTable.length > 0 ||
    rotationIdeas ||
    ipoPipeline;

  if (!hasStructuredData)
    return <GenericDataRenderer data={data} accentColor="#10b981" />;

  const formatDollars = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  const SectionTitle = ({ children }: any) => (
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
      {children}
    </Typography>
  );

  return (
    <Box sx={{ fontFamily: modernFont }}>
      {/* IPO / FO Pipeline */}
      {ipoPipeline && (
        <Box
          sx={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 3,
            p: 3,
            mb: 3,
          }}
        >
          <SectionTitle>IPO / FO Pipeline</SectionTitle>
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.8,
              color: "#374151",
              fontWeight: 400,
            }}
          >
            {typeof ipoPipeline === "string"
              ? ipoPipeline
              : ipoPipeline.content ||
                ipoPipeline.text ||
                ipoPipeline.description ||
                JSON.stringify(ipoPipeline)}
          </Typography>
        </Box>
      )}

      {/* Capital Freed */}
      {(capitalNarrative || capitalTotalDollars) && (
        <Box
          sx={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 3,
            p: 3,
            mb: 3,
          }}
        >
          <SectionTitle>Capital Freed if Stops Triggered</SectionTitle>

          {capitalNarrative && (
            <Typography
              sx={{
                fontSize: 14,
                lineHeight: 1.8,
                color: "#374151",
                mb: 2,
              }}
            >
              {typeof capitalNarrative === "string"
                ? capitalNarrative
                : capitalNarrative.content ||
                  capitalNarrative.text ||
                  capitalNarrative.description}
            </Typography>
          )}

          {(capitalTotalDollars !== null ||
            capitalTotalPctAum !== null) && (
            <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
              {capitalTotalDollars !== null && (
                <Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#6b7280",
                      fontWeight: 500,
                    }}
                  >
                    Total Freed
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#059669",
                    }}
                  >
                    {formatDollars(capitalTotalDollars)}
                  </Typography>
                </Box>
              )}
              {capitalTotalPctAum !== null && (
                <Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#6b7280",
                      fontWeight: 500,
                    }}
                  >
                    % of AUM
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: "#059669",
                    }}
                  >
                    {capitalTotalPctAum}%
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Upside Table */}
      {upsideTable.length > 0 && upsideKeys.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <SectionTitle>
            Highest Risk-Adjusted Upside Positions
          </SectionTitle>

          <Box
            sx={{
              border: "1px solid #e5e7eb",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${upsideKeys.length}, 1fr)`,
                backgroundColor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {upsideKeys.map((k) => (
                <Typography
                  key={k}
                  sx={{
                    px: 2,
                    py: 1.5,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {formatHeader(k)}
                </Typography>
              ))}
            </Box>

            {upsideTable.map((row: any, i: number) => (
              <Box
                key={i}
                sx={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${upsideKeys.length}, 1fr)`,
                  borderBottom:
                    i < upsideTable.length - 1
                      ? "1px solid #f3f4f6"
                      : "none",
                  "&:hover": { backgroundColor: "#f9fafb" },
                }}
              >
                {upsideKeys.map((k) => {
                  const val = row[k];
                  const displayVal =
                    val === null || val === undefined
                      ? "—"
                      : typeof val === "object"
                      ? JSON.stringify(val)
                      : String(val);

                  return (
                    <Typography
                      key={k}
                      sx={{
                        px: 2,
                        py: 1.6,
                        fontSize: 14,
                        color: "#111827",
                        fontWeight: 500,
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
      )}

      {/* Rotation Ideas */}
      {rotationIdeas && (
        <Box
          sx={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 3,
            p: 3,
          }}
        >
          <SectionTitle>Sector Rotation Ideas</SectionTitle>
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.8,
              color: "#374151",
            }}
          >
            {typeof rotationIdeas === "string"
              ? rotationIdeas
              : rotationIdeas.content ||
                rotationIdeas.text ||
                JSON.stringify(rotationIdeas)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OpportunityEngine;