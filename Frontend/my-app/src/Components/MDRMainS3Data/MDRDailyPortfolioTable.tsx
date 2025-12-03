// MDRDailyPortfolioTable.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

export interface MDRDailyPortfolioRow {
  ticker: string;
  type: string;
  dealCap: string;
  daysHeld: number;
  currentShares: number;
  currentExposure: number;
  maxPercent: string;
  grossPercent: string;
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

export interface MDRDailyPortfolioTableProps {
  rows: MDRDailyPortfolioRow[];
  tradeDate: string;
  loading: boolean;
  error?: string | null;
  onTradeDateChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
}

const PRIMARY_COLOR = "#002060";
const HEADER_BG = "#f0f3ff";
const HEADER_TEXT = "#002060";

const formatNumber = (value: number, decimals = 0) =>
  Number.isFinite(value)
    ? value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : "-";

export const MDRDailyPortfolioTable: React.FC<MDRDailyPortfolioTableProps> = ({
  rows,
  tradeDate,
  loading,
  error,
  onTradeDateChange,
  onApply,
  onReset,
}) => {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const rowsPerPage = 20;

  // Unique tickers from response
  const tickerOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.ticker)))
        .filter(Boolean)
        .sort(),
    [rows]
  );

  // If backend data changes and the previously selected ticker disappears, clear it
  useEffect(() => {
    if (selectedTicker && !tickerOptions.includes(selectedTicker)) {
      setSelectedTicker(null);
      setPage(0);
    }
  }, [tickerOptions, selectedTicker]);

  // Filter rows by selected ticker
  const filteredRows = useMemo(() => {
    if (!selectedTicker) return rows;
    return rows.filter((r) => r.ticker === selectedTicker);
  }, [rows, selectedTicker]);

  // Paginate
  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleResetClick = () => {
    setSelectedTicker(null);
    setPage(0);
    onReset();
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
      <Stack spacing={3}>
        {/* Title */}
        <Typography
          variant="h6"
          align="center"
          sx={{
            fontWeight: 600,
            color: PRIMARY_COLOR,
            letterSpacing: 0.5,
          }}
        >
        Monahsee Daily Portfolio Report
        </Typography>

        {/* Ticker Select + Controls */}
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={2}
          alignItems="center"
        >
          {/* Ticker Autocomplete driven by response tickers */}
          <Autocomplete
            size="small"
            options={tickerOptions}
            value={selectedTicker}
            onChange={(_event, value) => {
              setSelectedTicker(value);
              setPage(0);
            }}
            sx={{ minWidth: 260 }}
            disabled={rows.length === 0}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Ticker"
                placeholder="Select ticker"
              />
            )}
          />

          {/* Date + Buttons */}
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Trade Date"
              type="date"
              size="small"
              value={tradeDate}
              onChange={(e) => onTradeDateChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <Button
              variant="contained"
              disabled={loading}
              onClick={onApply}
                            sx={{
                                minWidth: 100,
                                fontWeight: 600,
                                backgroundColor: '#002060',  // Set the background color
                                '&:hover': {
                                    backgroundColor: '#001540',  // Darker shade for hover effect (optional)
                                },
                            }}
            >
              APPLY
            </Button>

            <Button
              variant="outlined"
              disabled={loading}
              onClick={handleResetClick}
              sx={{ minWidth: 100, fontWeight: 600 }}
            >
              RESET
            </Button>
          </Stack>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        {/* Table */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            mt: 1,
            borderRadius: 2,
            overflowX: "auto", // auto scrollbars if columns overflow
          }}
        >
          <Table size="small" sx={{ minWidth: 1200 }}>
            <TableHead>
              {/* Group headers */}
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                  sx={{
                    backgroundColor: HEADER_BG,
                    color: HEADER_TEXT,
                    fontWeight: 700,
                    fontSize: 16,
                    borderRight: "1px solid #c0c6e0",
                  }}
                >
                  Deal Information
                </TableCell>
                <TableCell
                  colSpan={3}
                  align="center"
                  sx={{
                    backgroundColor: HEADER_BG,
                    color: HEADER_TEXT,
                    fontWeight: 700,
                    fontSize: 16,
                    borderRight: "1px solid #c0c6e0",
                    borderLeft: "1px solid #c0c6e0",
                  }}
                >
                  Current Position
                </TableCell>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{
                    backgroundColor: HEADER_BG,
                    color: HEADER_TEXT,
                    fontWeight: 700,
                    fontSize: 16,
                    borderRight: "1px solid #c0c6e0",
                    borderLeft: "1px solid #c0c6e0",
                  }}
                >
                  Net vs Gross P&amp;L
                </TableCell>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{
                    backgroundColor: HEADER_BG,
                    color: HEADER_TEXT,
                    fontWeight: 700,
                    fontSize: 16,
                    borderLeft: "1px solid #c0c6e0",
                  }}
                >
                  Pricing{" "}
                  <Typography
                    component="span"
                    sx={{ fontWeight: 700, color: HEADER_TEXT }}
                  >
                    (Local Currency)
                  </Typography>
                </TableCell>
              </TableRow>

              {/* Column headers */}
              <TableRow>
                <TableCell
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Ticker
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Type
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Deal Capt
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Days Held
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Current Shares
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Current $ Exposure
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  % Max
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Gross %
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Excess Return %
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  DTD P&amp;L
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Cumulative Gross P&amp;L
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Cumulative Net P&amp;L
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Issue Price
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Avg In Price
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Avg Exit Price
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Current Price
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Ultimate Stop
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    backgroundColor: HEADER_BG,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Target Price
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {pagedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={18} align="center">
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 2 }}
                    >
                      No data. Adjust filters or select a trade date and click
                      Apply.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {pagedRows.map((row, index) => (
                <TableRow
                  key={`${row.ticker}-${row.dealCap}-${index}`}
                  sx={{
                    "&:hover": { backgroundColor: "#f9fafc" },
                  }}
                >
                  <TableCell>{row.ticker}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.dealCap}</TableCell>
                  <TableCell align="right">{row.daysHeld}</TableCell>
                  <TableCell align="right">
                    {formatNumber(row.currentShares)}
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(row.currentExposure, 2)}
                  </TableCell>
                  <TableCell align="right">{row.maxPercent}</TableCell>
                  <TableCell align="right">{row.grossPercent}</TableCell>
                  <TableCell align="right">
                    {row.excessReturnPercent}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color:
                        row.dtdPnl > 0
                          ? "green"
                          : row.dtdPnl < 0
                          ? "red"
                          : "inherit",
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

          {/* Pagination: fixed 20 rows per page */}
          <TablePagination
            component="div"
            rowsPerPageOptions={[rowsPerPage]}
            rowsPerPage={rowsPerPage}
            count={filteredRows.length}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={() => {}}
          />
        </TableContainer>
      </Stack>
    </Paper>
  );
};
