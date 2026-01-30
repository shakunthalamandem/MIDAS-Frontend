import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  Container,
  IconButton,
  Typography,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AiAnalysis from "./AiAnalysis";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import InsightsIcon from "@mui/icons-material/Insights";
import TimelineIcon from "@mui/icons-material/Timeline";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

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

function FeatureRow({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Box sx={{ display: "flex", gap: 1.1, alignItems: "flex-start" }}>
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          background: "rgba(29,78,216,0.10)",
          border: "1px solid rgba(29,78,216,0.16)",
          flex: "0 0 auto",
          mt: 0.2,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 600,
            color: "#0B1220",
            fontSize: 13.5,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{ color: "rgba(0,0,0,0.74)", fontSize: 12.8, lineHeight: 1.55 }}
        >
          {desc}
        </Typography>
      </Box>
    </Box>
  );
}

function StepRow({
  n,
  title,
  desc,
}: {
  n: string;
  title: string;
  desc: string;
}) {
  return (
    <Box sx={{ display: "flex", gap: 1.1, alignItems: "flex-start" }}>
      <Box
        sx={{
          width: 26,
          height: 26,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          background: "rgba(93,1,99,0.12)",
          border: "1px solid rgba(93,1,99,0.20)",
          color: "#5D0163",
          fontWeight: 600,
          fontSize: 12,
          flex: "0 0 auto",
          mt: 0.25,
        }}
      >
        {n}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 600,
            color: "#0B1220",
            fontSize: 13.5,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{ color: "rgba(0,0,0,0.74)", fontSize: 12.8, lineHeight: 1.55 }}
        >
          {desc}
        </Typography>
      </Box>
    </Box>
  );
}

const DashboardAIFewShotAnalysis: React.FC<DashboardAIFewShotAnalysisProps> = ({
  prefillTicker,
}) => {
  const API_URL = process.env.REACT_APP_API_URL;

  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [status, setStatus] = useState<ApiState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTicker, setSelectedTicker] = useState<TickerItem | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] =
    useState<boolean>(false);

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
        throw new Error(
          data?.error || data?.detail || "Failed to load tickers",
        );
      }

      const items = Array.isArray(data?.tickers)
        ? (
            data.tickers as { ticker: string; pricing_date?: string | null }[]
          ).map((t, idx) => ({
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
              (t) =>
                t.ticker === prev.ticker &&
                (t.pricing_date ?? "") === (prev.pricing_date ?? ""),
            ) || null
          );
        }
        return items[0] || null;
      });
      setStatus("success");
    } catch (error: any) {
      console.error("Error fetching tickers:", error);
      setStatus("error");
      setErrorMessage(
        error?.message || "Could not load tickers. Please retry.",
      );
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
        (opt.pricing_date ?? "") === (prefillTicker.pricing_date ?? ""),
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
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ pb: 0 }}>
              {/* Header row */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      background:
                        "linear-gradient(135deg, rgba(93,1,99,0.16), rgba(0,32,96,0.10))",
                      border: "1px solid rgba(93,1,99,0.25)",
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 20, color: "#5D0163" }} />
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 900,
                        color: "#002060",
                        lineHeight: 1.1,
                      }}
                    >
                      How this AI Analysis Works
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(0,0,0,0.72)", fontWeight: 600 }}
                    >
                      Think “similar IPO pattern matching” 
                    </Typography>
                  </Box>
                </Box>

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
                  {isDescriptionExpanded ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </IconButton>
              </Box>

              <Collapse in={isDescriptionExpanded} timeout="auto" unmountOnExit>
                {/* Body */}
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid rgba(0,32,96,0.10)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.60))",
                  }}
                >
                  {/* Two-column layout */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    {/* LEFT: What you get */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        background: "rgba(59,130,246,0.06)",
                        border: "1px solid rgba(59,130,246,0.12)",
                      }}
                    >
                      <Box sx={{ display: "grid", gap: 1.1 }}>
                        <FeatureRow
                          icon={
                            <InsightsIcon
                              sx={{ fontSize: 14, color: "#1D4ED8" }}
                            />
                          }
                          title="Executive summary"
                          desc="Key takeaways from the new S-1, framed for IPO investors."
                        />
                        <FeatureRow
                          icon={
                            <TimelineIcon
                              sx={{ fontSize: 14, color: "#1D4ED8" }}
                            />
                          }
                          title="1-week & 1-month outlook"
                          desc="Sentiment view + volatility view + confidence score."
                        />
                        <FeatureRow
                          icon={
                            <CompareArrowsIcon
                              sx={{ fontSize: 14, color: "#1D4ED8" }}
                            />
                          }
                          title="Comparable IPOs"
                          desc="Shows which past S-1 filings look most similar and how they traded."
                        />
                        <FeatureRow
                          icon={
                            <ShieldOutlinedIcon
                              sx={{ fontSize: 14, color: "#1D4ED8" }}
                            />
                          }
                          title="Scenario analysis"
                          desc="Bull / base / bear cases to explain why outcomes may differ."
                        />
                        <FeatureRow
                          icon={
                            <FindInPageIcon
                              sx={{ fontSize: 14, color: "#1D4ED8" }}
                            />
                          }
                          title="Expectation vs reality"
                          desc="Highlights gaps between S-1 narrative and post-listing market behavior."
                        />
                      </Box>
                    </Box>

                    {/* RIGHT: How it works */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        background: "rgba(93,1,99,0.05)",
                        border: "1px solid rgba(93,1,99,0.12)",
                      }}
                    >
                      <Box sx={{ display: "grid", gap: 1.1 }}>
                        <StepRow
                          n="1"
                          title="We start with SEC S-1 filings"
                          desc="We indexed ~40–50 historical US IPO S-1 PDFs + their post-IPO outcomes."
                        />
                        <StepRow
                          n="2"
                          title="AI finds the closest historical “matches”"
                          desc="It clusters and compares the new S-1 against prior deals to locate similar patterns."
                        />
                        <StepRow
                          n="3"
                          title="We anchor to what actually happened"
                          desc="For each matched IPO, we use 1-week and 1-month trading behavior, sentiment, and volatility."
                        />
                        <StepRow
                          n="4"
                          title="We generate an investor-ready narrative"
                          desc="Outputs include outlook, confidence, scenarios, and comparable deal summaries."
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Bottom CTA / reassurance */}
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Chip
                        label="Not a price target"
                        sx={{
                          fontWeight: 900,
                          bgcolor: "rgba(239,68,68,0.10)",
                          color: "#991B1B",
                          border: "1px solid rgba(239,68,68,0.20)",
                        }}
                      />
                      <Chip
                        label="Based on historical IPO outcomes"
                        sx={{
                          fontWeight: 900,
                          bgcolor: "rgba(34,197,94,0.10)",
                          color: "#166534",
                          border: "1px solid rgba(34,197,94,0.20)",
                        }}
                      />
                      <Chip
                        label="Includes scenarios + confidence"
                        sx={{
                          fontWeight: 900,
                          bgcolor: "rgba(59,130,246,0.10)",
                          color: "#1D4ED8",
                          border: "1px solid rgba(59,130,246,0.20)",
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Collapse>
            </CardContent>
          </Card>

          <Box sx={{ mt: 1 }}>
            <AiAnalysis
              ticker={selectedTicker?.ticker ?? null}
              pricingDate={selectedTicker?.pricing_date ?? null}
            />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DashboardAIFewShotAnalysis;
