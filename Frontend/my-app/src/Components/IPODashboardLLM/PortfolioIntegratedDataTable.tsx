import React, { useEffect, useState } from "react";
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

interface IPORankingData {
  decision?: {
    action: string;
    confidence_level: string;
    conviction_rating: number;
  };
}

interface PortfolioItem {
  ticker: string;
  sentiment_summary: SentimentData | null;
  unsupervised_summary: UnsupervisedData | null;
  ml_results: MLResults | null;
  ipo_ranking: IPORankingData;
}

type SortField = keyof PortfolioItem | "sentiment_week" | "sentiment_month" | "ml_prediction" | "ipo_action";
type SortOrder = "asc" | "desc";

const PortfolioIntegratedDataTable: React.FC = () => {
  const [data, setData] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    order: SortOrder;
  }>({ field: "ticker", order: "asc" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${apiUrl}/api/portfolio_integrated_data/`, {
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

  // Parse volatility outlook from few_shot_review
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

  // Sentiment color mapping
  const getSentimentColor = (sentiment: string | null) => {
    if (!sentiment) return "default";
    const lower = sentiment.toLowerCase();
    if (lower.includes("bearish")) return "error";
    if (lower.includes("bullish")) return "success";
    if (lower.includes("neutral")) return "warning";
    return "default";
  };

  // ML prediction color mapping
  const getPredictionColor = (prediction: string | null) => {
    if (!prediction) return "default";
    const lower = prediction.toLowerCase();
    if (lower.includes("negative")) return "error";
    if (lower.includes("positive")) return "success";
    return "default";
  };

  // Sorting logic
  const sortedData = React.useMemo(() => {
    let sorted = [...data];

    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.field) {
        case "ticker":
          aValue = a.ticker;
          bValue = b.ticker;
          break;
        case "sentiment_week":
          aValue = a.sentiment_summary?.one_week_sentiment || "";
          bValue = b.sentiment_summary?.one_week_sentiment || "";
          break;
        case "sentiment_month":
          aValue = a.sentiment_summary?.one_month_sentiment || "";
          bValue = b.sentiment_summary?.one_month_sentiment || "";
          break;
        case "ml_prediction":
          aValue = a.ml_results?.t1w_pred || "";
          bValue = b.ml_results?.t1w_pred || "";
          break;
        case "ipo_action":
          aValue = a.ipo_ranking?.decision?.action || "";
          bValue = b.ipo_ranking?.decision?.action || "";
          break;
        default:
          aValue = "";
          bValue = "";
      }

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
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
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
    <Box sx={{ width: "100%", overflow: "auto" }}>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table sx={{ minWidth: 1200 }} stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: 600, width: "10%" }}>
                <TableSortLabel
                  active={sortConfig.field === "ticker"}
                  direction={sortConfig.field === "ticker" ? sortConfig.order : "asc"}
                  onClick={() => handleSort("ticker")}
                >
                  Ticker
                </TableSortLabel>
              </TableCell>

              {/* Sentiment Column */}
              <TableCell sx={{ fontWeight: 600, width: "15%" }}>
                <Tooltip title="1-Week and 1-Month Sentiment from sentiment_summary">
                  <span>
                    <TableSortLabel
                      active={sortConfig.field === "sentiment_week"}
                      direction={sortConfig.field === "sentiment_week" ? sortConfig.order : "asc"}
                      onClick={() => handleSort("sentiment_week")}
                    >
                      Sentiment
                    </TableSortLabel>
                  </span>
                </Tooltip>
              </TableCell>

              {/* Unsupervised Column */}
              <TableCell sx={{ fontWeight: 600, width: "15%" }}>
                <Tooltip title="Sentiment & Volatility Outlook from unsupervised_summary">
                  <span>Unsupervised Analysis</span>
                </Tooltip>
              </TableCell>

              {/* ML Results Column */}
              <TableCell sx={{ fontWeight: 600, width: "20%" }}>
                <Tooltip title="ML Predictions for 1-Day, 1-Week, 1-Month">
                  <span>ML Predictions</span>
                </Tooltip>
              </TableCell>

              {/* IPO Ranking Column */}
              <TableCell sx={{ fontWeight: 600, width: "15%" }}>
                <Tooltip title="IPO Ranking Action from decision">
                  <span>IPO Ranking</span>
                </Tooltip>
              </TableCell>

              {/* Confidence Column */}
              <TableCell sx={{ fontWeight: 600, width: "10%" }}>
                <Tooltip title="Confidence Level & Conviction Rating">
                  <span>Confidence</span>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedData.map((item) => {
              const volatilityOutlook = parseVolatilityOutlook(item.unsupervised_summary);

              return (
                <TableRow
                  key={item.ticker}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                    "&:hover": { backgroundColor: "#f0f0f0" },
                  }}
                >
                  {/* Ticker */}
                  <TableCell sx={{ fontWeight: 500 }}>{item.ticker}</TableCell>

                  {/* Sentiment */}
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5, flexDirection: "column" }}>
                      {item.sentiment_summary?.one_week_sentiment && (
                        <Chip
                          label={`1W: ${item.sentiment_summary.one_week_sentiment}`}
                          size="small"
                          color={getSentimentColor(item.sentiment_summary.one_week_sentiment)}
                          variant="outlined"
                        />
                      )}
                      {item.sentiment_summary?.one_month_sentiment && (
                        <Chip
                          label={`1M: ${item.sentiment_summary.one_month_sentiment}`}
                          size="small"
                          color={getSentimentColor(item.sentiment_summary.one_month_sentiment)}
                          variant="outlined"
                        />
                      )}
                      {!item.sentiment_summary && <span style={{ color: "#999" }}>N/A</span>}
                    </Box>
                  </TableCell>

                  {/* Unsupervised */}
                  <TableCell>
                    {volatilityOutlook ? (
                      <Box sx={{ display: "flex", gap: 0.5, flexDirection: "column" }}>
                        {volatilityOutlook["1-Week Sentiment"] && (
                          <Chip
                            label={`1W: ${volatilityOutlook["1-Week Sentiment"]}`}
                            size="small"
                            color={getSentimentColor(volatilityOutlook["1-Week Sentiment"])}
                            variant="outlined"
                          />
                        )}
                        {volatilityOutlook["1-Month Sentiment"] && (
                          <Chip
                            label={`1M: ${volatilityOutlook["1-Month Sentiment"]}`}
                            size="small"
                            color={getSentimentColor(volatilityOutlook["1-Month Sentiment"])}
                            variant="outlined"
                          />
                        )}
                      </Box>
                    ) : (
                      <span style={{ color: "#999" }}>N/A</span>
                    )}
                  </TableCell>

                  {/* ML Results */}
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5, flexDirection: "column" }}>
                      {item.ml_results?.t1d_pred && (
                        <Chip
                          label={`1D: ${item.ml_results.t1d_pred}`}
                          size="small"
                          color={getPredictionColor(item.ml_results.t1d_pred)}
                          variant="outlined"
                        />
                      )}
                      {item.ml_results?.t1w_pred && (
                        <Chip
                          label={`1W: ${item.ml_results.t1w_pred}`}
                          size="small"
                          color={getPredictionColor(item.ml_results.t1w_pred)}
                          variant="outlined"
                        />
                      )}
                      {item.ml_results?.t1m_pred && (
                        <Chip
                          label={`1M: ${item.ml_results.t1m_pred}`}
                          size="small"
                          color={getPredictionColor(item.ml_results.t1m_pred)}
                          variant="outlined"
                        />
                      )}
                      {!item.ml_results && <span style={{ color: "#999" }}>N/A</span>}
                    </Box>
                  </TableCell>

                  {/* IPO Ranking */}
                  <TableCell>
                    {item.ipo_ranking?.decision?.action ? (
                      <Tooltip
                        title={`Confidence: ${item.ipo_ranking.decision.confidence_level}`}
                      >
                        <Chip
                          label={item.ipo_ranking.decision.action}
                          color={
                            item.ipo_ranking.decision.action.toLowerCase().includes("buy")
                              ? "success"
                              : item.ipo_ranking.decision.action.toLowerCase().includes("sell")
                              ? "error"
                              : "warning"
                          }
                          size="small"
                        />
                      </Tooltip>
                    ) : (
                      <span style={{ color: "#999" }}>N/A</span>
                    )}
                  </TableCell>

                  {/* Confidence */}
                  <TableCell>
                    {item.ipo_ranking?.decision ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <span style={{ fontSize: "0.85rem" }}>
                          {item.ipo_ranking.decision.confidence_level}
                        </span>
                        {item.ipo_ranking.decision.conviction_rating && (
                          <span style={{ fontSize: "0.85rem", color: "#666" }}>
                            ★ {item.ipo_ranking.decision.conviction_rating}/5
                          </span>
                        )}
                      </Box>
                    ) : (
                      <span style={{ color: "#999" }}>N/A</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Info text */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: "#f9f9f9", borderRadius: 1 }}>
        <strong>Legend:</strong> 1D = 1-Day, 1W = 1-Week, 1M = 1-Month predictions
      </Box>
    </Box>
  );
};

export default PortfolioIntegratedDataTable;
