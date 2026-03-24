import React from "react";
import { Box } from "@mui/material";
import type { HeadlineRisks as HeadlineRisksData, DashboardCategory } from "./types";
import { formatCurrency, formatFullCurrency, formatPct } from "./utils";

interface HeadlineRisksProps {
  data: HeadlineRisksData;
  selectedCategory: DashboardCategory;
  onCategorySelect: (category: DashboardCategory) => void;
}

const RISK_CARDS_CONFIG = [
  { key: "aum", label: "AUM", color: "green", icon: "$", showPct: false, clickable: false },
  { key: "gross_market_value", label: "Gross Market Value", color: "blue", icon: "\u{1F4CA}", showPct: true, pctKey: "gross_market_value_pct", clickable: true, category: "gross_market_value" as DashboardCategory },
  { key: "delta_adj_net_mv", label: "Delta Adj. Net MV", color: "cyan", icon: "\u{1F4C8}", showPct: true, pctKey: "delta_adj_net_mv_pct", clickable: true, category: "delta_adj_net_mv" as DashboardCategory },
  { key: "beta_adj_net_mv", label: "Beta Adj. Net MV", color: "orange", icon: "\u{1F4C9}", showPct: true, pctKey: "beta_adj_net_mv_pct", clickable: true, category: "beta_adj_net_mv" as DashboardCategory },
  { key: "one_yr_1pct_var", label: "1Y 1% VaR", color: "pink", icon: "\u2298", showPct: true, pctOnly: true, pctKey: "one_yr_1pct_var_pct", clickable: false },
] as const;

const SELECTED_COLORS: Record<string, string> = {
  blue: "#2563eb",
  cyan: "#0891b2",
  orange: "#ea580c",
};

const HeadlineRisks: React.FC<HeadlineRisksProps> = ({ data, selectedCategory, onCategorySelect }) => {
  return (
    <Box className="risk-dashboard-section">
      <Box className="risk-dashboard-section-title">HEADLINE RISKS</Box>
      <Box className="risk-cards-grid">
        {RISK_CARDS_CONFIG.map((cfg) => {
          const value = data[cfg.key as keyof HeadlineRisksData] as number;
          const pct = cfg.showPct
            ? formatPct(data[cfg.pctKey as keyof HeadlineRisksData] as number)
            : "";
          const isPctOnly = "pctOnly" in cfg && cfg.pctOnly;
          const isClickable = cfg.clickable;
          const isSelected = isClickable && "category" in cfg && selectedCategory === cfg.category;
          const selectedBg = SELECTED_COLORS[cfg.color] || "#2563eb";

          return (
            <Box
              key={cfg.key}
              className={`risk-card risk-card--${cfg.color}${isSelected ? " risk-card--selected" : ""}`}
              onClick={isClickable && "category" in cfg ? () => onCategorySelect(cfg.category) : undefined}
              sx={{
                cursor: isClickable ? "pointer" : "default",
                ...(isSelected && {
                  background: `${selectedBg} !important`,
                  border: `1px solid ${selectedBg} !important`,
                }),
              }}
            >
              {/* Top row: icon + label */}
              <Box className="risk-card-top">
                <Box
                  className={`risk-card-icon risk-card-icon--${cfg.color}`}
                  sx={isSelected ? { background: "rgba(255,255,255,0.2) !important", color: "#fff !important" } : {}}
                >
                  {cfg.icon}
                </Box>
                <Box
                  className="risk-card-label"
                  sx={isSelected ? { color: "#fff !important" } : {}}
                >
                  {cfg.label}
                </Box>
              </Box>

              {/* Bottom: value + pct centered */}
              <Box className="risk-card-body">
                {!isPctOnly && (
                  <Box
                    className={`risk-card-value risk-card-value--${cfg.color}`}
                    sx={isSelected ? { color: "#fff !important" } : {}}
                  >
                    {formatCurrency(value)}
                  </Box>
                )}
                {pct && (
                  <Box
                    className={isPctOnly ? `risk-card-value risk-card-value--${cfg.color}` : "risk-card-pct"}
                    sx={isSelected ? { color: "rgba(255,255,255,0.85) !important" } : {}}
                  >
                    {pct}
                  </Box>
                )}
              </Box>

              {/* Hover overlay with full details (hidden when selected) */}
              {!isSelected && (
                <Box className={`risk-card-hover-overlay risk-card-hover-overlay--${cfg.color}`}>
                  <Box className="risk-card-hover-label">{cfg.label}</Box>
                  {!isPctOnly && <Box className="risk-card-hover-value">{formatFullCurrency(value)}</Box>}
                  {pct && <Box className={isPctOnly ? "risk-card-hover-value" : "risk-card-hover-pct"}>{pct}</Box>}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default HeadlineRisks;
