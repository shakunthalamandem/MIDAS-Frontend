import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SummarizeIcon from "@mui/icons-material/Summarize";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";

import PredictionCard from "../NewDashboardLifeCycle/PredictionCard";
import type { TradingSignalIntelligence } from "./types";

/* ---------- helpers (same as AIMLDealInsightsPanel) ---------- */

function toNumber(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function fmtPct(v: number | string | null | undefined, digits = 1): string {
  const n = toNumber(v);
  if (n === null) return "-";
  return `${n.toFixed(digits)}%`;
}

function fmtPlain(v: any): string {
  if (v === null || v === undefined || String(v).trim() === "") return "-";
  return String(v);
}

/* ---------- sub-components ---------- */

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
      {icon}
      <Typography variant="h6" sx={{ fontWeight: 900, fontSize: 16 }}>
        {title}
      </Typography>
    </Box>
  );
}

function FancyCard({
  title,
  children,
  tone = "cool",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "cool" | "neutral" | "warm";
}) {
  const bg =
    tone === "cool"
      ? "linear-gradient(180deg, rgba(33,150,243,0.10), rgba(33,150,243,0.02))"
      : tone === "warm"
      ? "linear-gradient(180deg, rgba(251,146,60,0.10), rgba(251,146,60,0.02))"
      : "linear-gradient(180deg, rgba(148,163,184,0.10), rgba(148,163,184,0.02))";

  return (
    <Box
      sx={{
        borderRadius: 4,
        height: "100%",
        bgcolor: "#FFFFFF",
        border: "1px solid #EEF2F7",
        backgroundImage: bg,
        boxShadow: "0 10px 24px rgba(16, 24, 40, 0.08)",
        p: 2.25,
        transition: "transform 180ms ease, box-shadow 180ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 14px 30px rgba(16, 24, 40, 0.12)",
        },
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 1000, letterSpacing: 0.4, mb: 1.25 }}
      >
        {title.toUpperCase()}
      </Typography>
      <Divider sx={{ mb: 1.25, borderColor: "#EEF2F7" }} />
      {children}
    </Box>
  );
}

function StatRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        py: 1,
      }}
    >
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}
      >
        <Typography
          variant="body2"
          sx={{ color: "#000000", fontWeight: 700, whiteSpace: "nowrap" }}
        >
          {label}
        </Typography>
        {hint ? (
          <Tooltip title={hint} arrow>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ cursor: "help" }}
            >
              i
            </Typography>
          </Tooltip>
        ) : null}
      </Box>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 900,
          color: "text.primary",
          textAlign: "right",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "65%",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function SentimentChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const v = (value || "").toLowerCase();
  const color =
    v === "bullish"
      ? "#166534"
      : v === "bearish"
      ? "#991B1B"
      : "#374151";
  const bg =
    v === "bullish"
      ? "#DCFCE7"
      : v === "bearish"
      ? "#FEE2E2"
      : "#F3F4F6";
  const Icon =
    v === "bullish"
      ? TrendingUpIcon
      : v === "bearish"
      ? TrendingDownIcon
      : TrendingFlatIcon;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 700, color: "#374151", minWidth: 100 }}>
        {label}
      </Typography>
      <Chip
        icon={<Icon sx={{ fontSize: 16, color }} />}
        label={value || "-"}
        size="small"
        sx={{
          bgcolor: bg,
          color,
          fontWeight: 800,
          textTransform: "capitalize",
          borderRadius: 999,
          height: 28,
        }}
      />
    </Box>
  );
}

/* ---------- main component ---------- */

interface Props {
  ticker: string;
}

const AIMLIntelligencePanel: React.FC<Props> = ({ ticker }) => {
  const [data, setData] = useState<TradingSignalIntelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!ticker || !apiUrl) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${apiUrl}/api/trading_signal_intelligence/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({ ticker }),
          }
        );

        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          throw new Error(
            errJson?.error || `Request failed with status ${res.status}`
          );
        }

        const json: TradingSignalIntelligence = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Failed to fetch intelligence data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker, apiUrl, token]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data) return null;

  // Parse sentiment summary bullets
  const sentimentSummaryData = data.sentiment_summary?.sentiment_summary;
  const weekBullets = (sentimentSummaryData?.one_week || "")
    .split("\\n")
    .filter(Boolean);
  const monthBullets = (sentimentSummaryData?.one_month || "")
    .split("\\n")
    .filter(Boolean);

  const outlook = data.few_shot_final_outlook;

  return (
    <Box>
      {/* ── ML Predictions ── */}
      <Box
        sx={{
          p: 2.5,
          borderRadius: 4,
          bgcolor: "#FBF8E7",
          border: "1px solid #F3EFD8",
          boxShadow: "0 10px 24px rgba(16, 24, 40, 0.06)",
          mb: 3,
        }}
      >
        <SectionHeader
          icon={<PsychologyIcon sx={{ color: "#D97706", fontSize: 24 }} />}
          title="ML Model Predictions & Outcomes"
        />
        <Typography
          variant="body2"
          sx={{ color: "#111827", opacity: 0.75, fontWeight: 600, mb: 2 }}
        >
          AI-powered forecasts compared to actual market performance
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <PredictionCard
              title="1st Day Close from Issue Price"
              dirRaw={fmtPlain(data.t1d_pred)}
              confidence={data.t1d_confidence}
              actualReturn={data.t1d_actual_return}
              fmtPct={fmtPct}
              toNumber={toNumber}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PredictionCard
              title="1st Day Close from Open Price"
              dirRaw={fmtPlain(data.t1d_openprice_pred)}
              confidence={data.t1d_openprice_confidence}
              actualReturn={data.t1d_openprice_actual_return}
              fmtPct={fmtPct}
              toNumber={toNumber}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PredictionCard
              title="1 Week Close from 1st Day Close"
              dirRaw={fmtPlain(data.t1w_pred)}
              confidence={data.t1w_confidence}
              actualReturn={data.t1w_actual_return}
              fmtPct={fmtPct}
              toNumber={toNumber}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PredictionCard
              title="1 Month Close from 1st Day Close"
              dirRaw={fmtPlain(data.t1m_pred)}
              confidence={data.t1m_confidence}
              actualReturn={data.t1m_actual_return}
              fmtPct={fmtPct}
              toNumber={toNumber}
            />
          </Grid>
        </Grid>
      </Box>

      {/* ── Few-shot Analysis + Sentiment ── */}
      <Grid container spacing={3}>
        {/* Executive Summary */}
        <Grid item xs={12} md={6}>
          <FancyCard title="AI Executive Summary" tone="cool">
            <SectionHeader
              icon={<SummarizeIcon sx={{ color: "#2563EB", fontSize: 20 }} />}
              title=""
            />
            {data.few_shot_executive_summary ? (
              <Typography
                variant="body2"
                sx={{
                  color: "#374151",
                  fontWeight: 500,
                  lineHeight: 1.7,
                  whiteSpace: "pre-line",
                }}
              >
                {data.few_shot_executive_summary}
              </Typography>
            ) : (
              <Typography
                variant="body2"
                sx={{ color: "#9CA3AF", fontWeight: 600 }}
              >
                No executive summary available
              </Typography>
            )}
          </FancyCard>
        </Grid>

        {/* Final Outlook + Sentiment */}
        <Grid item xs={12} md={6}>
          <FancyCard title="Sentiment & Volatility Outlook" tone="warm">
            {/* Few-shot final outlook */}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: "#92400E",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                mb: 1.5,
                display: "block",
              }}
            >
              Unsupervised Model Outlook
            </Typography>

            <Box sx={{ mb: 2 }}>
              <StatRow
                label="1-Week Sentiment"
                value={
                  <Chip
                    label={outlook?.one_week_sentiment || "-"}
                    size="small"
                    sx={{
                      bgcolor:
                        (outlook?.one_week_sentiment || "").toLowerCase() ===
                        "bullish"
                          ? "#DCFCE7"
                          : (outlook?.one_week_sentiment || "").toLowerCase() ===
                            "bearish"
                          ? "#FEE2E2"
                          : "#F3F4F6",
                      fontWeight: 800,
                      textTransform: "capitalize",
                      height: 24,
                      fontSize: 12,
                    }}
                  />
                }
              />
              <StatRow
                label="1-Month Sentiment"
                value={
                  <Chip
                    label={outlook?.one_month_sentiment || "-"}
                    size="small"
                    sx={{
                      bgcolor:
                        (outlook?.one_month_sentiment || "").toLowerCase() ===
                        "bullish"
                          ? "#DCFCE7"
                          : (outlook?.one_month_sentiment || "").toLowerCase() ===
                            "bearish"
                          ? "#FEE2E2"
                          : "#F3F4F6",
                      fontWeight: 800,
                      textTransform: "capitalize",
                      height: 24,
                      fontSize: 12,
                    }}
                  />
                }
              />
              <StatRow
                label="Expected Volatility"
                value={fmtPlain(outlook?.expected_volatility)}
                hint="Low / Medium / High"
              />
              <StatRow
                label="Confidence Level"
                value={fmtPlain(outlook?.confidence_level)}
              />
            </Box>

            <Divider sx={{ my: 1.5, borderColor: "#EEF2F7" }} />

            {/* Classified sentiment */}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: "#1E40AF",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                mb: 1.5,
                display: "block",
              }}
            >
              Classified Sentiment
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <SentimentChip
                label="1-Week"
                value={data.one_week_sentiment}
              />
              <SentimentChip
                label="1-Month"
                value={data.one_month_sentiment}
              />
            </Box>
          </FancyCard>
        </Grid>

        {/* Sentiment Summary */}
        {(weekBullets.length > 0 || monthBullets.length > 0) && (
          <Grid item xs={12}>
            <FancyCard title="Sentiment Summary" tone="neutral">
              <SectionHeader
                icon={
                  <SentimentSatisfiedIcon
                    sx={{ color: "#6366F1", fontSize: 20 }}
                  />
                }
                title=""
              />
              <Grid container spacing={3}>
                {weekBullets.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 900, mb: 1, color: "#1E40AF" }}
                    >
                      1-Week Outlook
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                      {weekBullets.map((b, i) => (
                        <Typography
                          component="li"
                          variant="body2"
                          key={i}
                          sx={{ mb: 0.5, color: "#374151", lineHeight: 1.6 }}
                        >
                          {b}
                        </Typography>
                      ))}
                    </Box>
                  </Grid>
                )}
                {monthBullets.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 900, mb: 1, color: "#92400E" }}
                    >
                      1-Month Outlook
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                      {monthBullets.map((b, i) => (
                        <Typography
                          component="li"
                          variant="body2"
                          key={i}
                          sx={{ mb: 0.5, color: "#374151", lineHeight: 1.6 }}
                        >
                          {b}
                        </Typography>
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </FancyCard>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AIMLIntelligencePanel;
