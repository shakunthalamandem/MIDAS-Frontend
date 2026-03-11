import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SummarizeIcon from "@mui/icons-material/Summarize";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import PredictionCard from "../NewDashboardLifeCycle/PredictionCard";
import type { TradingSignalIntelligence, SourceStatus } from "./types";

/* ════════════════════════════════════════════
   Helpers
   ════════════════════════════════════════════ */

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

/* ════════════════════════════════════════════
   Sentiment color helper
   ════════════════════════════════════════════ */

function getSentimentStyle(value: string): { bg: string; color: string } {
  const v = (value || "").toLowerCase();
  if (v.includes("bullish"))
    return { bg: "#DCFCE7", color: "#166534" };
  if (v.includes("bearish"))
    return { bg: "#FEE2E2", color: "#991B1B" };
  if (v.includes("neutral"))
    return { bg: "#FEF3C7", color: "#92400E" };
  return { bg: "#F1F5F9", color: "#334155" };
}

function getVolatilityStyle(value: string): { bg: string; color: string } {
  const v = (value || "").toLowerCase();
  if (v.includes("high"))
    return { bg: "#FEE2E2", color: "#991B1B" };
  if (v.includes("medium") || v.includes("moderate"))
    return { bg: "#FEF3C7", color: "#92400E" };
  if (v.includes("low"))
    return { bg: "#DCFCE7", color: "#166534" };
  return { bg: "#E0F2FE", color: "#075985" };
}

function getConfidenceStyle(value: string): { bg: string; color: string } {
  const v = (value || "").toLowerCase();
  if (v.includes("high"))
    return { bg: "#DCFCE7", color: "#166534" };
  if (v.includes("medium") || v.includes("moderate"))
    return { bg: "#FEF9C3", color: "#854D0E" };
  if (v.includes("low"))
    return { bg: "#FEE2E2", color: "#991B1B" };
  return { bg: "#FEF9C3", color: "#854D0E" };
}

function isBlank(v: any): boolean {
  if (v === null || v === undefined) return true;
  const s = String(v).trim().toLowerCase();
  return s === "" || s === "-" || s === "na" || s === "n/a" || s === "none" || s === "null";
}

/* ════════════════════════════════════════════
   Sub-components
   ════════════════════════════════════════════ */

/** Section header with icon + title */
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
      {icon}
      <Typography sx={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>
        {title}
      </Typography>
    </Box>
  );
}

/** Individual Outlook Card matching the reference design */
function OutlookCard({
  label,
  value,
  chipBg,
  chipColor,
  accentColor = "#F1F5F9",
}: {
  label: string;
  value: string;
  chipBg: string;
  chipColor: string;
  accentColor?: string;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        background: "#FFFFFF",
        boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
        overflow: "hidden",
        height: "100%",
        minHeight: 120,
      }}
    >
      <Box sx={{ height: 6, bgcolor: accentColor }} />
      <CardContent
        sx={{
          p: 2.25,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "#002060",
            textAlign: "center",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {label}
        </Typography>

        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 32,
            px: 1.75,
            borderRadius: 2,
            bgcolor: chipBg,
            color: chipColor,
            fontWeight: 800,
            fontSize: 13,
            minWidth: "fit-content",
            border: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          {value || "-"}
        </Box>
      </CardContent>
    </Card>
  );
}

/** Sentiment card with icon + colored chip */
function SentimentCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  const style = getSentimentStyle(value);
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        background: "#FFFFFF",
        boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
        overflow: "hidden",
        height: "100%",
        minHeight: 120,
      }}
    >
      <Box sx={{ height: 6, bgcolor: style.bg }} />
      <CardContent
        sx={{
          p: 2.25,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "#002060",
            textAlign: "center",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {label}
        </Typography>
        <Chip
          icon={<>{icon}</>}
          label={value || "-"}
          size="small"
          sx={{
            height: 32,
            px: 1.75,
            bgcolor: style.bg,
            color: style.color,
            borderRadius: 2,
            border: "1px solid rgba(0,0,0,0.04)",
            fontWeight: 800,
            fontSize: 13,
            textTransform: "capitalize",
          }}
        />
      </CardContent>
    </Card>
  );
}

/* ════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════ */

interface Props {
  ticker: string;
  mlPredictionsRef?: React.RefObject<HTMLDivElement>;
  aiModelRef?: React.RefObject<HTMLDivElement>;
  aiSentimentRef?: React.RefObject<HTMLDivElement>;
  onDataStatus?: (status: SourceStatus) => void;
  onDataPoints?: (points: Record<string, string>) => void;
}

const AIMLIntelligencePanel: React.FC<Props> = ({
  ticker,
  mlPredictionsRef,
  aiModelRef,
  aiSentimentRef,
  onDataStatus,
  onDataPoints,
}) => {
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

        const res = await fetch(`${apiUrl}/api/trading_signal_intelligence/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker }),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          throw new Error(errJson?.error || `Request failed with status ${res.status}`);
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

  // Report data availability to parent
  useEffect(() => {
    if (!onDataStatus) return;
    if (!data) {
      onDataStatus({ mlModel: false, aiModel: false, aiSentiment: false });
      return;
    }
    const mlModel =
      !isBlank(data.t1d_pred) ||
      !isBlank(data.t1w_pred) ||
      !isBlank(data.t1m_pred);
    const aiModel =
      !!data.few_shot_executive_summary ||
      !!data.few_shot_final_outlook?.one_week_sentiment;
    const aiSentiment =
      !isBlank(data.one_week_sentiment) ||
      !isBlank(data.one_month_sentiment);
    onDataStatus({ mlModel, aiModel, aiSentiment });
  }, [data, onDataStatus]);

  // Report 1-month data points to parent for Intelligence Sources display
  useEffect(() => {
    if (!onDataPoints) return;
    if (!data) {
      onDataPoints({});
      return;
    }
    const points: Record<string, string> = {};
    if (!isBlank(data.t1m_pred)) {
      const conf = toNumber(data.t1m_confidence);
      points.mlModel =
        conf !== null
          ? `${fmtPlain(data.t1m_pred)} (${conf.toFixed(0)}%)`
          : fmtPlain(data.t1m_pred);
    }
    if (
      data.few_shot_final_outlook?.one_month_sentiment &&
      !isBlank(data.few_shot_final_outlook.one_month_sentiment)
    ) {
      points.aiModel = data.few_shot_final_outlook.one_month_sentiment;
    }
    if (!isBlank(data.one_month_sentiment)) {
      points.aiSentiment = data.one_month_sentiment;
    }
    if (!isBlank(data.one_month_sentiment)) {
      points.marketNews = data.one_month_sentiment;
    }
    if (!isBlank(data.t1m_actual_return)) {
      points.priceAction = fmtPct(data.t1m_actual_return);
    }
    onDataPoints(points);
  }, [data, onDataPoints]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 6,
        }}
      >
        <CircularProgress size={28} sx={{ color: "#64748B" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="info" sx={{ mt: 1, borderRadius: 2, fontSize: 13 }}>
        {error}
      </Alert>
    );
  }

  if (!data) return null;

  const outlook = data.few_shot_final_outlook;
  const mlPredictionsAvailable =
    !isBlank(data.t1d_pred) ||
    !isBlank(data.t1w_pred) ||
    !isBlank(data.t1m_pred);

  // Sentiment chip colors
  const weekSentiment = getSentimentStyle(outlook?.one_week_sentiment || "");
  const monthSentiment = getSentimentStyle(outlook?.one_month_sentiment || "");
  const volStyle = getVolatilityStyle(outlook?.expected_volatility || "");
  const confStyle = getConfidenceStyle(outlook?.confidence_level || "");

  // Classified sentiment
  const classWeek = getSentimentStyle(data.one_week_sentiment || "");
  const classMonth = getSentimentStyle(data.one_month_sentiment || "");

  const classWeekIcon =
    (data.one_week_sentiment || "").toLowerCase().includes("bullish") ? (
      <TrendingUpIcon sx={{ fontSize: 16, color: classWeek.color }} />
    ) : (data.one_week_sentiment || "").toLowerCase().includes("bearish") ? (
      <TrendingDownIcon sx={{ fontSize: 16, color: classWeek.color }} />
    ) : (
      <TrendingFlatIcon sx={{ fontSize: 16, color: classWeek.color }} />
    );

  const classMonthIcon =
    (data.one_month_sentiment || "").toLowerCase().includes("bullish") ? (
      <TrendingUpIcon sx={{ fontSize: 16, color: classMonth.color }} />
    ) : (data.one_month_sentiment || "").toLowerCase().includes("bearish") ? (
      <TrendingDownIcon sx={{ fontSize: 16, color: classMonth.color }} />
    ) : (
      <TrendingFlatIcon sx={{ fontSize: 16, color: classMonth.color }} />
    );

  // Sentiment summary text
  // sentiment_summary from the API is { one_week?: string, one_month?: string }
  const sentimentSummaryRaw = data.sentiment_summary;
  const sentimentSummaryData =
    (sentimentSummaryRaw as any)?.sentiment_summary ?? sentimentSummaryRaw;
  const weekSummaryText = (sentimentSummaryData?.one_week || "")
    .replace(/\\n/g, "\n")
    .trim();
  const monthSummaryText = (sentimentSummaryData?.one_month || "")
    .replace(/\\n/g, "\n")
    .trim();

  return (
    <Box>
      {/* ═══════════════════════════════════════════
          Section 1: ML Predictions
          ═══════════════════════════════════════════ */}
      <Box
        ref={mlPredictionsRef}
        sx={{
          borderRadius: 2,
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          p: 2.5,
          mb: 2.5,
          position: "relative",
          overflow: "hidden",
          scrollMarginTop: "120px",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 3,
            height: "100%",
            bgcolor: "#F59E0B",
          }}
        />
        <SectionHeader
          icon={<PsychologyIcon sx={{ color: "#D97706", fontSize: 22 }} />}
          title="ML Model Predictions & Outcomes"
        />
        <Typography sx={{ color: "#64748B", fontWeight: 500, fontSize: 12.5, mb: 2 }}>
          AI-powered forecasts compared to actual market performance
        </Typography>

        {mlPredictionsAvailable ? (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <PredictionCard
                title="1st Day Close from Issue Price"
                dirRaw={fmtPlain(data.t1d_pred)}
                confidence={data.t1d_confidence}
                actualReturn={data.t1d_actual_return}
                fmtPct={fmtPct}
                toNumber={toNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <PredictionCard
                title="1 Week Close from 1st Day Close"
                dirRaw={fmtPlain(data.t1w_pred)}
                confidence={data.t1w_confidence}
                actualReturn={data.t1w_actual_return}
                fmtPct={fmtPct}
                toNumber={toNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
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
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 5,
              bgcolor: "#F8FAFC",
              borderRadius: 2,
              border: "1px dashed #CBD5E1",
            }}
          >
            <PsychologyIcon sx={{ fontSize: 40, color: "#CBD5E1", mb: 1.5 }} />
            <Typography
              sx={{ fontWeight: 700, fontSize: 15, color: "#64748B", mb: 0.5 }}
            >
              Deal Not Yet Predicted
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>
              ML model predictions will appear here once generated
            </Typography>
          </Box>
        )}
      </Box>

      {/* ═══════════════════════════════════════════
          Section 2: AI Unsupervised Outlook
          Executive Summary + 4 Outlook Cards
          ═══════════════════════════════════════════ */}
      <Box
        ref={aiModelRef}
        sx={{
          borderRadius: 2,
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          p: 2.5,
          mb: 2.5,
          position: "relative",
          overflow: "hidden",
          scrollMarginTop: "120px",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 3,
            height: "100%",
            bgcolor: "#6366F1",
          }}
        />

        <SectionHeader
          icon={<AutoAwesomeIcon sx={{ color: "#6366F1", fontSize: 22 }} />}
          title="AI Unsupervised Analysis"
        />

        {/* Executive Summary */}
        {data.few_shot_executive_summary ? (
          <Box
            sx={{
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 2,
              p: 2,
              mb: 2.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
              <SummarizeIcon sx={{ color: "#6366F1", fontSize: 18 }} />
              <Typography sx={{ fontWeight: 800, fontSize: 12.5, color: "#334155" }}>
                Executive Summary
              </Typography>
            </Box>
            <Typography
              sx={{
                color: "#475569",
                fontWeight: 500,
                fontSize: 13,
                lineHeight: 1.7,
                whiteSpace: "pre-line",
              }}
            >
              {data.few_shot_executive_summary}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 2,
              p: 2,
              mb: 2.5,
            }}
          >
            <Typography sx={{ color: "#94A3B8", fontWeight: 600, fontSize: 13 }}>
              No executive summary available
            </Typography>
          </Box>
        )}

        {/* Outlook Summary heading */}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 14,
            color: "#5D0163",
            textAlign: "center",
            mb: 1.5,
          }}
        >
          Outlook Summary
        </Typography>

        {/* 4 Outlook Cards in a row */}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
          }}
        >
          <OutlookCard
            label="1-Week Sentiment"
            value={fmtPlain(outlook?.one_week_sentiment)}
            chipBg={weekSentiment.bg}
            chipColor={weekSentiment.color}
            accentColor={weekSentiment.bg}
          />
          <OutlookCard
            label="1-Month Sentiment"
            value={fmtPlain(outlook?.one_month_sentiment)}
            chipBg={monthSentiment.bg}
            chipColor={monthSentiment.color}
            accentColor={monthSentiment.bg}
          />
          <OutlookCard
            label="Expected Volatility"
            value={fmtPlain(outlook?.expected_volatility)}
            chipBg={volStyle.bg}
            chipColor={volStyle.color}
            accentColor="#E0F2FE"
          />
          <OutlookCard
            label="Confidence Level"
            value={fmtPlain(outlook?.confidence_level)}
            chipBg={confStyle.bg}
            chipColor={confStyle.color}
            accentColor="#FEF9C3"
          />
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════
          Section 3: Classified Sentiment
          Sentiment Summary + 2 Sentiment Cards
          ═══════════════════════════════════════════ */}
      <Box
        ref={aiSentimentRef}
        sx={{
          borderRadius: 2,
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          p: 2.5,
          position: "relative",
          overflow: "hidden",
          scrollMarginTop: "120px",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 3,
            height: "100%",
            bgcolor: "#3B82F6",
          }}
        />

        <SectionHeader
          icon={<SentimentSatisfiedIcon sx={{ color: "#3B82F6", fontSize: 22 }} />}
          title="Classified Sentiment Analysis"
        />

        {/* AI Sentiment Summary (if available) */}
        {(weekSummaryText || monthSummaryText) && (
          <Box
            sx={{
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 2,
              p: 2,
              mb: 2.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
              <SummarizeIcon sx={{ color: "#3B82F6", fontSize: 18 }} />
              <Typography sx={{ fontWeight: 800, fontSize: 13, color: "#334155" }}>
                AI Sentiment Summary
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {weekSummaryText && (
                <Grid item xs={12} md={6}>
                  <Typography
                    sx={{ fontWeight: 800, fontSize: 13, mb: 1, color: "#1E40AF" }}
                  >
                    1-Week Outlook
                  </Typography>
                  <Typography
                    sx={{
                      color: "#475569",
                      fontSize: 13,
                      lineHeight: 1.7,
                      fontWeight: 500,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {weekSummaryText}
                  </Typography>
                </Grid>
              )}
              {monthSummaryText && (
                <Grid item xs={12} md={6}>
                  <Typography
                    sx={{ fontWeight: 800, fontSize: 13, mb: 1, color: "#92400E" }}
                  >
                    1-Month Outlook
                  </Typography>
                  <Typography
                    sx={{
                      color: "#475569",
                      fontSize: 13,
                      lineHeight: 1.7,
                      fontWeight: 500,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {monthSummaryText}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Sentiment heading */}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 14,
            color: "#5D0163",
            textAlign: "center",
            mb: 1.5,
          }}
        >
          Sentiment Overview
        </Typography>

        {/* 2 Sentiment Cards */}
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
            },
          }}
        >
          <SentimentCard
            label="1-Week Sentiment"
            value={data.one_week_sentiment}
            icon={classWeekIcon}
          />
          <SentimentCard
            label="1-Month Sentiment"
            value={data.one_month_sentiment}
            icon={classMonthIcon}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AIMLIntelligencePanel;
