import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

type SummaryPayload = {
  one_week?: string;
  one_month?: string;
};

type SentimentData = {
  one_week_sentiment: string;
  one_month_sentiment: string;
  sentiment_summary: string;
};

const splitLines = (text?: string) =>
  (text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

const sentimentStyle = (value: string) => {
  const normalized = value?.toLowerCase() || "";
  if (normalized.includes("bull")) {
    return { color: "#0f5132", borderColor: "#d1fae5", bg: "#dcfce7" };
  }
  if (normalized.includes("bear")) {
    return { color: "#991b1b", borderColor: "#fecdd3", bg: "#ffe4e6" };
  }
  if (normalized.includes("neutral") || normalized.includes("cautious")) {
    return { color: "#475569", borderColor: "#e2e8f0", bg: "#e2e8f0" };
  }
  return { color: "#0f172a", borderColor: "rgba(209, 213, 226, 0.9)", bg: "#ffffff" };
};

interface MarketSentimentFOWriteUpProps {
  ticker?: string;
  pricing_date?: string;
}

const MarketSentimentFOWriteUp: React.FC<MarketSentimentFOWriteUpProps> = ({
  ticker,
  pricing_date,
}) => {
  const [data, setData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    let alive = true;

    async function fetchData() {
      if (!apiUrl) {
        setErrorMsg("Missing REACT_APP_API_URL");
        return;
      }
      if (!ticker) {
        setErrorMsg("Missing ticker");
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch(`${apiUrl}/api/fo_writeup_model_indications/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ ticker, pricing_date }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Request failed (${res.status})`);
        }

        const json = await res.json();
        if (!alive) return;

        setData({
          one_week_sentiment: json.one_week_sentiment ?? "",
          one_month_sentiment: json.one_month_sentiment ?? "",
          sentiment_summary: json.sentiment_summary ?? "",
        });
      } catch (e: any) {
        if (!alive) return;
        setErrorMsg(e?.message ?? "Unknown error");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    fetchData();
    return () => {
      alive = false;
    };
  }, [apiUrl, token, ticker, pricing_date]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (errorMsg) {
    return (
      <Typography color="error" variant="body2" sx={{ p: 2 }}>
        {errorMsg}
      </Typography>
    );
  }

  if (!data) return null;

  const { one_week_sentiment, one_month_sentiment, sentiment_summary } = data;

  const hasSummary = !!sentiment_summary?.trim();
  const parsedSummary: SummaryPayload | null = (() => {
    if (!sentiment_summary) return null;
    try {
      const parsed = JSON.parse(sentiment_summary);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        ("one_week" in parsed || "one_month" in parsed)
      ) {
        return parsed as SummaryPayload;
      }
    } catch {
      // ignore
    }
    return null;
  })();

  return (
    <>

        <Stack spacing={1.5}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#026269" }}
            align="center"
          >
            Market Sentiment
          </Typography>

          <Stack spacing={2}>
            {hasSummary && (
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                {(parsedSummary?.one_week || !parsedSummary) && (
                  <Box
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      border: "1px solid rgba(209, 213, 226, 0.9)",
                      background: "#ffffff",
                      p: 2,
                      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1d2b5a" }}>
                        1-Week Narrative
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: sentimentStyle(one_week_sentiment).color,
                          background: sentimentStyle(one_week_sentiment).bg,
                          borderRadius: 1,
                          px: 0.75,
                          py: 0.25,
                          fontWeight: 700,
                        }}
                      >
                        {one_week_sentiment || "-"}
                      </Typography>
                    </Stack>
                    <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
                      {(parsedSummary?.one_week
                        ? splitLines(parsedSummary.one_week)
                        : splitLines(sentiment_summary)
                      ).map((line, idx) => (
                        <Typography
                          key={`week-li-${idx}`}
                          component="li"
                          variant="body2"
                          sx={{ color: "#141414", lineHeight: 1.6, mb: 0.5 }}
                        >
                          {line}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
                {(parsedSummary?.one_month || !parsedSummary) && (
                  <Box
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      border: "1px solid rgba(209, 213, 226, 0.9)",
                      background: "#ffffff",
                      p: 2,
                      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1d2b5a" }}>
                        1-Month Narrative
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: sentimentStyle(one_month_sentiment).color,
                          background: sentimentStyle(one_month_sentiment).bg,
                          borderRadius: 1,
                          px: 0.75,
                          py: 0.25,
                          fontWeight: 700,
                        }}
                      >
                        {one_month_sentiment || "-"}
                      </Typography>
                    </Stack>
                    <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
                      {(parsedSummary?.one_month
                        ? splitLines(parsedSummary.one_month)
                        : splitLines(sentiment_summary)
                      ).map((line, idx) => (
                        <Typography
                          key={`month-li-${idx}`}
                          component="li"
                          variant="body2"
                          sx={{ color: "#141414", lineHeight: 1.6, mb: 0.5 }}
                        >
                          {line}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
              </Stack>
            )}
          </Stack>
        </Stack>
</>
  );
};

export default MarketSentimentFOWriteUp;
