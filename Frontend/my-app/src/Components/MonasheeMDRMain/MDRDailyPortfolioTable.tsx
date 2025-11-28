// MDRDailyPortfolioTable.tsx
import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

export interface MDRDailyPortfolioRow {
  ticker: string;
  type: string;
  deal_cap: string;
  days_held: number;
  current_shares: number;
  current_exposure: number;
  max_pct: number;
  gross_pct: number;
  excess_return_pct: number;
  dtd_pnl: number;
  cumulative_gross_pnl: number;
  cumulative_net_pnl: number;
  issue_price: number;
  avg_in_price: number;
  avg_exit_price: number | null;
  current_price: number | null;
  ultimate_stop: number | null;
  target_price: number | null;
}

interface Props {
  rows: MDRDailyPortfolioRow[];
  hasApplied: boolean;
  loading: boolean;
}

const PRIMARY_COLOR = "#002060";

const formatNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
};

const isNegative = (value: number | null | undefined) =>
  value !== null && value !== undefined && value < 0;

const MDRDailyPortfolioTable: React.FC<Props> = ({
  rows,
  hasApplied,
  loading,
}) => {
  if (!hasApplied) return null;

  return (
    <TableContainer
      component={Paper}
      elevation={1}
      sx={{ borderRadius: 2, maxHeight: 500, overflow: "auto" }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}>
              Ticker
            </TableCell>
            <TableCell sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}>
              Type
            </TableCell>
            <TableCell sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}>
              Deal Capt
            </TableCell>
            <TableCell
              sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
              align="right"
            >
              Days Held
            </TableCell>

            <TableCell
              sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
              align="right"
            >
              Current Shares
            </TableCell>
            <TableCell
              sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
              align="right"
            >
              Current $ Exposure
            </TableCell>
            <TableCell
              sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
              align="right"
            >
              % Max
            </TableCell>

            <TableCell
              sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
              align="right"
            >
              Gross %
            </TableCell>
            <TableCell
              sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
              align="right"
            >
              Excess Return %
            </TableCell>
            <TableCell
              sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
              align="right"
            >
              DTD P&amp;L
            </TableCell>
            <TableCell
              sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
              align="right"
            >
              Cumulative Gross $ P&amp;L
            </TableCell>
            <TableCell
              sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
              align="right"
            >
              Cumulative Net $ P&amp;L
            </TableCell>

            <TableCell
              sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
              align="right"
            >
              Issue Price
            </TableCell>
            <TableCell
              sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
              align="right"
            >
              Avg. In Price
            </TableCell>
            <TableCell
              sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
              align="right"
            >
              Avg. Exit Price
            </TableCell>
            <TableCell
              sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
              align="right"
            >
              Current Price
            </TableCell>
            <TableCell
              sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
              align="right"
            >
              Ultimate Stop
            </TableCell>
            <TableCell
              sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
              align="right"
            >
              Target Price
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length === 0 && !loading ? (
            <TableRow>
              <TableCell colSpan={18} align="center">
                No data available for selected filters.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={`${row.ticker}-${index}`}>
                <TableCell>{row.ticker}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.deal_cap}</TableCell>
                <TableCell align="right">
                  {formatNumber(row.days_held)}
                </TableCell>

                <TableCell align="right">
                  {formatNumber(row.current_shares)}
                </TableCell>
                <TableCell align="right">
                  {formatNumber(row.current_exposure)}
                </TableCell>
                <TableCell align="right">
                  {formatNumber(row.max_pct)}%
                </TableCell>

                <TableCell
                  align="right"
                  sx={{ color: isNegative(row.gross_pct) ? "red" : "inherit" }}
                >
                  {formatNumber(row.gross_pct)}%
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: isNegative(row.excess_return_pct)
                      ? "red"
                      : "inherit",
                  }}
                >
                  {formatNumber(row.excess_return_pct)}%
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: isNegative(row.dtd_pnl) ? "red" : "inherit" }}
                >
                  {formatNumber(row.dtd_pnl)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: isNegative(row.cumulative_gross_pnl)
                      ? "red"
                      : "inherit",
                  }}
                >
                  {formatNumber(row.cumulative_gross_pnl)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: isNegative(row.cumulative_net_pnl)
                      ? "red"
                      : "inherit",
                  }}
                >
                  {formatNumber(row.cumulative_net_pnl)}
                </TableCell>

                <TableCell align="right">
                  {formatNumber(row.issue_price)}
                </TableCell>
                <TableCell align="right">
                  {formatNumber(row.avg_in_price)}
                </TableCell>
                <TableCell align="right">
                  {formatNumber(row.avg_exit_price)}
                </TableCell>
                <TableCell align="right">
                  {formatNumber(row.current_price)}
                </TableCell>
                <TableCell align="right">
                  {formatNumber(row.ultimate_stop)}
                </TableCell>
                <TableCell align="right">
                  {formatNumber(row.target_price)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MDRDailyPortfolioTable;
