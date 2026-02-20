import React from "react";
import { Box } from "@mui/material";
import type { IndexesComparison as IndexesComparisonData } from "./types";

interface IndexesComparisonProps {
  data: IndexesComparisonData;
}

interface IndexCardConfig {
  label: string;
  valueKey: keyof IndexesComparisonData;
  subKey?: keyof IndexesComparisonData;
  format: "beta" | "vol";
  color: string;
}

const INDEX_CARDS_CONFIG: IndexCardConfig[] = [
  { label: "1m \u03B2 S&P", valueKey: "one_month_beta_sp", format: "beta", color: "blue" },
  { label: "3m \u03B2 S&P", valueKey: "three_month_beta_sp", format: "beta", color: "blue" },
  { label: "1m Vol / S&P", valueKey: "one_month_vol", subKey: "one_month_sp_vol", format: "vol", color: "cyan" },
  { label: "3m Vol / S&P", valueKey: "three_month_vol", subKey: "three_month_sp_vol", format: "vol", color: "orange" },
  { label: "YTD Vol / S&P", valueKey: "ytd_vol", subKey: "ytd_sp_vol", format: "vol", color: "pink" },
  { label: "Drawdown / S&P", valueKey: "drawdown", subKey: "sp_drawdown", format: "vol", color: "red" },
];

const IndexesComparison: React.FC<IndexesComparisonProps> = ({ data }) => {
  return (
    <Box className="risk-dashboard-section">
      <Box className="index-cards-grid">
        {INDEX_CARDS_CONFIG.map((cfg) => {
          const value = data[cfg.valueKey];
          const subValue = cfg.subKey ? data[cfg.subKey] : null;

          return (
            <Box
              key={cfg.label}
              className={`index-card index-card--${cfg.color}`}
            >
              <Box className={`index-card-label index-card-label--${cfg.color}`}>
                {cfg.label}
              </Box>
              <Box className="index-card-value">
                {cfg.format === "beta"
                  ? value.toFixed(2)
                  : `${value.toFixed(2)}%`}
                {subValue !== null && (
                  <Box component="span" className="index-card-sub">
                    {"  "}({subValue.toFixed(2)}%)
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
