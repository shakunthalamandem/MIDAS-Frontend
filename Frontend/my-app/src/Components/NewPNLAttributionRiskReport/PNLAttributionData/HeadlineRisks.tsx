import React from "react";
import { Box } from "@mui/material";
import type { HeadlineRisks as HeadlineRisksData } from "./types";
import { formatCurrency, formatPct } from "./utils";

interface HeadlineRisksProps {
  data: HeadlineRisksData;
}

const RISK_CARDS_CONFIG = [
  { key: "aum", label: "AUM", color: "green", icon: "$", showPct: false },
  { key: "gross_market_value", label: "Gross Market Value", color: "blue", icon: "\u{1F4CA}", showPct: true, pctKey: "gross_market_value_pct" },
  { key: "delta_adj_net_mv", label: "Delta Adj. Net MV", color: "cyan", icon: "\u{1F4C8}", showPct: true, pctKey: "delta_adj_net_mv_pct" },
  { key: "beta_adj_net_mv", label: "Beta Adj. Net MV", color: "orange", icon: "\u{1F4C9}", showPct: true, pctKey: "beta_adj_net_mv_pct" },
  { key: "one_yr_1pct_var", label: "1Y 1% VaR", color: "pink", icon: "\u2298", showPct: true, pctKey: "one_yr_1pct_var_pct" },
] as const;

const HeadlineRisks: React.FC<HeadlineRisksProps> = ({ data }) => {
  return (
    <Box className="risk-dashboard-section">
      <Box className="risk-dashboard-section-title">HEADLINE RISKS</Box>
      <Box className="risk-cards-grid">
        {RISK_CARDS_CONFIG.map((cfg) => {
          const value = data[cfg.key as keyof HeadlineRisksData] as number;
          const pct = cfg.showPct
            ? formatPct(data[cfg.pctKey as keyof HeadlineRisksData] as number)
            : "";
          return (
            <Box key={cfg.key} className={`risk-card risk-card--${cfg.color}`}>
              <Box className={`risk-card-icon risk-card-icon--${cfg.color}`}>
                {cfg.icon}
              </Box>
              <Box>
                <Box className="risk-card-label">{cfg.label}</Box>
                <Box className={`risk-card-value risk-card-value--${cfg.color}`}>
                  {formatCurrency(value)}
                </Box>
                {pct && <Box className="risk-card-pct">{pct}</Box>}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default HeadlineRisks;
