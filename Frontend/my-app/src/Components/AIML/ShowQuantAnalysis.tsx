import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import { useNavigate } from "react-router-dom";
import { Block } from "../GhcAi/Utils/ComponentsUtils";

interface QuantAnalysisData {
  count: number;
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
  created_at: string;
  updated_at: string;
}

const ShowQuantAnalysis: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const [tickers, setTickers] = useState<QuantTicker[]>([]);
  const [filteredTickers, setFilteredTickers] = useState<QuantTicker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchQuantAnalysis();
  }, []);

  useEffect(() => {
    const filtered = tickers.filter(
      (ticker) =>
        ticker.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticker.issuer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticker.sector.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTickers(filtered);
  }, [searchQuery, tickers]);

  const fetchQuantAnalysis = async () => {
    if (!apiUrl) {
      setError("REACT_APP_API_URL is not set.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${apiUrl}/api/quant_agent/all_tickers_latest/`, {
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
        {/* Top Row: Title + Search */}
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
        <TableContainer
          component={Paper}
          sx={{
            mt:4,
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <TableCell sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.85rem" }}>
                  Ticker
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.85rem" }}>
                  Issuer Name
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.85rem" }}>
                  Sector
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.85rem" }}>
                  Pricing Date
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.85rem" }}>
                  Run Date
                </TableCell>
                {/* <TableCell sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.85rem" }}>
                  Verdict
                </TableCell> */}
                {/* <TableCell sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.85rem" }}>
                  Conviction Score
                </TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickers.map((ticker) => {
                const conviction = getConvictionScore(ticker.quant_analysis);
                const verdict = getSentimentFromBlocks(ticker.quant_analysis);

                return (
                  <TableRow
                    key={ticker.unique_deal_id}
                    onClick={() =>
                      navigate(`/quant-analysis/${encodeURIComponent(ticker.ticker)}`)
                    }
                    sx={{
                      background: "#ffffff",
                      "&:hover": { background: "#f8fafc" },
                      cursor: "pointer",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <TableCell
                      sx={{ fontWeight: 600, color: "#4f46e5", fontSize: "0.85rem" }}
                    >
                      {ticker.ticker}
                    </TableCell>
                    <TableCell sx={{ color: "#0f172a", fontSize: "0.8rem" }}>
                      {ticker.issuer_name}
                    </TableCell>
                    <TableCell sx={{ color: "#000000", fontSize: "0.8rem" }}>
                    {ticker.sector} 
                    </TableCell>
                    <TableCell sx={{ color: "#000000", fontSize: "0.8rem" }}>
                      {new Date(ticker.pricing_date).toISOString().split("T")[0]}
                    </TableCell>
                    <TableCell sx={{ color: "#000000", fontSize: "0.8rem" }}>
                      {new Date(ticker.run_date).toISOString().split("T")[0]}
                    </TableCell>
                    {/* <TableCell sx={{ fontSize: "0.8rem" }}>
                      <Chip
                        label={verdict}
                        size="small"
                        color={
                          verdict.includes("Buy")
                            ? "success"
                            : verdict.includes("Sell")
                            ? "error"
                            : "warning"
                        }
                        variant="outlined"
                      />
                    </TableCell> */}
                    {/* <TableCell
                      sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.85rem" }}
                    >
                      {conviction !== null ? `${conviction}/10` : "—"}
                    </TableCell> */}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Results Count */}
      {!loading && filteredTickers.length > 0 && (
        <Box sx={{ mt: 2, textAlign: "right" }}>
          <Typography sx={{ fontSize: "0.8rem", color: "#64748b" }}>
            Showing {filteredTickers.length} of {tickers.length} tickers
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ShowQuantAnalysis;
