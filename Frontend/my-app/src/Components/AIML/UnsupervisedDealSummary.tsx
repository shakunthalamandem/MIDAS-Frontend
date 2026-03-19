import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Typography,
  Chip,
  ChipProps,
  TableSortLabel,
  Card,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface UnsupervisedDealData {
  ticker: string;
  issuer_name: string;
  pricing_date: string | null;
  unique_deal_id: string;
  few_shot_review: string;
  one_week_sentiment?: string | null;
  one_month_sentiment?: string | null;
}

// Helper function to parse few_shot_review JSON and extract sentiment values
const parseSentimentData = (fewShotReview: string): { oneWeekSentiment: string | null; oneMonthSentiment: string | null } => {
  try {
    const parsed = JSON.parse(fewShotReview);
    if (parsed.answer && Array.isArray(parsed.answer) && parsed.answer.length > 0) {
      const firstAnswer = parsed.answer[0];
      const finalOutlook = firstAnswer["Final Sentiment & Volatility Outlook"];
      if (finalOutlook) {
        return {
          oneWeekSentiment: finalOutlook["1-Week Sentiment"] || null,
          oneMonthSentiment: finalOutlook["1-Month Sentiment"] || null,
        };
      }
    }
  } catch (e) {
    console.error("Error parsing few_shot_review:", e);
  }
  return { oneWeekSentiment: null, oneMonthSentiment: null };
};

type SortField = "ticker" | "issuer_name" | "pricing_date" | "one_week_sentiment" | "one_month_sentiment";
type SortOrder = "asc" | "desc";

const UnsupervisedDealSummary: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [data, setData] = useState<UnsupervisedDealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<UnsupervisedDealData[]>([]);
  const [sortField, setSortField] = useState<SortField>("ticker");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Fetch data
  useEffect(() => {
    const fetchUnsupervisedData = async () => {
      if (!apiUrl) {
        setError("API URL is missing");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${apiUrl}/api/unsupervised_summary/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed: ${response.statusText}`);
        }

        const result = await response.json();
        const arr = Array.isArray(result) ? result : result.data || [];

        const mapped = arr.map((item: any) => {
          const { oneWeekSentiment, oneMonthSentiment } = parseSentimentData(item.few_shot_review);
          return {
            ticker: item.ticker,
            issuer_name: item.issuer_name,
            pricing_date: item.pricing_date,
            unique_deal_id: item.unique_deal_id,
            few_shot_review: item.few_shot_review,
            one_week_sentiment: oneWeekSentiment,
            one_month_sentiment: oneMonthSentiment,
          };
        });

        setData(mapped);
        setFilteredData(mapped);
      } catch (err: any) {
        setError(err.message || "Failed to load unsupervised summary data");
        setData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnsupervisedData();
  }, [apiUrl]);

  // Search filter and sorting
  useEffect(() => {
    let filtered = data;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = data.filter(
        (item) =>
          item.ticker.toLowerCase().includes(term) ||
          item.issuer_name.toLowerCase().includes(term) ||
          item.unique_deal_id.toLowerCase().includes(term)
      );
    }

    // Sorting logic
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (aValue === null || aValue === undefined) aValue = "";
      if (bValue === null || bValue === undefined) bValue = "";

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredData(sorted);
  }, [searchTerm, data, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Navigation to AI Few Shot Analysis with auto-filled fields
  const handleRowClick = (row: UnsupervisedDealData) => {
    navigate(
      `/ai_fewshot_analysis?ticker=${encodeURIComponent(
        row.ticker
      )}&unique_deal_id=${encodeURIComponent(row.unique_deal_id)}`
    );
  };

  // Helper function to get sentiment color and label
  const getSentiment = (
    sentiment: string | null | undefined
  ): { color: ChipProps["color"]; label: string } => {
    switch (sentiment?.toLowerCase()) {
      case "bullish":
        return { color: "success", label: "Bullish" };
      case "bearish":
        return { color: "error", label: "Bearish" };
      case "neutral":
        return { color: "warning", label: "Neutral" };
      case "neutral to slightly bullish":
        return { color: "success", label: "Neutral to Slightly Bullish" };
      case "neutral to cautiously positive":
        return { color: "success", label: "Neutral to Cautiously Positive" };
      default:
        return { color: "default", label: sentiment || "N/A" };
    }
  };

  // Loading
  if (loading) {
    return (
      <Container maxWidth={false}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      <Box sx={{ width: "100%", mx: "auto" }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Unsupervised Deal Summary
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Explore AI-powered deal insights with real-time sentiment analysis
          </Typography>
        </Box>

        {/* Results Count and Search Bar */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
            {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}
          </Typography>

          {/* Empty space to push search to right */}
          <Box sx={{ flex: 1 }} />

          <Box sx={{ maxWidth: 400 }}>
            <TextField
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                backgroundColor: "#f8f9fa",
                borderRadius: 2,
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#ffffff",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#f8f9fa",
                  },
                  "&.Mui-focused": {
                    backgroundColor: "#ffffff",
                    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e0e0e0",
                },
              }}
              InputProps={{
                startAdornment: (
                  <SearchOutlinedIcon sx={{ mr: 1.5, fontSize: 20, color: "text.secondary" }} />
                ),
              }}
            />
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Table Card */}
        <Card
          sx={{
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #e0e0e0",
          }}
        >
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "#f8f9fa",
                    "& .MuiTableCell-head": {
                      backgroundColor: "#f8f9fa",
                      fontWeight: 600,
                      color: "#333",
                      borderBottom: "2px solid #e0e0e0",
                      padding: "16px 24px",
                    },
                  }}
                >
                  <TableCell>
                    <TableSortLabel
                      active={sortField === "ticker"}
                      direction={sortField === "ticker" ? sortOrder : "asc"}
                      onClick={() => handleSort("ticker")}
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        "&:hover": { color: "#667eea" },
                      }}
                    >
                      Ticker
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === "issuer_name"}
                      direction={sortField === "issuer_name" ? sortOrder : "asc"}
                      onClick={() => handleSort("issuer_name")}
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        "&:hover": { color: "#667eea" },
                      }}
                    >
                      Issuer Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === "pricing_date"}
                      direction={sortField === "pricing_date" ? sortOrder : "asc"}
                      onClick={() => handleSort("pricing_date")}
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        "&:hover": { color: "#667eea" },
                      }}
                    >
                      Pricing Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === "one_week_sentiment"}
                      direction={sortField === "one_week_sentiment" ? sortOrder : "asc"}
                      onClick={() => handleSort("one_week_sentiment")}
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        "&:hover": { color: "#667eea" },
                      }}
                    >
                      1W Sentiment
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === "one_month_sentiment"}
                      direction={sortField === "one_month_sentiment" ? sortOrder : "asc"}
                      onClick={() => handleSort("one_month_sentiment")}
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        "&:hover": { color: "#667eea" },
                      }}
                    >
                      1M Sentiment
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => {
                    const weekSentiment = getSentiment(row.one_week_sentiment);
                    const monthSentiment = getSentiment(row.one_month_sentiment);

                    return (
                      <TableRow
                        key={index}
                        sx={{
                          borderBottom: "1px solid #f0f0f0",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "#fafafa",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                          },
                          "& .MuiTableCell-body": {
                            padding: "16px 24px",
                            color: "#333",
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 700, color: "#667eea" }}>
                          {row.ticker}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.9rem" }}>
                          {row.issuer_name}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.9rem", color: "#666" }}>
                          {row.pricing_date || "TBA"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={weekSentiment.label}
                            color={weekSentiment.color}
                            size="small"
                            variant="filled"
                            sx={{
                              fontWeight: 500,
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={monthSentiment.label}
                            color={monthSentiment.color}
                            size="small"
                            variant="filled"
                            sx={{
                              fontWeight: 500,
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(row);
                            }}
                            endIcon={<ArrowForwardIcon sx={{ fontSize: "0.9rem" }} />}
                            sx={{
                              textTransform: "none",
                              fontSize: "0.85rem",
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              "&:hover": {
                                background: "linear-gradient(135deg, #5568d3 0%, #6a3a90 100%)",
                              },
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Box sx={{ py: 4 }}>
                        <Typography variant="body1" sx={{ color: "text.secondary" }}>
                          {searchTerm
                            ? "🔍 No deals found matching your search"
                            : "📊 No unsupervised deal data available"}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </Container>
  );
};

export default UnsupervisedDealSummary;
