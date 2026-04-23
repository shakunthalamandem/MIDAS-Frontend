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

export type PnlPeriod = "dtd" | "mtd" | "ytd";

const PERIOD_OPTIONS: { key: PnlPeriod; label: string }[] = [
  { key: "dtd", label: "DTD" },
  { key: "mtd", label: "MTD" },
  { key: "ytd", label: "YTD" },
];

interface TopBottomPnLTableProps {
  top10: TopBottomPnlTicker[];
  bottom10: TopBottomPnlTicker[];
  loading: boolean;
  category?: DashboardCategory;
  metricTop10?: TopBottomMetricTicker[];
  metricBottom10?: TopBottomMetricTicker[];
  metricLoading?: boolean;
  period?: PnlPeriod;
  onPeriodChange?: (period: PnlPeriod) => void;
}

const TopBottomPnLTable: React.FC<TopBottomPnLTableProps> = ({
  top10,
  bottom10,
  loading,
  category = "pnl",
  metricTop10 = [],
  metricBottom10 = [],
  metricLoading = false,
  period = "dtd",
  onPeriodChange,
}) => {
  const isPnl = category === "pnl";
  const activeTop = isPnl ? top10 : metricTop10;
  const activeBottom = isPnl ? bottom10 : metricBottom10;
  const activeLoading = isPnl ? loading : metricLoading;
  const baseLabel = CATEGORY_LABELS[category] || "P&L (Gross)";
  const periodLabel = period.toUpperCase();
  const label = isPnl ? `${periodLabel} ${baseLabel}` : baseLabel;
  const valueKey = isPnl ? "pnl" : "value";

  const periodToggle = isPnl && onPeriodChange ? (
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
  ) : null;

  if (activeLoading) {
    return (
      <Box className="risk-dashboard-section">
        {periodToggle && (
          <Box className="tb-pnl-toolbar">{periodToggle}</Box>
        )}
        <Box className="risk-dashboard-loading" sx={{ minHeight: 200 }}>
          <CircularProgress size={32} />
        </Box>
      </Box>
    );
  }

  if (activeTop.length === 0 && activeBottom.length === 0) {
    if (!periodToggle) return null;
    return (
      <Box className="risk-dashboard-section">
        <Box className="tb-pnl-toolbar">{periodToggle}</Box>
        <Box className="tb-pnl-empty" sx={{ padding: "24px 16px" }}>No data available</Box>
      </Box>
    );
  }

  return (
    <Box className="risk-dashboard-section">
      {periodToggle && (
        <Box className="tb-pnl-toolbar">{periodToggle}</Box>
      )}
      <Box className="tb-pnl-container">
        {/* Top 10 */}
        <Box className="tb-pnl-card">
          <Box className="tb-pnl-header tb-pnl-header--top">
            <TrendingUpIcon sx={{ fontSize: 20 }} />
            <span>Top 10 {label}</span>
          </Box>
          <Box className="tb-pnl-table-wrapper">
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
                      <span className="tb-pnl-rank-badge tb-pnl-rank-badge--top">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="tb-pnl-td tb-pnl-td--ticker">{item.ticker}</td>
                    <td className="tb-pnl-td tb-pnl-td--issuer">{item.issuer}</td>
                    <td className="tb-pnl-td tb-pnl-td--pnl tb-pnl-positive">
                      {formatFullCurrency(item[valueKey])}
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
          </Box>
        </Box>

        {/* Bottom 10 */}
        <Box className="tb-pnl-card">
          <Box className="tb-pnl-header tb-pnl-header--bottom">
            <TrendingDownIcon sx={{ fontSize: 20 }} />
            <span>Bottom 10 {label}</span>
          </Box>
          <Box className="tb-pnl-table-wrapper">
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
                      <span className="tb-pnl-rank-badge tb-pnl-rank-badge--bottom">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="tb-pnl-td tb-pnl-td--ticker">{item.ticker}</td>
                    <td className="tb-pnl-td tb-pnl-td--issuer">{item.issuer}</td>
                    <td className="tb-pnl-td tb-pnl-td--pnl tb-pnl-negative">
                      {formatFullCurrency(item[valueKey])}
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
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TopBottomPnLTable;
