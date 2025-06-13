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

} from "@mui/material";

// Types for API response
type ComparableMetric = {
  competitor: string;
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

const columns: { key: keyof ComparableMetric; label: string; isCurrency?: boolean; isPercentage?: boolean }[] = [
  { key: "competitor", label: "Ticker" },
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

const columnsWithX = new Set([
  "present_year_ev_sales",
  "one_year_later_ev_sales",
  "present_year_price_earning",
  "one_year_later_price_earning",
  "present_year_ev_fcf",
  "one_year_later_ev_fcf",
]);

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

const IPODashboardMainTable: React.FC = () => {
  const [ticker, setTicker] = useState("CRWV");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    handleFetch("CRWV");
    // eslint-disable-next-line
  }, []);

  const noData =
    data &&
    Object.values(data).every((metrics) => !metrics || metrics.length === 0);

  return (
    <Box sx={{ p: 0, width: "100%" }}>
      {/* Comparable Company Metrics Table */}
      <Typography variant="h6" sx={{ mb: 2 }} color="#002060" align="center" fontWeight={600}>
        Comparative Trading Multiples & Performance Metrics
      </Typography>
    
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {noData && (
        <Alert severity="info">No data found for this ticker.</Alert>
      )}
      {!loading && !error && data && !noData && (
        <TableContainer component={Paper} elevation={4} sx={{ mb: 4, width: "100%" }}>
          <Table size="small" sx={{ width: "100%" }}>
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
                      // Add 'x' for specific columns, show N/A if null
                      if (columnsWithX.has(col.key)) {
                        return (
                          <TableCell
                            key={col.key}
                            align="center"
                            sx={{ border: "1px solid #000000" }}
                          >
                            {value === null ||
                            value === undefined ||
                            (typeof value === "number" && isNaN(value))
                              ? "N/A"
                              : `${formatNumber(
                                  value as number,
                                  col.isCurrency,
                                  col.isPercentage
                                )}x`}
                          </TableCell>
                        );
                      }
                      // Default rendering for other columns
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
    </Box>
  );
};

export default IPODashboardMainTable;