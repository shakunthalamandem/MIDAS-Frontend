import React, { useEffect, useState, useMemo } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
  Link,
  Button,
  TableSortLabel,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import { useNavigate, useLocation } from "react-router-dom";
import { Block } from "../GhcAi/Utils/ComponentsUtils";

interface QuantAnalysisData {
  count: number;
  deal_type: string;
  data: QuantTicker[];
}

interface QuantTicker {
  ticker: string;
  run_date: string;
  pricing_date: string;
  region: string;
  deal_type: string;
  unique_deal_id: string;
  issuer_name: string;
  sector: string;
  quant_analysis?: Block[];
  quant_signal?: string;
  created_at: string;
  updated_at: string;
}

const ShowQuantAnalysis: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialDealType = (searchParams.get("dealType") as "IPO" | "FO") || "IPO";

  const [tickers, setTickers] = useState<QuantTicker[]>([]);
  const [filteredTickers, setFilteredTickers] = useState<QuantTicker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dealType, setDealType] = useState<"IPO" | "FO">(initialDealType);
  const [sortColumn, setSortColumn] = useState<string>("run_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchQuantAnalysis();
  }, [dealType]);

  const sortTickers = (data: QuantTicker[], column: string, direction: "asc" | "desc") => {
    const sorted = [...data].sort((a, b) => {
      let aVal: any = a[column as keyof QuantTicker];
      let bVal: any = b[column as keyof QuantTicker];

      // Handle null/undefined values - push them to the end
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return direction === "asc" ? 1 : -1;
      if (bVal == null) return direction === "asc" ? -1 : 1;

      if (column === "pricing_date" || column === "run_date") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === "string" && typeof bVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (direction === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    return sorted;
  };

  useEffect(() => {
    const filtered = tickers.filter(
      (ticker) =>
        ticker.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticker.issuer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticker.sector.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const sorted = sortTickers(filtered, sortColumn, sortDirection);
    setFilteredTickers(sorted);
    setPage(0);
  }, [searchQuery, tickers, sortColumn, sortDirection]);

  const fetchQuantAnalysis = async () => {
    if (!apiUrl) {
      setError("REACT_APP_API_URL is not set.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${apiUrl}/api/quant_agent/all_tickers_latest/?deal_type=${dealType}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data: any = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || data?.detail || `Request failed with status ${res.status}`);
      }

      setTickers(data.data || []);
      setFilteredTickers(data.data || []);
    } catch (err: any) {
      const msg = err?.message || "Unable to load quant analysis.";
      setError(msg);
      setTickers([]);
    } finally {
      setLoading(false);
    }
  };

  const getConvictionScore = (blocks: Block[] | undefined): number | null => {
    if (!blocks || !Array.isArray(blocks)) return null;

    const textBlock = blocks.find(
      (block) =>
        block.type === "text" &&
        "content" in block &&
        typeof (block as any).content === "string" &&
        (block as any).content.includes("Conviction Score")
    );
    if (textBlock && "content" in textBlock && typeof (textBlock as any).content === "string") {
      const match = (textBlock as any).content.match(/(\d+\.?\d*)\s*\/\s*10/);
      return match ? parseFloat(match[1]) : null;
    }
    return null;
  };

  const getSentimentFromBlocks = (blocks: Block[] | undefined): string => {
    if (!blocks || !Array.isArray(blocks)) return "—";

    const cardBlocks = blocks.filter((b) => b.type === "card");
    const executiveCard = cardBlocks.find((b) => "subtitle" in b && (b as any).subtitle === "Executive Verdict");
    return "title" in (executiveCard || {}) ? (executiveCard as any).title : "—";
  };

  const getSummaryFromBlocks = (blocks: Block[] | string | undefined): string => {
    let parsedBlocks: any[] = [];

    if (typeof blocks === "string") {
      try {
        parsedBlocks = JSON.parse(blocks);
      } catch (e) {
        return "No summary available";
      }
    } else if (Array.isArray(blocks)) {
      parsedBlocks = blocks;
    } else {
      return "No summary available";
    }

    const textBlocks = parsedBlocks.filter((b: any) => b.type === "text");

    // Try to get the last text block first
    if (textBlocks.length > 0) {
      const lastTextBlock = textBlocks[textBlocks.length - 1] as any;
      const content = lastTextBlock.content || "";
      if (content) {
        return content.substring(0, 120) + "...";
      }
    }

    // Fallback to card blocks if no text blocks
    const cardBlocks = parsedBlocks.filter((b: any) => b.type === "card");
    if (cardBlocks.length > 0) {
      const firstCard = cardBlocks[0] as any;
      const content = firstCard.description || "";
      if (content) {
        return content.substring(0, 120) + "...";
      }
    }

    return "No summary available";
  };

  const getSignalColor = (signal: string | undefined) => {
    if (!signal) return { bg: "#f1f5f9", color: "#64748b" };
    const s = signal.toLowerCase();
    if (/buy|strong buy/.test(s)) return { bg: "#dcfce7", color: "#166534" };
    if (/sell|strong sell/.test(s)) return { bg: "#fee2e2", color: "#991b1b" };
    if (/hold|neutral/.test(s)) return { bg: "#fef3c7", color: "#92400e" };
    return { bg: "#f1f5f9", color: "#64748b" };
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const SortableHeader = ({ column, label }: { column: string; label: string }) => (
    <TableCell
      sx={{
        fontWeight: 700,
        color: "#0f172a",
        fontSize: "0.85rem",
        cursor: "pointer",
        userSelect: "none",
        "&:hover": {
          backgroundColor: "#f1f5f9",
        },
      }}
      onClick={() => handleSort(column)}
    >
      <TableSortLabel
        active={sortColumn === column}
        direction={sortColumn === column ? sortDirection : "asc"}
        sx={{
          "& .MuiTableSortLabel-icon": {
            color: sortColumn === column ? "#4f46e5" : "#cbd5e1",
          },
        }}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 1, sm: 2, md: 3 },
        py: 3,
      }}
    >
      {/* Header Section - Minimal Layout */}
      <Box sx={{ mb: 2.5 }}>
        {/* Top Row: Title + Tabs + Search */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 1.5,
            flexWrap: "wrap",
          }}
        >
          {/* Left - Icon + Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexShrink: 0 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <InsightsRoundedIcon sx={{ fontSize: 20, color: "#fff" }} />
            </Box>
            <Typography
              sx={{
                fontSize: "1.35rem",
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              Quant Analysis
            </Typography>
          </Box>

          {/* Middle - Deal Type Tabs */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={() => {
                setDealType("IPO");
                setPage(0);
              }}
              sx={{
                px: 2.5,
                py: 0.8,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: "0.85rem",
                textTransform: "none",
                border: `2px solid ${dealType === "IPO" ? "#4f46e5" : "#e2e8f0"}`,
                color: dealType === "IPO" ? "#4f46e5" : "#94a3b8",
                backgroundColor: dealType === "IPO" ? "#eef2ff" : "transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#4f46e5",
                  backgroundColor: "#eef2ff",
                },
              }}
            >
              IPO
            </Button>
            <Button
              onClick={() => {
                setDealType("FO");
                setPage(0);
              }}
              sx={{
                px: 2.5,
                py: 0.8,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: "0.85rem",
                textTransform: "none",
                border: `2px solid ${dealType === "FO" ? "#4f46e5" : "#e2e8f0"}`,
                color: dealType === "FO" ? "#4f46e5" : "#94a3b8",
                backgroundColor: dealType === "FO" ? "#eef2ff" : "transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#4f46e5",
                  backgroundColor: "#eef2ff",
                },
              }}
            >
              FO
            </Button>
          </Box>

          {/* Right - Search Bar */}
          <Box sx={{ width: { xs: "100%", sm: 320 }, flexShrink: 0 }}>
            <TextField
              fullWidth
              placeholder="Search by ticker, issuer name, or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchOutlinedIcon sx={{ color: "#94a3b8", mr: 0.5, fontSize: 20 }} />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  background: "#f8fafc",
                  fontSize: "0.88rem",
                  "& fieldset": { borderColor: "#e2e8f0" },
                  "&:hover fieldset": { borderColor: "#cbd5e1" },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4f46e5",
                    borderWidth: "1.5px",
                  },
                },
              }}
            />
          </Box>
        </Box>

        {/* Description - Smaller, Below */}
        {/* <Typography
          sx={{
            fontSize: "0.75rem",
            color: "#94a3b8",
            lineHeight: 1.5,
          }}
        >
          QuantAgent is a quantitative scoring engine that evaluates a stock after a major event (earnings, IPO, FDA, offering, etc.) using 7 categories of hard data — trend, relative strength, volume, momentum, volatility, technical levels, and event quality.
        </Typography> */}
      </Box>

      {/* Loading */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            gap: 2,
          }}
        >
          <CircularProgress size={36} thickness={4} sx={{ color: "#4f46e5" }} />
          <Typography sx={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}>
            Loading quant analysis data...
          </Typography>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2.5,
            border: "1px solid #fecaca",
            "& .MuiAlert-message": { fontSize: "0.85rem" },
          }}
        >
          {error}
        </Alert>
      )}

      {/* No Data */}
      {!loading && !error && filteredTickers.length === 0 && (
        <Box
          sx={{
            py: 8,
            textAlign: "center",
            background: "#ffffff",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
          }}
        >
          <PublicRoundedIcon sx={{ fontSize: 48, color: "#e2e8f0", mb: 1.5 }} />
          <Typography sx={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            {searchQuery ? "No results found." : "No quant analysis data available."}
          </Typography>
        </Box>
      )}

      {/* Table */}
      {!loading && filteredTickers.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              maxHeight: 600,
              overflow: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f1f5f9",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#cbd5e1",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#94a3b8",
              },
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <SortableHeader column="ticker" label="Ticker" />
                  <SortableHeader column="issuer_name" label="Issuer Name" />
                  <SortableHeader column="pricing_date" label="Pricing Date" />
                  <SortableHeader column="run_date" label="Run Date" />
                  <SortableHeader column="quant_signal" label="Signal" />
                  <TableCell sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.85rem" }}>
                    Summary
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTickers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((ticker) => {
                    const verdict = getSentimentFromBlocks(ticker.quant_analysis);

                    return (
                      <TableRow
                        key={ticker.unique_deal_id}
                        onClick={() =>
                          navigate(`/quant-analysis/${encodeURIComponent(ticker.ticker)}?deal_type=${dealType}`)
                        }
                        sx={{
                          background: "#ffffff",
                          "&:hover": { background: "#f8fafc" },
                          borderBottom: "1px solid #e2e8f0",
                          cursor: "pointer",
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600, color: "#4f46e5", fontSize: "0.85rem" }}>
                          {ticker.ticker}
                        </TableCell>
                        <TableCell sx={{ color: "#0f172a", fontSize: "0.8rem" }}>
                          {ticker.issuer_name}
                        </TableCell>
                        <TableCell sx={{ color: "#000000", fontSize: "0.8rem" }}>
                          {new Date(ticker.pricing_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell sx={{ color: "#000000", fontSize: "0.8rem" }}>
                          {new Date(ticker.run_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell sx={{ padding: "8px" }}>
                          {ticker.quant_signal && (
                            <Chip
                              label={ticker.quant_signal}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                backgroundColor: getSignalColor(ticker.quant_signal).bg,
                                color: getSignalColor(ticker.quant_signal).color,
                                border: "none",
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 350, padding: "8px" }}>
                          <Typography
                            sx={{
                              color: "#312f2f",
                              lineHeight: 1.4,
                              fontSize: "0.8rem",
                              fontWeight: 500,
                              fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              mb: 0.75,
                            }}
                          >
                            {getSummaryFromBlocks(ticker.quant_analysis)}
                          </Typography>
                          <Link
                            component="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/quant-analysis/${encodeURIComponent(ticker.ticker)}`);
                            }}
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "#4f46e5",
                              textDecoration: "none",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              "&:hover": {
                                textDecoration: "underline",
                                color: "#3730a3",
                              },
                            }}
                          >
                            Read more
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredTickers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            sx={{
              borderTop: "1px solid #e2e8f0",
              background: "#ffffff",
              borderRadius: "0 0 12px 12px",
              "& .MuiTablePagination-toolbar": {
                paddingRight: 2,
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ShowQuantAnalysis;
