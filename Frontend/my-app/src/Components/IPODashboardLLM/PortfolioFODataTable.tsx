import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  Typography,
  Button,
} from "@mui/material";

interface SentimentData {
  ticker: string;
  one_week_sentiment: string | null;
  one_month_sentiment: string | null;
}

interface VolatilityOutlook {
  "1-Week Sentiment": string;
  "1-Month Sentiment": string;
  "Expected Volatility": string;
  "Confidence Level": string;
}

interface UnsupervisedData {
  ticker: string;
  few_shot_review?: string;
}

interface MLResults {
  ticker: string;
  t1d_pred: string | null;
  t1w_pred: string | null;
  t1m_pred: string | null;
}

interface FORankingData {
  decision?: {
    action: string;
    confidence_level: string;
    conviction_rating: number;
  };
}

interface TradingSignal {
  signal: string;
  confidence: number;
  insight?: string;
}

interface PortfolioFOItem {
  ticker: string;
  sentiment_summary: SentimentData | null;
  unsupervised_summary: UnsupervisedData | null;
  ml_results: MLResults | null;
  fo_ranking: FORankingData;
  trading_signal?: TradingSignal;
}

type SortField =
  | "ticker"
  | "sentiment_week"
  | "sentiment_month"
  | "ml_prediction"
  | "fo_action"
  | "trading_signal";

type SortOrder = "asc" | "desc";

const PortfolioFODataTable: React.FC = () => {
  const [data, setData] = useState<PortfolioFOItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    order: SortOrder;
  }>({
    field: "ticker",
    order: "asc",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${apiUrl}/api/portfolio_integrated_fo_data/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(Array.isArray(jsonData) ? jsonData : []);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch portfolio data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const parseVolatilityOutlook = (
    unsupervisedData: UnsupervisedData | null
  ): VolatilityOutlook | null => {
    if (!unsupervisedData?.few_shot_review) return null;

    try {
      const parsed = JSON.parse(unsupervisedData.few_shot_review);
      if (parsed.answer && parsed.answer[0]) {
        return parsed.answer[0]["Final Sentiment & Volatility Outlook"] || null;
      }
    } catch {
      return null;
    }

    return null;
  };

  const getSentimentColor = (sentiment: string | null) => {
    if (!sentiment) return "default";
    const lower = sentiment.toLowerCase();
    if (lower.includes("bearish")) return "error";
    if (lower.includes("bullish")) return "success";
    if (lower.includes("neutral")) return "warning";
    return "default";
  };

  const getPredictionColor = (prediction: string | null) => {
    if (!prediction) return "default";
    const lower = prediction.toLowerCase();
    if (lower.includes("negative")) return "error";
    if (lower.includes("positive")) return "success";
    if (lower.includes("neutral")) return "warning";
    return "default";
  };

  const getSortableValue = (item: PortfolioFOItem, field: SortField) => {
    switch (field) {
      case "ticker":
        return item.ticker || "";
      case "sentiment_week":
        return item.sentiment_summary?.one_week_sentiment || "";
      case "sentiment_month":
        return item.sentiment_summary?.one_month_sentiment || "";
      case "ml_prediction":
        return item.ml_results?.t1w_pred || "";
      case "fo_action":
        return item.fo_ranking?.decision?.action || "";
      case "trading_signal":
        return item.trading_signal?.signal || "";
      default:
        return "";
    }
  };

  const sortedData = useMemo(() => {
    const sorted = [...data];

    sorted.sort((a, b) => {
      const aValue = String(getSortableValue(a, sortConfig.field)).toLowerCase();
      const bValue = String(getSortableValue(b, sortConfig.field)).toLowerCase();

      if (aValue < bValue) return sortConfig.order === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.order === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (data.length === 0) {
    return <Alert severity="info">No FO portfolio data available</Alert>;
  }

  return (
    <Box sx={{
      maxWidth: "1800px",
      mx: "auto",
      px: 2,
      mb: 3,
    }}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: "18px",
          border: "1px solid #d9e2ec",
          boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <TableContainer
          sx={{
            height: 560,
            maxHeight: 560,
            overflowY: "auto",
            overflowX: "auto",
            "&::-webkit-scrollbar": {
              width: "10px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#e8f4f8",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#b8d4e8",
              borderRadius: "5px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#a0c5e0",
            },
          }}
        >
          <Table stickyHeader sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    backgroundColor: "#cfe3f1",
                    fontWeight: 700,
                    py: 2.2,
                    minWidth: 160,
                  }}
                >
                  <TableSortLabel
                    active={sortConfig.field === "ticker"}
                    direction={sortConfig.field === "ticker" ? sortConfig.order : "asc"}
                    onClick={() => handleSort("ticker")}
                  >
                    Ticker
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    backgroundColor: "#cfe3f1",
                    fontWeight: 700,
                    py: 2.2,
                    minWidth: 210,
                  }}
                >
                  <TableSortLabel
                    active={sortConfig.field === "sentiment_week"}
                    direction={
                      sortConfig.field === "sentiment_week" ? sortConfig.order : "asc"
                    }
                    onClick={() => handleSort("sentiment_week")}
                  >
                    Sentiment
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    backgroundColor: "#cfe3f1",
                    fontWeight: 700,
                    py: 2.2,
                    minWidth: 240,
                  }}
                >
                  <TableSortLabel
                    active={sortConfig.field === "ml_prediction"}
                    direction={
                      sortConfig.field === "ml_prediction" ? sortConfig.order : "asc"
                    }
                    onClick={() => handleSort("ml_prediction")}
                  >
                    ML Predictions
                  </TableSortLabel>
                </TableCell>

                <TableCell
                  sx={{
                    backgroundColor: "#cfe3f1",
                    fontWeight: 700,
                    py: 2.2,
                    minWidth: 180,
                  }}
                >
                  <TableSortLabel
                    active={sortConfig.field === "trading_signal"}
                    direction={sortConfig.field === "trading_signal" ? sortConfig.order : "asc"}
                    onClick={() => handleSort("trading_signal")}
                  >
                    Trading Signal
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedData.map((item, index) => {
                const volatilityOutlook = parseVolatilityOutlook(item.unsupervised_summary);

                return (
                  <TableRow
                    key={item.ticker}
                    hover
                    sx={{
                      backgroundColor: index % 2 === 0 ? "#fff" : "#fcfcfc",
                      "& td": {
                        py: 2.8,
                        borderBottom: "1px solid #e6eaf0",
                        verticalAlign: "middle",
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700 }}>{item.ticker}</TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {item.sentiment_summary?.one_week_sentiment && (
                          <Chip
                            label={`1W: ${item.sentiment_summary.one_week_sentiment}`}
                            size="small"
                            color={getSentimentColor(
                              item.sentiment_summary.one_week_sentiment
                            )}
                            sx={{ width: "fit-content", fontWeight: 600 }}
                          />
                        )}

                        {item.sentiment_summary?.one_month_sentiment && (
                          <Chip
                            label={`1M: ${item.sentiment_summary.one_month_sentiment}`}
                            size="small"
                            color={getSentimentColor(
                              item.sentiment_summary.one_month_sentiment
                            )}
                            sx={{ width: "fit-content", fontWeight: 600 }}
                          />
                        )}

                        {!item.sentiment_summary && (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {item.ml_results?.t1d_pred && (
                          <Chip
                            label={`1D: ${item.ml_results.t1d_pred}`}
                            size="small"
                            color={getPredictionColor(item.ml_results.t1d_pred)}
                            sx={{ width: "fit-content", fontWeight: 600 }}
                          />
                        )}

                        {item.ml_results?.t1w_pred && (
                          <Chip
                            label={`1W: ${item.ml_results.t1w_pred}`}
                            size="small"
                            color={getPredictionColor(item.ml_results.t1w_pred)}
                            sx={{ width: "fit-content", fontWeight: 600 }}
                          />
                        )}

                        {item.ml_results?.t1m_pred && (
                          <Chip
                            label={`1M: ${item.ml_results.t1m_pred}`}
                            size="small"
                            color={getPredictionColor(item.ml_results.t1m_pred)}
                            sx={{ width: "fit-content", fontWeight: 600 }}
                          />
                        )}

                        {!item.ml_results && (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      {item.trading_signal?.signal ? (
                        <Tooltip title={`Confidence: ${item.trading_signal.confidence}%`}>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Chip
                              label={item.trading_signal.signal}
                              size="small"
                              color={
                                item.trading_signal.signal.toLowerCase() === "buy"
                                  ? "success"
                                  : item.trading_signal.signal.toLowerCase() === "sell"
                                  ? "error"
                                  : "warning"
                              }
                              sx={{ fontWeight: 700, width: "fit-content" }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {item.trading_signal.confidence}% confidence
                            </Typography>
                          </Box>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default PortfolioFODataTable;
