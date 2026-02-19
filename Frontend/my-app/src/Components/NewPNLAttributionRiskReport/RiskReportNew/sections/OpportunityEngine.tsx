import React from "react";
import { Box, Typography } from "@mui/material";

interface Props {
  data: any;
}

const OpportunityEngine: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const capitalCards: any[] = data.capital_cards || data.capital_freed || [];
  const upsideTable: any[] = data.upside_table || data.highest_risk_adjusted_upside || [];
  const rotationIdeas = data.rotation_ideas || data.sector_rotation_ideas;

  return (
    <Box>
      {/* Capital Cards */}
      {capitalCards.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(capitalCards.length, 3)}, 1fr)`,
            gap: 2,
            mb: 3,
          }}
        >
          {capitalCards.map((card: any, i: number) => {
            const colors = [
              { bg: "#eff6ff", border: "#dbeafe", text: "#2563eb" },
              { bg: "#fff7ed", border: "#ffedd5", text: "#ea580c" },
              { bg: "#ecfdf5", border: "#d1fae5", text: "#059669" },
            ];
            const c = colors[i % colors.length];
            return (
              <Box
                key={i}
                sx={{
                  backgroundColor: c.bg,
                  border: `1px solid ${c.border}`,
                  borderRadius: 2,
                  p: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: 1,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    mb: 0.5,
                  }}
                >
                  {card.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: c.text,
                    fontFamily: "monospace",
                    mb: 0.5,
                  }}
                >
                  {card.value}
                </Typography>
                {card.interpretation && (
                  <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                    {card.interpretation}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Upside Table */}
      {upsideTable.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1.5 }}>
            Highest Risk-Adjusted Upside
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
                gridTemplateColumns: "1fr 0.8fr 0.8fr 0.8fr 0.8fr 1.2fr",
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {["TICKER", "PRICE", "TARGET", "% UPSIDE", "STOP DIST", "RISK/REWARD"].map(
                (h) => (
                  <Typography
                    key={h}
                    sx={{
                      px: 2,
                      py: 1.2,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 0.8,
                      color: "#475569",
                    }}
                  >
                    {h}
                  </Typography>
                )
              )}
            </Box>

            {/* Rows */}
            {upsideTable.map((row: any, i: number) => (
              <Box
                key={i}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 0.8fr 0.8fr 0.8fr 0.8fr 1.2fr",
                  borderBottom: i < upsideTable.length - 1 ? "1px solid #f1f5f9" : "none",
                  "&:hover": { backgroundColor: "#fafbfc" },
                }}
              >
                <Typography
                  sx={{ px: 2, py: 1.5, fontSize: 13, fontWeight: 700, color: "#2563eb" }}
                >
                  {row.ticker}
                </Typography>
                <Typography
                  sx={{ px: 2, py: 1.5, fontSize: 13, color: "#475569", fontFamily: "monospace" }}
                >
                  {row.price}
                </Typography>
                <Typography
                  sx={{ px: 2, py: 1.5, fontSize: 13, color: "#475569", fontFamily: "monospace" }}
                >
                  {row.target}
                </Typography>
                <Typography
                  sx={{
                    px: 2,
                    py: 1.5,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#059669",
                    fontFamily: "monospace",
                  }}
                >
                  {row.pct_upside || row.upside}
                </Typography>
                <Typography
                  sx={{ px: 2, py: 1.5, fontSize: 13, color: "#475569" }}
                >
                  {row.stop_dist || row.stop_distance}
                </Typography>
                <Typography
                  sx={{
                    px: 2,
                    py: 1.5,
                    fontSize: 13,
                    color: row.risk_reward?.toLowerCase?.().includes("unfavorable")
                      ? "#ea580c"
                      : "#059669",
                    fontWeight: 500,
                  }}
                >
                  {row.risk_reward}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Sector Rotation Ideas */}
      {rotationIdeas && (
        <Box
          sx={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            p: 2.5,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>
            Sector Rotation Ideas
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
            {typeof rotationIdeas === "string"
              ? rotationIdeas
              : rotationIdeas.content || rotationIdeas.text || JSON.stringify(rotationIdeas)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OpportunityEngine;
