import React, { useEffect, useState } from "react";
import { Box, Container } from "@mui/material";
import ShowSentimentAnalysis from "./ShowSentimentAnalysis";

type SentimentTickerOption = {
  id: string;
  ticker: string;
  pricing_date?: string | null;
};

const ShowUSSentimentAnalysis: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [sentimentOptions, setSentimentOptions] = useState<SentimentTickerOption[]>([]);
  const [sentimentTicker, setSentimentTicker] = useState<SentimentTickerOption | null>(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [sentimentErr, setSentimentErr] = useState<string | null>(null);

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
        setSentimentTicker((prev) => prev ?? (items[0] || null));
      } catch (e: any) {
        setSentimentErr(e.message || "Unable to load sentiment ticker list");
      } finally {
        setSentimentLoading(false);
      }
    };

    loadSentimentTickers();
  }, [apiUrl]);

  return (
    <Container maxWidth={false} disableGutters>
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Box sx={{ width: { xs: "96%", sm: "90%", md: "80%" }, mt: { xs: 1.5, md: 2.5 } }}>
          <ShowSentimentAnalysis
            focusTicker={sentimentTicker?.ticker ?? null}
            tickerOptions={sentimentOptions}
            selectedTicker={sentimentTicker}
            onSelectTicker={setSentimentTicker}
            loadingTickers={sentimentLoading}
            tickerError={sentimentErr}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default ShowUSSentimentAnalysis;
