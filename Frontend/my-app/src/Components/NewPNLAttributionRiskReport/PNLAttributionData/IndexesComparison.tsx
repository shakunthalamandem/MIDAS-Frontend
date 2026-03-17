import React from "react";
import { Box } from "@mui/material";
import type { IndexesComparison as IndexesComparisonData } from "./types";

interface IndexesComparisonProps {
  data: IndexesComparisonData;
  selectedMetric?: string;
  onMetricSelect?: (metricKey: string) => void;
}

interface IndexCardConfig {
  label: string;
  valueKey: keyof IndexesComparisonData;
  subKey?: keyof IndexesComparisonData;
  format: "beta" | "vol";
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
  { label: "3m Beta S&P", valueKey: "three_month_beta_sp", format: "beta", color: "blue", metricKey: "three_month_beta_sp" },
  { label: "1m Volatility / S&P", valueKey: "one_month_vol", subKey: "one_month_sp_vol", format: "vol", color: "cyan", metricKey: "one_month_vol" },
  { label: "3m Volatility / S&P", valueKey: "three_month_vol", subKey: "three_month_sp_vol", format: "vol", color: "orange", metricKey: "three_month_vol" },
  { label: "YTD Volatility / S&P", valueKey: "ytd_vol", subKey: "ytd_sp_vol", format: "vol", color: "pink", metricKey: "ytd_vol" },
  { label: "Drawdown / S&P", valueKey: "drawdown", subKey: "sp_drawdown", format: "vol", color: "red", metricKey: "drawdown" },
];

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
          const subValue = cfg.subKey ? toNumber(data[cfg.subKey]) : null;
          const isSelected = selectedMetric === cfg.metricKey;

          const selectedBg = SELECTED_BG[cfg.color] || "#1e293b";

          return (
            <Box
              key={cfg.label}
              className={`index-card${isSelected ? " index-card--selected" : ` index-card--${cfg.color}`}`}
              onClick={() => onMetricSelect?.(cfg.metricKey)}
              sx={{
                cursor: onMetricSelect ? "pointer" : "default",
                ...(isSelected && {
                  background: `${selectedBg} !important`,
                  borderColor: selectedBg,
                }),
              }}
            >
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
                  ? value.toFixed(2)
                  : `${value.toFixed(2)}%`}
                {subValue !== null && value !== null && (
                  <Box
                    component="span"
                    className={isSelected ? "" : "index-card-sub"}
                    sx={isSelected ? { fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.7)", ml: 0.5 } : {}}
                  >
                    {" / "}({subValue.toFixed(2)}%)
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default IndexesComparison;
