import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Card,
  CardContent,
  Container,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import AiAnalysis from "./AiAnalysis";

type ApiState = "idle" | "loading" | "success" | "error";

type TickerItem = {
  id: string;
  ticker: string;
  pricing_date?: string | null;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatPricingDate = (dateStr?: string | null) => {
  if (!dateStr) return "TBA";
  return dateStr;
};

interface AIFewshotAnalysisProps {
  prefillTicker?: { ticker: string; pricing_date?: string | null } | null;
}

const AIFewshotAnalysis: React.FC<AIFewshotAnalysisProps> = ({ prefillTicker }) => {
  const API_URL = process.env.REACT_APP_API_URL;

  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [status, setStatus] = useState<ApiState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTicker, setSelectedTicker] = useState<TickerItem | null>(null);

  const loadTickers = async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      if (!API_URL) {
        throw new Error("REACT_APP_API_URL is not set.");
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
      };

      const res = await fetch(`${API_URL}/api/few_shot_review_tickers/`, {
        method: "GET",
        headers,
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(data?.error || data?.detail || "Failed to load tickers");
      }

      const items = Array.isArray(data?.tickers)
        ? (data.tickers as { ticker: string; pricing_date?: string | null }[]).map((t, idx) => ({
            ticker: t.ticker,
            pricing_date: t.pricing_date ?? null,
            id: `${t.ticker}-${t.pricing_date ?? idx}`,
          }))
        : [];
      setTickers(items);
      setSelectedTicker((prev) => {
        if (prev) {
          return (
            items.find(
              (t) => t.ticker === prev.ticker && (t.pricing_date ?? "") === (prev.pricing_date ?? "")
            ) || null
          );
        }
        return items[0] || null;
      });
      setStatus("success");
    } catch (error: any) {
      console.error("Error fetching tickers:", error);
      setStatus("error");
      setErrorMessage(error?.message || "Could not load tickers. Please retry.");
    }
  };

  useEffect(() => {
    if (!API_URL) {
      setErrorMessage("REACT_APP_API_URL is not set.");
      setStatus("error");
      return;
    }
    loadTickers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL]);

  const isLoading = status === "loading";
  const hasError = status === "error";

  const options = useMemo(() => tickers, [tickers]);

  useEffect(() => {
    if (!prefillTicker?.ticker || !options.length) return;
    const match = options.find(
      (opt) =>
        opt.ticker === prefillTicker.ticker &&
        (opt.pricing_date ?? "") === (prefillTicker.pricing_date ?? "")
    );
    if (match) {
      setSelectedTicker(match);
    }
  }, [prefillTicker, options]);

  return (

      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 4 } }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid #c5cede",
            boxShadow: "0 12px 22px rgba(0,32,96,0.08)",
            background: "#ffffff",
          }}
        >
          <CardContent sx={{ pt: 3, pb: 3 }}>
            {hasError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "flex-start", md: "center" },
                justifyContent: "space-between",
                gap: { xs: 1.25, md: 2.5 },
                mb: 2.5,
              }}
            >
              <Box sx={{ maxWidth: { xs: "100%", md: "65%" } }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    color: "#002060",
                    letterSpacing: 0.3,
                    textTransform: "uppercase",
                    fontSize: { xs: "1.15rem", md: "1.35rem" },
                  }}
                >
                  AI Unsupervised
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.6 }}>
                  Explore AI-generated few-shot reviews using historical deal context. Select a ticker to
                  load its unsupervised insights and related analysis.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                  This view surfaces narrative-style takeaways and patterns seen across past placements,
                  powered by our internal AI engine.
                </Typography>
              </Box>
              <Autocomplete
                options={options}
                loading={isLoading}
                value={selectedTicker}
                onChange={(_, value) => setSelectedTicker(value)}
                getOptionLabel={(option) =>
                  option.pricing_date
                    ? `${option.ticker} - ${formatPricingDate(option.pricing_date)}`
                    : option.ticker
                }
                isOptionEqualToValue={(opt, val) =>
                  opt.ticker === val.ticker && (opt.pricing_date ?? "") === (val.pricing_date ?? "")
                }
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography sx={{ fontWeight: 900, color: "#0e0d0dff" }}>{option.ticker}</Typography>
                      <Typography variant="caption" sx={{ color: "#6b7280" }}>
                        {formatPricingDate(option.pricing_date)}
                      </Typography>
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search ticker"
                    placeholder={isLoading ? "Loading tickers..." : "Type to search..."}
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isLoading ? <CircularProgress color="inherit" size={18} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2.5,
                        background: "#ffffff",
                        "& fieldset": { borderColor: "#c5cede" },
                        "&:hover fieldset": { borderColor: "#9aa9c5" },
                        "&.Mui-focused fieldset": {
                          borderColor: "#002060",
                          boxShadow: "0 0 0 2px rgba(0,32,96,0.12)",
                        },
                      },
                    }}
                  />
                )}
                sx={{
                  width: { xs: "100%", md: 360 },
                  maxWidth: "100%",
                  flexShrink: 0,
                }}
              />
            </Box>

            <Box sx={{ mt: 1 }}>
              <AiAnalysis ticker={selectedTicker?.ticker ?? null} pricingDate={selectedTicker?.pricing_date ?? null} />
            </Box>
          </CardContent>
        </Card>
      </Container>
  );
};

export default AIFewshotAnalysis;
