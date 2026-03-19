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

  // Fetch data
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

        const mapped = arr.map((item: any) => ({
          ticker: item.ticker,
          issuer_name: item.issuer_name,
          pricing_date: item.pricing_date,
          unique_deal_id: item.unique_deal_id,
          one_week_sentiment: item.one_week_sentiment,
          one_month_sentiment: item.one_month_sentiment,
        }));

        setData(mapped);
        setFilteredData(mapped);
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

  // Search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(data);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredData(
        data.filter(
          (item) =>
            item.ticker.toLowerCase().includes(term) ||
            item.issuer_name.toLowerCase().includes(term) ||
            item.unique_deal_id.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, data]);

  // Navigation
  const handleRowClick = (row: SentimentData) => {
    navigate(
      `/ai_sentiment_view?ticker=${encodeURIComponent(
        row.ticker
      )}&unique_deal_id=${encodeURIComponent(
        row.unique_deal_id
      )}&pricing_date=${encodeURIComponent(row.pricing_date || "")}`
    );
  };

  // ✅ Properly typed sentiment helper
  const getSentiment = (
    sentiment: string | null
  ): { color: ChipProps["color"]; label: string } => {
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
    <Container maxWidth={false}>
      <Box sx={{ width: "95%", mx: "auto", mt: 3 }}>
        {/* Header + Search */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Sentiment Summary Dashboard
          </Typography>

          <TextField
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ width: 260 }}
            InputProps={{
              startAdornment: (
                <SearchOutlinedIcon sx={{ mr: 1, fontSize: 18 }} />
              ),
            }}
          />
        </Box>

        {/* Count */}
        <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
          Showing {filteredData.length} of {data.length}
        </Typography>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: 500,
            overflow: "auto",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><b>Ticker</b></TableCell>
                <TableCell><b>Issuer Name</b></TableCell>
                <TableCell><b>Pricing Date</b></TableCell>
                <TableCell><b>Deal ID</b></TableCell>
                <TableCell><b>1W</b></TableCell>
                <TableCell><b>1M</b></TableCell>
                <TableCell><b>Action</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => {
                  const weekSentiment = getSentiment(
                    row.one_week_sentiment
                  );
                  const monthSentiment = getSentiment(
                    row.one_month_sentiment
                  );

                  return (
                    <TableRow
                      key={index}
                      hover
                      onClick={() => handleRowClick(row)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "#f5f5f5" },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>
                        {row.ticker}
                      </TableCell>
                      <TableCell>{row.issuer_name}</TableCell>
                      <TableCell>{row.pricing_date || "TBA"}</TableCell>
                      <TableCell sx={{ fontSize: "0.8rem" }}>
                        {row.unique_deal_id}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={weekSentiment.label}
                          color={weekSentiment.color}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={monthSentiment.label}
                          color={monthSentiment.color}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation(); // ✅ prevent row click
                            handleRowClick(row);
                          }}
                          sx={{ textTransform: "none" }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {searchTerm
                      ? "No results found"
                      : "No sentiment data available"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default SentimentSummary;