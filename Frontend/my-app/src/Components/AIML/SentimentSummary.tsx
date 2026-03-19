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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

interface SentimentData {
  ticker: string;
  issuer_name: string;
  pricing_date: string | null;
  unique_deal_id: string;
  one_week_sentiment: string | null;
  one_month_sentiment: string | null;
}

const SentimentSummary: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [data, setData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<SentimentData[]>([]);

  // Fetch sentiment data
  useEffect(() => {
    const fetchSentimentData = async () => {
      if (!apiUrl) {
        setError("API URL is missing");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${apiUrl}/api/sentiment_sumamry_data/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch sentiment data: ${response.statusText}`);
        }

        const result = await response.json();
        const sentimentDataArray = Array.isArray(result) ? result : result.data || [];

        // Map and filter the data to exclude sentiment field
        const mappedData: SentimentData[] = sentimentDataArray.map((item: any) => ({
          ticker: item.ticker,
          issuer_name: item.issuer_name,
          pricing_date: item.pricing_date,
          unique_deal_id: item.unique_deal_id,
          one_week_sentiment: item.one_week_sentiment,
          one_month_sentiment: item.one_month_sentiment,
        }));

        setData(mappedData);
        setFilteredData(mappedData);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load sentiment data");
        setData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSentimentData();
  }, [apiUrl]);

  // Handle search filtering
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = data.filter(
        (item) =>
          item.ticker.toLowerCase().includes(term) ||
          item.issuer_name.toLowerCase().includes(term) ||
          item.unique_deal_id.toLowerCase().includes(term)
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, data]);

  // Handle row click to navigate to detailed view
  const handleRowClick = (row: SentimentData) => {
    // Navigate to sentiment view with search parameters
    navigate(
      `/ai_sentiment_view?ticker=${encodeURIComponent(
        row.ticker
      )}&unique_deal_id=${encodeURIComponent(
        row.unique_deal_id
      )}&pricing_date=${encodeURIComponent(row.pricing_date || "")}`
    );
  };

  // Get sentiment color
  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment?.toLowerCase()) {
      case "bullish":
        return { color: "success", label: "Bullish" };
      case "bearish":
        return { color: "error", label: "Bearish" };
      case "neutral":
        return { color: "warning", label: "Neutral" };
      default:
        return { color: "default", label: sentiment || "N/A" };
    }
  };

  if (loading) {
    return (
      <Container maxWidth={false} disableGutters>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} disableGutters>
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Box sx={{ width: { xs: "96%", sm: "90%", md: "95%" }, mt: { xs: 1.5, md: 2.5 }, mb: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
              Sentiment Summary Dashboard
            </Typography>

            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search by ticker, issuer name, or deal ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchOutlinedIcon sx={{ mr: 1, color: "action.active" }} />,
              }}
              size="small"
              sx={{
                mb: 2,
                backgroundColor: "background.paper",
                borderRadius: 1,
              }}
            />

            {/* Results count */}
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Showing {filteredData.length} of {data.length} records
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Table */}
          <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
            <Table stickyHeader aria-label="sentiment summary table">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>Ticker</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 250 }}>Issuer Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 130 }}>Pricing Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 180 }}>Deal ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 130 }}>1-Week Sentiment</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 130 }}>1-Month Sentiment</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "#f9f9f9" },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell sx={{ fontWeight: "600", color: "primary.main" }}>
                        {row.ticker}
                      </TableCell>
                      <TableCell>{row.issuer_name}</TableCell>
                      <TableCell>{row.pricing_date || "TBA"}</TableCell>
                      <TableCell sx={{ fontSize: "0.85rem", fontFamily: "monospace" }}>
                        {row.unique_deal_id}
                      </TableCell>
                      <TableCell>
                        {row.one_week_sentiment ? (
                          <Chip
                            label={getSentimentColor(row.one_week_sentiment).label}
                            color={
                              getSentimentColor(row.one_week_sentiment).color as
                                | "success"
                                | "error"
                                | "warning"
                                | "default"
                            }
                            size="small"
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.one_month_sentiment ? (
                          <Chip
                            label={getSentimentColor(row.one_month_sentiment).label}
                            color={
                              getSentimentColor(row.one_month_sentiment).color as
                                | "success"
                                | "error"
                                | "warning"
                                | "default"
                            }
                            size="small"
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => handleRowClick(row)}
                          startIcon={<SearchOutlinedIcon />}
                          sx={{ textTransform: "none", fontSize: "0.85rem" }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {searchTerm ? "No results found matching your search." : "No sentiment data available."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Container>
  );
};

export default SentimentSummary;
