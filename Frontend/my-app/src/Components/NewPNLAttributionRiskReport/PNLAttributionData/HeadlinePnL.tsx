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

          return (
            <Box
              key={cfg.metricKey}
              className={`pnl-card pnl-card--${modifier}${isSelected ? " pnl-card--selected" : ""}`}
              onClick={() => onMetricSelect(cfg.metricKey)}
              sx={{ cursor: "pointer" }}
            >
              <Box className="pnl-card-header">
                <Box className="pnl-card-title">{cfg.title}</Box>
              </Box>
              <Box>
                <Box
                  component="span"
                  className={`pnl-card-value pnl-card-value--${modifier}`}
                >
                  {formatCurrency(value)}
                </Box>
                <Box
                  component="span"
                  className={`pnl-card-pct pnl-card-pct--${modifier}`}
                >
                  ({pct.toFixed(2)}%)
                </Box>
              </Box>

              {/* Hover overlay with full details */}
              <Box className={`pnl-card-hover-overlay pnl-card-hover-overlay--${modifier}`}>
                <Box className="pnl-card-hover-label">{cfg.title}</Box>
                <Box className="pnl-card-hover-value">{formatFullCurrency(value)}</Box>
                <Box className="pnl-card-hover-pct">({pct.toFixed(2)}%)</Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default HeadlinePnL;
