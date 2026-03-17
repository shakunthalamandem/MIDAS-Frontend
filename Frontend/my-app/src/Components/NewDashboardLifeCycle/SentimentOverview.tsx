import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  HorizontalRule as NeutralIcon,
} from "@mui/icons-material";

interface SentimentOverviewProps {
  ticker: string;
}

type SummaryPayload = {
  one_week?: string;
  one_month?: string;
};

const splitLines = (text?: string) =>
  (text || "")
    .replace(/\\n/g, "\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

const sentimentStyle = (value: string) => {
  const normalized = value?.toLowerCase() || "";
  if (normalized.includes("bull")) {
    return {
      color: "#0f5132",
      borderColor: "#d1fae5",
      bg: "#dcfce7",
      gradient: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
      icon: <TrendingUpIcon sx={{ fontSize: 18 }} />,
      label: "Bullish",
    };
  }
  if (normalized.includes("bear")) {
    return {
      color: "#991b1b",
      borderColor: "#fecdd3",
      bg: "#ffe4e6",
      gradient: "linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)",
      icon: <TrendingDownIcon sx={{ fontSize: 18 }} />,
      label: "Bearish",
    };
  }
  return {
    color: "#475569",
    borderColor: "#e2e8f0",
    bg: "#f1f5f9",
    gradient: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
    icon: <NeutralIcon sx={{ fontSize: 18 }} />,
    label: "Neutral",
  };
};

const SentimentOverview: React.FC<SentimentOverviewProps> = ({ ticker }) => {
  const [oneWeekSentiment, setOneWeekSentiment] = useState<string>("");
  const [oneMonthSentiment, setOneMonthSentiment] = useState<string>("");
  const [sentimentSummary, setSentimentSummary] =
    useState<SummaryPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!ticker) return;

    const fetchSentiment = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        if (!apiUrl) throw new Error("REACT_APP_API_URL is not set.");

        const token = localStorage.getItem("access_token");
        const res = await fetch(`${apiUrl}/api/trading_signal_intelligence/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker }),
        });

        if (!res.ok) throw new Error(`Request failed (${res.status})`);

        const data = await res.json();

        if (!cancelled) {
          setOneWeekSentiment(data.one_week_sentiment || "");
          setOneMonthSentiment(data.one_month_sentiment || "");

          // Parse sentiment_summary — handle both flat and nested formats
          let summary: SummaryPayload | null = null;
          let raw = data.sentiment_summary;

          // If raw is a string, parse it first
          if (typeof raw === "string" && raw.trim()) {
            try {
              raw = JSON.parse(raw);
            } catch {
              raw = null;
            }
          }

          if (raw && typeof raw === "object") {
            // Handle nested format: { sentiment_summary: { one_week, one_month } }
            if (raw.sentiment_summary && typeof raw.sentiment_summary === "object") {
              summary = raw.sentiment_summary as SummaryPayload;
            }
            // Handle flat format: { one_week, one_month }
            else if (raw.one_week || raw.one_month) {
              summary = raw as SummaryPayload;
            }
          }
          setSentimentSummary(summary);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load sentiment data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSentiment();
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  const hasData =
    oneWeekSentiment || oneMonthSentiment || sentimentSummary;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!hasData) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        Sentiment data will appear here once available for {ticker}.
      </Alert>
    );
  }

  const weekStyle = sentimentStyle(oneWeekSentiment);
  const monthStyle = sentimentStyle(oneMonthSentiment);

  return (
    <Stack spacing={2.5}>
      {/* Sentiment badges */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
      >
        {oneWeekSentiment && (
          <Box
            sx={{
              flex: 1,
              maxWidth: 280,
              borderRadius: 3,
              background: weekStyle.gradient,
              border: `1.5px solid ${weekStyle.borderColor}`,
              p: 2,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: weekStyle.color,
                opacity: 0.8,
                mb: 0.5,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              1-Week Outlook
            </Typography>
            <Chip
              icon={weekStyle.icon}
              label={oneWeekSentiment}
              sx={{
                fontWeight: 800,
                fontSize: "0.85rem",
                color: weekStyle.color,
                bgcolor: "rgba(255,255,255,0.7)",
                border: `1px solid ${weekStyle.borderColor}`,
                height: 32,
                "& .MuiChip-icon": { color: weekStyle.color },
              }}
            />
          </Box>
        )}
        {oneMonthSentiment && (
          <Box
            sx={{
              flex: 1,
              maxWidth: 280,
              borderRadius: 3,
              background: monthStyle.gradient,
              border: `1.5px solid ${monthStyle.borderColor}`,
              p: 2,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: monthStyle.color,
                opacity: 0.8,
                mb: 0.5,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              1-Month Outlook
            </Typography>
            <Chip
              icon={monthStyle.icon}
              label={oneMonthSentiment}
              sx={{
                fontWeight: 800,
                fontSize: "0.85rem",
                color: monthStyle.color,
                bgcolor: "rgba(255,255,255,0.7)",
                border: `1px solid ${monthStyle.borderColor}`,
                height: 32,
                "& .MuiChip-icon": { color: monthStyle.color },
              }}
            />
          </Box>
        )}
      </Stack>

      {/* Sentiment narrative summaries */}
      {sentimentSummary &&
        (sentimentSummary.one_week || sentimentSummary.one_month) && (
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            {sentimentSummary.one_week && (
              <Box
                sx={{
                  flex: 1,
                  borderRadius: 2.5,
                  border: "1px solid rgba(209, 213, 226, 0.9)",
                  background: "#ffffff",
                  p: 2.5,
                  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1.5}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#1d2b5a",
                    }}
                  >
                    1-Week Narrative
                  </Typography>
                  <Chip
                    label={oneWeekSentiment || "N/A"}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      color: weekStyle.color,
                      bgcolor: weekStyle.bg,
                      height: 24,
                    }}
                  />
                </Stack>
                <Box component="ul" sx={{ pl: 2, mt: 0, mb: 0 }}>
                  {splitLines(sentimentSummary.one_week).map((line, idx) => (
                    <Typography
                      key={`week-${idx}`}
                      component="li"
                      variant="body2"
                      sx={{ color: "#374151", lineHeight: 1.7, mb: 0.5 }}
                    >
                      {line}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
            {sentimentSummary.one_month && (
              <Box
                sx={{
                  flex: 1,
                  borderRadius: 2.5,
                  border: "1px solid rgba(209, 213, 226, 0.9)",
                  background: "#ffffff",
                  p: 2.5,
                  boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={1.5}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#1d2b5a",
                    }}
                  >
                    1-Month Narrative
                  </Typography>
                  <Chip
                    label={oneMonthSentiment || "N/A"}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      color: monthStyle.color,
                      bgcolor: monthStyle.bg,
                      height: 24,
                    }}
                  />
                </Stack>
                <Box component="ul" sx={{ pl: 2, mt: 0, mb: 0 }}>
                  {splitLines(sentimentSummary.one_month).map((line, idx) => (
                    <Typography
                      key={`month-${idx}`}
                      component="li"
                      variant="body2"
                      sx={{ color: "#374151", lineHeight: 1.7, mb: 0.5 }}
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
  );
};

export default SentimentOverview;
