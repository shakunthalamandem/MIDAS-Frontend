import React from "react";
import { Box, CircularProgress } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import type { TopBottomPnlTicker } from "./types";
import { formatFullCurrency } from "./utils";

interface TopBottomPnLTableProps {
  top10: TopBottomPnlTicker[];
  bottom10: TopBottomPnlTicker[];
  loading: boolean;
}

const TopBottomPnLTable: React.FC<TopBottomPnLTableProps> = ({
  top10,
  bottom10,
  loading,
}) => {
  if (loading) {
    return (
      <Box className="risk-dashboard-section">
        <Box className="risk-dashboard-loading" sx={{ minHeight: 200 }}>
          <CircularProgress size={32} />
        </Box>
      </Box>
    );
  }

  if (top10.length === 0 && bottom10.length === 0) {
    return null;
  }

  return (
    <Box className="risk-dashboard-section">
      <Box className="tb-pnl-container">
        {/* Top 10 */}
        <Box className="tb-pnl-card">
          <Box className="tb-pnl-header tb-pnl-header--top">
            <TrendingUpIcon sx={{ fontSize: 20 }} />
            <span>Top 10 P&L</span>
          </Box>
          <Box className="tb-pnl-table-wrapper">
            <table className="tb-pnl-table">
              <thead>
                <tr>
                  <th className="tb-pnl-th tb-pnl-th--rank">#</th>
                  <th className="tb-pnl-th tb-pnl-th--ticker">Ticker</th>
                  <th className="tb-pnl-th tb-pnl-th--issuer">Issuer</th>
                  <th className="tb-pnl-th tb-pnl-th--pnl">P&L</th>
                </tr>
              </thead>
              <tbody>
                {top10.map((item, idx) => (
                  <tr key={item.ticker} className="tb-pnl-row">
                    <td className="tb-pnl-td tb-pnl-td--rank">
                      <span className="tb-pnl-rank-badge tb-pnl-rank-badge--top">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="tb-pnl-td tb-pnl-td--ticker">{item.ticker}</td>
                    <td className="tb-pnl-td tb-pnl-td--issuer">{item.issuer}</td>
                    <td className="tb-pnl-td tb-pnl-td--pnl tb-pnl-positive">
                      {formatFullCurrency(item.pnl)}
                    </td>
                  </tr>
                ))}
                {top10.length === 0 && (
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
            <span>Bottom 10 P&L</span>
          </Box>
          <Box className="tb-pnl-table-wrapper">
            <table className="tb-pnl-table">
              <thead>
                <tr>
                  <th className="tb-pnl-th tb-pnl-th--rank">#</th>
                  <th className="tb-pnl-th tb-pnl-th--ticker">Ticker</th>
                  <th className="tb-pnl-th tb-pnl-th--issuer">Issuer</th>
                  <th className="tb-pnl-th tb-pnl-th--pnl">P&L</th>
                </tr>
              </thead>
              <tbody>
                {bottom10.map((item, idx) => (
                  <tr key={item.ticker} className="tb-pnl-row">
                    <td className="tb-pnl-td tb-pnl-td--rank">
                      <span className="tb-pnl-rank-badge tb-pnl-rank-badge--bottom">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="tb-pnl-td tb-pnl-td--ticker">{item.ticker}</td>
                    <td className="tb-pnl-td tb-pnl-td--issuer">{item.issuer}</td>
                    <td className="tb-pnl-td tb-pnl-td--pnl tb-pnl-negative">
                      {formatFullCurrency(item.pnl)}
                    </td>
                  </tr>
                ))}
                {bottom10.length === 0 && (
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
