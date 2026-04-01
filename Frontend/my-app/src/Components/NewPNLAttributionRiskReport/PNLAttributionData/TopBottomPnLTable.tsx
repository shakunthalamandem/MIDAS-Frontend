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

interface TopBottomPnLTableProps {
  top10: TopBottomPnlTicker[];
  bottom10: TopBottomPnlTicker[];
  loading: boolean;
  category?: DashboardCategory;
  metricTop10?: TopBottomMetricTicker[];
  metricBottom10?: TopBottomMetricTicker[];
  metricLoading?: boolean;
}

const TopBottomPnLTable: React.FC<TopBottomPnLTableProps> = ({
  top10,
  bottom10,
  loading,
  category = "pnl",
  metricTop10 = [],
  metricBottom10 = [],
  metricLoading = false,
}) => {
  const isPnl = category === "pnl";
  const activeTop = isPnl ? top10 : metricTop10;
  const activeBottom = isPnl ? bottom10 : metricBottom10;
  const activeLoading = isPnl ? loading : metricLoading;
  const label = CATEGORY_LABELS[category] || "P&L (Gross)";
  const valueKey = isPnl ? "pnl" : "value";

  if (activeLoading) {
    return (
      <Box className="risk-dashboard-section">
        <Box className="risk-dashboard-loading" sx={{ minHeight: 200 }}>
          <CircularProgress size={32} />
        </Box>
      </Box>
    );
  }

  if (activeTop.length === 0 && activeBottom.length === 0) {
    return null;
  }

  return (
    <Box className="risk-dashboard-section">
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
