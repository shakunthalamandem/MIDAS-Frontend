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
  Container,
} from "@mui/material";

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

interface FinancialForecastTableProps {
  defaultTicker?: string;
}

const FinancialForecastTable: React.FC<FinancialForecastTableProps> = ({
  defaultTicker = "CRWV",
}) => {
  const [forecastsInput, setForecastsInput] = useState(defaultTicker);
  const [forecastsTicker, setForecastsTicker] = useState(defaultTicker);
  const [forecasts, setForecasts] = useState<any | null>(null);
  const [forecastsLoading, setForecastsLoading] = useState(false);
  const [forecastsError, setForecastsError] = useState<string | null>(null);

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

  useEffect(() => {
    setForecastsInput(defaultTicker);
    setForecastsTicker(defaultTicker);
    handleFetchForecasts(defaultTicker);
    // eslint-disable-next-line
  }, [defaultTicker]);

  return (
    <Box>
      <Container sx={{ maxWidth: "xl", b: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, mt: 4 }} color="#002060" fontWeight={600} align="center">
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
                  ($US M)
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
      </Container>
    </Box>
  );
};

export default FinancialForecastTable;