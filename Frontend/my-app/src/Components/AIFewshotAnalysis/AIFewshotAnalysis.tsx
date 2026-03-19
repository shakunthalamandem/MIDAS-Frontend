import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Card,
  CardContent,
  Collapse,
  Container,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useSearchParams, useNavigate } from "react-router-dom";
import AiAnalysis from "./AiAnalysis";

type ApiState = "idle" | "loading" | "success" | "error";

type TickerItem = {
  id: string;
  ticker: string;
  pricing_date?: string | null;
  unique_deal_id?: string | null;
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
  prefillTicker?: {
    ticker: string;
    pricing_date?: string | null;
    unique_deal_id?: string | null;
  } | null;
}

const AIFewshotAnalysis: React.FC<AIFewshotAnalysisProps> = ({ prefillTicker }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [status, setStatus] = useState<ApiState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTicker, setSelectedTicker] = useState<TickerItem | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(true);

  // Get prefill data from URL query params or props
  const prefillTickerData = useMemo(() => {
    const ticker = searchParams.get("ticker");
    const uniqueDealId = searchParams.get("unique_deal_id");

    if (ticker) {
      return {
        ticker,
        unique_deal_id: uniqueDealId || undefined,
        pricing_date: null,
      };
    }
    return prefillTicker;
  }, [searchParams, prefillTicker]);

  const loadTickers = async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      if (!API_URL) throw new Error("REACT_APP_API_URL is not set.");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
      };

      const res = await fetch(`${API_URL}/api/us_few_shot_review_tickers/`, {
        method: "GET",
        headers,
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(data?.error || data?.detail || "Failed to load tickers");
      }

      const items: TickerItem[] = Array.isArray(data?.tickers)
        ? data.tickers.map(
          (
            t: {
              ticker: string;
              pricing_date?: string | null;
              unique_deal_id?: string | null;
            },
            idx: number
          ) => ({
            ticker: t.ticker,
            pricing_date: t.pricing_date ?? null,
            unique_deal_id: t.unique_deal_id ?? null,
            id: t.unique_deal_id ?? `${t.ticker}-${idx}`,
          })
        )
        : [];

      setTickers(items);

      setSelectedTicker((prev) => {
        if (prev) {
          return (
            items.find(
              (t) =>
                t.ticker === prev.ticker &&
                (t.pricing_date ?? "") === (prev.pricing_date ?? "") &&
                (t.unique_deal_id ?? "") === (prev.unique_deal_id ?? "")
            ) || null
          );
        }
        return items[0] || null;
      });

      setStatus("success");
    } catch (error: any) {
      console.error("Error fetching tickers:", error);
      setStatus("error");
      setErrorMessage(error?.message || "Could not load tickers.");
    }
  };

  useEffect(() => {
    if (!API_URL) {
      setErrorMessage("REACT_APP_API_URL is not set.");
      setStatus("error");
      return;
    }
    loadTickers();
  }, [API_URL]);

  const options = useMemo(() => tickers, [tickers]);
  const isLoading = status === "loading";
  const hasError = status === "error";

  useEffect(() => {
    if (!prefillTickerData?.ticker || !options.length) return;

    const match = options.find(
      (opt) =>
        opt.ticker === prefillTickerData.ticker &&
        (opt.unique_deal_id ?? "") === (prefillTickerData.unique_deal_id ?? "")
    );

    if (match) setSelectedTicker(match);
  }, [prefillTickerData, options]);

  const companyName = selectedTicker?.ticker ?? "the selected company";

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, lg: 4 }, mb: 4, mt: 2 }}>
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

          {/* Header + Search */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 2,
              mb: 2.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                onClick={() => navigate("/ai_unsupervised_summary")}
                size="small"
                sx={{
                  color: "#5D0163",
                  "&:hover": { backgroundColor: "rgba(93, 1, 99, 0.1)" },
                }}
                title="Back to Unsupervised Summary"
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography
                variant="h5"
                align="center"
                sx={{ fontWeight: 900, color: "#5D0163" }}
              >
                Deal(IPO) Agent for {companyName}
              </Typography>
            </Box>

            <Autocomplete
              options={options}
              loading={isLoading}
              value={selectedTicker}
              onChange={(_, value) => setSelectedTicker(value)}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}

              /* 🔥 Search Label */
              getOptionLabel={(option) =>
                `${option.ticker} - ${formatPricingDate(option.pricing_date)} ${option.unique_deal_id ? `(${option.unique_deal_id})` : ""
                }`
              }

              /* 🔥 Dropdown UI */
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography fontWeight={900}>{option.ticker}</Typography>

                    <Typography variant="caption" color="#000000">
                      {formatPricingDate(option.pricing_date)}
                    </Typography>

                    {option.unique_deal_id && (
                      <Typography variant="caption" color="#002060">
                        {option.unique_deal_id}
                      </Typography>
                    )}
                  </Box>
                </li>
              )}

              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search ticker"
                  placeholder={isLoading ? "Loading..." : "Type to search..."}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isLoading && <CircularProgress size={18} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              sx={{ width: 360 }}
            />
          </Box>

          {/* About Section */}
          <Card variant="outlined" sx={{ mb: 1.5 }}>
            <CardContent sx={{ pb: 0 }}>
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight={600}>
                  Deal(IPO) Agent                </Typography>

                <IconButton
                  onClick={() => setIsDescriptionExpanded((p) => !p)}
                >
                  {isDescriptionExpanded ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </IconButton>
              </Box>

              <Collapse in={isDescriptionExpanded}>
                <Typography variant="body2" color="#000000" sx={{ lineHeight: 1.7 }}>
                  This analysis explains how an IPO is likely to behave in its early trading period rather than
                  predicting exact prices or returns. It evaluates the company's pre-listing fundamentals and compares
                  them with five to ten similar past IPOs that traded under comparable conditions. By reviewing how
                  those IPOs performed in their first week and first month, the analysis identifies common market
                  patterns such as sentiment shifts, volatility, and valuation reassessment. The output provides a
                  clear, analyst-style view of likely short-term direction and risks, designed to complement
                  quantitative price models and support informed interpretation of early IPO behavior.
                </Typography>
              </Collapse>
            </CardContent>
          </Card>

          {/* 🔥 PASS ALL 3 VALUES */}
          <AiAnalysis
            ticker={selectedTicker?.ticker ?? null}
            pricingDate={selectedTicker?.pricing_date ?? null}
            uniqueDealId={selectedTicker?.unique_deal_id ?? null}
          />
        </CardContent>
      </Card>
    </Container>
  );
};

export default AIFewshotAnalysis;
