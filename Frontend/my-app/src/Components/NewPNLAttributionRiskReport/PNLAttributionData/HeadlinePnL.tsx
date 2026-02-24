import React from "react";
import { Box } from "@mui/material";
import type { HeadlinePnl } from "./types";
import { formatCurrency, formatFullCurrency } from "./utils";

interface HeadlinePnLProps {
  data: HeadlinePnl;
  selectedMetric: string;
  onMetricSelect: (metric: string) => void;
}

const PNL_CARDS = [
  { title: "DTD P&L", valueKey: "dtd_pnl", pctKey: "dtd_pnl_pct", metricKey: "dtd_pnl" },
  { title: "WTD P&L", valueKey: "wtd_pnl", pctKey: "wtd_pnl_pct", metricKey: "wtd_pnl" },
  { title: "MTD P&L", valueKey: "mtd_pnl", pctKey: "mtd_pnl_pct", metricKey: "mtd_pnl" },
  { title: "YTD P&L", valueKey: "ytd_pnl", pctKey: "ytd_pnl_pct", metricKey: "ytd_pnl" },
] as const;

const HeadlinePnL: React.FC<HeadlinePnLProps> = ({
  data,
  selectedMetric,
  onMetricSelect,
}) => {
  return (
    <Box className="risk-dashboard-section">
      <Box className="risk-dashboard-section-title">HEADLINE P&L</Box>
      <Box className="pnl-cards-grid">
        {PNL_CARDS.map((cfg) => {
          const value = data[cfg.valueKey] as number;
          const pct = data[cfg.pctKey] as number;
          const isPositive = value >= 0;
          const modifier = isPositive ? "positive" : "negative";
          const isSelected = selectedMetric === cfg.metricKey;

          const selectedBg = isPositive ? "#059669" : "#dc2626";

          return (
            <Box
              key={cfg.metricKey}
              className={`pnl-card${isSelected ? "" : ` pnl-card--${modifier}`}${isSelected ? " pnl-card--selected" : ""}`}
              onClick={() => onMetricSelect(cfg.metricKey)}
              sx={{
                cursor: "pointer",
                ...(isSelected && {
                  background: `${selectedBg} !important`,
                  border: `1px solid ${selectedBg} !important`,
                  borderLeft: `4px solid ${selectedBg} !important`,
                }),
              }}
            >
              <Box className="pnl-card-header">
                <Box
                  className={isSelected ? "" : "pnl-card-title"}
                  sx={isSelected ? { fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)" } : {}}
                >
                  {cfg.title}
                </Box>
              </Box>
              <Box>
                <Box
                  component="span"
                  className={isSelected ? "" : `pnl-card-value pnl-card-value--${modifier}`}
                  sx={isSelected ? { fontSize: 20, fontWeight: 700, color: "#fff" } : undefined}
                >
                  {formatCurrency(value)}
                </Box>
                <Box
                  component="span"
                  className={isSelected ? "" : `pnl-card-pct pnl-card-pct--${modifier}`}
                  sx={isSelected ? { fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.8)", ml: 0.75 } : undefined}
                >
                  ({pct.toFixed(2)}%)
                </Box>
              </Box>

              {/* Hover overlay (hidden when selected) */}
              {!isSelected && (
                <Box className={`pnl-card-hover-overlay pnl-card-hover-overlay--${modifier}`}>
                  <Box className="pnl-card-hover-label">{cfg.title}</Box>
                  <Box className="pnl-card-hover-value">{formatFullCurrency(value)}</Box>
                  <Box className="pnl-card-hover-pct">({pct.toFixed(2)}%)</Box>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default HeadlinePnL;
