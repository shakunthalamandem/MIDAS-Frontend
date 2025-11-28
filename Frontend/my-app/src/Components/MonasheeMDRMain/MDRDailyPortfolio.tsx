// MDRDailyPortfolio.tsx
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";

const PRIMARY_COLOR = "#002060";

interface MDRDailyPortfolioRow {
  ticker: string;
  type: string;
  deal_cap: string; // "Deal Capt" in UI
  days_held: number;
  current_shares: number;
  current_exposure: number;
  max_pct: number; // % Max
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
  // add other fields from API if needed
}

interface FilterState {
  tradeDate: string;
  fund: string;
  asset: string;
  region: string;
}

const initialFilters: FilterState = {
  tradeDate: "",
  fund: "",
  asset: "",
  region: "",
};

const MDRDailyPortfolio: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [rows, setRows] = useState<MDRDailyPortfolioRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleChange =
    (field: keyof FilterState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "";
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(value);
  };

  const isNegative = (value: number | null | undefined) =>
    value !== null && value !== undefined && value < 0;

  const handleApply = async () => {
    setHasApplied(true);
    setError(null);

    if (!apiUrl) {
      setError("API URL is not defined in environment variables");
      return;
    }

    const payload = {
      trade_date: filters.tradeDate,
      fund: filters.fund || null,
      asset: filters.asset || null,
      region: filters.region || null,
    };

    try {
      setLoading(true);

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

      // Assuming the API returns { results: [...] } or just an array
      const portfolioRows: MDRDailyPortfolioRow[] =
        Array.isArray(data) ? data : data.results || [];

      setRows(portfolioRows);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setRows([]);
    setError(null);
    setHasApplied(false);
  };

  // Dummy options – replace with values from your API / config
  const fundOptions = ["Fund A", "Fund B", "Fund C"];
  const assetOptions = ["Equity", "Fixed Income", "Derivatives"];
  const regionOptions = ["APAC", "EMEA", "Americas"];

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f6fa" }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: "#ffffff",
        }}
      >
        {/* Header */}
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: PRIMARY_COLOR,
          }}
        >
          Daily Portfolio
        </Typography>

        {/* Filters */}
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            backgroundColor: "#f0f3ff",
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Trade Date"
                type="date"
                value={filters.tradeDate}
                onChange={handleChange("tradeDate")}
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Fund"
                value={filters.fund}
                onChange={handleChange("fund")}
                fullWidth
                size="small"
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {fundOptions.map((f) => (
                  <MenuItem key={f} value={f}>
                    {f}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Asset"
                value={filters.asset}
                onChange={handleChange("asset")}
                fullWidth
                size="small"
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {assetOptions.map((a) => (
                  <MenuItem key={a} value={a}>
                    {a}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Region"
                value={filters.region}
                onChange={handleChange("region")}
                fullWidth
                size="small"
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {regionOptions.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Buttons */}
            <Grid
              item
              xs={12}
              md={12}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 1,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{
                  textTransform: "none",
                  borderColor: PRIMARY_COLOR,
                  color: PRIMARY_COLOR,
                  "&:hover": {
                    borderColor: PRIMARY_COLOR,
                    backgroundColor: "rgba(0,32,96,0.05)",
                  },
                }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={handleApply}
                sx={{
                  textTransform: "none",
                  backgroundColor: PRIMARY_COLOR,
                  "&:hover": {
                    backgroundColor: "#001540",
                  },
                }}
                disabled={!filters.tradeDate || loading}
              >
                {loading ? (
                  <CircularProgress size={20} sx={{ color: "#ffffff" }} />
                ) : (
                  "Apply"
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Error */}
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* Table */}
        {hasApplied && (
          <TableContainer
            component={Paper}
            elevation={1}
            sx={{
              borderRadius: 2,
              maxHeight: 500,
              overflow: "auto",
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {/* Deal Information */}
                  <TableCell
                    sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
                  >
                    Ticker
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
                  >
                    Type
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
                  >
                    Deal Capt
                  </TableCell>
                  <TableCell
                    sx={{ backgroundColor: PRIMARY_COLOR, color: "#fff" }}
                    align="right"
                  >
                    Days Held
                  </TableCell>

                  {/* Current Position */}
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

                  {/* Net vs Gross P&L */}
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

                  {/* Pricing (Local Currency) */}
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
                        sx={{
                          color: isNegative(row.gross_pct) ? "red" : "inherit",
                        }}
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
                        sx={{
                          color: isNegative(row.dtd_pnl) ? "red" : "inherit",
                        }}
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
        )}
      </Paper>
    </Box>
  );
};

export default MDRDailyPortfolio;
