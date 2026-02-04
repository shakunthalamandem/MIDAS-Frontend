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
import { DealRecommendationResponse } from "./DealRecommendationHome";
import { SectionCard } from "./SectionCard";

function toneFromText(text: string): Tone {
  const t = (text || "").toLowerCase();
  if (t.includes("positive") || t.includes("bull") || t.includes("up"))
    return "success";
  if (t.includes("low") || t.includes("negative") || t.includes("bear"))
    return "warning";
  if (t.includes("high")) return "info";
  return "default";
}



type Tone = "success" | "warning" | "default" | "info";
type Timeframe = "t1d" | "t1w" | "t1m";

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

function getIndication(timeframe: Timeframe, pred: string): string | null {
  // case-insensitive key lookup
  const bucket = INDICATION_MAP[timeframe];
  if (!bucket) return null;
  const match = Object.keys(bucket).find(
    (key) => key.toLowerCase() === (pred || "").toLowerCase()
  );
  return match ? bucket[match] : null;
}


export function formatPct(n: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  return `${n.toFixed(1)}%`;
}
export function formatNum(n: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  return n.toFixed(2);
}


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
  const tone: Tone = toneFromText(pred);
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