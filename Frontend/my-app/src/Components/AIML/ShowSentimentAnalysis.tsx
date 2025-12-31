import React, { useEffect, useState } from "react";
import { Alert, Box, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import GENAIRenderer from "../GhcAi/AIPages/GENAIRenderer";
import { Block } from "../GhcAi/Utils/ComponentsUtils";

type ShowSentimentAnalysisProps = {
  focusTicker: string | null;
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

const ShowSentimentAnalysis: React.FC<ShowSentimentAnalysisProps> = ({ focusTicker }) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!focusTicker) {
      setBlocks([]);
      setError(null);
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
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${apiUrl}/api/get_sentiment_analysis/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker: focusTicker }),
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : null;

        if (!res.ok) {
          throw new Error(data?.error || data?.detail || `Request failed with status ${res.status}`);
        }

        const raw = data?.sentiment ?? data?.answer ?? data;
        const parsedBlocks = normalizeBlocks(raw);
        if (!parsedBlocks.length) {
          setError("No sentiment analysis available yet.");
          setBlocks([]);
        } else {
          setBlocks(parsedBlocks);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load sentiment analysis.");
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
  }, [apiUrl, focusTicker]);

  const showPlaceholder = !focusTicker || (!!focusTicker && !loading && !error && !blocks.length);

  return (
    <Box sx={{ py: 2 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#002060">
                Sentiment Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {focusTicker ? `Showing sentiment for ${focusTicker}` : "Select a ticker to view sentiment analysis."}
              </Typography>
            </Box>
            {loading && <CircularProgress size={22} />}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {showPlaceholder && (
            <Typography variant="body2" color="text.secondary">
              {focusTicker ? "Sentiment analysis will appear here once available." : "Pick a ticker to load sentiment."}
            </Typography>
          )}

          {!loading && !error && blocks.length > 0 && <GENAIRenderer blocks={blocks} renderAll />}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ShowSentimentAnalysis;
