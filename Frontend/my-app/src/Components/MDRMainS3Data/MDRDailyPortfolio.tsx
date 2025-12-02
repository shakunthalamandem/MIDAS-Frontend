// MDRDailyPortfolio.tsx
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

/* ---------- Shared Types ---------- */

export interface MDRDailyPortfolioRow {
  ticker: string;
  type: string;
  dealCap: string;
  daysHeld: number;
  currentShares: number;
  currentExposure: number;
  maxPercent: string; // "%max"
  grossPercent: string; // "gross%"
  excessReturnPercent: string;
  dtdPnl: number;
  cumulativeGrossPnl: number;
  cumulativeNetPnl: number;
  issuePrice: number;
  avgInPrice: number;
  avgExitPrice: number;
  currentPrice: number;
  ultimateStop: number;
  targetPrice: number;
}

/* ---------- Presentational Table Component ---------- */

interface MDRDailyPortfolioTableProps {
  rows: MDRDailyPortfolioRow[];
  tradeDate: string;
  loading: boolean;
  error?: string | null;
  onTradeDateChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
}

const HEADER_BG = "#f0f3ff";
const HEADER_TEXT = "#002060";

const formatNumber = (value: number, decimals = 0) =>
  Number.isFinite(value)
    ? value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : "-";

const MDRDailyPortfolioTable: React.FC<MDRDailyPortfolioTableProps> = ({
  rows,
  tradeDate,
  loading,
  error,
  onTradeDateChange,
  onApply,
  onReset,
}) => {
  const totals = useMemo(() => {
    const totalExposure = rows.reduce(
      (acc, r) => acc + (r.currentExposure || 0),
      0
    );
    const totalDtdPnl = rows.reduce((acc, r) => acc + (r.dtdPnl || 0), 0);
    const totalGrossPnl = rows.reduce(
      (acc, r) => acc + (r.cumulativeGrossPnl || 0),
      0
    );
    const totalNetPnl = rows.reduce(
      (acc, r) => acc + (r.cumulativeNetPnl || 0),
      0
    );
    return { totalExposure, totalDtdPnl, totalGrossPnl, totalNetPnl };
  }, [rows]);

  return (
    <Box component={Paper} sx={{ p: 2 }}>
      <Stack spacing={2}>
        {/* Header + Filters */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6" fontWeight={600} color={HEADER_TEXT}>
            Daily Portfolio
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Trade Date"
              type="date"
              size="small"
              value={tradeDate}
              onChange={(e) => onTradeDateChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" onClick={onApply} disabled={loading}>
              Apply
            </Button>
            <Button variant="outlined" onClick={onReset} disabled={loading}>
              Reset
            </Button>
          </Stack>
        </Stack>

        {/* Summary Tokens */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            label={`Total Exposure: ${formatNumber(
              totals.totalExposure,
              2
            )}`}
            variant="outlined"
          />
          <Chip
            label={`Total DTD P&L: ${formatNumber(totals.totalDtdPnl, 2)}`}
            variant="outlined"
            sx={{
              color:
                totals.totalDtdPnl > 0
                  ? "success.main"
                  : totals.totalDtdPnl < 0
                  ? "error.main"
                  : undefined,
            }}
          />
          <Chip
            label={`Total Gross P&L: ${formatNumber(
              totals.totalGrossPnl,
              2
            )}`}
            variant="outlined"
          />
          <Chip
            label={`Total Net P&L: ${formatNumber(totals.totalNetPnl, 2)}`}
            variant="outlined"
          />
        </Stack>

        {error && (
          <Alert severity="error" variant="outlined">
            {error}
          </Alert>
        )}

        {/* Table */}
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              {/* Top title row, like screenshot */}
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={18}
                  sx={{
                    backgroundColor: HEADER_BG,
                    color: HEADER_TEXT,
                    fontWeight: 700,
                    borderBottom: "1px solid #d0d4e6",
                    fontSize: 14,
                  }}
                >
                  Daily Portfolio
                </TableCell>
              </TableRow>

              {/* Group headers */}
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={4}
                  sx={{
                    backgroundColor: HEADER_BG,
                    color: HEADER_TEXT,
                    fontWeight: 600,
                    borderRight: "1px solid #d0d4e6",
                  }}
                >
                  Deal Information
                </TableCell>
                <TableCell
                  align="center"
                  colSpan={3}
                  sx={{
                    backgroundColor: HEADER_BG,
                    color: HEADER_TEXT,
                    fontWeight: 600,
                    borderRight: "1px solid #d0d4e6",
                  }}
                >
                  Current Position
                </TableCell>
                <TableCell
                  align="center"
                  colSpan={5}
                  sx={{
                    backgroundColor: HEADER_BG,
                    color: HEADER_TEXT,
                    fontWeight: 600,
                    borderRight: "1px solid #d0d4e6",
                  }}
                >
                  Net vs. Gross P&amp;L at Position Level
                </TableCell>
                <TableCell
                  align="center"
                  colSpan={6}
                  sx={{
                    backgroundColor: HEADER_BG,
                    color: HEADER_TEXT,
                    fontWeight: 600,
                  }}
                >
                  Pricing{" "}
                  <Typography
                    component="span"
                    sx={{ fontWeight: 600, color: HEADER_TEXT }}
                  >
                    (Local Currency)
                  </Typography>
                </TableCell>
              </TableRow>

              {/* Column headers */}
              <TableRow>
                {/* Deal Information */}
                <TableCell sx={{ backgroundColor: HEADER_BG }}>
                  Ticker
                </TableCell>
                <TableCell sx={{ backgroundColor: HEADER_BG }}>Type</TableCell>
                <TableCell sx={{ backgroundColor: HEADER_BG }}>
                  Deal Capt
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ backgroundColor: HEADER_BG }}
                >
                  Days Held
                </TableCell>

                {/* Current Position */}
                <TableCell
                  align="right"
                  sx={{ backgroundColor: HEADER_BG }}
                >
                  Current Shares
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ backgroundColor: HEADER_BG }}
                >
                  Current $ Exposure
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ backgroundColor: HEADER_BG }}
                >
                  % Max
                </TableCell>

                {/* Net vs Gross P&L */}
                <TableCell
                  align="right"
                  sx={{ backgroundColor: HEADER_BG }}
                >
                  Gross %
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ backgroundColor: HEADER_BG }}
                >
                  Excess Return %
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ backgroundColor: HEADER_BG }}
                >
                  DTD P&amp;L
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ backgroundColor: HEADER_BG }}
                >
                  Cumulative Gross P&amp;L
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ backgroundColor: HEADER_BG }}
                >
                  Cumulative Net P&amp;L
                </TableCell>

                {/* Pricing */}
                <TableCell
                  align="right"
                  sx={{ backgroundColor: HEADER_BG }}
                >
                  Issue Price
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ backgroundColor: HEADER_BG }}
                >
                  Avg. In Price
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ backgroundColor: HEADER_BG }}
                >
                  Avg. Exit Price
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ backgroundColor: HEADER_BG }}
                >
                  Current Price
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ backgroundColor: HEADER_BG }}
                >
                  Ultimate Stop
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ backgroundColor: HEADER_BG }}
                >
                  Target Price
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={18} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No data. Please select a trade date and click Apply.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {rows.map((row) => (
                <TableRow key={`${row.ticker}-${row.dealCap}`}>
                  {/* Deal Info */}
                  <TableCell>{row.ticker}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.dealCap}</TableCell>
                  <TableCell align="right">{row.daysHeld}</TableCell>

                  {/* Current Position */}
                  <TableCell align="right">
                    {formatNumber(row.currentShares, 0)}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(row.currentExposure, 2)}
                  </TableCell>
                  <TableCell align="right">{row.maxPercent}</TableCell>

                  {/* Net vs Gross P&L */}
                  <TableCell align="right">{row.grossPercent}</TableCell>
                  <TableCell align="right">
                    {row.excessReturnPercent}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color:
                        row.dtdPnl > 0
                          ? "success.main"
                          : row.dtdPnl < 0
                          ? "error.main"
                          : undefined,
                    }}
                  >
                    {formatNumber(row.dtdPnl, 2)}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(row.cumulativeGrossPnl, 2)}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(row.cumulativeNetPnl, 2)}
                  </TableCell>

                  {/* Pricing */}
                  <TableCell align="right">
                    {formatNumber(row.issuePrice, 4)}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(row.avgInPrice, 4)}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(row.avgExitPrice, 4)}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(row.currentPrice, 4)}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(row.ultimateStop, 4)}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(row.targetPrice, 4)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Box>
  );
};

/* ---------- Container Component (API + sample data) ---------- */

// SAMPLE DATA so you can see UI before wiring real API
const SAMPLE_ROWS: MDRDailyPortfolioRow[] = [
  {
    ticker: "ILS US",
    type: "Cash",
    dealCap: "CASH",
    daysHeld: 0,
    currentShares: 621927.89,
    currentExposure: 193043.3901,
    maxPercent: "0.0%",
    grossPercent: "0.0%",
    excessReturnPercent: "0.0%",
    dtdPnl: 257.3114,
    cumulativeGrossPnl: 193043.3901,
    cumulativeNetPnl: 0.0,
    issuePrice: 1.0,
    avgInPrice: 0.272609,
    avgExitPrice: 0.0,
    currentPrice: 1.0,
    ultimateStop: 0.0,
    targetPrice: 0.0,
  },
  {
    ticker: "JPY US",
    type: "Cash",
    dealCap: "CASH",
    daysHeld: 0,
    currentShares: 193188164.0,
    currentExposure: 1253491.851,
    maxPercent: "0.0%",
    grossPercent: "0.0%",
    excessReturnPercent: "0.0%",
    dtdPnl: -569.584093,
    cumulativeGrossPnl: 1253491.851,
    cumulativeNetPnl: 0.0,
    issuePrice: 1.0,
    avgInPrice: 0.006699,
    avgExitPrice: 0.0,
    currentPrice: 1.0,
    ultimateStop: 0.0,
    targetPrice: 0.0,
  },
];

const normalizeRow = (raw: any): MDRDailyPortfolioRow => ({
  ticker: raw.ticker ?? "",
  type: raw.type ?? "",
  dealCap: raw.deal_cap ?? raw.dealCap ?? "",
  daysHeld: Number(raw.days_held ?? raw.daysHeld ?? 0),
  currentShares: Number(raw.current_shares ?? raw.currentShares ?? 0),
  currentExposure: Number(raw.current_exposure ?? raw.currentExposure ?? 0),
  maxPercent: raw["%max"] ?? raw.maxPercent ?? "0.0%",
  grossPercent: raw["gross%"] ?? raw.grossPercent ?? "0.0%",
  excessReturnPercent:
    raw["excess_return%"] ?? raw.excessReturnPercent ?? "0.0%",
  dtdPnl: Number(raw.dtd_pnl ?? raw.dtdPnl ?? 0),
  cumulativeGrossPnl: Number(
    raw.cumulative_gross_pnl ?? raw.cumulativeGrossPnl ?? 0
  ),
  cumulativeNetPnl: Number(
    raw.cumulative_net_pnl ?? raw.cumulativeNetPnl ?? 0
  ),
  issuePrice: Number(raw.issue_price ?? raw.issuePrice ?? 0),
  avgInPrice: Number(raw.avg_in_price ?? raw.avgInPrice ?? 0),
  avgExitPrice: Number(raw.avg_exit_price ?? raw.avgExitPrice ?? 0),
  currentPrice: Number(raw.current_price ?? raw.currentPrice ?? 0),
  ultimateStop: Number(raw.ultimate_stop ?? raw.ultimateStop ?? 0),
  targetPrice: Number(raw.target_price ?? raw.targetPrice ?? 0),
});

export const MDRDailyPortfolio: React.FC = () => {
  const [tradeDate, setTradeDate] = useState<string>("");
  const [rows, setRows] = useState<MDRDailyPortfolioRow[]>(SAMPLE_ROWS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL ?? "";
  const getToken = () => localStorage.getItem("access_token") || "";

  const handleApply = useCallback(async () => {
    if (!tradeDate) {
      setError("Please select a trade date");
      return;
    }

    const payload = { trade_date: tradeDate };

    try {
      setError(null);
      setLoading(true);

      const token = getToken();

      const response = await fetch(`${apiUrl}/api/mdr_daily_portfolio/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to fetch portfolio data");
      }

      const data = await response.json();
      const rawRows: any[] = Array.isArray(data)
        ? data
        : data.daily_portfolio || data.results || [];
      const portfolioRows: MDRDailyPortfolioRow[] = rawRows.map(normalizeRow);

      setRows(portfolioRows);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, tradeDate]);

  const handleReset = useCallback(() => {
    setTradeDate("");
    setRows(SAMPLE_ROWS); // back to sample data
    setError(null);
  }, []);

  return (
    <MDRDailyPortfolioTable
      rows={rows}
      tradeDate={tradeDate}
      loading={loading}
      error={error}
      onTradeDateChange={setTradeDate}
      onApply={handleApply}
      onReset={handleReset}
    />
  );
};

export default MDRDailyPortfolio;
