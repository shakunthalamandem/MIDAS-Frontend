import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Divider,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

import IntelligenceSourcesBar from "./IntelligenceSourcesBar";
import TradingSignalCard from "./TradingSignalCard";
import PriceChartsSection from "./PriceChartsSection";
import type { SourceDetail, SourceDetails, TradingSignalData } from "./types";

const MotionBox = motion(Box);

interface Props {
  ticker: string;
  trade_date: string;
  isUpcoming?: boolean;
  dealStatus?: string;
  issuerName?: string;
  expectedDate?: string;
}

/* ── Helpers for popup data rendering ── */

function formatValue(val: any): string {
  if (val === null || val === undefined) return "N/A";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "number") {
    if (Math.abs(val) >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (Math.abs(val) >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (Array.isArray(val)) return val.map((v) => formatValue(v)).join(", ");
  return String(val);
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Pct", "%")
    .replace("Snp", "S&P")
    .replace("Dma", "DMA")
    .replace("Rsi", "RSI")
    .replace("Macd", "MACD")
    .replace("Dmi", "DMI")
    .replace("Fo ", "FO ")
    .replace("Ml ", "ML ")
    .replace("Spy", "SPY")
    .replace("Ytd", "YTD")
    .replace("Mtd", "MTD")
    .replace("Qtd", "QTD");
}

function getValueColor(key: string, val: any): string {
  if (val === null || val === undefined) return "#94A3B8";

  const k = key.toLowerCase();
  const v = typeof val === "string" ? val.toLowerCase() : "";

  // Signal/sentiment values
  if (v === "buy" || v === "long" || v === "positive" || v === "bullish" || v === "up")
    return "#059669";
  if (v === "sell" || v === "short" || v === "negative" || v === "bearish" || v === "down")
    return "#DC2626";
  if (v === "hold" || v === "avoid" || v === "neutral") return "#D97706";

  // Numeric returns / changes
  if (typeof val === "number" && (k.includes("return") || k.includes("change") || k.includes("pnl"))) {
    if (val > 0) return "#059669";
    if (val < 0) return "#DC2626";
  }

  // Boolean expired
  if (k === "expired" && val === true) return "#D97706";

  return "#0F172A";
}

/* ── Renders a nested data object (e.g. ML prediction horizons) ── */
function renderDataRows(data: Record<string, any>, depth = 0): React.ReactNode {
  if (!data || typeof data !== "object") return null;

  return Object.entries(data).map(([key, val]) => {
    // Skip internal keys
    if (key === "label" || key === "weight" || key === "status") return null;

    // Nested object (e.g., t1d: {prediction, confidence, actual_return})
    if (val && typeof val === "object" && !Array.isArray(val)) {
      return (
        <Box key={key} sx={{ mb: 1.5 }}>
          <Typography
            sx={{
              fontWeight: 700, fontSize: 12, color: "#334155",
              textTransform: "uppercase", letterSpacing: 0.5,
              mb: 0.5, pl: depth * 2,
            }}
          >
            {formatLabel(key)}
          </Typography>
          <Box sx={{ pl: 1, borderLeft: "2px solid #E2E8F0" }}>
            {renderDataRows(val, depth + 1)}
          </Box>
        </Box>
      );
    }

    // Array of objects (e.g., eodhd_news, recent_closes)
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
      return (
        <Box key={key} sx={{ mb: 1.5 }}>
          <Typography
            sx={{ fontWeight: 700, fontSize: 12, color: "#334155", mb: 0.5 }}
          >
            {formatLabel(key)}
          </Typography>
          {val.slice(0, 5).map((item: any, idx: number) => (
            <Box
              key={idx}
              sx={{
                p: 1, mb: 0.5, bgcolor: "#F8FAFC", borderRadius: 1,
                border: "1px solid #F1F5F9",
              }}
            >
              {Object.entries(item).map(([ik, iv]) => (
                <Box key={ik} sx={{ display: "flex", justifyContent: "space-between", py: 0.25 }}>
                  <Typography sx={{ fontSize: 11.5, color: "#64748B", fontWeight: 500 }}>
                    {formatLabel(ik)}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 11.5, fontWeight: 600,
                      color: getValueColor(ik, iv),
                      maxWidth: "60%", textAlign: "right",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                  >
                    {formatValue(iv)}
                  </Typography>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      );
    }

    // Simple key-value
    return (
      <Box
        key={key}
        sx={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          py: 0.6, px: depth * 2,
          borderBottom: "1px solid #F8FAFC",
        }}
      >
        <Typography sx={{ fontSize: 12.5, color: "#64748B", fontWeight: 500 }}>
          {formatLabel(key)}
        </Typography>
        <Typography
          sx={{
            fontSize: 12.5, fontWeight: 700,
            color: getValueColor(key, val),
          }}
        >
          {formatValue(val)}
        </Typography>
      </Box>
    );
  });
}

/* ══════════════════════════════════════════ */

/* ── Default source cards shown before signal generation ── */

function buildDefaultSources(dealType: string): SourceDetails {
  const isIPO = (dealType || "").toUpperCase().trim() === "IPO";

  const base: SourceDetails = {
    price_action: {
      label: "Price Action & Volume",
      weight: isIPO ? 30 : 30,
      status: "inactive",
      data: {},
    },
    technicals: {
      label: "Technical Agent",
      weight: isIPO ? 20 : 25,
      status: "inactive",
      data: {},
    },
    ml_predictions: {
      label: "Factors Based Agent",
      weight: isIPO ? 5 : 10,
      status: "inactive",
      data: {},
    },
    sentiment_news: {
      label: "Sentiment & News Agent",
      weight: isIPO ? 10 : 10,
      status: "inactive",
      data: {},
    },
    market_context: {
      label: "Market Context",
      weight: 5,
      status: "inactive",
      data: {},
    },
    position_context: {
      label: "Position Context",
      weight: 5,
      status: "inactive",
      data: { currently_held: false },
    },
  };

  if (isIPO) {
    base.jay_ritter = {
      label: "Jay Ritter IPO Agent",
      weight: 25,
      status: "inactive",
      data: {},
    };
  } else {
    base.fo_dynamics = {
      label: "FO Dynamics",
      weight: 15,
      status: "inactive",
      data: {},
    };
  }

  return base;
}

const TradingSignalsMain: React.FC<Props> = ({
  ticker,
  trade_date,
  isUpcoming,
  dealStatus,
  issuerName,
  expectedDate,
}) => {
  const [signalData, setSignalData] = useState<TradingSignalData | null>(null);
  const [popupSource, setPopupSource] = useState<string | null>(null);
  const [dealType, setDealType] = useState<string>("");
  const [defaultSources, setDefaultSources] = useState<SourceDetails>({});

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  // Fetch source details with real data on mount (before signal generation)
  useEffect(() => {
    if (!ticker || !apiUrl) return;

    const fetchSourceDetails = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/trading_signal_source_details/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker }),
        });
        if (res.ok) {
          const data = await res.json();
          const dt = data.deal_type || "IPO";
          setDealType(dt);
          // Use real source_details from backend (with actual data)
          if (data.source_details && Object.keys(data.source_details).length > 0) {
            setDefaultSources(data.source_details);
          } else {
            setDefaultSources(buildDefaultSources(dt));
          }
        } else {
          // Fallback to empty default cards
          setDealType("IPO");
          setDefaultSources(buildDefaultSources("IPO"));
        }
      } catch {
        setDealType("IPO");
        setDefaultSources(buildDefaultSources("IPO"));
      }
    };

    fetchSourceDetails();
  }, [ticker, apiUrl]);

  const handleSignalLoaded = useCallback((data: TradingSignalData | null) => {
    setSignalData(data);
    if (data?.deal_type) {
      setDealType(data.deal_type);
    }
  }, []);

  const handleSourceClick = useCallback((sourceKey: string) => {
    setPopupSource(sourceKey);
  }, []);

  const handleClosePopup = () => setPopupSource(null);

  // Use signal source_details if available, otherwise default cards
  const sourceDetails: SourceDetails =
    signalData?.source_details && Object.keys(signalData.source_details).length > 0
      ? signalData.source_details
      : defaultSources;

  const effectiveDealType = signalData?.deal_type || dealType;
  const activeSource: SourceDetail | null = popupSource ? sourceDetails[popupSource] || null : null;

  return (
    <Box sx={{ maxWidth: "100%" }}>
      {/* Intelligence Sources */}
      <IntelligenceSourcesBar
        onSourceClick={handleSourceClick}
        sourceDetails={sourceDetails}
        dealType={effectiveDealType}
      />

      {/* Arrow from Synthesized Signal to Trading Signal Card */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 0.5 }}>
        <Box sx={{ width: 2, height: 16, bgcolor: "#262268", opacity: 0.35, borderRadius: 1 }} />
        <Box
          sx={{
            width: 0, height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "8px solid #262268",
            opacity: 0.5,
          }}
        />
      </Box>

      {/* Section 1: AI Trading Signal */}
      <MotionBox
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        sx={{ mb: 2.5 }}
      >
        <TradingSignalCard ticker={ticker} onSignalLoaded={handleSignalLoaded} />
      </MotionBox>

      {/* Section 2: Price Charts (FactSet + TradingView) */}
      <MotionBox
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        sx={{ scrollMarginTop: "240px" }}
      >
        <PriceChartsSection
          ticker={ticker}
          trade_date={trade_date}
          isUpcoming={isUpcoming}
          dealStatus={dealStatus}
          issuerName={issuerName}
          expectedDate={expectedDate}
        />
      </MotionBox>

      {/* ── Source Detail Popup Dialog ── */}
      <Dialog
        open={!!popupSource && !!activeSource}
        onClose={handleClosePopup}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: "80vh",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          },
        }}
      >
        {activeSource && (
          <>
            <DialogTitle
              sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                pb: 1, pt: 2.5, px: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40, height: 40, borderRadius: 2, bgcolor: "#EEF2FF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#262268",
                  }}
                >
                  {/* Re-use icon from the source key */}
                  <Typography sx={{ fontSize: 20 }}>
                    {popupSource === "price_action" && "📈"}
                    {popupSource === "jay_ritter" && "🎓"}
                    {popupSource === "fo_dynamics" && "📊"}
                    {popupSource === "technicals" && "📉"}
                    {popupSource === "ml_predictions" && "🧠"}
                    {popupSource === "sentiment_news" && "💬"}
                    {popupSource === "market_context" && "🌍"}
                    {popupSource === "position_context" && "💼"}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: 16, color: "#0F172A" }}>
                    {activeSource.label}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
                    <Chip
                      label={`${activeSource.weight}% Weight`}
                      size="small"
                      sx={{
                        bgcolor: activeSource.weight > 20 ? "#EEF2FF" : "#F1F5F9",
                        color: activeSource.weight > 20 ? "#4338CA" : "#64748B",
                        fontWeight: 700, fontSize: 11, height: 22,
                      }}
                    />
                    <Chip
                      label={activeSource.status === "active" ? "Active" : "Inactive"}
                      size="small"
                      sx={{
                        bgcolor: activeSource.status === "active" ? "#DCFCE7" : "#FEE2E2",
                        color: activeSource.status === "active" ? "#166534" : "#991B1B",
                        fontWeight: 700, fontSize: 11, height: 22,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              <IconButton onClick={handleClosePopup} size="small">
                <CloseIcon sx={{ fontSize: 20, color: "#64748B" }} />
              </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ px: 3, py: 2 }}>
              <Typography
                sx={{
                  fontWeight: 700, fontSize: 12, color: "#94A3B8",
                  textTransform: "uppercase", letterSpacing: 1, mb: 1.5,
                }}
              >
                Parameters sent to signal generation
              </Typography>

              <Box
                sx={{
                  bgcolor: "#FAFBFC", borderRadius: 2,
                  border: "1px solid #E2E8F0", p: 2,
                }}
              >
                {activeSource.data && Object.keys(activeSource.data).length > 0 ? (
                  renderDataRows(activeSource.data)
                ) : (
                  <Typography sx={{ color: "#94A3B8", fontSize: 13, fontStyle: "italic" }}>
                    No data available for this source.
                  </Typography>
                )}
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                onClick={handleClosePopup}
                variant="contained"
                sx={{
                  bgcolor: "#262268", borderRadius: 2,
                  textTransform: "none", fontWeight: 700, px: 4,
                  "&:hover": { bgcolor: "#3A3790" },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TradingSignalsMain;
