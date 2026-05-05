import React from "react";
import { Box, CircularProgress } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import type { TopBottomPnlTicker, TopBottomMetricTicker, DashboardCategory } from "./types";
import { formatFullCurrency } from "./utils";

const CATEGORY_LABELS: Record<string, string> = {
  pnl: "P&L (Gross)",
  gross_market_value: "Gross Market Value",
  delta_adj_net_mv: "Delta Adj. Net Exposure",
  beta_adj_net_mv: "Beta Adj. Net Exposure",
};

const CATEGORY_OPTIONS: { key: DashboardCategory; label: string; icon: string }[] = [
  { key: "pnl", label: "P&L", icon: "💰" },
  { key: "gross_market_value", label: "Gross Market Value", icon: "📊" },
  { key: "delta_adj_net_mv", label: "Delta Adj. Net Exposure", icon: "📈" },
  { key: "beta_adj_net_mv", label: "Beta Adj. Net Exposure", icon: "📉" },
];

export type PnlPeriod = "dtd" | "mtd" | "ytd";

const PERIOD_OPTIONS: { key: PnlPeriod; label: string }[] = [
  { key: "dtd", label: "DTD" },
  { key: "mtd", label: "MTD" },
  { key: "ytd", label: "YTD" },
];

interface TopBottomPnLTableProps {
  top10: TopBottomPnlTicker[];
  bottom10: TopBottomPnlTicker[];
  topLoading: boolean;
  bottomLoading: boolean;
  category?: DashboardCategory;
  onCategoryChange?: (cat: DashboardCategory) => void;
  metricTop10?: TopBottomMetricTicker[];
  metricBottom10?: TopBottomMetricTicker[];
  metricTopLoading?: boolean;
  metricBottomLoading?: boolean;
  period?: PnlPeriod;
  onPeriodChange?: (period: PnlPeriod) => void;
}

const TopBottomPnLTable: React.FC<TopBottomPnLTableProps> = ({
  top10,
  bottom10,
  topLoading,
  bottomLoading,
  category = "pnl",
  onCategoryChange,
  metricTop10 = [],
  metricBottom10 = [],
  metricTopLoading = false,
  metricBottomLoading = false,
  period = "dtd",
  onPeriodChange,
}) => {
  const isPnl = category === "pnl";

  const activeTop = isPnl ? top10 : metricTop10;
  const activeBottom = isPnl ? bottom10 : metricBottom10;
  const isTopLoading = isPnl ? topLoading : metricTopLoading;
  const isBottomLoading = isPnl ? bottomLoading : metricBottomLoading;

  const baseLabel = CATEGORY_LABELS[category] || "P&L (Gross)";
  const tableLabel = isPnl ? `${period.toUpperCase()} ${baseLabel}` : baseLabel;

  return (
    <Box className="risk-dashboard-section">
      {/* Toolbar: category buttons left, period toggle right */}
      <Box className="tb-pnl-toolbar-row">
        <Box className="tb-pnl-category-bar">
          {CATEGORY_OPTIONS.map((opt) => (
            <Box
              key={opt.key}
              className={`tb-pnl-category-btn${category === opt.key ? " tb-pnl-category-btn--active" : ""}`}
              onClick={() => onCategoryChange?.(opt.key)}
            >
              <span className="tb-pnl-category-icon">{opt.icon}</span>
              <span className="tb-pnl-category-label">{opt.label}</span>
            </Box>
          ))}
        </Box>

        {isPnl && onPeriodChange && (
          <Box className="tb-pnl-period-toggle" role="tablist" aria-label="PNL period">
            {PERIOD_OPTIONS.map((opt) => (
              <Box
                key={opt.key}
                role="tab"
                aria-selected={period === opt.key}
                className={`tb-pnl-period-btn${period === opt.key ? " tb-pnl-period-btn--active" : ""}`}
                onClick={() => onPeriodChange(opt.key)}
              >
                {opt.label}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box className="tb-pnl-container">
        {/* Top 10 */}
        <Box className="tb-pnl-card">
          <Box className="tb-pnl-header tb-pnl-header--top">
            <TrendingUpIcon sx={{ fontSize: 20 }} />
            <span>Top 10 {tableLabel}</span>
          </Box>
          <Box className="tb-pnl-table-wrapper">
            {isTopLoading ? (
              <Box className="risk-dashboard-loading" sx={{ minHeight: 160 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <table className="tb-pnl-table">
                <thead>
                  <tr>
                    <th className="tb-pnl-th tb-pnl-th--rank">#</th>
                    <th className="tb-pnl-th tb-pnl-th--ticker">Ticker</th>
                    <th className="tb-pnl-th tb-pnl-th--issuer">Issuer</th>
                    <th className="tb-pnl-th tb-pnl-th--pnl">{isPnl ? "P&L" : "Value"}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTop.map((item: any, idx: number) => (
                    <tr key={item.ticker} className="tb-pnl-row">
                      <td className="tb-pnl-td tb-pnl-td--rank">
                        <span className="tb-pnl-rank-badge tb-pnl-rank-badge--top">{idx + 1}</span>
                      </td>
                      <td className="tb-pnl-td tb-pnl-td--ticker">{item.ticker}</td>
                      <td className="tb-pnl-td tb-pnl-td--issuer">{item.issuer}</td>
                      <td className="tb-pnl-td tb-pnl-td--pnl tb-pnl-positive">
                        {formatFullCurrency(isPnl ? item.pnl : item.value)}
                      </td>
                    </tr>
                  ))}
                  {activeTop.length === 0 && (
                    <tr>
                      <td colSpan={4} className="tb-pnl-empty">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </Box>
        </Box>

        {/* Bottom 10 */}
        <Box className="tb-pnl-card">
          <Box className="tb-pnl-header tb-pnl-header--bottom">
            <TrendingDownIcon sx={{ fontSize: 20 }} />
            <span>Bottom 10 {tableLabel}</span>
          </Box>
          <Box className="tb-pnl-table-wrapper">
            {isBottomLoading ? (
              <Box className="risk-dashboard-loading" sx={{ minHeight: 160 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <table className="tb-pnl-table">
                <thead>
                  <tr>
                    <th className="tb-pnl-th tb-pnl-th--rank">#</th>
                    <th className="tb-pnl-th tb-pnl-th--ticker">Ticker</th>
                    <th className="tb-pnl-th tb-pnl-th--issuer">Issuer</th>
                    <th className="tb-pnl-th tb-pnl-th--pnl">{isPnl ? "P&L" : "Value"}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBottom.map((item: any, idx: number) => (
                    <tr key={item.ticker} className="tb-pnl-row">
                      <td className="tb-pnl-td tb-pnl-td--rank">
                        <span className="tb-pnl-rank-badge tb-pnl-rank-badge--bottom">{idx + 1}</span>
                      </td>
                      <td className="tb-pnl-td tb-pnl-td--ticker">{item.ticker}</td>
                      <td className="tb-pnl-td tb-pnl-td--issuer">{item.issuer}</td>
                      <td className="tb-pnl-td tb-pnl-td--pnl tb-pnl-negative">
                        {formatFullCurrency(isPnl ? item.pnl : item.value)}
                      </td>
                    </tr>
                  ))}
                  {activeBottom.length === 0 && (
                    <tr>
                      <td colSpan={4} className="tb-pnl-empty">No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TopBottomPnLTable;
