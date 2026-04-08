import React, { useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import GENAIRenderer from "../GhcAi/AIPages/GENAIRenderer";
import { Block } from "../GhcAi/Utils/ComponentsUtils";

const formatPricingDate = (dateStr?: string | null) => {
  if (!dateStr) return "TBA";
  return dateStr;
};

type ShowSentimentAnalysisProps = {
  focusTicker: string | null;
  tickerOptions?: {
    id: string;
    ticker: string;
    unique_deal_id: string;
    issuer_name: string;
    pricing_date?: string | null;
    sentiment_date: string;
    updated_at: string;
    created_at: string;
  }[];
  selectedTicker?: {
    id: string;
    ticker: string;
    unique_deal_id: string;
    issuer_name: string;
    pricing_date?: string | null;
    sentiment_date: string;
    updated_at: string;
    created_at: string;
  } | null;
  onSelectTicker?: (
    val: {
      id: string;
      ticker: string;
      unique_deal_id: string;
      issuer_name: string;
      pricing_date?: string | null;
      sentiment_date: string;
      updated_at: string;
      created_at: string;
    } | null
  ) => void;
  loadingTickers?: boolean;
  tickerError?: string | null;
};

const parseLooseJson = (value: string): any | null => {
  try {
    return JSON.parse(value);
  } catch {
    try {
      const fn = new Function(`return ${value};`);
      return fn();
    } catch {
      return null;
    }
  }
};

const normalizeBlocks = (val: any): Block[] => {
  if (Array.isArray(val)) return val as Block[];
  if (val && typeof val === "object") {
    if (Array.isArray((val as any).answer)) return (val as any).answer as Block[];
    if (Array.isArray((val as any).blocks)) return (val as any).blocks as Block[];
    if (Array.isArray((val as any).data)) return (val as any).data as Block[];
    if (Array.isArray((val as any).sentiment)) return (val as any).sentiment as Block[];
  }
  if (typeof val === "string" && val.trim()) {
    const parsed = parseLooseJson(val.trim());
    if (parsed) return normalizeBlocks(parsed);
    return [{ type: "text", content: val.trim() } as Block];
  }
  return [];
};

const ShowSentimentAnalysis: React.FC<ShowSentimentAnalysisProps> = ({
  focusTicker,
  tickerOptions = [],
  selectedTicker = null,
  onSelectTicker,
  loadingTickers = false,
  tickerError = null,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [socialMediaBlocks, setSocialMediaBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [latestDate, setLatestDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    if (!focusTicker || !selectedTicker) {
      setBlocks([]);
      setSocialMediaBlocks([]);
      setError(null);
      setStatus(null);
      setLoading(false);
      setActiveTab(0);
      return;
    }

    if (!apiUrl) {
      setError("REACT_APP_API_URL is not set.");
      setBlocks([]);
      return;
    }

    const fetchSentiment = async () => {
      setLoading(true);
      setError(null);
      setStatus(null);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${apiUrl}/api/get_us_sentiment_analysis/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            ticker: focusTicker,
            unique_deal_id: selectedTicker.unique_deal_id,
            updated_at: selectedTicker.updated_at,
            pricing_date: selectedTicker.pricing_date,
          }),
        });

        const text = await res.text();
        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = null;
        }

        if (!res.ok) {
          const friendly = "Data will update soon for this ticker.";
          const apiMsg = data?.error || data?.detail || text || "";
          const isNotFound = res.status === 404;
          const mentionsNoSentiment = typeof apiMsg === "string" && apiMsg.toLowerCase().includes("no sentiment");
          if (isNotFound || mentionsNoSentiment) {
            setStatus(friendly);
            setBlocks([]);
            setSocialMediaBlocks([]);
            return;
          }
          throw new Error(apiMsg || `Request failed with status ${res.status}`);
        }

        if (data?.updated_at) {
          setLatestDate(data.updated_at);
        } else {
          setLatestDate(null);
        }

        const raw = data?.sentiment ?? data?.answer ?? data;
        const parsedBlocks = normalizeBlocks(raw);

        const socialMediaRaw = data?.socialmedia_retail_sentiment;
        const parsedSocialMediaBlocks = socialMediaRaw ? normalizeBlocks(socialMediaRaw) : [];

        if (!parsedBlocks.length && !parsedSocialMediaBlocks.length) {
          setStatus("Data will update soon for this ticker.");
          setBlocks([]);
          setSocialMediaBlocks([]);
        } else {
          setBlocks(parsedBlocks);
          setSocialMediaBlocks(parsedSocialMediaBlocks);
          // Auto-activate the appropriate tab based on available data
          if (parsedSocialMediaBlocks.length > 0) {
            setActiveTab(0);
          } else if (parsedBlocks.length > 0) {
            setActiveTab(1);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          const msg = err?.message || "";
          const mentionsNoSentiment =
            typeof msg === "string" && msg.toLowerCase().includes("no sentiment");
          if (mentionsNoSentiment) {
            setStatus("Data will update soon for this ticker.");
            setError(null);
          } else {
            setError(msg || "Unable to load sentiment analysis.");
          }
          setBlocks([]);
          setSocialMediaBlocks([]);
          setActiveTab(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSentiment();
    return () => {
      cancelled = true;
    };
  }, [apiUrl, focusTicker, selectedTicker]);

  const showPlaceholder =
    !focusTicker || (!!focusTicker && !loading && !error && !status && !blocks.length && !socialMediaBlocks.length);

  const tabs = [
    { label: "Social Media/Retail Sentiment", icon: <ForumRoundedIcon sx={{ fontSize: 16 }} />, show: socialMediaBlocks.length > 0 },
    { label: "Other Details", icon: <InsightsRoundedIcon sx={{ fontSize: 16 }} />, show: blocks.length > 0 },
  ];

  return (
    <Box>
      {/* Header Section */}
      <Box
        sx={{
          background: "#ffffff",
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          p: { xs: 2.5, md: 3 },
          mb: 2.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2.5,
            flexWrap: "wrap",
          }}
        >
          {/* Left - Title & Description */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1 }}>
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
              <Box>
                <Typography
                  sx={{
                    fontSize: "1.35rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  Sentiment Analysis
                  {focusTicker && (
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "1.35rem",
                        fontWeight: 700,
                        color: "#4f46e5",
                        ml: 0.8,
                      }}
                    >
                      {focusTicker}
                    </Typography>
                  )}
                </Typography>
              </Box>
            </Box>

            <Typography
              sx={{
                fontSize: "0.82rem",
                color: "#64748b",
                lineHeight: 1.6,
                maxWidth: 680,
              }}
            >
Each ticker is analyzed independently using live market data, news sentiment, and analyst commentary to generate first-week and first-month insights.            </Typography>
          </Box>

          {/* Right - Search & Date */}
          <Box sx={{ minWidth: { xs: "100%", sm: 280 }, width: { xs: "100%", sm: 320 } }}>
            <Autocomplete
              options={tickerOptions}
              loading={loadingTickers}
              value={selectedTicker}
              onChange={(_, value) => onSelectTicker?.(value)}
              getOptionLabel={(option) => `${option.ticker}-${option.unique_deal_id}`}
              isOptionEqualToValue={(opt, val) => opt.unique_deal_id === val.unique_deal_id}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.3 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        background: "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.7rem",
                        color: "#4f46e5",
                        flexShrink: 0,
                      }}
                    >
                      {option.ticker.slice(0, 2)}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>
                        {option.ticker}-{option.unique_deal_id}
                      </Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>
                        Updated: {new Date(option.updated_at).toISOString().split("T")[0]}
                      </Typography>
                    </Box>
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search ticker"
                  placeholder={loadingTickers ? "Loading tickers..." : "Type to search..."}
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <SearchOutlinedIcon sx={{ color: "#94a3b8", mr: 0.5, fontSize: 20 }} />
                    ),
                    endAdornment: (
                      <>
                        {loadingTickers ? <CircularProgress color="inherit" size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
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
                    "& .MuiInputLabel-root": {
                      fontSize: "0.85rem",
                      color: "#94a3b8",
                      "&.Mui-focused": { color: "#4f46e5" },
                    },
                  }}
                />
              )}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: 2.5,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                    mt: 0.5,
                    "& .MuiAutocomplete-option": {
                      borderRadius: 1.5,
                      mx: 0.5,
                      "&:hover": { background: "#f1f5f9" },
                      '&[aria-selected="true"]': { background: "#eef2ff" },
                    },
                  },
                },
              }}
            />
            {tickerError && (
              <Alert severity="warning" sx={{ mt: 1, borderRadius: 2 }}>
                {tickerError}
              </Alert>
            )}

            {latestDate && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 1.5, ml: 0.5 }}>
                <CalendarTodayRoundedIcon sx={{ fontSize: 14, color: "#4f46e5" }} />
                <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#000000" }}>
                  Last Updated: <strong>{new Date(latestDate).toISOString().split("T")[0]}</strong>
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
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
          <CircularProgress
            size={36}
            thickness={4}
            sx={{
              color: "#4f46e5",
              "& .MuiCircularProgress-circle": {
                strokeLinecap: "round",
              },
            }}
          />
          <Typography sx={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}>
            Analyzing sentiment for {focusTicker}...
          </Typography>
        </Box>
      )}

      {/* Status */}
      {status && (
        <Box
          sx={{
            py: 6,
            textAlign: "center",
            background: "#ffffff",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
          }}
        >
          <PublicRoundedIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1.5 }} />
          <Typography sx={{ color: "#64748b", fontWeight: 600, fontSize: "0.9rem" }}>
            {status}
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

      {/* Placeholder */}
      {showPlaceholder && (
        <Box
          sx={{
            py: 8,
            textAlign: "center",
            background: "#ffffff",
            borderRadius: 3,
            border: "1px solid #e2e8f0",
          }}
        >
          <InsightsRoundedIcon sx={{ fontSize: 48, color: "#e2e8f0", mb: 1.5 }} />
          <Typography sx={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            {focusTicker ? "Sentiment analysis will appear here once available." : "Pick a ticker to load sentiment."}
          </Typography>
        </Box>
      )}

      {/* Content with Tabs */}
      {!loading && !error && (blocks.length > 0 || socialMediaBlocks.length > 0) && (
        <>
          {/* Tab Pills */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mb: 2.5,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {tabs.map((tab, idx) =>
              tab.show ? (
                <Box
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.8,
                    px: 2.5,
                    py: 1,
                    borderRadius: 2,
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    ...(activeTab === idx
                      ? {
                        background: "#4f46e5",
                        color: "#ffffff",
                        boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
                      }
                      : {
                        background: "#ffffff",
                        color: "#64748b",
                        border: "1px solid #e2e8f0",
                        "&:hover": {
                          background: "#f8fafc",
                          borderColor: "#cbd5e1",
                          color: "#334155",
                        },
                      }),
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </Box>
              ) : null
            )}
          </Box>

          {/* Rendered Content */}
          <Box
            sx={{
              background: "#ffffff",
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              overflow: "hidden",
            }}
          >
            {activeTab === 0 && socialMediaBlocks.length > 0 && <GENAIRenderer blocks={socialMediaBlocks} renderAll />}
            {activeTab === 1 && blocks.length > 0 && <GENAIRenderer blocks={blocks} renderAll />}
          </Box>
        </>
      )}
    </Box>
  );
};

export default ShowSentimentAnalysis;
