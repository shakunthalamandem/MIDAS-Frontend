import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Collapse,
  Container,
  IconButton,
  Typography,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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

interface DashboardAIFewShotAnalysisProps {
  prefillTicker?: { ticker: string; pricing_date?: string | null } | null;
}

const DashboardAIFewShotAnalysis: React.FC<DashboardAIFewShotAnalysisProps> = ({ prefillTicker }) => {
  const API_URL = process.env.REACT_APP_API_URL;

  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [status, setStatus] = useState<ApiState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTicker, setSelectedTicker] = useState<TickerItem | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);

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

      const res = await fetch(`${API_URL}/api/us_few_shot_review_tickers/`, {
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

  const hasError = status === "error";

  useEffect(() => {
    if (!prefillTicker?.ticker || !tickers.length) return;
    const match = tickers.find(
      (opt) =>
        opt.ticker === prefillTicker.ticker &&
        (opt.pricing_date ?? "") === (prefillTicker.pricing_date ?? "")
    );
    if (match) {
      setSelectedTicker(match);
    }
  }, [prefillTicker, tickers]);

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
                align="center"
                sx={{
                  fontWeight: 900,
                  color: "#5D0163",
                  letterSpacing: 0.3,
                  fontSize: { xs: "1.15rem", md: "1.35rem" },
                }}
              >
                AI Unsupervised Analysis for {companyName}
              </Typography>
            </Box>
          </Box>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "#c5cede",
              background: "#f7f9fd",
              mb: 1.5,
            }}
          >
            <CardContent sx={{ pb: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",

                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#002060" }}>
                  About AI Unsupervised Analysis
                </Typography>
                <IconButton
                  aria-label={
                    isDescriptionExpanded
                      ? "Collapse analysis description"
                      : "Expand analysis description"
                  }
                  onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                  sx={{
                    color: "#002060",
                    backgroundColor: "#e7ecfb",
                    "&:hover": { backgroundColor: "#d8e0f8" },
                    borderRadius: 2,
                    width: 32,
                    height: 32,
                  }}
                  size="small"
                >
                  {isDescriptionExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={isDescriptionExpanded} timeout="auto" unmountOnExit>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, color: "rgba(0, 0, 0, 0.92)", }}>
                  This analysis helps explain how an IPO may behave in its early days of trading.
                  It does not predict exact prices or returns. Instead, it reviews the company's business, growth, profitability,
                  and valuation before listing, and compares them with five to ten similar past IPOs, focusing on how those IPOs traded during their
                  first week and first month to highlight common patterns such as early market sentiment.
                </Typography>
              </Collapse>
            </CardContent>
          </Card>


          <Box sx={{ mt: 1 }}>
            <AiAnalysis ticker={selectedTicker?.ticker ?? null} pricingDate={selectedTicker?.pricing_date ?? null} />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DashboardAIFewShotAnalysis;
