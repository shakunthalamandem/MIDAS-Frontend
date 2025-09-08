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
import TickerInputComponent from "./TickerInputComponent";

// Types for API response
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
  present_year_ev_fcf: number | null;
  one_year_later_ev_fcf: number | null;
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
  "present_year_ev_fcf",
  "one_year_later_ev_fcf",
]);

const formatNumber = (
  value: number,
  isCurrency = false,
  isPercentage = false
): string => {
  if (value === null || value === undefined || isNaN(value)) return "N/A";

  const isNegative = value < 0;
  const absValue = Math.abs(value);
  let formattedValue: string;

  if (absValue >= 1e9) {
    formattedValue = `${(absValue / 1e9).toFixed(1)}B`;
  } else if (absValue >= 1e6) {
    formattedValue = `${(absValue / 1e6).toFixed(1)}M`;
  } else if (absValue >= 1e3) {
    formattedValue = `${(absValue / 1e3).toFixed(1)}K`;
  } else {
    formattedValue = absValue.toFixed(1);
  }

  if (isCurrency) {
    formattedValue = `$${formattedValue}`;
    if (isNegative) formattedValue = `-${formattedValue}`;
  } else if (isPercentage) {
    // Let toFixed handle the sign automatically
    formattedValue = `${value.toFixed(1)}%`;
  } else {
    if (isNegative) formattedValue = `-${formattedValue}`;
  }

  return formattedValue;
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
    key: "present_year_ev_fcf",
    label: "2025 EV/EBITDA",
  },
  {
    key: "one_year_later_ev_fcf",
    label: "2026 EV/EBITDA",
  },
  { key: "sales_growth", label: "Sales Growth (25–26)", isPercentage: true },
  { key: "eps_growth", label: "EPS Growth (25–26)", isPercentage: true },
];

interface IPODashboardMainTableProps {
  ticker: string;
}

const IPODashboardMainTable: React.FC<IPODashboardMainTableProps> = ({
  ticker,
}) => {
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
    handleFetch(ticker);
  }, [ticker]);

  const noData =
    data &&
    Object.values(data).every(
      (metrics) => !metrics.data || metrics.data.length === 0
    );
  const ai_generated =
    data?.[ticker]?.data?.some((item) => item.ai_generated) || false;

  const columns = getColumns(ticker, ai_generated);

  const selectedRow: ComparableMetric | undefined = data?.[ticker]?.data?.find(
    (m) =>
      (m.competitor || "")
        .toUpperCase()
        .trim()
        .startsWith(ticker.toUpperCase().trim())
  );

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

      {/* <TickerInputComponent
        ticker={ticker}
        onSuccess={() => handleFetch(ticker)}
      /> */}

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
              {/* --- NEW: render the selected ticker's own data row first, highlighted & bold --- */}
              {selectedRow && (
                <Fade in timeout={500}>
                  <TableRow
                    sx={{
                      backgroundColor: "#9de0f5ff",
                      // ensure cells inherit the highlight & bold reliably
                      "& td": {
                        backgroundColor: "#ffecb8ff",
                        fontWeight: 700,
                      },
                    }}
                  >
                    {columns.map((col) => {
                      const value = selectedRow[col.key];
                      let displayValue =
                        value === null ||
                        value === undefined ||
                        (typeof value === "number" && isNaN(value))
                          ? "N/A"
                          : col.key === "price_usd"
                            ? Number(value).toFixed(1)
                            : col.key === "market_cap" ||
                                col.key === "ev_usd_million"
                              ? typeof value === "number"
                                ? value.toLocaleString(undefined, {
                                    maximumFractionDigits: 1,
                                  })
                                : value
                              : typeof value === "number"
                                ? formatNumber(
                                    value,
                                    col.isCurrency,
                                    col.isPercentage
                                  )
                                : value;

                      return (
                        <TableCell
                          key={col.key}
                          align="center"
                          sx={{ borderBottom: "none", whiteSpace: "nowrap" }}
                        >
                          {columnsWithX.has(col.key) &&
                          typeof value === "number" &&
                          col.key !== "competitor" ? (
                            `${displayValue}x`
                          ) : (
                            <>
                              {displayValue}
                              {col.key === "competitor" &&
                                selectedRow.ai_generated && (
                                  <span
                                    style={{
                                      color: "#FF5722",
                                      fontWeight: "bold",
                                      marginLeft: "4px",
                                    }}
                                  >
                                    (AI)
                                  </span>
                                )}
                            </>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </Fade>
              )}

              {Object.entries(data).map(([tickerKey, metricsObj]) => {
                // For the section that matches the selected ticker,
                // exclude the selected row so it doesn't duplicate below.
                const metrics = metricsObj.data
                  ? tickerKey === ticker
                    ? metricsObj.data
                        // exclude the main ticker row (competitor startsWith ticker)
                        .filter(
                          (m) =>
                            !(m.competitor || "")
                              .toUpperCase()
                              .trim()
                              .startsWith(ticker.toUpperCase().trim())
                        )
                        .sort((a, b) => {
                          const aIsTicker = (a.competitor || "")
                            .toUpperCase()
                            .trim()
                            .startsWith(tickerKey.toUpperCase().trim());
                          const bIsTicker = (b.competitor || "")
                            .toUpperCase()
                            .trim()
                            .startsWith(tickerKey.toUpperCase().trim());

                          if (aIsTicker && !bIsTicker) return -1;
                          if (!aIsTicker && bIsTicker) return 1;
                          return 0;
                        })
                    : [...metricsObj.data].sort((a, b) => {
                        const aIsTicker = (a.competitor || "")
                          .toUpperCase()
                          .trim()
                          .startsWith(tickerKey.toUpperCase().trim());
                        const bIsTicker = (b.competitor || "")
                          .toUpperCase()
                          .trim()
                          .startsWith(tickerKey.toUpperCase().trim());

                        if (aIsTicker && !bIsTicker) return -1;
                        if (!aIsTicker && bIsTicker) return 1;
                        return 0;
                      })
                  : [];

                const averages = metricsObj.Averages;

                return (
                  <React.Fragment key={tickerKey}>
                    {metrics.map((metric, idx) => (
                      <Fade in timeout={500} key={`${tickerKey}-${idx}`}>
                        <TableRow
                          sx={{
                            backgroundColor:
                              idx % 2 === 0 ? "#f9f9f9" : "#ffffff",
                            transition: "background-color 0.3s",
                            "&:hover": {
                              backgroundColor: "#e3f2fd",
                            },
                          }}
                        >
                          {columns.map((col) => {
                            const value = metric[col.key];
                            let displayValue =
                              value === null ||
                              value === undefined ||
                              (typeof value === "number" && isNaN(value))
                                ? "N/A"
                                : col.key === "price_usd"
                                  ? Number(value).toFixed(1)
                                  : col.key === "market_cap" ||
                                      col.key === "ev_usd_million"
                                    ? typeof value === "number"
                                      ? value.toLocaleString(undefined, {
                                          maximumFractionDigits: 1,
                                        })
                                      : value
                                    : typeof value === "number"
                                      ? formatNumber(
                                          value,
                                          col.isCurrency,
                                          col.isPercentage
                                        )
                                      : value;

                            if (
                              col.key === "competitor" &&
                              metric.ai_generated
                            ) {
                              displayValue = `${displayValue}`;
                            }

                            return (
                              <TableCell
                                key={col.key}
                                align="center"
                                sx={{
                                  borderBottom: "none",
                                  color: "#333",
                                  whiteSpace: "nowrap",
                                  fontWeight:
                                    metric.competitor === tickerKey
                                      ? "bold"
                                      : "normal",
                                }}
                              >
                                {columnsWithX.has(col.key) &&
                                typeof value === "number" &&
                                col.key !== "competitor" ? (
                                  `${displayValue}x`
                                ) : (
                                  <>
                                    {displayValue}
                                    {col.key === "competitor" &&
                                      metric.ai_generated && (
                                        <span
                                          style={{
                                            color: "#FF5722",
                                            fontWeight: "bold",
                                            marginLeft: "4px",
                                          }}
                                        >
                                          (AI)
                                        </span>
                                      )}
                                  </>
                                )}
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

export default IPODashboardMainTable;
