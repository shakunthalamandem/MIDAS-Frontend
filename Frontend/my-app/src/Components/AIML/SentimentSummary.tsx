import React, { useEffect, useState, useMemo } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableSortLabel,
  IconButton,
  Divider,
  TablePagination,
  InputAdornment,
  Fade,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CloseIcon from "@mui/icons-material/Close";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FilterListIcon from "@mui/icons-material/FilterList";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

// ── Color Palette (White / Light Theme) ──
const C = {
  // Backgrounds
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBgHover: "#f8fafc",
  tableHeaderBg: "#fafbfc",
  rowHover: "#f0f4ff",
  rowAlt: "#fafbfd",
  // Borders
  border: "#e5e7eb",
  borderLight: "#f0f1f3",
  // Text
  textPrimary: "#0f172a",
  textSecondary: "#1e293b",
  textMuted: "#374151",
  // Accent (deep indigo-blue)
  accent: "#4f46e5",
  accentHover: "#4338ca",
  accentBg: "#eef2ff",
  // Sentiments
  bullishBg: "#ecfdf5",
  bullishColor: "#059669",
  bullishBorder: "#a7f3d0",
  bearishBg: "#fef2f2",
  bearishColor: "#dc2626",
  bearishBorder: "#fecaca",
  neutralBg: "#fffbeb",
  neutralColor: "#d97706",
  neutralBorder: "#fde68a",
};

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
  updated_at?: string;
}

type SentimentType = "bullish" | "bearish" | "neutral";

const SENTIMENT_CONFIG: Record<
  SentimentType,
  { bg: string; color: string; border: string; icon: React.ReactNode; label: string }
> = {
  bullish: {
    bg: C.bullishBg,
    color: C.bullishColor,
    border: C.bullishBorder,
    icon: <TrendingUpIcon sx={{ fontSize: 14 }} />,
    label: "Bullish",
  },
  bearish: {
    bg: C.bearishBg,
    color: C.bearishColor,
    border: C.bearishBorder,
    icon: <TrendingDownIcon sx={{ fontSize: 14 }} />,
    label: "Bearish",
  },
  neutral: {
    bg: C.neutralBg,
    color: C.neutralColor,
    border: C.neutralBorder,
    icon: <TrendingFlatIcon sx={{ fontSize: 14 }} />,
    label: "Neutral",
  },
};

const SentimentBadge: React.FC<{ sentiment: string | null }> = ({ sentiment }) => {
  const key = sentiment?.toLowerCase() as SentimentType | undefined;
  const config = key && SENTIMENT_CONFIG[key];

  if (!config) {
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          px: 1.4,
          py: 0.4,
          borderRadius: "8px",
          fontSize: "0.75rem",
          fontWeight: 600,
          background: "rgba(100,116,139,0.1)",
          color: C.textMuted,
          border: `1px solid ${C.border}`,
        }}
      >
        N/A
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1.4,
        py: 0.4,
        borderRadius: "8px",
        fontSize: "0.75rem",
        fontWeight: 600,
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        letterSpacing: "0.03em",
      }}
    >
      {config.icon}
      {config.label}
    </Box>
  );
};

const StatCard: React.FC<{
  label: string;
  count: number;
  icon: React.ReactNode;
  accentColor: string;
  accentBg: string;
  cardBgColor: string;
  borderColor: string;
}> = ({ label, count, icon, accentColor, accentBg, cardBgColor, borderColor }) => (
  <Box
    sx={{
      flex: "1 1 180px",
      p: 2.5,
      borderRadius: 3,
      background: cardBgColor,
      border: `1px solid ${borderColor}`,
      display: "flex",
      alignItems: "center",
      gap: 2,
      transition: "all 0.2s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 6px 16px rgba(0,0,0,0.07)",
      },
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: 2.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: accentBg,
        color: accentColor,
        flexShrink: 0,
        fontSize: 22,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1.1, color: C.textPrimary }}>
        {count}
      </Typography>
      <Typography sx={{ fontSize: "0.76rem", color: C.textSecondary, fontWeight: 600, mt: 0.3, letterSpacing: "0.03em" }}>
        {label}
      </Typography>
    </Box>
  </Box>
);

const SentimentSummary: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [data, setData] = useState<SentimentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");

  const [selectedSummary, setSelectedSummary] = useState<SentimentData | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [orderBy, setOrderBy] = useState<keyof SentimentData | "summary" | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter((d) => {
      const matchesSearch =
        d.ticker.toLowerCase().includes(term) ||
        d.issuer_name.toLowerCase().includes(term) ||
        d.unique_deal_id.toLowerCase().includes(term);

      const matchesSentiment =
        sentimentFilter === "all" ||
        d.one_week_sentiment?.toLowerCase() === sentimentFilter ||
        d.one_month_sentiment?.toLowerCase() === sentimentFilter;

      return matchesSearch && matchesSentiment;
    });
  }, [searchTerm, sentimentFilter, data]);

  const stats = useMemo(() => {
    const bullish = data.filter(
      (d) =>
        d.one_week_sentiment?.toLowerCase() === "bullish" ||
        d.one_month_sentiment?.toLowerCase() === "bullish"
    ).length;
    const bearish = data.filter(
      (d) =>
        d.one_week_sentiment?.toLowerCase() === "bearish" ||
        d.one_month_sentiment?.toLowerCase() === "bearish"
    ).length;
    const neutral = data.filter(
      (d) =>
        d.one_week_sentiment?.toLowerCase() === "neutral" ||
        d.one_month_sentiment?.toLowerCase() === "neutral"
    ).length;
    return { total: data.length, bullish, bearish, neutral };
  }, [data]);

  const handleSort = (column: keyof SentimentData | "summary") => {
    if (orderBy === column) {
      const isAsc = order === "asc";
      setOrder(isAsc ? "desc" : "asc");
    } else {
      setOrderBy(column);
      setOrder("asc");
    }
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

  const sortedData = useMemo(
    () => {
      if (!orderBy) return filteredData;
      return [...filteredData].sort((a, b) => {
        const valA = getComparableValue(a, orderBy);
        const valB = getComparableValue(b, orderBy);
        if (valA < valB) return order === "asc" ? -1 : 1;
        if (valA > valB) return order === "asc" ? 1 : -1;
        return 0;
      });
    },
    [filteredData, orderBy, order]
  );

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const preview = (text?: string) =>
    text ? `${text.split(" ").slice(0, 18).join(" ")}...` : "N/A";

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

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSentimentFilterChange = (event: SelectChangeEvent<string>) => {
    setSentimentFilter(event.target.value);
    setPage(0);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          gap: 2,
          background: C.pageBg,
        }}
      >
        <CircularProgress size={40} sx={{ color: C.accent }} />
        <Typography sx={{ color: C.textMuted, fontSize: "0.85rem" }}>
          Loading sentiment data...
        </Typography>
      </Box>
    );
  }

  const columns = [
    { label: "Ticker", key: "ticker", width: "9%" },
    { label: "Issuer Name", key: "issuer_name", width: "18%" },
    { label: "Pricing Date", key: "pricing_date", width: "10%" },
    { label: "Last Updated", key: "updated_at", width: "11%" },
    { label: "1-Week", key: "one_week_sentiment", width: "8%" },
    { label: "1-Month", key: "one_month_sentiment", width: "8%" },
    { label: "Summary", key: "summary", width: "28%" },
    { label: "", key: "action", width: "8%" },
  ];

  return (
    <Box sx={{ background: C.pageBg, minHeight: "100vh" }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: C.textPrimary,
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
              }}
            >
              Sentiment Summary
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: C.textMuted, mt: 0.5 }}>
              AI-driven IPO sentiment insights
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: "0.78rem",
              color: C.textMuted,
              background: C.cardBg,
              border: `1px solid ${C.border}`,
              borderRadius: 2,
              px: 2,
              py: 0.8,
            }}
          >
            {stats.total} deals tracked
          </Typography>
        </Box>

        {/* Stat Cards */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <StatCard
            label="Total Deals"
            count={stats.total}
            accentColor={C.accent}
            accentBg={C.accentBg}
            cardBgColor="#eef2ff"
            borderColor="#c7d2fe"
            icon={<FilterListIcon sx={{ fontSize: 20 }} />}
          />
          <StatCard
            label="Bullish"
            count={stats.bullish}
            accentColor={C.bullishColor}
            accentBg={C.bullishBg}
            cardBgColor="#ecfdf5"
            borderColor="#a7f3d0"
            icon={<TrendingUpIcon sx={{ fontSize: 20 }} />}
          />
          <StatCard
            label="Bearish"
            count={stats.bearish}
            accentColor={C.bearishColor}
            accentBg={C.bearishBg}
            cardBgColor="#fef2f2"
            borderColor="#fecaca"
            icon={<TrendingDownIcon sx={{ fontSize: 20 }} />}
          />
          <StatCard
            label="Neutral"
            count={stats.neutral}
            accentColor={C.neutralColor}
            accentBg={C.neutralBg}
            cardBgColor="#fffbeb"
            borderColor="#fde68a"
            icon={<TrendingFlatIcon sx={{ fontSize: 20 }} />}
          />
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 2,
              background: C.bearishBg,
              color: C.bearishColor,
              border: `1px solid ${C.bearishBorder}`,
              "& .MuiAlert-icon": { color: C.bearishColor },
            }}
          >
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            placeholder="Search ticker, issuer..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{
              flex: "1 1 280px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: C.cardBg,
                color: C.textPrimary,
                fontSize: "0.85rem",
                border: `1px solid ${C.border}`,
                "&:hover": { borderColor: C.textMuted },
                "&.Mui-focused": { borderColor: C.accent },
                "& fieldset": { border: "none" },
              },
              "& .MuiInputBase-input::placeholder": {
                color: C.textMuted,
                opacity: 1,
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon sx={{ color: C.textMuted, fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl size="small">
            <Select
              value={sentimentFilter}
              onChange={handleSentimentFilterChange}
              displayEmpty
              sx={{
                borderRadius: 2,
                backgroundColor: C.cardBg,
                color: C.textPrimary,
                fontSize: "0.85rem",
                minWidth: 155,
                border: `1px solid ${C.border}`,
                "&:hover": { borderColor: C.textMuted },
                "& .MuiSelect-select": { py: 0.9 },
                "& fieldset": { border: "none" },
                "& .MuiSvgIcon-root": { color: C.textMuted },
              }}
              startAdornment={
                <FilterListIcon sx={{ color: C.textMuted, fontSize: 16, mr: 0.5 }} />
              }
              MenuProps={{
                PaperProps: {
                  sx: {
                    background: C.cardBg,
                    border: `1px solid ${C.border}`,
                    borderRadius: 2,
                    mt: 0.5,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    "& .MuiMenuItem-root": {
                      color: C.textSecondary,
                      fontSize: "0.85rem",
                      "&:hover": { background: C.accentBg },
                      "&.Mui-selected": { background: C.accentBg, color: C.accent },
                    },
                  },
                },
              }}
            >
              <MenuItem value="all">All Sentiments</MenuItem>
              <MenuItem value="bullish">Bullish</MenuItem>
              <MenuItem value="bearish">Bearish</MenuItem>
              <MenuItem value="neutral">Neutral</MenuItem>
            </Select>
          </FormControl>

          <Typography sx={{ fontSize: "0.78rem", color: C.textMuted, ml: "auto" }}>
            {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}
          </Typography>
        </Box>

        {/* Table */}
        <Fade in>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${C.border}`,
              overflow: "hidden",
              background: C.cardBg,
            }}
          >
            <TableContainer sx={{ maxHeight: 560 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell
                        key={col.label || "action"}
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          // textTransform: "uppercase",
                          // letterSpacing: "0.08em",
                          color: C.textMuted,
                          backgroundColor: C.tableHeaderBg,
                          borderBottom: `1px solid ${C.border}`,
                          py: 1.6,
                          px: 2,
                          width: col.width,
                          alignContent:"center"
                        }}
                      >
                        {col.key !== "action" ? (
                          <TableSortLabel
                            active={orderBy === col.key && orderBy !== null}
                            direction={orderBy === col.key ? order : "asc"}
                            onClick={() =>
                              handleSort(col.key as keyof SentimentData | "summary")
                            }
                            sx={{
                              color: `${C.textMuted} !important`,
                              "&:hover": { color: `${C.textSecondary} !important` },
                              "&.Mui-active": { color: `${C.accent} !important` },
                              "&.Mui-active .MuiTableSortLabel-icon": {
                                color: `${C.accent} !important`,
                              },
                              "& .MuiTableSortLabel-icon": {
                                color: `${C.textMuted} !important`,
                              },
                            }}
                          >
                            {col.label}
                          </TableSortLabel>
                        ) : null}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        sx={{
                          textAlign: "center",
                          py: 8,
                          borderBottom: "none",
                          background: "transparent",
                        }}
                      >
                        <Typography sx={{ color: C.textMuted, fontSize: "0.9rem" }}>
                          No results found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((row, i) => (
                      <TableRow
                        key={`${row.ticker}-${i}`}
                        sx={{
                          cursor: "pointer",
                          transition: "background-color 0.15s ease",
                          background: i % 2 === 0 ? "transparent" : C.rowAlt,
                          "&:hover": {
                            background: `${C.rowHover} !important`,
                          },
                          "& td": {
                            borderBottom: `1px solid ${C.borderLight}`,
                            px: 2,
                            py: 1.6,
                          },
                        }}
                        onClick={() => handleRowClick(row)}
                      >
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: "0.95rem",
                              color: C.accent,
                              fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                              letterSpacing: "0.03em",
                            }}
                          >
                            {row.ticker}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              fontSize: "0.83rem",
                              color: C.textSecondary,
                              fontWeight: 500,
                            }}
                          >
                            {row.issuer_name}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              fontSize: "0.82rem",
                              color: C.textMuted,
                              fontWeight: 500,
                              // fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                            }}
                          >
                            {row.pricing_date
                              ? new Date(row.pricing_date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "N/A"}                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              fontSize: "0.82rem",
                              color: C.textMuted,
                              fontWeight: 500,
                              // fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                            }}
                          >
                            {row.updated_at
                              ? new Date(row.updated_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <SentimentBadge sentiment={row.one_week_sentiment} />
                        </TableCell>

                        <TableCell>
                          <SentimentBadge sentiment={row.one_month_sentiment} />
                        </TableCell>

                        <TableCell>
                          <Typography
                            sx={{
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              fontSize: "0.8rem",
                              color: C.textSecondary,
                              lineHeight: 1.65,
                            }}
                          >
                            {preview(row.sentiment_summary?.one_week)}
                          </Typography>
                          <Typography
                            component="span"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDialog(row);
                            }}
                            sx={{
                              fontSize: "0.74rem",
                              fontWeight: 600,
                              color: C.accent,
                              cursor: "pointer",
                              mt: 0.3,
                              display: "inline-block",
                              "&:hover": { color: C.accentHover, textDecoration: "underline" },
                            }}
                          >
                            Read more
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Tooltip title="View full analysis" arrow>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(row);
                              }}
                              sx={{
                                color: C.accent,
                                background: C.accentBg,
                                borderRadius: 1.5,
                                width: 32,
                                height: 32,
                                "&:hover": {
                                  background: C.accent,
                                  color: "#fff",
                                },
                                transition: "all 0.2s ease",
                              }}
                            >
                              <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: `1px solid ${C.border}`,
                color: C.textMuted,
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                  fontSize: "0.78rem",
                  color: C.textMuted,
                },
                "& .MuiTablePagination-select": {
                  color: C.textSecondary,
                },
                "& .MuiSvgIcon-root": { color: C.textMuted },
                "& .MuiIconButton-root.Mui-disabled": { color: `${C.border}` },
              }}
            />
          </Paper>
        </Fade>

        {/* Detail Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="md"
          slots={{ transition: Fade }}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 3,
                overflow: "hidden",
                background: C.cardBg,
                border: `1px solid ${C.border}`,
                boxShadow: "0 25px 60px rgba(0,0,0,0.12)",
              },
            },
          }}
        >
          <DialogTitle
            sx={{
              px: 3,
              py: 2.5,
              background: C.tableHeaderBg,
              borderBottom: `1px solid ${C.border}`,
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
                <Typography
                  sx={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: C.textPrimary,
                    letterSpacing: "-0.01em",
                    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
                  }}
                >
                  {selectedSummary?.ticker}
                </Typography>
                <Typography sx={{ fontSize: "0.85rem", color: C.textSecondary, mt: 0.3 }}>
                  {selectedSummary?.issuer_name}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SentimentBadge sentiment={selectedSummary?.one_week_sentiment || null} />
                <SentimentBadge sentiment={selectedSummary?.one_month_sentiment || null} />
                <IconButton
                  onClick={handleCloseDialog}
                  size="small"
                  sx={{
                    color: C.textMuted,
                    ml: 0.5,
                    "&:hover": { color: C.textPrimary, background: C.accentBg },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ px: 3, py: 3 }}>
            {/* 1-Week */}
            <Box
              sx={{
                mb: 2.5,
                p: 2.5,
                borderRadius: 2.5,
                background: C.accentBg,
                border: `1px solid #c7d2fe`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
                <TrendingUpIcon sx={{ fontSize: 16, color: C.accent }} />
                <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: C.accent }}>
                  1-Week Outlook
                </Typography>
              </Box>
              <Typography
                sx={{ lineHeight: 1.8, color: C.textSecondary, fontSize: "0.88rem" }}
              >
                {selectedSummary?.sentiment_summary?.one_week || "N/A"}
              </Typography>
            </Box>

            {/* 1-Month */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                background: C.neutralBg,
                border: `1px solid ${C.neutralBorder}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
                <TrendingFlatIcon sx={{ fontSize: 16, color: C.neutralColor }} />
                <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: C.neutralColor }}>
                  1-Month Outlook
                </Typography>
              </Box>
              <Typography
                sx={{ lineHeight: 1.8, color: C.textSecondary, fontSize: "0.88rem" }}
              >
                {selectedSummary?.sentiment_summary?.one_month || "N/A"}
              </Typography>
            </Box>
          </DialogContent>

          <Divider sx={{ borderColor: C.border }} />

          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                px: 2.5,
                fontWeight: 600,
                fontSize: "0.84rem",
                color: C.textMuted,
                border: `1px solid ${C.border}`,
                "&:hover": { borderColor: C.textMuted, background: C.accentBg },
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
                fontSize: "0.84rem",
                background: C.accent,
                color: "#ffffff",
                boxShadow: "none",
                "&:hover": {
                  background: C.accentHover,
                  boxShadow: `0 4px 16px rgba(79,70,229,0.25)`,
                },
              }}
              endIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
            >
              View Full Analysis
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default SentimentSummary;
