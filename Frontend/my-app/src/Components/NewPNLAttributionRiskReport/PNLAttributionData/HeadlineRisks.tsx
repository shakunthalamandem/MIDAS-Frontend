import React from "react";
import { Box, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import type { HeadlineRisks as HeadlineRisksData, DashboardCategory } from "./types";
import { formatCurrency, formatFullCurrency, formatPct } from "./utils";

interface HeadlineRisksProps {
  data: HeadlineRisksData;
  selectedCategory: DashboardCategory;
  onCategorySelect: (category: DashboardCategory) => void;
}

interface RiskCardInfo {
  definition: string;
  formula: string;
}

const RISK_CARDS_INFO: Record<string, RiskCardInfo> = {
  aum: {
    definition: "Assets Under Management — the total market value of all positions held in the portfolio.",
    formula: "AUM = Σ (Position Market Value)",
  },
  gross_market_value: {
    definition: "Total absolute market exposure across all long and short positions, regardless of direction.",
    formula: "Gross MV = |Long MV| + |Short MV|\nGross MV % = Gross MV / AUM × 100",
  },
  delta_adj_net_mv: {
    definition: "Net market exposure adjusted for option delta, reflecting true equity sensitivity for derivatives positions.",
    formula: "Delta Adj. Net MV = Σ (Position MV × Delta)\nDelta Adj. Net % = Delta Adj. Net MV / AUM × 100",
  },
  beta_adj_net_mv: {
    definition: "Net market exposure scaled by each position's beta to the benchmark, reflecting systematic market risk.",
    formula: "Beta Adj. Net MV = Σ (Position MV × Beta)\nBeta Adj. Net % = Beta Adj. Net MV / AUM × 100",
  },
  one_yr_1pct_var: {
    definition: "1-Year 1% Value at Risk — the maximum expected portfolio loss over a 1-year horizon at 99% confidence level.",
    formula: "VaR (1Y, 1%) = Portfolio Volatility (1Y) × 2.326 × AUM\nVaR % = VaR / AUM × 100",
  },
};

const RISK_CARDS_CONFIG = [
  { key: "aum", label: "AUM", color: "green", icon: "$", showPct: false, clickable: false },
  { key: "gross_market_value", label: "Gross Market Value", color: "blue", icon: "\u{1F4CA}", showPct: true, pctKey: "gross_market_value_pct", clickable: true, category: "gross_market_value" as DashboardCategory },
  { key: "delta_adj_net_mv", label: "Delta Adj. Net Exposure", color: "cyan", icon: "\u{1F4C8}", showPct: true, pctKey: "delta_adj_net_mv_pct", clickable: true, category: "delta_adj_net_mv" as DashboardCategory },
  { key: "beta_adj_net_mv", label: "Beta Adj. Net Exposure", color: "orange", icon: "\u{1F4C9}", showPct: true, pctKey: "beta_adj_net_mv_pct", clickable: true, category: "beta_adj_net_mv" as DashboardCategory },
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
          const displayPct = isPctOnly ? pct.replace(/[()]/g, "") : pct;
          const isClickable = cfg.clickable;
          const isSelected = isClickable && "category" in cfg && selectedCategory === cfg.category;
          const selectedBg = SELECTED_COLORS[cfg.color] || "#2563eb";

          return (
            <Box
              key={cfg.key}
              className={`risk-card risk-card--${cfg.color}${isSelected ? " risk-card--selected" : ""}`}
              onClick={isClickable && "category" in cfg ? () => onCategorySelect(cfg.category) : undefined}
              sx={{
                position: "relative",
                cursor: isClickable ? "pointer" : "default",
                ...(isSelected && {
                  background: `${selectedBg} !important`,
                  border: `1px solid ${selectedBg} !important`,
                }),
              }}
            >
              {/* Info icon — top right */}
              {RISK_CARDS_INFO[cfg.key] && (
                <Tooltip
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Box sx={{ fontWeight: 700, mb: 0.5 }}>{cfg.label}</Box>
                      <Box sx={{ mb: 0.75 }}>{RISK_CARDS_INFO[cfg.key].definition}</Box>
                      <Box sx={{ fontWeight: 600, color: "#90caf9", mb: 0.25 }}>Formula:</Box>
                      <Box sx={{ fontFamily: "monospace", whiteSpace: "pre-line", color: "#e0f2fe" }}>
                        {RISK_CARDS_INFO[cfg.key].formula}
                      </Box>
                    </Box>
                  }
                  placement="top"
                  arrow
                  slotProps={{
                    tooltip: { sx: { bgcolor: "#1e293b", maxWidth: 320, fontSize: "12px", lineHeight: 1.5 } },
                    arrow: { sx: { color: "#1e293b" } },
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <InfoOutlinedIcon
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      fontSize: "15px",
                      cursor: "help",
                      opacity: 0.55,
                      color: isSelected ? "#fff" : "inherit",
                      zIndex: 1,
                      "&:hover": { opacity: 1 },
                    }}
                  />
                </Tooltip>
              )}

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
                  <Box className={isPctOnly ? `risk-card-value risk-card-value--${cfg.color}` : "risk-card-pct"}>
                    {displayPct}
                  </Box>
                )}
              </Box>

              {/* Hover overlay with full details (hidden when selected) */}
              {!isSelected && (
                <Box className={`risk-card-hover-overlay risk-card-hover-overlay--${cfg.color}`}>
                  <Box className="risk-card-hover-label">{cfg.label}</Box>
                  {!isPctOnly && <Box className="risk-card-hover-value">{formatFullCurrency(value)}</Box>}
                  {pct && <Box className={isPctOnly ? "risk-card-hover-value" : "risk-card-hover-pct"}>{displayPct}</Box>}
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
