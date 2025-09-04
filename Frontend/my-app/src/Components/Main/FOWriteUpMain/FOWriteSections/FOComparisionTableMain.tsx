// FOComparisionTableMain.tsx

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
  CircularProgress,
  Alert,
  Fade,
  Typography,
} from "@mui/material";

interface FOComparisionTableMainProps {
  ticker: string;
  deal_id: string;
}

type ComparableMetric = {
  ticker: string;
  competitor: string;
  price_usd: string;
  market_cap: number | null;
  ev_usd_million: number | null;
  present_year_ev_sales: number | null;
  one_year_later_ev_sales: number | null;
  present_year_price_earning: number | null;
  one_year_later_price_earning: number | null;
  present_year_ev_ebitda: number | null;
  one_year_later_ev_ebitda: number | null;
  sales_growth: number | null;
  eps_growth: number | null;
  ai_generated: boolean;
};

type AveragesType = {
  [key: string]: {
    average?: number;
    median?: number;
  };
};

type ApiResponse = {
  [ticker: string]: {
    data: ComparableMetric[];
    Averages?: AveragesType;
  };
};

const columnsWithX = new Set([
  "present_year_ev_sales",
  "one_year_later_ev_sales",
  "present_year_price_earning",
  "one_year_later_price_earning",
  "present_year_ev_ebitda",
  "one_year_later_ev_ebitda",
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
    formattedValue = `${(absValue / 1e9).toFixed(1)}B`;
  } else if (absValue >= 1e6) {
    formattedValue = `${(absValue / 1e6).toFixed(1)}M`;
  } else if (absValue >= 1e3) {
    formattedValue = `${(absValue / 1e3).toFixed(1)}K`;
  } else {
    formattedValue = absValue.toFixed(1);
  }

  if (isCurrency) formattedValue = `$${formattedValue}`;
  if (isPercentage) formattedValue = `${value.toFixed(1)}%`;

  return value < 0 ? `-${formattedValue}` : formattedValue;
};

const getColumns = (
  ticker: string,
  ai_generated: boolean
): {
  key: keyof ComparableMetric;
  label: string;
  isCurrency?: boolean;
  isPercentage?: boolean;
}[] => [
  { key: "competitor", label: "Ticker" },
  { key: "price_usd", label: "Price (USD)", isCurrency: true },
  { key: "market_cap", label: "Market Cap (USDm)", isCurrency: true },
  { key: "ev_usd_million", label: "EV (USDm)", isCurrency: true },
  { key: "present_year_ev_sales", label: "2025 EV/Sales" },
  { key: "one_year_later_ev_sales", label: "2026 EV/Sales" },
  { key: "present_year_price_earning", label: "2025 P/E" },
  { key: "one_year_later_price_earning", label: "2026 P/E" },
  {
    key: "present_year_ev_ebitda",
    label: "2025 EV/EBITDA",
  },
  {
    key: "one_year_later_ev_ebitda",
    label: "2026 EV/EBITDA",
  },
  { key: "sales_growth", label: "Sales Growth (25–26)", isPercentage: true },
  { key: "eps_growth", label: "EPS Growth (25–26)", isPercentage: true },
];

const FOComparisionTableMain: React.FC<FOComparisionTableMainProps> = ({
  ticker,
  deal_id,
}) => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        if (!apiUrl) throw new Error("API URL not set");
        const response = await fetch(`${apiUrl}/api/fo_companymetric_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker, deal_id }),
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

    fetchData();
  }, [ticker, deal_id]);

  const noData =
    data &&
    Object.values(data).every(
      (metrics) => !metrics.data || metrics.data.length === 0
    );

  const ai_generated =
    data?.[ticker]?.data?.some((item) => item.ai_generated) || false;

  const columns = getColumns(ticker, ai_generated);

  // Extract averages for the main ticker if available
  const averages: AveragesType | undefined = data?.[ticker]?.Averages;

  return (
    <Box sx={{ p: 0, width: "100%" }}>
      <Typography
        variant="h6"
        color="#002060"
        fontWeight={600}
        sx={{ whiteSpace: "nowrap", mb: 2, textAlign: "center" }}
      >
        Comparative Trading Multiples & Performance Metrics
      </Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {noData && <Alert severity="info">No data found for this ticker.</Alert>}

      {!loading && !error && data && !noData && (
        <TableContainer
          component={Paper}
          elevation={4}
          sx={{
            mb: 4,
            width: "100%",
            borderRadius: 2,
            overflowX: "auto",
          }}
        >
          <Table size="small" sx={{ width: "100%" }}>
            <TableHead sx={{ backgroundColor: "#002060" }}>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      fontWeight: "bold",
                      color: "#FFFFFF",
                      textAlign: "center",
                      borderBottom: "none",
                      whiteSpace: "nowrap",
                      fontSize: "0.75rem",
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {Object.entries(data).map(([tickerKey, metricsObj]) => {
                const rows = metricsObj.data || [];

                const mainTickerRow = rows.find((m) =>
                  (m.competitor || "")
                    .toUpperCase()
                    .startsWith(ticker.toUpperCase())
                );

                const competitorRows = rows.filter((m) => m !== mainTickerRow);

                return (
                  <React.Fragment key={tickerKey}>
                    {mainTickerRow && (
                      <Fade in timeout={500}>
                        <TableRow
                          sx={{
                            backgroundColor: "#9de0f5ff",
                            "& td": {
                              backgroundColor: "#ffecb8ff",
                              fontWeight: 700,
                            },
                          }}
                        >
                          {columns.map((col) => {
                            const value = mainTickerRow[col.key];
                            const displayValue =
                              typeof value === "number"
                                ? formatNumber(
                                    value,
                                    col.isCurrency,
                                    col.isPercentage
                                  )
                                : value || "N/A";
                            return (
                              <TableCell key={col.key} align="center">
                                {displayValue}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </Fade>
                    )}
                    {competitorRows.map((row, idx) => (
                      <Fade in timeout={500} key={idx}>
                        <TableRow>
                          {columns.map((col) => {
                            const value = row[col.key];
                            const displayValue =
                              typeof value === "number"
                                ? formatNumber(
                                    value,
                                    col.isCurrency,
                                    col.isPercentage
                                  )
                                : value || "N/A";
                            return (
                              <TableCell key={col.key} align="center">
                                {displayValue}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </Fade>
                    ))}
                     {averages && (
                                          <>
                                            <TableRow>
                                              {columns.map((col, colIdx) => {
                                                if (colIdx === 0) {
                                                  return (
                                                    <TableCell
                                                      key="overall-average-label"
                                                      align="center"
                                                      colSpan={4}
                                                      sx={{
                                                        borderBottom: "none",
                                                        color: "#0288d1",
                                                        fontWeight: "bold",
                                                        whiteSpace: "nowrap",
                                                        textAlign: "center",
                                                        fontSize: "1rem",
                                                      }}
                                                    >
                                                      Overall Average
                                                    </TableCell>
                                                  );
                                                }
                                                if (colIdx < 4) return null;
                                                return (
                                                  <TableCell
                                                    key={col.key}
                                                    align="center"
                                                    sx={{
                                                      borderBottom: "none",
                                                      color: "#0288d1",
                                                      fontWeight: "bold",
                                                      whiteSpace: "nowrap",
                                                    }}
                                                  >
                                                    {averages[col.key] &&
                                                    averages[col.key].average !== undefined
                                                      ? columnsWithX.has(col.key)
                                                        ? `${formatNumber(
                                                            averages[col.key].average!,
                                                            col.isCurrency,
                                                            col.isPercentage
                                                          )}x`
                                                        : formatNumber(
                                                            averages[col.key].average!,
                                                            col.isCurrency,
                                                            col.isPercentage
                                                          )
                                                      : ""}
                                                  </TableCell>
                                                );
                                              })}
                                            </TableRow>
                                            <TableRow>
                                              {columns.map((col, colIdx) => {
                                                if (colIdx === 0) {
                                                  return (
                                                    <TableCell
                                                      key="overall-median-label"
                                                      align="center"
                                                      colSpan={4}
                                                      sx={{
                                                        borderBottom: "none",
                                                        color: "#0288d1",
                                                        fontWeight: "bold",
                                                        whiteSpace: "nowrap",
                                                        textAlign: "center",
                                                        fontSize: "1rem",
                                                      }}
                                                    >
                                                      Overall Median
                                                    </TableCell>
                                                  );
                                                }
                                                if (colIdx < 4) return null;
                                                return (
                                                  <TableCell
                                                    key={col.key}
                                                    align="center"
                                                    sx={{
                                                      borderBottom: "none",
                                                      color: "#0288d1",
                                                      fontWeight: "bold",
                                                      whiteSpace: "nowrap",
                                                    }}
                                                  >
                                                    {averages[col.key] &&
                                                    averages[col.key].median !== undefined
                                                      ? columnsWithX.has(col.key)
                                                        ? `${formatNumber(
                                                            averages[col.key].median!,
                                                            col.isCurrency,
                                                            col.isPercentage
                                                          )}x`
                                                        : formatNumber(
                                                            averages[col.key].median!,
                                                            col.isCurrency,
                                                            col.isPercentage
                                                          )
                                                      : ""}
                                                  </TableCell>
                                                );
                                              })}
                                            </TableRow>
                                          </>
                                        )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default FOComparisionTableMain
