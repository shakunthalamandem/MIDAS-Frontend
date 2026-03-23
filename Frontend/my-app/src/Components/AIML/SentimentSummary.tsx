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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableSortLabel,
  IconButton,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CloseIcon from "@mui/icons-material/Close";

interface SentimentData {
  ticker: string;
  issuer_name: string;
  pricing_date: string | null;
  unique_deal_id: string;
  one_week_sentiment: string | null;
  one_month_sentiment: string | null;
  sentiment_summary?: {
    one_week?: string;
    one_month?: string;
  };
}

const SentimentSummary: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [data, setData] = useState<SentimentData[]>([]);
  const [filteredData, setFilteredData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedSummary, setSelectedSummary] = useState<SentimentData | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [orderBy, setOrderBy] = useState<keyof SentimentData | "summary">("ticker");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${apiUrl}/api/sentiment_sumamry_data/`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const result = await res.json();
        const arr = Array.isArray(result) ? result : result.data || [];

        const mapped = arr.map((item: any) => ({
          ...item,
          sentiment_summary:
            typeof item.sentiment_summary === "string"
              ? JSON.parse(item.sentiment_summary)
              : item.sentiment_summary,
        }));

        setData(mapped);
        setFilteredData(mapped);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredData(
      data.filter(
        (d) =>
          d.ticker.toLowerCase().includes(term) ||
          d.issuer_name.toLowerCase().includes(term) ||
          d.unique_deal_id.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, data]);

  const handleSort = (column: keyof SentimentData | "summary") => {
    const isAsc = orderBy === column && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(column);
  };

  const getComparableValue = (row: SentimentData, column: keyof SentimentData | "summary") => {
    switch (column) {
      case "summary":
        return row.sentiment_summary?.one_week || "";
      case "pricing_date":
        return row.pricing_date ? new Date(row.pricing_date).getTime() : 0;
      case "one_week_sentiment":
      case "one_month_sentiment":
        return row[column] || "";
      default:
        return row[column] || "";
    }
  };

  const sortedData = [...filteredData].sort((a, b) => {
    const valA = getComparableValue(a, orderBy);
    const valB = getComparableValue(b, orderBy);

    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  });

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

  const preview = (text?: string) =>
    text ? `${text.split(" ").slice(0, 15).join(" ")}...` : "N/A";

  const handleOpenDialog = (row: SentimentData) => {
    setSelectedSummary(row);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSummary(null);
  };

  const handleRowClick = (row: SentimentData) => {
    navigate(`/ai_sentiment_view?ticker=${row.ticker}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Sentiment Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-driven IPO sentiment insights
          </Typography>
        </Box>

        <TextField
          placeholder="Search ticker, issuer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ width: 280 }}
          InputProps={{
            startAdornment: <SearchOutlinedIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
        />
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          maxHeight: 550,
          mb: 5,
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {[
                { label: "Ticker", key: "ticker" },
                { label: "Issuer", key: "issuer_name" },
                { label: "Date", key: "pricing_date" },
                { label: "1-Week", key: "one_week_sentiment" },
                { label: "1-Month", key: "one_month_sentiment" },
                { label: "Summary", key: "summary" },
                { label: "Action", key: "action" },
              ].map((col) => (
                <TableCell
                  key={col.label}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: "#c7e4f1",
                  }}
                >
                  {col.key !== "action" ? (
                    <TableSortLabel
                      active={orderBy === col.key}
                      direction={orderBy === col.key ? order : "asc"}
                      onClick={() => handleSort(col.key as keyof SentimentData | "summary")}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedData.map((row, i) => {
              const week = getSentiment(row.one_week_sentiment);
              const month = getSentiment(row.one_month_sentiment);

              return (
                <TableRow
                  key={i}
                  hover
                  sx={{
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#f4fbfe" },
                  }}
                  onClick={() => handleRowClick(row)}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{row.ticker}</TableCell>

                  <TableCell>{row.issuer_name}</TableCell>

                  <TableCell>{row.pricing_date || "TBA"}</TableCell>

                  <TableCell>
                    <Chip label={week.label} color={week.color} size="small" />
                  </TableCell>

                  <TableCell>
                    <Chip label={month.label} color={month.color} size="small" />
                  </TableCell>

                  <TableCell sx={{ maxWidth: 320 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        fontSize: "0.9rem",
                        color: "text.primary",
                        lineHeight: 1.6,
                      }}
                    >
                      {preview(row.sentiment_summary?.one_week)}
                    </Typography>

                    <Button
                      size="small"
                      sx={{ mt: 0.5, textTransform: "none", fontWeight: 600 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(row);
                      }}
                    >
                      Read more
                    </Button>
                  </TableCell>

                  <TableCell>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(row);
                      }}
                      sx={{ textTransform: "none" }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            py: 2,
            background: "linear-gradient(90deg, #eef8fd 0%, #f8fbff 100%)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#1f2937" }}>
                {selectedSummary?.ticker} Sentiment Details
              </Typography>
              <Typography variant="body2" sx={{ color: "text.primary", mt: 0.5 }}>
                {selectedSummary?.issuer_name}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`1W: ${
                  getSentiment(selectedSummary?.one_week_sentiment || null).label
                }`}
                color={getSentiment(selectedSummary?.one_week_sentiment || null).color}
                size="small"
              />
              <Chip
                label={`1M: ${
                  getSentiment(selectedSummary?.one_month_sentiment || null).label
                }`}
                color={getSentiment(selectedSummary?.one_month_sentiment || null).color}
                size="small"
              />
              <IconButton onClick={handleCloseDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ px: 3, py: 3 }}>
          <Box
            sx={{
              mb: 3,
              p: 2.5,
              borderRadius: 3,
              backgroundColor: "#f4fbff",
              border: "1px solid #d9ebf7",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 1.2,
                color: "#0f4c75",
              }}
            >
              1 Week Outlook
            </Typography>

            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.9,
                color: "#374151",
                fontSize: "0.97rem",
              }}
            >
              {selectedSummary?.sentiment_summary?.one_week || "N/A"}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: "#fffaf3",
              border: "1px solid #f3dfb1",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 1.2,
                color: "#9a6700",
              }}
            >
              1 Month Outlook
            </Typography>

            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.9,
                color: "#374151",
                fontSize: "0.97rem",
              }}
            >
              {selectedSummary?.sentiment_summary?.one_month || "N/A"}
            </Typography>
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 2.5,
              fontWeight: 600,
            }}
          >
            Close
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              if (selectedSummary) {
                handleCloseDialog();
                navigate(`/ai_sentiment_view?ticker=${selectedSummary.ticker}`);
              }
            }}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 2.5,
              fontWeight: 600,
            }}
          >
            View Details
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SentimentSummary;