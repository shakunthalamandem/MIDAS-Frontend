import React from "react";
import { Box, Typography } from "@mui/material";
import GenericDataRenderer from "./GenericDataRenderer";

interface Props {
  data: any;
}

const SKIP_KEYS = ["badge", "overall", "section_number", "label", "key"];
const formatHeader = (k: string) => k.replace(/_/g, " ").toUpperCase();

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

const OpportunityEngine: React.FC<Props> = ({ data }) => {
  if (!data) return null;
  if (typeof data === "string") {
    return (
      <Box sx={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 2.5, p: 2.5 }}>
        <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{data}</Typography>
      </Box>
    );
  }

  /* --- IPO / FO Pipeline --- */
  const ipoPipeline = data.ipo_fo_pipeline || data.ipo_pipeline || data.fo_pipeline;

  /* --- Capital freed if stops triggered --- */
  const capitalRaw = data.capital_freed_if_stops_triggered || data.capital_freed || null;
  const capitalNarrative =
    data.capital_freed_narrative ||
    data.capital_freed_text ||
    data.capital_freed_description ||
    data.capital_summary ||
    (capitalRaw && typeof capitalRaw === "object" ? capitalRaw.description : null) ||
    (typeof capitalRaw === "string" ? capitalRaw : null);
  const capitalTotalDollars = capitalRaw && typeof capitalRaw === "object" ? capitalRaw.total_freed_dollars : null;
  const capitalTotalPctAum = capitalRaw && typeof capitalRaw === "object" ? capitalRaw.total_freed_pct_aum : null;

  /* --- Highest risk-adjusted upside table --- */
  const upsideRaw = data.upside_table || data.highest_risk_adjusted_upside || data.upside || data.rows || null;
  const upsideTable: any[] = extractRows(upsideRaw);
  const upsideKeys = extractColumns(upsideRaw, upsideTable).filter((k) => !SKIP_KEYS.includes(k));

  /* --- Sector rotation ideas --- */
  const rotationIdeas = data.rotation_ideas || data.sector_rotation_ideas;

  const hasStructuredData = capitalNarrative || capitalTotalDollars || upsideTable.length > 0 || rotationIdeas || ipoPipeline;
  if (!hasStructuredData) return <GenericDataRenderer data={data} accentColor="#10b981" />;

  const formatDollars = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <Box>
      {/* IPO / FO Pipeline */}
      {ipoPipeline && (
        <Box sx={{ background: "linear-gradient(135deg, #f0f7ff, #eff6ff)", border: "1px solid #bfdbfe", borderRadius: 2.5, p: 2.5, mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1e293b", mb: 1 }}>IPO / FO Pipeline</Typography>
          <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {typeof ipoPipeline === "string" ? ipoPipeline : ipoPipeline.content || ipoPipeline.text || ipoPipeline.description || JSON.stringify(ipoPipeline)}
          </Typography>
        </Box>
      )}

      {/* Capital Freed if Stops Triggered */}
      {(capitalNarrative || capitalTotalDollars) && (
        <Box sx={{ background: "linear-gradient(135deg, #f0f7ff, #ecfdf5)", border: "1px solid #a7f3d0", borderRadius: 2.5, p: 2.5, mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#1e293b", mb: 1 }}>Capital Freed if Stops Triggered</Typography>
          {capitalNarrative && (
            <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, mb: capitalTotalDollars ? 1.5 : 0 }}>
              {typeof capitalNarrative === "string" ? capitalNarrative : capitalNarrative.content || capitalNarrative.text || capitalNarrative.description}
            </Typography>
          )}
          {(capitalTotalDollars !== null || capitalTotalPctAum !== null) && (
            <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
              {capitalTotalDollars !== null && (
                <Box sx={{ background: "#fff", border: "1px solid #a7f3d0", borderRadius: 2, px: 2, py: 1.2 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.8 }}>Total Freed</Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#059669", fontFamily: "monospace" }}>{formatDollars(capitalTotalDollars)}</Typography>
                </Box>
              )}
              {capitalTotalPctAum !== null && (
                <Box sx={{ background: "#fff", border: "1px solid #a7f3d0", borderRadius: 2, px: 2, py: 1.2 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.8 }}>% of AUM</Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#059669", fontFamily: "monospace" }}>{capitalTotalPctAum}%</Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Highest Risk-Adjusted Upside Table */}
      {upsideTable.length > 0 && upsideKeys.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1.5, color: "#1e293b" }}>Highest Risk-Adjusted Upside Positions</Typography>
          <Box sx={{ border: "1px solid #a7f3d0", borderRadius: 2.5, overflow: "hidden" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${upsideKeys.length}, 1fr)`,
                backgroundColor: "#f8fafc",
                borderBottom: "2px solid #a7f3d0",
              }}
            >
              {upsideKeys.map((k) => (
                <Typography key={k} sx={{ px: 2, py: 1.2, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#475569", textTransform: "uppercase" }}>
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
                  borderBottom: i < upsideTable.length - 1 ? "1px solid #e0e7ff" : "none",
                  "&:hover": { backgroundColor: "#ecfdf5" },
                }}
              >
                {upsideKeys.map((k, j) => {
                  const val = row[k];
                  const displayVal = val === null || val === undefined ? "—" : typeof val === "object" ? JSON.stringify(val) : String(val);
                  const isTicker = k.toLowerCase().includes("ticker") || k.toLowerCase().includes("name") || k.toLowerCase().includes("symbol");
                  const isMonospace = k.toLowerCase().includes("price") || k.toLowerCase().includes("target") || k.toLowerCase().includes("upside") || k.toLowerCase().includes("distance");
                  const isRiskReward = k.toLowerCase().includes("risk") && k.toLowerCase().includes("reward");
                  const isUnfavorable = displayVal.toLowerCase().includes("unfavorable") || displayVal.toLowerCase().includes("warning");
                  return (
                    <Typography
                      key={k}
                      sx={{
                        px: 2,
                        py: 1.5,
                        fontSize: 13,
                        fontWeight: isTicker ? 700 : j === 0 ? 600 : isRiskReward ? 500 : 400,
                        color: isTicker ? "#1e293b" : isUnfavorable ? "#ea580c" : displayVal.startsWith("+") ? "#059669" : "#334155",
                        fontFamily: isMonospace ? "monospace" : "inherit",
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

      {/* Sector Rotation Ideas */}
      {rotationIdeas && (
        <Box sx={{ background: "linear-gradient(135deg, #f0f7ff, #ecfdf5)", border: "1px solid #a7f3d0", borderRadius: 2.5, p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1, color: "#1e293b" }}>Sector Rotation Ideas</Typography>
          <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7 }}>
            {typeof rotationIdeas === "string" ? rotationIdeas : rotationIdeas.content || rotationIdeas.text || JSON.stringify(rotationIdeas)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OpportunityEngine;
