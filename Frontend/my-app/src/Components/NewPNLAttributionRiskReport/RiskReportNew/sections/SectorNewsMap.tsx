import React from "react";
import { Box, Typography } from "@mui/material";
import GenericDataRenderer from "./GenericDataRenderer";

interface Props {
  data: any;
}

const sectorGradients = [
  { border: "#93c5fd", bg: "linear-gradient(135deg, #fff, #eff6ff)" },
  { border: "#86efac", bg: "linear-gradient(135deg, #fff, #f0fdf4)" },
  { border: "#c4b5fd", bg: "linear-gradient(135deg, #fff, #faf5ff)" },
  { border: "#fda4af", bg: "linear-gradient(135deg, #fff, #fff1f2)" },
  { border: "#fcd34d", bg: "linear-gradient(135deg, #fff, #fffbeb)" },
  { border: "#67e8f9", bg: "linear-gradient(135deg, #fff, #ecfeff)" },
];

const SKIP_META = ["badge", "overall", "section_number", "label", "key", "risk_clustering", "systemic_risk_flag", "portfolio_sentiment_skew"];
const NAME_KEYS = ["sector", "name", "title", "sector_name", "industry", "group"];
const STRONG_KEYS = ["strong", "strengths", "strong_positions", "strong_performers", "top", "winners", "outperformers", "top_performers", "top_holdings", "positive"];
const WEAK_KEYS = ["weak", "weaknesses", "weak_positions", "weak_performers", "bottom", "losers", "underperformers", "bottom_performers", "bottom_holdings", "negative", "laggards"];
const CATALYST_KEYS = ["catalysts", "threats", "risks", "news", "key_events", "events", "key_catalysts", "catalyst_news", "movers", "drivers"];

const findArrayByKeys = (obj: any, keys: string[]): any[] => {
  for (const k of keys) {
    if (Array.isArray(obj[k]) && obj[k].length > 0) return obj[k];
  }
  return [];
};

const findLabelByKeys = (obj: any, keys: string[]): string => {
  for (const k of keys) {
    if (obj[k] !== undefined) return k.replace(/_/g, " ").toUpperCase();
  }
  return "";
};

const renderItem = (item: any): string => {
  if (typeof item === "string") return item;
  if (typeof item === "number" || typeof item === "boolean") return String(item);
  if (item?.ticker) return item.ticker + (item.name ? ` (${item.name})` : "");
  return item?.name || item?.text || item?.description || item?.title || JSON.stringify(item);
};

/**
 * Parse a peer_relative_strength string like:
 *   "Strong: NKTR (+25.7%), IMGN (+15.2%)... Weak: AKTS (-28.5%), AGTC (-12.0%)..."
 * Returns { strong: string[], weak: string[] }
 */
const parsePeerRelativeStrength = (prs: string): { strong: string[]; weak: string[] } => {
  const result: { strong: string[]; weak: string[] } = { strong: [], weak: [] };
  if (!prs || typeof prs !== "string") return result;

  // Try to find "Strong:" and "Weak:" sections
  const strongMatch = prs.match(/Strong:\s*(.*?)(?=\s*Weak:|$)/i);
  const weakMatch = prs.match(/Weak:\s*(.*?)(?=\s*Strong:|$)/i);

  if (strongMatch && strongMatch[1]) {
    result.strong = strongMatch[1].split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  }
  if (weakMatch && weakMatch[1]) {
    result.weak = weakMatch[1].split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  }

  return result;
};

const SectorNewsMap: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  if (typeof data === "string") {
    return (
      <Box sx={{ backgroundColor: "#f0f7ff", borderRadius: 2.5, p: 2.5 }}>
        <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{data}</Typography>
      </Box>
    );
  }

  let sectors: any[] = Array.isArray(data) ? data : data.sectors || data.items || data.rows || data.sector_map || [];

  // If data is an object with no known array key, check if it's a map of sector-name -> details
  if (sectors.length === 0 && typeof data === "object" && !Array.isArray(data)) {
    const entries = Object.entries(data).filter(([k]) => !SKIP_META.includes(k));
    // If values are objects/arrays, treat keys as sector names
    const allValuesAreObjects = entries.length > 0 && entries.every(([, v]) => typeof v === "object" && v !== null);
    if (allValuesAreObjects) {
      sectors = entries.map(([k, v]: [string, any]) => ({
        sector: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        ...(Array.isArray(v) ? { items: v } : v),
      }));
    }
  }

  if (sectors.length === 0) {
    return <GenericDataRenderer data={data} accentColor="#3b82f6" />;
  }

  // Extract top-level narrative fields
  const riskClustering = data.risk_clustering;
  const systemicRiskFlag = data.systemic_risk_flag;
  const portfolioSentimentSkew = data.portfolio_sentiment_skew;

  return (
    <Box>
      {sectors.map((sector: any, i: number) => {
        const gradient = sectorGradients[i % sectorGradients.length];

        // Try to get strong/weak from explicit arrays first
        let strongItems = findArrayByKeys(sector, STRONG_KEYS);
        let weakItems = findArrayByKeys(sector, WEAK_KEYS);
        const catalystItems = findArrayByKeys(sector, CATALYST_KEYS);

        // If no strong/weak arrays found, try to parse peer_relative_strength string
        if (strongItems.length === 0 && weakItems.length === 0 && sector.peer_relative_strength) {
          const parsed = parsePeerRelativeStrength(sector.peer_relative_strength);
          strongItems = parsed.strong;
          weakItems = parsed.weak;
        }

        const strongLabel = findLabelByKeys(sector, STRONG_KEYS) || (strongItems.length > 0 ? "STRONG" : "");
        const weakLabel = findLabelByKeys(sector, WEAK_KEYS) || (weakItems.length > 0 ? "WEAK" : "");
        const catalystLabel = findLabelByKeys(sector, CATALYST_KEYS) || "CATALYSTS";
        const hasColumns = strongItems.length > 0 || weakItems.length > 0 || catalystItems.length > 0;

        // Determine sector name from known keys or first string value
        let sectorName = "";
        for (const k of NAME_KEYS) {
          if (sector[k]) { sectorName = sector[k]; break; }
        }

        // Build the subtitle with position_count and portfolio_weight_pct
        const positionCount = sector.position_count ?? sector.positions;
        const weightPct = sector.portfolio_weight_pct ?? sector.allocation;
        let subtitleParts: string[] = [];
        if (positionCount !== undefined) subtitleParts.push(`${positionCount} positions`);
        if (weightPct !== undefined) subtitleParts.push(`${weightPct}%`);
        const subtitle = subtitleParts.length > 0 ? subtitleParts.join(" \u2014 ") : "";

        // Collect remaining properties that aren't in the columns above
        const usedKeys = new Set([
          ...SKIP_META, ...NAME_KEYS,
          "allocation", "positions", "summary", "description", "overview",
          "position_count", "portfolio_weight_pct", "emerging_themes", "momentum_detail", "sector_momentum", "peer_relative_strength",
        ]);
        STRONG_KEYS.forEach((k) => { if (sector[k]) usedKeys.add(k); });
        WEAK_KEYS.forEach((k) => { if (sector[k]) usedKeys.add(k); });
        CATALYST_KEYS.forEach((k) => { if (sector[k]) usedKeys.add(k); });

        const extraProps = Object.entries(sector).filter(([k]) => !usedKeys.has(k));

        return (
          <Box key={i} sx={{
            background: gradient.bg, border: `1px solid ${gradient.border}40`, borderLeft: `4px solid ${gradient.border}`,
            borderRadius: 2, p: 2.5, mb: 2, transition: "all 0.2s", "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
          }}>
            {sectorName && (
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1e293b", mb: 0.5 }}>
                {sectorName}
                {subtitle && (
                  <Box component="span" sx={{ fontWeight: 400, fontSize: 13, color: "#334155", ml: 1 }}>
                    ({subtitle})
                  </Box>
                )}
              </Typography>
            )}
            {sector.sector_momentum && (
              <Box sx={{ display: "inline-block", mb: 1 }}>
                <Typography component="span" sx={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                  color: sector.sector_momentum.toLowerCase().includes("positive") ? "#059669"
                    : sector.sector_momentum.toLowerCase().includes("negative") ? "#dc2626" : "#d97706",
                  backgroundColor: sector.sector_momentum.toLowerCase().includes("positive") ? "#ecfdf5"
                    : sector.sector_momentum.toLowerCase().includes("negative") ? "#fef2f2" : "#fffbeb",
                  px: 1.5, py: 0.5, borderRadius: 1,
                }}>
                  {sector.sector_momentum}
                </Typography>
              </Box>
            )}
            {hasColumns ? (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mt: 1.5 }}>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#059669", textTransform: "uppercase", mb: 0.8 }}>{strongLabel || "STRONG"}</Typography>
                  {strongItems.map((item: any, j: number) => (
                    <Typography key={j} sx={{ fontSize: 13, color: "#059669", mb: 0.3, fontWeight: 500 }}>{renderItem(item)}</Typography>
                  ))}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#dc2626", textTransform: "uppercase", mb: 0.8 }}>{weakLabel || "WEAK"}</Typography>
                  {weakItems.map((item: any, j: number) => (
                    <Typography key={j} sx={{ fontSize: 13, color: "#dc2626", mb: 0.3, fontWeight: 500 }}>{renderItem(item)}</Typography>
                  ))}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#475569", textTransform: "uppercase", mb: 0.8 }}>{catalystLabel}</Typography>
                  {catalystItems.map((item: any, j: number) => (
                    <Typography key={j} sx={{ fontSize: 13, color: "#1e293b", mb: 0.3 }}>{renderItem(item)}</Typography>
                  ))}
                </Box>
              </Box>
            ) : sector.peer_relative_strength && typeof sector.peer_relative_strength === "string" ? (
              /* peer_relative_strength exists but couldn't be split into Strong/Weak - render as text */
              <Box sx={{ mt: 1 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#475569", textTransform: "uppercase", mb: 0.5 }}>
                  PEER RELATIVE STRENGTH
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>{sector.peer_relative_strength}</Typography>
              </Box>
            ) : (
              /* No strong/weak/catalysts columns matched -- render all properties dynamically */
              <Box sx={{ mt: 1 }}>
                {extraProps.map(([key, val]) => {
                  const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                  if (Array.isArray(val) && val.length > 0) {
                    return (
                      <Box key={key} sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#475569", textTransform: "uppercase", mb: 0.5 }}>{label}</Typography>
                        {typeof val[0] === "object" ? (
                          val.map((item: any, j: number) => (
                            <Typography key={j} sx={{ fontSize: 13, color: "#1e293b", mb: 0.3 }}>{renderItem(item)}</Typography>
                          ))
                        ) : (
                          val.map((item: any, j: number) => (
                            <Typography key={j} sx={{ fontSize: 13, color: "#1e293b", mb: 0.3 }}>{String(item)}</Typography>
                          ))
                        )}
                      </Box>
                    );
                  }
                  if (typeof val === "string" || typeof val === "number") {
                    return (
                      <Box key={key} sx={{ display: "flex", gap: 1, mb: 0.5 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{label}:</Typography>
                        <Typography sx={{ fontSize: 13, color: "#1e293b" }}>{String(val)}</Typography>
                      </Box>
                    );
                  }
                  if (typeof val === "object" && val !== null) {
                    return (
                      <Box key={key} sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#475569", textTransform: "uppercase", mb: 0.5 }}>{label}</Typography>
                        {Object.entries(val).map(([subK, subV]) => (
                          <Typography key={subK} sx={{ fontSize: 13, color: "#1e293b", mb: 0.3 }}>
                            <Box component="span" sx={{ fontWeight: 600, color: "#1e293b" }}>{subK.replace(/_/g, " ")}:</Box>{" "}
                            {typeof subV === "string" ? subV : JSON.stringify(subV)}
                          </Typography>
                        ))}
                      </Box>
                    );
                  }
                  return null;
                })}
              </Box>
            )}
            {/* Emerging themes */}
            {sector.emerging_themes && (
              <Box sx={{ mt: 1.5, pt: 1, borderTop: "1px dashed #c7d2fe40" }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#475569", textTransform: "uppercase", mb: 0.5 }}>
                  EMERGING THEMES
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{sector.emerging_themes}</Typography>
              </Box>
            )}
            {/* Momentum detail */}
            {sector.momentum_detail && (
              <Box sx={{ mt: 1, pt: 1, borderTop: "1px dashed #c7d2fe40" }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#475569", textTransform: "uppercase", mb: 0.5 }}>
                  MOMENTUM DETAIL
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{sector.momentum_detail}</Typography>
              </Box>
            )}
            {(sector.summary || sector.description || sector.overview) && (
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid #c7d2fe" }}>
                <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>{sector.summary || sector.description || sector.overview}</Typography>
              </Box>
            )}
          </Box>
        );
      })}
      {/* Top-level narrative fields */}
      {(riskClustering || systemicRiskFlag || portfolioSentimentSkew) && (
        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          {riskClustering && (
            <Box sx={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 2, p: 2 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#dc2626", textTransform: "uppercase", mb: 0.5 }}>
                RISK CLUSTERING
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{riskClustering}</Typography>
            </Box>
          )}
          {systemicRiskFlag && (
            <Box sx={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: 2, p: 2 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#d97706", textTransform: "uppercase", mb: 0.5 }}>
                SYSTEMIC RISK FLAG
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{systemicRiskFlag}</Typography>
            </Box>
          )}
          {portfolioSentimentSkew && (
            <Box sx={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 2, p: 2 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#059669", textTransform: "uppercase", mb: 0.5 }}>
                PORTFOLIO SENTIMENT SKEW
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{portfolioSentimentSkew}</Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SectorNewsMap;
