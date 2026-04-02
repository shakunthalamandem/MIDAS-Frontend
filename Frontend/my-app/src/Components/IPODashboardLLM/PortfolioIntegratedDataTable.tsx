import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  TextField,
  InputAdornment,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

interface SentimentData {
  ticker: string;
  issuer_name?: string;
  pricing_date: string;
  one_week_sentiment: string | null;
  one_month_sentiment: string | null;
  sentiment_score?: number;
  socialmedia_retail_sentiment_score?: number;
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

interface IPORankingData {
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

interface JayRitter {
  overall_signal: string;
  confidence_score: number;
}

interface PortfolioItem {
  ticker: string;
  sentiment_summary: SentimentData | null;
  unsupervised_summary: UnsupervisedData | null;
  ml_results: MLResults | null;
  ipo_ranking: IPORankingData;
  trading_signal?: TradingSignal;
  jay_ritter?: JayRitter;
}

type SortField =
  | "ticker"
  | "sentiment_week"
  | "sentiment_month"
  | "ml_prediction"
  | "jay_ritter";

type SortOrder = "asc" | "desc";

const PortfolioIntegratedDataTable: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    field: SortField | null;
    order: SortOrder;
  }>({
    field: null,
    order: "asc",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 100;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${apiUrl}/api/portfolio_integrated_ipo_data/`, {
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

  const getSortableValue = (item: PortfolioItem, field: SortField) => {
    switch (field) {
      case "ticker":
        return item.ticker || "";
      case "sentiment_week":
        return item.sentiment_summary?.one_week_sentiment || "";
      case "sentiment_month":
        return item.sentiment_summary?.one_month_sentiment || "";
      case "ml_prediction":
        return item.ml_results?.t1w_pred || "";
      case "jay_ritter":
        return item.jay_ritter?.overall_signal || "";
      default:
        return "";
    }
  };

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      return (
        (item.ticker && item.ticker.toLowerCase().includes(query)) ||
        (item.sentiment_summary?.one_week_sentiment && item.sentiment_summary.one_week_sentiment.toLowerCase().includes(query)) ||
        (item.sentiment_summary?.one_month_sentiment && item.sentiment_summary.one_month_sentiment.toLowerCase().includes(query)) ||
        (item.jay_ritter?.overall_signal && item.jay_ritter.overall_signal.toLowerCase().includes(query))
      );
    });
  }, [data, searchQuery]);

  const sortedData = useMemo(() => {
    if (!sortConfig.field) return filteredData;

    const sorted = [...filteredData];

    sorted.sort((a, b) => {
      const aValue = String(getSortableValue(a, sortConfig.field!)).toLowerCase();
      const bValue = String(getSortableValue(b, sortConfig.field!)).toLowerCase();

      if (aValue < bValue) return sortConfig.order === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.order === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedData.length);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleTickerClick = (item: PortfolioItem) => {
    const queryParams = new URLSearchParams();
    queryParams.append("ticker", item.ticker);
    queryParams.append("pricing_date", item.sentiment_summary?.pricing_date || "");
    queryParams.append("issuer_name", item.sentiment_summary?.issuer_name || "");

    window.open(`/deals/new_dashboard/details?${queryParams.toString()}`, "_blank");
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
    return <Alert severity="info">No portfolio data available</Alert>;
  }

  return (
    <Box sx={{
      maxWidth: "1800px",
      mx: "auto",
      px: 2,
      mb: 3,
    }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <TextField
          placeholder="Search ticker, issuer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#999", mr: 0.5 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 300,
            "& .MuiOutlinedInput-root": {
              borderRadius: "6px",
              backgroundColor: "#f5f5f5",
            },
            "& .MuiOutlinedInput-input::placeholder": {
              opacity: 0.7,
            },
          }}
        />
      </Box>
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
                    minWidth: 140,
                  }}
                >
                  Pricing Date
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
                    minWidth: 250,
                  }}
                >
                  Unsupervised Analysis
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
                    active={sortConfig.field === "jay_ritter"}
                    direction={sortConfig.field === "jay_ritter" ? sortConfig.order : "asc"}
                    onClick={() => handleSort("jay_ritter")}
                  >
                    Jay Ritter Signal
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.map((item, index) => {
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
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        cursor: "pointer",
                        color: "#1a237e",
                        "&:hover": {
                          textDecoration: "underline",
                          color: "#0d1b5f",
                        }
                      }}
                      onClick={() => handleTickerClick(item)}
                    >
                      {item.ticker}
                    </TableCell>

                    <TableCell>{item.sentiment_summary?.pricing_date || "N/A"}</TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                        <Tooltip title="Social Media & Retail Sentiment Score">
                          <Typography variant="caption" sx={{ fontWeight: 600, color: "#1a237e", fontSize: "0.75rem" }}>
                            {item.sentiment_summary?.socialmedia_retail_sentiment_score !== undefined && item.sentiment_summary?.socialmedia_retail_sentiment_score !== null
                              ? `Score: ${item.sentiment_summary.socialmedia_retail_sentiment_score}/100`
                              : "Score: N/A"}
                          </Typography>
                        </Tooltip>

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
                      {volatilityOutlook ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {volatilityOutlook["1-Week Sentiment"] && (
                            <Chip
                              label={`1W: ${volatilityOutlook["1-Week Sentiment"]}`}
                              size="small"
                              color={getSentimentColor(
                                volatilityOutlook["1-Week Sentiment"]
                              )}
                              sx={{ width: "fit-content", fontWeight: 600 }}
                            />
                          )}

                          {volatilityOutlook["1-Month Sentiment"] && (
                            <Chip
                              label={`1M: ${volatilityOutlook["1-Month Sentiment"]}`}
                              size="small"
                              color={getSentimentColor(
                                volatilityOutlook["1-Month Sentiment"]
                              )}
                              sx={{ width: "fit-content", fontWeight: 600 }}
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      )}
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
                      {item.jay_ritter?.overall_signal ? (
                        <Tooltip title={`Confidence: ${item.jay_ritter.confidence_score}%`}>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Chip
                              label={item.jay_ritter.overall_signal}
                              size="small"
                              color={
                                item.jay_ritter.overall_signal.toLowerCase() === "long"
                                  ? "success"
                                  : item.jay_ritter.overall_signal.toLowerCase() === "short"
                                  ? "error"
                                  : "warning"
                              }
                              sx={{ fontWeight: 700, width: "fit-content" }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {item.jay_ritter.confidence_score}% confidence
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
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 2, gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {startIndex + 1}–{endIndex} of {sortedData.length}
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            ‹
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            ›
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PortfolioIntegratedDataTable;