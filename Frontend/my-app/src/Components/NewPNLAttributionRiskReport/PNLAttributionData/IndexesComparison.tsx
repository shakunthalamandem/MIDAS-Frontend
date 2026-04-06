import React from "react";
import { Box, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { IndexesComparison as IndexesComparisonData } from "./types";

interface IndexesComparisonProps {
  data: IndexesComparisonData;
  selectedMetric?: string;
  onMetricSelect?: (metricKey: string) => void;
}

interface IndexCardConfig {
  label: string;
  valueKey: keyof IndexesComparisonData;
  format: "beta" | "vol" | "ratio";
  color: string;
  metricKey: string;
}

const SELECTED_BG: Record<string, string> = {
  blue: "#2563eb",
  cyan: "#0891b2",
  orange: "#ea580c",
  pink: "#db2777",
  red: "#b91c1c",
};

const INDEX_CARDS_CONFIG: IndexCardConfig[] = [
  { label: "1m Beta S&P", valueKey: "one_month_beta_sp", format: "beta", color: "blue", metricKey: "one_month_beta_sp" },
  { label: "1m Beta Russell", valueKey: "one_month_beta_russell", format: "beta", color: "blue", metricKey: "one_month_beta_russell" },
  { label: "1m Volatility (Portfolio vs S&P)", valueKey: "one_month_volatility_1_sp", format: "ratio", color: "cyan", metricKey: "one_month_volatility_1_sp" },
  { label: "6m Volatility (Portfolio vs S&P)", valueKey: "six_month_volatility_1_sp", format: "ratio", color: "orange", metricKey: "six_month_volatility_1_sp" },
  { label: "YTD Volatility (Portfolio vs S&P)", valueKey: "ytd_volatility_sp", format: "ratio", color: "pink", metricKey: "ytd_volatility_sp" },
  { label: "Drawdown (Portfolio vs S&P)", valueKey: "drawdown_1_sp", format: "ratio", color: "red", metricKey: "drawdown_1_sp" },
];

const INDEX_CARDS_INFO: Record<string, { definition: string; formula: string }> = {
  one_month_beta_sp: {
    definition: "1-month rolling beta of the portfolio against the S&P 500. A beta > 1 means the portfolio amplifies S&P moves; < 1 means it is less sensitive.",
    formula: "β = Cov(R_portfolio, R_S&P) / Var(R_S&P)\nCalculated over a 21-trading-day rolling window.",
  },
  one_month_beta_russell: {
    definition: "1-month rolling beta of the portfolio against the Russell 2000 small-cap index.",
    formula: "β = Cov(R_portfolio, R_Russell) / Var(R_Russell)\nCalculated over a 21-trading-day rolling window.",
  },
  one_month_volatility_1_sp: {
    definition: "Ratio of the portfolio's 1-month annualised volatility to the S&P 500's 1-month annualised volatility. A value > 1 means the portfolio is more volatile than the index.",
    formula: "Ratio = Vol(Portfolio, 1m) / Vol(S&P 500, 1m)\nVol = StdDev(Daily Returns) × √252",
  },
  six_month_volatility_1_sp: {
    definition: "Ratio of the portfolio's 6-month annualised volatility to the S&P 500's 6-month annualised volatility.",
    formula: "Ratio = Vol(Portfolio, 6m) / Vol(S&P 500, 6m)\nVol = StdDev(Daily Returns) × √252",
  },
  ytd_volatility_sp: {
    definition: "Ratio of the portfolio's year-to-date annualised volatility to the S&P 500's YTD annualised volatility.",
    formula: "Ratio = Vol(Portfolio, YTD) / Vol(S&P 500, YTD)\nVol = StdDev(Daily Returns) × √252",
  },
  drawdown_1_sp: {
    definition: "Represents the decline in portfolio value from its peak to the current level, indicating the magnitude of loss experienced. Shown as a ratio vs the S&P 500's drawdown over the same period.",
    formula: "Drawdown = (Peak Value — Current Value) / Peak Value\nRatio = Drawdown(Portfolio) / Drawdown(S&P 500)",
  },
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return null;
};

const IndexesComparison: React.FC<IndexesComparisonProps> = ({
  data,
  selectedMetric,
  onMetricSelect,
}) => {
  return (
    <Box className="risk-dashboard-section">
      <Box className="index-cards-grid">
        {INDEX_CARDS_CONFIG.map((cfg) => {
          const value = toNumber(data[cfg.valueKey]);
          const isSelected = selectedMetric === cfg.metricKey;

          const selectedBg = SELECTED_BG[cfg.color] || "#1e293b";

          return (
            <Box
              key={cfg.label}
              className={`index-card${isSelected ? " index-card--selected" : ` index-card--${cfg.color}`}`}
              onClick={() => onMetricSelect?.(cfg.metricKey)}
              sx={{
                position: "relative",
                cursor: onMetricSelect ? "pointer" : "default",
                ...(isSelected && {
                  background: `${selectedBg} !important`,
                  borderColor: selectedBg,
                }),
              }}
            >
              {/* Info icon — top right */}
              {INDEX_CARDS_INFO[cfg.metricKey] && (
                <Tooltip
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Box sx={{ fontWeight: 700, mb: 0.5 }}>{cfg.label}</Box>
                      <Box sx={{ mb: 0.75 }}>{INDEX_CARDS_INFO[cfg.metricKey].definition}</Box>
                      <Box sx={{ fontWeight: 600, color: "#90caf9", mb: 0.25 }}>Formula:</Box>
                      <Box sx={{ fontFamily: "monospace", whiteSpace: "pre-line", color: "#e0f2fe" }}>
                        {INDEX_CARDS_INFO[cfg.metricKey].formula}
                      </Box>
                    </Box>
                  }
                  placement="top"
                  arrow
                  slotProps={{
                    tooltip: { sx: { bgcolor: "#1e293b", maxWidth: 340, fontSize: "12px", lineHeight: 1.5 } },
                    arrow: { sx: { color: "#1e293b" } },
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <InfoOutlinedIcon
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      fontSize: "14px",
                      cursor: "help",
                      opacity: 0.55,
                      color: isSelected ? "rgba(255,255,255,0.8)" : "inherit",
                      zIndex: 1,
                      "&:hover": { opacity: 1 },
                    }}
                  />
                </Tooltip>
              )}

              <Box
                className={isSelected ? "" : `index-card-label index-card-label--${cfg.color}`}
                sx={isSelected ? { fontSize: 12, fontWeight: 700, mb: 0.75, color: "rgba(255,255,255,0.85)", letterSpacing: "0.5px" } : {}}
              >
                {cfg.label}
              </Box>
              <Box
                className={isSelected ? "" : "index-card-value"}
                sx={isSelected ? { fontSize: 16, fontWeight: 700, color: "#fff" } : {}}
              >
                {value === null
                  ? "--"
                  : cfg.format === "beta"
                  ? value.toFixed(3)
                  : cfg.format === "ratio"
                  ? value.toFixed(2)
                  : `${value.toFixed(2)}%`}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default IndexesComparison;
