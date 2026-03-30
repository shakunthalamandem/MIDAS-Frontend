import React, { useEffect, useState } from "react";
import { Box, Container, IconButton, Typography } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ShowSentimentAnalysis from "./ShowSentimentAnalysis";

type SentimentTickerOption = {
  id: string;
  ticker: string;
  pricing_date?: string | null;
};

const ShowUSSentimentAnalysis: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [searchParams] = useSearchParams();
  const [sentimentOptions, setSentimentOptions] = useState<SentimentTickerOption[]>([]);
  const [sentimentTicker, setSentimentTicker] = useState<SentimentTickerOption | null>(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [sentimentErr, setSentimentErr] = useState<string | null>(null);
  const navigate = useNavigate();

  const queryTicker = searchParams.get("ticker");

  useEffect(() => {
    const loadSentimentTickers = async () => {
      if (!apiUrl) {
        setSentimentErr("API URL is missing");
        return;
      }
      setSentimentLoading(true);
      setSentimentErr(null);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${apiUrl}/api/us_sentiment_tickers/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        if (!res.ok) {
          throw new Error(data?.error || data?.detail || "Failed to load sentiment tickers");
        }

        const items = Array.isArray(data?.tickers)
          ? (data.tickers as { ticker: string; pricing_date?: string | null }[]).map((t, idx) => ({
            id: `${t.ticker}-${t.pricing_date ?? idx}`,
            ticker: t.ticker,
            pricing_date: t.pricing_date ?? null,
          }))
          : [];
        setSentimentOptions(items);

        if (queryTicker) {
          const selectedItem = items.find((item) => item.ticker === queryTicker);
          setSentimentTicker(selectedItem || items[0] || null);
        } else {
          setSentimentTicker((prev) => prev ?? (items[0] || null));
        }
      } catch (e: any) {
        setSentimentErr(e.message || "Unable to load sentiment ticker list");
      } finally {
        setSentimentLoading(false);
      }
    };

    loadSentimentTickers();
  }, [apiUrl, queryTicker]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f4ff 0%, #f8fafc 50%, #f0f9ff 100%)",
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        {/* Back button */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            mb: 2,
            cursor: "pointer",
            color: "#64748b",
            transition: "all 0.2s ease",
            "&:hover": { color: "#4f46e5" },
          }}
          onClick={() => navigate(-1)}
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 20 }} />
          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>Back</Typography>
        </Box>

        <ShowSentimentAnalysis
          focusTicker={sentimentTicker?.ticker ?? null}
          tickerOptions={sentimentOptions}
          selectedTicker={sentimentTicker}
          onSelectTicker={setSentimentTicker}
          loadingTickers={sentimentLoading}
          tickerError={sentimentErr}
        />
      </Container>
    </Box>
  );
};

export default ShowUSSentimentAnalysis;
