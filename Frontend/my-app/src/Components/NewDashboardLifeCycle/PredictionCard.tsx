// components/AIMLResults/PredictionCard.tsx
import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Divider,
  Chip,
} from "@mui/material";

type Direction =
  | "POSITIVE"
  | "NEGATIVE"
  | "NEUTRAL"
  | "LOW_RETURN"
  | "POSITIVE_RETURN"
  | "NEUTRAL_RETURN"
  | "EXTREME";

type ReturnRange =
  | "LOW_RETURN"
  | "NEUTRAL_RETURN"
  | "POSITIVE_RETURN"
  | "POSITIVE"
  | "NEGATIVE";

type Props = {
  title: string;
  dirRaw: string;
  confidence: number | string;
  actualReturn: number | string;
  fmtPct: (v: number | string | null | undefined, digits?: number) => string;
  toNumber: (v: number | string | null | undefined) => number | null;
};

function parseDirection(raw: string | null | undefined): Direction {
  const s = String(raw || "").toLowerCase();
  if (s.includes("extreme") || s.includes("flash")) return "EXTREME";
  if (s.includes("low return")) return "LOW_RETURN";
  if (s.includes("neutral return")) return "NEUTRAL";
  if (s.includes("positive return")) return "POSITIVE_RETURN";
  if (s.includes("positive") || s.includes("up")) return "POSITIVE";
  if (s.includes("negative") || s.includes("down")) return "NEGATIVE";
  return "NEUTRAL";
}

function confidenceProgressValue(
  conf: number | string | null | undefined,
  toNumber: (v: any) => number | null,
): number {
  const n = toNumber(conf);
  if (n === null) return 0;
  const v = n <= 1 ? n * 100 : n;
  return Math.max(0, Math.min(100, v));
}

function getCardTone(dir: Direction) {
  switch (dir) {
    case "POSITIVE":
    case "POSITIVE_RETURN":
      return { chipBg: "#DCFCE7", chipText: "#166534", bar: "#22C55E" };
    case "NEGATIVE":
      return { chipBg: "#FEE2E2", chipText: "#991B1B", bar: "#EF4444" };
    case "LOW_RETURN":
      return { chipBg: "#FEF9C3", chipText: "#854D0E", bar: "#EAB308" };
    case "EXTREME":
      return { chipBg: "#E0E7FF", chipText: "#3730A3", bar: "#6366F1" };
    case "NEUTRAL":
    default:
      return { chipBg: "#E5E7EB", chipText: "#374151", bar: "#9CA3AF" };
  }
}

function directionLabel(dir: Direction) {
  switch (dir) {
    case "POSITIVE":
      return "POSITIVE";
    case "POSITIVE_RETURN":
      return "POSITIVE RETURN";
    case "NEGATIVE":
      return "NEGATIVE";
    case "LOW_RETURN":
      return "LOW RETURN";
    case "EXTREME":
      return "EXTREME";
    case "NEUTRAL":
    default:
      return "NEUTRAL";
  }
}

function classifyReturnRange(
  actualReturn: string | number | null | undefined,
  toNumber: (v: any) => number | null,
): ReturnRange | null {
  const num = toNumber(actualReturn);
  if (num === null) return null;

  if (num < 0) return "NEGATIVE";
  if (num >= 0 && num < 3) return "LOW_RETURN";
  if (num >= 3 && num < 8) return "NEUTRAL_RETURN";
  if (num >= 8) return "POSITIVE_RETURN";

  return null;
}

function getReturnRangeLabel(dir: Direction): string {
  switch (dir) {
    case "LOW_RETURN":
      return "LOW RETURN (<3%)";
    case "NEUTRAL_RETURN":
      return "NEUTRAL RETURN (>3% and <8%)";
    case "POSITIVE_RETURN":
      return "POSITIVE RETURN (>8%)";
    case "POSITIVE":
      return "POSITIVE (>0%)";
    case "NEGATIVE":
      return "NEGATIVE (<0%)";
    case "EXTREME":
      return "EXTREME";
    case "NEUTRAL":
    default:
      return "NEUTRAL";
  }
}

function DirectionChip({ dir }: { dir: Direction }) {
  const tone = getCardTone(dir);
  return (
    <Chip
      label={directionLabel(dir)}
      size="small"
      sx={{
        height: 26,
        borderRadius: 999,
        bgcolor: tone.chipBg,
        color: tone.chipText,
        fontWeight: 900,
        px: 0.75,
      }}
    />
  );
}

const PredictionCard: React.FC<Props> = ({
  title,
  dirRaw,
  confidence,
  actualReturn,
  fmtPct,
  toNumber,
}) => {
  const isPredictionDone = dirRaw && String(dirRaw).trim() !== "";
  const dir = parseDirection(dirRaw);
  const tone = getCardTone(dir);
  const prob = confidenceProgressValue(confidence, toNumber);

  // Get the expected return label based on prediction direction
  const returnRangeLabel = getReturnRangeLabel(dir);
  const actualReturnFormatted =
    actualReturn === "-" || !actualReturn
      ? "Not Done"
      : fmtPct(actualReturn, 2);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        height: "100%",
        bgcolor: "#FFFFFF",
        border: "1px solid #EEF2F7",
        boxShadow: "0 10px 24px rgba(16, 24, 40, 0.10)",
        transition: "transform 180ms ease, box-shadow 180ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 14px 30px rgba(16, 24, 40, 0.14)",
        },
      }}
    >
      <CardContent sx={{ p: 2.4 }}>
        <Typography
          sx={{ fontWeight: 900, fontSize: 14, lineHeight: 1.25, mb: 1.6 }}
        >
          {title}
        </Typography>

        {isPredictionDone ? (
          <>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.8 }}>
              <DirectionChip dir={dir} />
              {returnRangeLabel && (
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#6B7280",
                    fontWeight: 700,
                    alignSelf: "center",
                    opacity: 0.9,
                  }}
                >
                  {returnRangeLabel}
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 1.1 }}>
              <LinearProgress
                variant="determinate"
                value={prob}
                sx={{
                  height: 10,
                  borderRadius: 999,
                  bgcolor: "#E5E7EB",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                    backgroundColor: tone.bar,
                  },
                }}
              />
            </Box>

            <Typography
              sx={{ fontSize: 13, color: "#111827", fontWeight: 700, mb: 1.2 }}
            >
              Prob. {prob.toFixed(1)}%
            </Typography>

            <Divider sx={{ my: 1.8, borderColor: "#EEF2F7" }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography sx={{ fontSize: 13, color: "#6B7280", fontWeight: 700 }}>
                Actual return
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#111827", fontWeight: 900 }}>
                {actualReturnFormatted}
              </Typography>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 140,
            }}
          >
            <Typography
              sx={{ fontSize: 14, color: "#9CA3AF", fontWeight: 600 }}
            >
              Not Done
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionCard;