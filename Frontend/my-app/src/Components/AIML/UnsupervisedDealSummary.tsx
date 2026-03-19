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
  CircularProgress,
  Alert,
  TextField,
  Button,
  Typography,
  Chip,
  TableSortLabel,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

interface Data {
  ticker: string;
  issuer_name: string;
  pricing_date: string | null;
  unique_deal_id: string;
  few_shot_review: string;
  one_week_sentiment?: string | null;
  one_month_sentiment?: string | null;
  executive_summary?: string;
}

type SortField =
  | "ticker"
  | "issuer_name"
  | "pricing_date"
  | "one_week_sentiment"
  | "one_month_sentiment"
  | "executive_summary";

type SortOrder = "asc" | "desc";

const parseData = (review: string) => {
  try {
    const parsed = JSON.parse(review);
    const obj = parsed?.answer?.[0];

    return {
      oneWeek:
        obj?.["Final Sentiment & Volatility Outlook"]?.["1-Week Sentiment"],
      oneMonth:
        obj?.["Final Sentiment & Volatility Outlook"]?.["1-Month Sentiment"],
      summary: obj?.["Executive Summary"],
    };
  } catch {
    return { oneWeek: null, oneMonth: null, summary: "" };
  }
};

const Component: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [data, setData] = useState<Data[]>([]);
  const [filteredData, setFilteredData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("ticker");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const [selectedSummary, setSelectedSummary] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${apiUrl}/api/unsupervised_summary/`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const result = await res.json();
        const arr = Array.isArray(result) ? result : result.data || [];

        const mapped = arr.map((item: any) => {
          const parsed = parseData(item.few_shot_review);

          return {
            ...item,
            one_week_sentiment: parsed.oneWeek,
            one_month_sentiment: parsed.oneMonth,
            executive_summary: parsed.summary,
          };
        });

        setData(mapped);
        setFilteredData(mapped);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  useEffect(() => {
    let filtered = data;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = data.filter(
        (d) =>
          d.ticker?.toLowerCase().includes(term) ||
          d.issuer_name?.toLowerCase().includes(term) ||
          d.unique_deal_id?.toLowerCase().includes(term)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      let aVal: any = a[sortField] || "";
      let bVal: any = b[sortField] || "";

      if (sortField === "pricing_date") {
        aVal = aVal && aVal !== "TBA" ? new Date(aVal).getTime() : 0;
        bVal = bVal && bVal !== "TBA" ? new Date(bVal).getTime() : 0;
      }

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredData(sorted);
  }, [searchTerm, data, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    setSortField(field);
    setSortOrder(sortField === field && sortOrder === "asc" ? "desc" : "asc");
  };

  const getSentiment = (s: string | null | undefined) => {
    switch (s?.toLowerCase()) {
      case "bullish":
        return { label: "Bullish", bg: "#1f8b3d" };
      case "bearish":
        return { label: "Bearish", bg: "#d64541" };
      case "neutral":
        return { label: "Neutral", bg: "#f08a24" };
      default:
        return { label: s || "N/A", bg: "#9e9e9e" };
    }
  };

  const preview = (text?: string) =>
    text ? text.split(" ").slice(0, 12).join(" ") + "..." : "N/A";

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Sentiment Summary
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
            AI-driven IPO sentiment insights
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Search ticker, issuer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            width: 280,
            backgroundColor: "#fff",
            borderRadius: 2,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon sx={{ fontSize: 18, color: "#6b7280" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card
        sx={{
          borderRadius: "16px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <TableContainer
          sx={{
            maxHeight: 550,
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#a9a9a9",
              borderRadius: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f3f4f6",
            },
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  ["Ticker", "ticker"],
                  ["Issuer", "issuer_name"],
                  ["Date", "pricing_date"],
                  ["1-Week", "one_week_sentiment"],
                  ["1-Month", "one_month_sentiment"],
                  ["Summary", "executive_summary"],
                ].map(([label, key]) => (
                  <TableCell
                    key={key}
                    sx={{
                      backgroundColor: "#b9d4e1",
                      color: "#000",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      borderBottom: "none",
                      py: 2.2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <TableSortLabel
                      active={sortField === key}
                      direction={sortOrder}
                      onClick={() => handleSort(key as SortField)}
                      sx={{
                        "& .MuiTableSortLabel-icon": {
                          color: "#5f6368 !important",
                        },
                      }}
                    >
                      {label}
                    </TableSortLabel>
                  </TableCell>
                ))}

                <TableCell
                  sx={{
                    backgroundColor: "#b9d4e1",
                    color: "#000",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    borderBottom: "none",
                    py: 2.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredData.map((row, i) => {
                const w = getSentiment(row.one_week_sentiment);
                const m = getSentiment(row.one_month_sentiment);

                return (
                  <TableRow
                    key={row.unique_deal_id }
                    // sx={{
                    //   backgroundColor: i === 0 ? "#c7e4f1" : "#fff",
                    //   "&:hover": {
                    //     backgroundColor: i === 0 ? "#c7e4f1" : "#f7fbfd",
                    //   },
                    //   "& td": {
                    //     borderBottom: "1px solid #d9d9d9",
                    //     py: 2.2,
                    //   },
                    // }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.98rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.ticker || "N/A"}
                    </TableCell>

                    <TableCell
                      sx={{
                        minWidth: 260,
                        fontSize: "0.98rem",
                      }}
                    >
                      {row.issuer_name || "N/A"}
                    </TableCell>

                    <TableCell sx={{ whiteSpace: "nowrap", fontSize: "0.98rem" }}>
                      {row.pricing_date || "TBA"}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={w.label}
                        size="small"
                        sx={{
                          backgroundColor: w.bg,
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                          height: 26,
                          borderRadius: "14px",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={m.label}
                        size="small"
                        sx={{
                          backgroundColor: m.bg,
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                          height: 26,
                          borderRadius: "14px",
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ minWidth: 340, maxWidth: 360 }}>
                      <Typography
                        sx={{
                          fontSize: "0.95rem",
                          color: "#4b5563",
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          mb: 0.5,
                        }}
                      >
                        {preview(row.executive_summary)}
                      </Typography>

                      <Button
                        size="small"
                        variant="text"
                        sx={{
                          textTransform: "none",
                          p: 0,
                          minWidth: 0,
                          fontSize: "0.95rem",
                          color: "#2563eb",
                          fontWeight: 500,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSummary(row.executive_summary || "");
                          setOpenDialog(true);
                        }}
                      >
                        Read more
                      </Button>
                    </TableCell>

                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{
                          textTransform: "none",
                          backgroundColor: "#4f7bd9",
                          color: "#fff",
                          borderRadius: "6px",
                          px: 2.4,
                          minWidth: 64,
                          boxShadow: "0 2px 6px rgba(79,123,217,0.35)",
                          "&:hover": {
                            backgroundColor: "#3f6ac4",
                          },
                        }}
                        onClick={() =>
                          navigate(`/ai_fewshot_analysis?ticker=${row.ticker}`)
                        }
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!filteredData.length && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No records found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Executive Summary</DialogTitle>

        <DialogContent dividers>
          <Box
            sx={{ fontSize: "0.95rem", lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{
              __html: selectedSummary || "No summary available",
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Component;