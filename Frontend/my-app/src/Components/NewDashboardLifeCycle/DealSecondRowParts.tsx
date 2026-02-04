import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { DealRecommendationResponse } from "./DealRecomendation";

// ─── helpers ─────────────────────────────────────────────────────────────────
export function formatPct(n: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  return `${n.toFixed(1)}%`;
}
export function formatNum(n: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  return n.toFixed(2);
}

type Tone = "success" | "warning" | "default" | "info";

function toneFromText(text: string): Tone {
  const t = (text || "").toLowerCase();
  if (t.includes("positive") || t.includes("bull") || t.includes("up"))
    return "success";
  if (t.includes("low") || t.includes("negative") || t.includes("bear"))
    return "warning";
  if (t.includes("high")) return "info";
  return "default";
}

// ─── indication map ──────────────────────────────────────────────────────────
// Each timeframe → each possible label → the meaning to display
type Timeframe = "t1d" | "t1w" | "t1m";

const INDICATION_MAP: Record<Timeframe, Record<string, string>> = {
  t1d: {
    "Low Return": "< 3%",
    "Neutral Return": "3% – 5%",
    "Positive Return": "> 8%",
    Positive: "> 0%",
    Negative: "< 0%",
  },
  t1w: {
    Positive: "> 0%",
    Negative: "< 0%",
  },
  t1m: {
    Positive: "> 0%",
    Negative: "< 0%",
  },
};

/** Returns the meaning string for a given timeframe + prediction label, or null */
function getIndication(timeframe: Timeframe, pred: string): string | null {
  // case-insensitive key lookup
  const bucket = INDICATION_MAP[timeframe];
  if (!bucket) return null;
  const match = Object.keys(bucket).find(
    (key) => key.toLowerCase() === (pred || "").toLowerCase()
  );
  return match ? bucket[match] : null;
}

/** Colours for the indication pill, keyed by tone */
const INDICATION_BG: Record<Tone, string> = {
  success: "rgba(34, 197, 94, 0.12)",
  warning: "rgba(234, 179, 8, 0.12)",
  info: "rgba(59, 130, 246, 0.10)",
  default: "rgba(107, 114, 128, 0.10)",
};
const INDICATION_TEXT: Record<Tone, string> = {
  success: "#15803d",
  warning: "#a16207",
  info: "#1d4ed8",
  default: "#4b5563",
};
const INDICATION_BORDER: Record<Tone, string> = {
  success: "rgba(34, 197, 94, 0.28)",
  warning: "rgba(234, 179, 8, 0.28)",
  info: "rgba(59, 130, 246, 0.22)",
  default: "rgba(107, 114, 128, 0.22)",
};

// ─── SentimentChip ──────────────────────────────────────────────────────────
function SentimentChip({ text }: { text: string }) {
  const tone = toneFromText(text);
  const color =
    tone === "success"
      ? "success"
      : tone === "warning"
      ? "warning"
      : tone === "info"
      ? "info"
      : "default";

  return (
    <Chip
      label={text || "-"}
      color={color as any}
      variant={color === "default" ? "outlined" : "filled"}
      size="small"
      sx={{
        height: 16,
        fontSize: "0.6rem",
        lineHeight: 1,
        borderRadius: 1,
        "& .MuiChip-label": {
          padding: "0 6px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 80,
          textAlign: "center",
        },
      }}
    />
  );
}

// ─── SectionCard ─────────────────────────────────────────────────────────────
export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #e5e7ef",
        background: "#f7f9ff",
        boxShadow: "0 10px 20px rgba(32, 70, 150, 0.08)",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack spacing={1.5}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#121f44" }}
            align="center"
          >
            {title}
          </Typography>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── PredictionTile ─────────────────────────────────────────────────────────
function PredictionTile({
  title,
  pred,
  confidence,
  timeframe,
}: {
  title: string;
  pred: string;
  confidence: number;
  timeframe: Timeframe;
}) {
  const tone = toneFromText(pred);
  const chipColor =
    tone === "success"
      ? "success"
      : tone === "warning"
        ? "warning"
        : tone === "info"
          ? "info"
          : "inherit";

  const indication = getIndication(timeframe, pred);

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid #e5e7ef",
        background: "#eceff5",
        boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
        p: 2.25,
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack spacing={1.25}>
        {/* title */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: "#1d2b5a" }}
        >
          {title}
        </Typography>

        {/* prediction chip  +  indication pill on the same row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Chip
            size="small"
            label={(pred || "NEUTRAL").toUpperCase()}
            color={chipColor as any}
            variant={tone === "default" ? "outlined" : "filled"}
          />

          {indication && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.35,
                background: INDICATION_BG[tone],
                border: `1px solid ${INDICATION_BORDER[tone]}`,
                borderRadius: 99,
                px: 1,
                py: 0.2,
              }}
            >
              {/* tiny trend arrow */}
              <Typography
                component="span"
                sx={{
                  fontSize: 10,
                  lineHeight: 1,
                  color: INDICATION_TEXT[tone],
                }}
              >
                {tone === "success" ? "↑" : tone === "warning" ? "↓" : "→"}
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: INDICATION_TEXT[tone],
                  letterSpacing: 0.2,
                }}
              >
                {indication}
              </Typography>
            </Box>
          )}
        </Box>

        {/* progress bar + probability */}
        <Box>
          <LinearProgress
            variant="determinate"
            value={Math.max(0, Math.min(100, confidence || 0))}
            sx={{ height: 8, borderRadius: 99 }}
            color={
              tone === "success"
                ? "success"
                : tone === "warning"
                  ? "warning"
                  : "inherit"
            }
          />
          <Typography
            variant="caption"
            color="#000000"
            sx={{ mt: 0.75, display: "block" }}
          >
            Prob.{" "}
            <Typography
              component="span"
              variant="caption"
              fontWeight={800}
              color="text.primary"
            >
              {formatPct(confidence)}
            </Typography>
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

// ─── DealMomentum ────────────────────────────────────────────────────────────
export function DealMomentum({ data }: { data: DealRecommendationResponse }) {
  return (
    <SectionCard title="Deal Momentum (Peers Avg Price)">
      <Typography variant="body2" color="#000000">
        Average price performance based on the latest deal of each peer
        ({data.peers_count || 0} peers)
      </Typography>

      <TableContainer
        component={Card}
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid #e5e7ef",
          background: "#ffffff",
          boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
          mt: 1.5,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Peers</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>1st Day</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>1st Week</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>1st Month</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 400 }}>
                Peers Average (Top {data.peers_count || 0})
              </TableCell>
              <TableCell>{formatNum(data.peers_t1d_avg_price)}%</TableCell>
              <TableCell>{formatNum(data.peers_t1w_avg_price)}%</TableCell>
              <TableCell>{formatNum(data.peers_t1m_avg_price)}%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </SectionCard>
  );
}

// ─── OutlookSummary ─────────────────────────────────────────────────────────
export function OutlookSummary({ data }: { data: DealRecommendationResponse }) {
  return (
    <SectionCard title="AI Unsupervised Summary">
      {/* Executive Summary */}
      <Box
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 2,
          background: "#ffffff",
          borderLeft: "4px solid #4f46e5",
          boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
        }}
      >
        <Typography
          variant="subtitle2"
          fontWeight={700}
          color="#111827"
          gutterBottom
        >
          Executive Summary
        </Typography>
        <Typography variant="body2" sx={{ color: "#374151", lineHeight: 1.6 }}>
          {data.executive_summary || "No executive summary available."}
        </Typography>
      </Box>

      {/* Sentiment Cards */}
      <Grid container spacing={1} sx={{ pb: 0.5 }}>
        {[
          { label: "1-Week", value: data.fs_1w_sentiment },
          { label: "1-Month", value: data.fs_1m_sentiment },
          { label: "Volatility", value: data.fs_expected_volatility },
          { label: "Confidence", value: data.fs_confidence_level },
        ].map(({ label, value }) => (
          <Grid item xs={12} md={3} key={label}>
            <Box
              sx={{
                borderRadius: 2,
                border: "1px solid #e5e7ef",
                background: "#f7f9ff",
                boxShadow: "0 6px 14px rgba(32, 70, 150, 0.08)",
                p: 2,
                height: "70%",
                textAlign: "center",
              }}
            >
              <Stack spacing={1} alignItems="center">
                <Typography variant="body2" fontWeight={600} color="#111827">
                  {label}
                </Typography>
                <SentimentChip text={value} />
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </SectionCard>
  );
}

// ─── MarketSentiment ─────────────────────────────────────────────────────────
export function MarketSentiment({
  oneWeek,
  oneMonth,
}: {
  oneWeek: string;
  oneMonth: string;
}) {
  return (
    <SectionCard title="Social Media Buzz (Public Sentiment)">
      <Grid container spacing={1} sx={{ pb: 0.5 }}>
        <Grid item xs={4}>
          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid #e5e7ef",
              background: "#eceff5",
              boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
              p: 2,
              height: "70%",
            }}
          >
            <Stack spacing={1}>
              <Typography variant="body2" fontWeight={700} color="#000000">
                First Week
              </Typography>
              <SentimentChip text={oneWeek} />
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid #e5e7ef",
              background: "#eceff5",
              boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
              p: 2,
              height: "70%",
            }}
          >
            <Stack spacing={1}>
              <Typography variant="body2" fontWeight={700} color="#000000">
                First Month
              </Typography>
              <SentimentChip text={oneMonth} />
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </SectionCard>
  );
}

// ─── OverallAISummary ────────────────────────────────────────────────────────
export function OverallAISummary({
  t1d,
  t1w,
  t1m,
}: {
  t1d: string;
  t1w: string;
  t1m: string;
}) {
  return (
    <SectionCard title="Overall AI Summary">
      <Grid container spacing={2}>
        {[
          { label: "T+1 Day", value: t1d },
          { label: "T+1 Week", value: t1w },
          { label: "T+1 Month", value: t1m },
        ].map(({ label, value }) => (
          <Grid item xs={12} md={4} key={label}>
            <Box
              sx={{
                borderRadius: 2,
                border: "1px solid #e5e7ef",
                background: "#eceff5",
                boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
                p: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "#1d2b5a" }}
              >
                {label}
              </Typography>
              <Typography sx={{ mt: 1, fontWeight: 700, color: "#111827" }}>
                {value || "-"}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </SectionCard>
  );
}

// ─── AIMLPredictions ─────────────────────────────────────────────────────────
export function AIMLPredictions({
  data,
}: {
  data: DealRecommendationResponse;
}) {
  return (
    <SectionCard title="AI-ML Predictions">
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <PredictionTile
            title="T+1 Day"
            pred={data.t1d_pred}
            confidence={data.t1d_confidence}
            timeframe="t1d"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PredictionTile
            title="T+1 Week"
            pred={data.t1w_pred}
            confidence={data.t1w_confidence}
            timeframe="t1w"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PredictionTile
            title="T+1 Month"
            pred={data.t1m_pred}
            confidence={data.t1m_confidence}
            timeframe="t1m"
          />
        </Grid>
      </Grid>
    </SectionCard>
  );
}