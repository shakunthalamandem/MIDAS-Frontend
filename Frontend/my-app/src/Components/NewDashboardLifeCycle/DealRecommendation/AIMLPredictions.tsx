import React from "react";
import {
  Box,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { TrendingUp, TrendingDown, TrendingFlat } from "@mui/icons-material";
import { DealRecommendationResponse } from "./DealRecommendationHome";
import { SectionCard } from "./SectionCard";
import BusinessIcon from "@mui/icons-material/Business";
import BarChartIcon from "@mui/icons-material/BarChart";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PublicIcon from "@mui/icons-material/Public";
import TimelineIcon from "@mui/icons-material/Timeline";

// ─── Types ──────────────────────────────────────────────────────────────────
type Tone = "success" | "warning" | "default" | "info";
type Timeframe = "t1d" | "t1w" | "t1m";
const modelPillars = [
  {
    title: "Deal Structure",
    desc: "Issue size, allocation mix, and sponsor backing to assess demand quality.",
    icon: <BusinessIcon />,
  },
  {
    title: "Sector & Peers",
    desc: "Sector momentum and comparable IPO performance analysis.",
    icon: <BarChartIcon />,
  },
  {
    title: "Fundamentals",
    desc: "Revenue scale, growth trajectory, and profitability signals.",
    icon: <AccountBalanceIcon />,
  },
  {
    title: "Macro & Market",
    desc: "Equity trends, rates, inflation, and market liquidity.",
    icon: <PublicIcon />,
  },
  {
    title: "New-Issue Flow",
    desc: "Issuance momentum and recent deal quality tracking.",
    icon: <TimelineIcon />,
  },
];

interface PredictionData {
  title: string;
  prediction: string;
  confidence: number;
  timeframe: Timeframe;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const TONE_CONFIG: Record<Tone, { bg: string; text: string; border: string }> =
  {
    success: {
      bg: "rgba(34, 197, 94, 0.12)",
      text: "#15803d",
      border: "rgba(34, 197, 94, 0.28)",
    },
    warning: {
      bg: "rgba(234, 179, 8, 0.12)",
      text: "#a16207",
      border: "rgba(234, 179, 8, 0.28)",
    },
    info: {
      bg: "rgba(59, 130, 246, 0.10)",
      text: "#1d4ed8",
      border: "rgba(59, 130, 246, 0.22)",
    },
    default: {
      bg: "rgba(107, 114, 128, 0.10)",
      text: "#4b5563",
      border: "rgba(107, 114, 128, 0.22)",
    },
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

// ─── Utility Functions ───────────────────────────────────────────────────────
/**
 * Determines tone (color theme) based on prediction text
 */
function getToneFromPrediction(text: string): Tone {
  const normalized = (text || "").toLowerCase();

  if (
    normalized.includes("positive") ||
    normalized.includes("bull") ||
    normalized.includes("up")
  )
    return "success";
  if (
    normalized.includes("low") ||
    normalized.includes("negative") ||
    normalized.includes("bear")
  )
    return "warning";
  if (normalized.includes("high")) return "info";

  return "default";
}

/**
 * Gets indication value (e.g., "> 8%") for a given timeframe and prediction
 */
function getIndicationValue(timeframe: Timeframe, pred: string): string | null {
  const bucket = INDICATION_MAP[timeframe];
  if (!bucket) return null;

  const match = Object.keys(bucket).find(
    (key) => key.toLowerCase() === (pred || "").toLowerCase(),
  );

  return match ? bucket[match] : null;
}

/**
 * Formats number as percentage with 1 decimal place
 */
function formatPercentage(value: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return `${value.toFixed(1)}%`;
}

/**
 * Formats number to 2 decimal places
 */
function formatNumber(value: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return value.toFixed(2);
}

/**
 * Returns appropriate trend icon based on tone
 */
function getTrendIcon(tone: Tone) {
  switch (tone) {
    case "success":
      return <TrendingUp sx={{ fontSize: 14, color: "#15803d" }} />;
    case "warning":
      return <TrendingDown sx={{ fontSize: 14, color: "#a16207" }} />;
    case "info":
      return <TrendingFlat sx={{ fontSize: 14, color: "#1d4ed8" }} />;
    default:
      return <TrendingFlat sx={{ fontSize: 14, color: "#4b5563" }} />;
  }
}

// ─── PredictionTile Component ───────────────────────────────────────────────
interface PredictionTileProps {
  title: string;
  prediction: string;
  confidence: number;
  timeframe: Timeframe;
}

function PredictionTile({
  title,
  prediction,
  confidence,
  timeframe,
}: PredictionTileProps) {
  const normalizedPrediction = (prediction || "").trim();
  const hasPrediction = normalizedPrediction.length > 0;
  const tone = getToneFromPrediction(normalizedPrediction);
  const toneStyles = TONE_CONFIG[tone];
  const indication = hasPrediction
    ? getIndicationValue(timeframe, normalizedPrediction)
    : null;
  const chipColor: any =
    tone === "success"
      ? "success"
      : tone === "warning"
        ? "warning"
        : tone === "info"
          ? "info"
          : "default";

  const confidenceValue = Math.max(0, Math.min(100, confidence || 0));

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 2.5,
        border: "1px solid #e5e7ef",
        background: "linear-gradient(135deg, #eceff5 0%, #f5f7fb 100%)",
        boxShadow: "0 4px 12px rgba(72, 100, 170, 0.08)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        p: 2.5,
        minHeight: 140,
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          boxShadow: "0 12px 24px rgba(72, 100, 170, 0.16)",
          transform: "translateY(-2px)",
          border: "1px solid #d8dde5",
        },
      }}
    >
      {/* Accent bar at the top */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: toneStyles.text,
          borderRadius: "2.5px 2.5px 0 0",
        }}
      />

      <Stack spacing={1.5} sx={{ mt: 0.5 }}>
        {/* Title */}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: "#1d2b5a",
            fontSize: "0.875rem",
            letterSpacing: 0.3,
          }}
        >
          {title}
        </Typography>

        {/* Prediction Chip + Indication Badge */}
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
            label={
              hasPrediction
                ? normalizedPrediction.toUpperCase()
                : "Prediction not yet done"
            }
            color={chipColor}
            variant={tone === "default" ? "outlined" : "filled"}
            sx={{
              fontWeight: 600,
              fontSize: "0.75rem",
              letterSpacing: 0.5,
              alignContent: "center",
            }}
          />
          {indication && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                background: toneStyles.bg,
                border: `1px solid ${toneStyles.border}`,
                borderRadius: 20,
                px: 1.25,
                py: 0.35,
                transition: "all 0.2s ease",
              }}
            >
              {getTrendIcon(tone)}
              <Typography
                component="span"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: toneStyles.text,
                  letterSpacing: 0.3,
                }}
              >
                {indication}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Confidence Section */}
        {hasPrediction && (
          <Box sx={{ mt: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.75,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "#4b5563",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Confidence
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: toneStyles.text,
                  fontSize: "0.8rem",
                }}
              >
                {formatPercentage(confidence)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={confidenceValue}
              sx={{
                height: 6,
                borderRadius: 99,
                backgroundColor: "rgba(107, 114, 128, 0.12)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 99,
                  background: `linear-gradient(90deg, ${toneStyles.text}, ${toneStyles.text}dd)`,
                },
              }}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
interface AIMLPredictionsProps {
  data: DealRecommendationResponse;
}

export function AIMLPredictions({ data }: AIMLPredictionsProps) {
  const predictions: PredictionData[] = [
    {
      title: "1st Day Close from Issue",
      prediction: data.t1d_pred,
      confidence: data.t1d_confidence,
      timeframe: "t1d",
    },
    {
      title: "1st Week from 1st Day Close",
      prediction: data.t1w_pred,
      confidence: data.t1w_confidence,
      timeframe: "t1w",
    },
    {
      title: "1st Month from 1st Day Close",
      prediction: data.t1m_pred,
      confidence: data.t1m_confidence,
      timeframe: "t1m",
    },
  ];

  return (
    <SectionCard title="ML Model Predictions">
      {/* Context */}
      <Box
        mb={3}
        sx={{
          p: 2.5,
          borderRadius: 2,
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
        }}
      >
        <Grid container spacing={2}>
          {modelPillars.map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "flex-start",
                }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    mt: "2px",
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>

                {/* Text */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} mb={0.3}>
                    {item.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="#000000"
                    lineHeight={1.5}
                  >
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Grid container spacing={2.5}>
        {predictions.map((pred, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <PredictionTile
              title={pred.title}
              prediction={pred.prediction}
              confidence={pred.confidence}
              timeframe={pred.timeframe}
            />
          </Grid>
        ))}
      </Grid>
    </SectionCard>
  );
}
