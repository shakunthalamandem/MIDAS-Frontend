import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Button,
} from "@mui/material";

// Types for API response
type ComparableMetric = {
  ticker_names: string;
  price_usd: string;
  market_cap: number | null;
  ev_usd_million: number | null;
  present_year_ev_sales: number | null;
  one_year_later_ev_sales: number | null;
  present_year_price_earning: number | null;
  one_year_later_price_earning: number | null;
  present_year_ev_fcf: number | null;
  one_year_later_ev_fcf: number | null;
  sales_growth: number | null;
  eps_growth: number | null;
};

type ApiResponse = Record<string, ComparableMetric[]>;

// Table columns
const columns: { key: keyof ComparableMetric; label: string; isCurrency?: boolean; isPercentage?: boolean }[] = [
  { key: "ticker_names", label: "Ticker" },
  { key: "price_usd", label: "Price (USD)", isCurrency: true },
  { key: "market_cap", label: "Market Cap (USDm)", isCurrency: true },
  { key: "ev_usd_million", label: "EV (USDm)", isCurrency: true },
  { key: "present_year_ev_sales", label: "2025 EV/Sales" },
  { key: "one_year_later_ev_sales", label: "2026 EV/Sales" },
  { key: "present_year_price_earning", label: "2025 P/E" },
  { key: "one_year_later_price_earning", label: "2026 P/E" },
  { key: "present_year_ev_fcf", label: "2025 EV/FCF" },
  { key: "one_year_later_ev_fcf", label: "2026 EV/FCF" },
  { key: "sales_growth", label: "Sales Growth (25-26)", isPercentage: true },
  { key: "eps_growth", label: "EPS Growth (25-26)", isPercentage: true },
];

// Forecasts table columns
const forecastYearKeys = [
  "two_years_before",
  "one_year_before",
  "current_year",
  "one_year_later",
  "two_years_later",
  "three_years_later",
  "four_years_later",
  "five_years_later",
];

const forecastYearLabels = [
  "2023 A",
  "2024 A",
  "2025 E",
  "2026 E",
  "2027 E",
  "2028 E",
  "2029 E",
  "2030 E",
];

// Format function
const formatNumber = (
  value: number,
  isCurrency = false,
  isPercentage = false
): string => {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  let formattedValue: string;
  const absValue = Math.abs(value);

  if (absValue >= 1e9) {
    formattedValue = Number.isInteger(absValue / 1e9)
      ? `${(absValue / 1e9).toFixed(0)}B`
      : `${(absValue / 1e9).toFixed(1)}B`;
  } else if (absValue >= 1e6) {
    formattedValue = Number.isInteger(absValue / 1e6)
      ? `${(absValue / 1e6).toFixed(0)}M`
      : `${(absValue / 1e6).toFixed(1)}M`;
  } else if (absValue >= 1e3) {
    formattedValue = Number.isInteger(absValue / 1e3)
      ? `${(absValue / 1e3).toFixed(0)}K`
      : `${(absValue / 1e3).toFixed(1)}K`;
  } else {
    formattedValue = Number.isInteger(absValue)
      ? absValue.toFixed(0)
      : absValue.toFixed(2);
  }

  if (isCurrency) formattedValue = `$${formattedValue}`;
  if (isPercentage) formattedValue = `${value.toFixed(1)}%`;

  return value < 0 ? `-${formattedValue}` : formattedValue;
};

const IPODashboardMain: React.FC = () => {
  // Comparable Company Metrics state
  const [ticker, setTicker] = useState("AAPL");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Financial Forecasts state
  const [forecastsInput, setForecastsInput] = useState("CRWV");
  const [forecastsTicker, setForecastsTicker] = useState("CRWV");
  const [forecasts, setForecasts] = useState<any | null>(null);
  const [forecastsLoading, setForecastsLoading] = useState(false);
  const [forecastsError, setForecastsError] = useState<string | null>(null);

  // Fetch Comparable Company Metrics
  const handleFetch = async (customTicker?: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");
      if (!apiUrl) throw new Error("API URL not set");
      const response = await fetch(`${apiUrl}/api/companymetric_data_view/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker: customTicker ?? ticker }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || json.message || "Failed to fetch data");
      }
      setData(json);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Financial Forecasts
  const handleFetchForecasts = async (customTicker?: string) => {
    setForecastsLoading(true);
    setForecastsError(null);
    setForecasts(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");
      if (!apiUrl) throw new Error("API URL not set");
      const tickerToFetch = customTicker ?? forecastsInput;
      const response = await fetch(`${apiUrl}/api/financial_forecasts_data_view/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker: tickerToFetch }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || json.message || "Failed to fetch forecasts");
      }
      setForecasts(json);
      setForecastsTicker(tickerToFetch);
    } catch (e: any) {
      setForecastsError(e.message || "Unknown error");
    } finally {
      setForecastsLoading(false);
    }
  };

  // Fetch default data on mount
  useEffect(() => {
    handleFetch("AAPL");
    setForecastsInput("CRWV");
    setForecastsTicker("CRWV");
    handleFetchForecasts("CRWV");
    // eslint-disable-next-line
  }, []);

  // Check if there is no data for the ticker
  const noData =
    data &&
    Object.values(data).every((metrics) => !metrics || metrics.length === 0);

  return (
    <Box sx={{ p: 3, maxWidth: "1300px", margin: "auto" }}>
      {/* Comparable Company Metrics Table */}
      <Typography variant="h6" sx={{ mb: 2 }}>
         Comparative Trading Multiples & Performance Metrics
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          size="small"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading && ticker) {
              handleFetch();
            }
          }}
        />
        <Button
          variant="contained"
          onClick={() => handleFetch()}
          disabled={loading || !ticker}
        >
          Fetch
        </Button>
      </Box>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {noData && (
        <Alert severity="info">No data found for this ticker.</Alert>
      )}
      {!loading && !error && data && !noData && (
        <TableContainer component={Paper} elevation={4} sx={{ mb: 4 }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "#002060" }}>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      fontWeight: "bold",
                      color: "#FFFFFF",
                      border: "1px solid #000000",
                      textAlign: "center",
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(data).map(([tickerKey, metrics]) =>
                metrics.map((metric, idx) => (
                  <TableRow key={`${tickerKey}-${idx}`}>
                    {columns.map((col) => {
                      const value = metric[col.key];
                      return (
                        <TableCell
                          key={col.key}
                          align="center"
                          sx={{ border: "1px solid #000000" }}
                        >
                          {col.key === "price_usd"
                            ? value || "N/A"
                            : value === null ||
                              value === undefined ||
                              (typeof value === "number" && isNaN(value))
                            ? "N/A"
                            : typeof value === "number"
                            ? formatNumber(
                                value as number,
                                col.isCurrency,
                                col.isPercentage
                              )
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Financial Forecasts Table */}
      <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
        Financial Forecasts (FYE Dec 31, Internal Estimates) 
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Ticker"
          value={forecastsInput}
          onChange={(e) => setForecastsInput(e.target.value)}
          size="small"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !forecastsLoading && forecastsInput) {
              handleFetchForecasts();
            }
          }}
        />
        <Button
          variant="contained"
          onClick={() => handleFetchForecasts()}
          disabled={forecastsLoading || !forecastsInput}
        >
          Fetch 
        </Button>
      </Box>
      {forecastsLoading && <CircularProgress />}
      {forecastsError && <Alert severity="error">{forecastsError}</Alert>}
      {!forecastsLoading && forecasts && forecasts[forecastsTicker.toUpperCase()] && (
        <TableContainer component={Paper} elevation={4}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "#002060" }}>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    color: "#FFFFFF",
                    border: "1px solid #000000",
                    textAlign: "center",
                  }}
                >
                  $US M
                </TableCell>
                {forecastYearLabels.map((label) => (
                  <TableCell
                    key={label}
                    sx={{
                      fontWeight: "bold",
                      color: "#FFFFFF",
                      border: "1px solid #000000",
                      textAlign: "center",
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(forecasts[forecastsTicker.toUpperCase()] || {}).map(
                ([metricName, years]: [string, any]) => (
                  <TableRow key={metricName}>
                    <TableCell
                      sx={{ border: "1px solid #000000", fontWeight: "bold" }}
                    >
                      {metricName}
                    </TableCell>
                    {forecastYearKeys.map((yearKey) => (
                      <TableCell
                        key={yearKey}
                        align="center"
                        sx={{ border: "1px solid #000000" }}
                      >
                        {years[yearKey] !== null && years[yearKey] !== undefined
                          ? years[yearKey]
                          : "N/A"}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {!forecastsLoading && forecasts && !forecasts[forecastsTicker.toUpperCase()] && (
        <Alert severity="info">No forecasts found for this ticker.</Alert>
      )}
    </Box>
  );
};

export default IPODashboardMain;