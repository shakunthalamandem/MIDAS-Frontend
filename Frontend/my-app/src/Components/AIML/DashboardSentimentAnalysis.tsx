import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import GENAIRenderer from "../GhcAi/AIPages/GENAIRenderer";
import { Block } from "../GhcAi/Utils/ComponentsUtils";

type DashboardSentimentAnalysisProps = {
  focusTicker: string | null;
  region?: string | null;
};

const parseLooseJson = (value: string): any | null => {
  try {
    return JSON.parse(value);
  } catch {
    try {
      // Fallback for Python-style stringified lists with single quotes
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

const DashboardSentimentAnalysis: React.FC<DashboardSentimentAnalysisProps> = ({
  focusTicker,
  region,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [latestDate, setLatestDate] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!focusTicker) {
      setBlocks([]);
      setError(null);
      setStatus(null);
      setLoading(false);
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
        const normalizedRegion = (region || "").toString().trim().toUpperCase();
        const endpoint =
          normalizedRegion === "APAC"
            ? "/api/get_apac_sentiment_analysis/"
            : "/api/get_us_sentiment_analysis/";
        const res = await fetch(`${apiUrl}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker: focusTicker }),
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
        if (!parsedBlocks.length) {
          setStatus("Data will update soon for this ticker.");
          setBlocks([]);
        } else {
          setBlocks(parsedBlocks);
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
  }, [apiUrl, focusTicker, region]);

  const showPlaceholder =
    !focusTicker || (!!focusTicker && !loading && !error && !status && !blocks.length);

  return (
    <Box sx={{ py: 2 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
              flexWrap: "wrap",
              mb: 2,
              position: "relative"
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" fontWeight={600} color="#002060" align="center">
                Sentiment Analysis{focusTicker ? ` for ${focusTicker}` : ""}
              </Typography>
              <Typography variant="body2" color="#000000" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                A standardized, evidence-focused system prompt is dynamically populated with the current date and individual ticker symbols. Each ticker is processed independently via the Perplexity API, aggregating market data, news sentiment, analyst commentary, and historical IPO performance signals to deliver consistent yet deal-specific insights on first-week and first-month performance drivers.
              </Typography>
            </Box>

            {latestDate && (
              <Typography
                sx={{
                  position: "absolute",
                  right: 28,
                  top: 14,
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#002060",
                }}
              >
                Last Updated Date: {new Date(latestDate).toISOString().split("T")[0]}
              </Typography>
            )}
          </Box>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <CircularProgress size={22} />
            </Box>
          )}

        {status && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ color: "#002060", fontWeight: 700, textAlign: "center" }}
            >
              {status}
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

          {showPlaceholder && (
            <Typography variant="body2" color="#000000">
              {focusTicker ? "Sentiment analysis will appear here once available." : "Pick a ticker to load sentiment."}
            </Typography>
          )}

          {!loading && !error && blocks.length > 0 && <GENAIRenderer blocks={blocks} renderAll />}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardSentimentAnalysis;
