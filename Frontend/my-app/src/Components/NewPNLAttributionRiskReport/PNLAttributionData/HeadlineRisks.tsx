import React from "react";
import { Box, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RemoveIcon from "@mui/icons-material/Remove";
import type { HeadlineRisks as HeadlineRisksData, HeadlinePnl, DashboardCategory } from "./types";
import { formatCurrency, formatFullCurrency, formatPct } from "./utils";

interface HeadlineRisksProps {
  data: HeadlineRisksData;
  pnlData?: HeadlinePnl;
  selectedCategory: DashboardCategory;
  onCategorySelect: (category: DashboardCategory) => void;
}

interface RiskCardInfo {
  definition: string;
  formula: string;
  notes?: string;
}

const RISK_CARDS_INFO: Record<string, RiskCardInfo> = {
  aum: {
    definition: "Assets Under Management — the total market value of all assets held in the portfolio, measured at the beginning of the month.",
    formula: "AUM = Σ (Position Market Value)",
  },
  gross_market_value: {
    definition: "Gross Market Value = Sum of absolute position exposures (long + short), showing total portfolio size without netting.",
    formula: "Gross Market Value = Σ | Market Value |",
  },
  delta_adj_net_mv: {
    definition: "Measures the net exposure of the portfolio to equity movements after adjusting positions by their delta.",
    formula: "Delta Adjusted Net Exposure = Σ(Position Exposure × Δ) / AUM",
    notes: "Delta values are sourced on a weekly basis from B Source. Where data is unavailable, proxy assumptions are applied as follows: 0.5 for convertible bonds, 0.25 for equity calls, -0.25 for equity puts, and 1 for high yield instruments. For equities, delta is assumed to be 1.",
  },
  beta_adj_net_mv: {
    definition: "Measures the portfolio's sensitivity to overall market movements after adjusting for both delta and beta, indicating how the portfolio is expected to move relative to the market.",
    formula: "Beta Adjusted Net Exposure = Σ(Position Exposure × Δ × β) / AUM",
    notes: "Beta values are sourced daily from B Source. The Raw overridable beta is calculated over a 1-month period from the current date, using a fixed benchmark index (SPY Equity) for both US and international securities. Beta values are capped within a range of +2.5 (maximum) and -2.5 (minimum). Where data is unavailable, a proxy beta of 0.4 is applied for convertible bonds and 0.25 for High yield instruments.",
  },
  one_yr_1pct_var: {
    definition: "Estimates the maximum expected loss at a 99% confidence level, meaning there is only a 1% probability that losses will exceed this level over the specified time horizon.",
    formula: "VaR (99%) = | PERCENTILE.INC(Returns, 0.01) | × √T\n(Where T = time horizon, e.g., 252 for 1 year)",
  },
};

const RISK_CARDS_CONFIG = [
  { key: "aum", label: "AUM", color: "green", icon: "$", showPct: false, clickable: false },
  { key: "gross_market_value", label: "Gross Market Value", color: "blue", icon: "\u{1F4CA}", showPct: true, pctKey: "gross_market_value_pct", clickable: true, category: "gross_market_value" as DashboardCategory },
  { key: "delta_adj_net_mv", label: "Delta Adj. Net Exposure", color: "cyan", icon: "\u{1F4C8}", showPct: true, pctKey: "delta_adj_net_mv_pct", clickable: true, category: "delta_adj_net_mv" as DashboardCategory },
  { key: "beta_adj_net_mv", label: "Beta Adj. Net Exposure", color: "orange", icon: "\u{1F4C9}", showPct: true, pctKey: "beta_adj_net_mv_pct", clickable: true, category: "beta_adj_net_mv" as DashboardCategory },
  { key: "one_yr_1pct_var", label: "1% VaR", color: "pink", icon: "\u2298", showPct: true, pctOnly: true, pctKey: "one_yr_1pct_var_pct", clickable: false },
] as const;

const SELECTED_COLORS: Record<string, string> = {
  blue: "#2563eb",
  cyan: "#0891b2",
  orange: "#ea580c",
};

const PNL_BOXES = [
  { label: "DTD P&L", valueKey: "dtd_pnl", pctKey: "dtd_pnl_pct" },
  { label: "WTD P&L", valueKey: "wtd_pnl", pctKey: "wtd_pnl_pct" },
  { label: "MTD P&L", valueKey: "mtd_pnl", pctKey: "mtd_pnl_pct" },
  { label: "YTD P&L", valueKey: "ytd_pnl", pctKey: "ytd_pnl_pct" },
] as const;

const HeadlineRisks: React.FC<HeadlineRisksProps> = ({ data, pnlData, selectedCategory, onCategorySelect }) => {
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
                      <Box sx={{ fontFamily: "monospace", whiteSpace: "pre-line", color: "#e0f2fe", mb: RISK_CARDS_INFO[cfg.key].notes ? 0.75 : 0 }}>
                        {RISK_CARDS_INFO[cfg.key].formula}
                      </Box>
                      {RISK_CARDS_INFO[cfg.key].notes && (
                        <Box sx={{ color: "#cbd5e1", fontSize: "11px", lineHeight: 1.5, borderTop: "1px solid rgba(255,255,255,0.1)", pt: 0.75 }}>
                          {RISK_CARDS_INFO[cfg.key].notes}
                        </Box>
                      )}
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

      {/* P&L Summary Boxes */}
      {pnlData && (
        <Box className="pnl-summary-grid">
          {PNL_BOXES.map((cfg) => {
            const value = pnlData[cfg.valueKey as keyof HeadlinePnl] as number;
            const pct = pnlData[cfg.pctKey as keyof HeadlinePnl] as number;
            const isPositive = value > 0;
            const isNegative = value < 0;
            const isZero = value === 0;

            return (
              <Box key={cfg.valueKey} className="pnl-summary-box">
                <Box className="pnl-summary-box-header">
                  <Box className="pnl-summary-box-icon">
                    {isPositive ? (
                      <TrendingUpIcon sx={{ fontSize: 14, color: "#059669" }} />
                    ) : isNegative ? (
                      <TrendingDownIcon sx={{ fontSize: 14, color: "#dc2626" }} />
                    ) : (
                      <RemoveIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                    )}
                  </Box>
                  <span className="pnl-summary-box-label">{cfg.label}</span>
                </Box>
                <Box
                  className="pnl-summary-box-value"
                  sx={{
                    color: isPositive ? "#059669" : isNegative ? "#dc2626" : "#64748b",
                  }}
                >
                  {formatCurrency(value)}
                </Box>
                <Box className="pnl-summary-box-pct">
                  {pct.toFixed(2)}%
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default HeadlineRisks;
