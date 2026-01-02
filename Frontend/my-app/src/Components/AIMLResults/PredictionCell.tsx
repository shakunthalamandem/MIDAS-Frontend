import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { alpha } from "@mui/material/styles";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import BoltIcon from "@mui/icons-material/Bolt";

type Tone = "positive" | "negative" | "extreme" | "neutral";

const parseConfidence = (value: number | string): number | null => {
  if (value === "" || value === null || value === undefined) return null;
  const num = typeof value === "string" ? Number(value) : value;
  if (isNaN(num)) return null;
  return num;
};

const formatNumber = (
  value: number | string | null | undefined,
  options?: { suffix?: string; decimals?: number }
): string => {
  const { suffix = "", decimals = 2 } = options || {};
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? Number(value) : value;
  if (isNaN(num)) return String(value);

  const base =
    Math.abs(num) >= 1000
      ? num.toLocaleString(undefined, { maximumFractionDigits: decimals })
      : num.toFixed(decimals).replace(/\.00$/, "");
  return suffix ? `${base}${suffix}` : base;
};

const formatPercent = (value: number | null): string => {
  if (value === null) return "";
  const pct = value <= 1 ? value * 100 : value;
  const rounded = pct.toFixed(1).replace(/\.0$/, "");
  return `${rounded}%`;
};

export const ActualCell: React.FC<{ value: number | string }> = ({ value }) => {
  const hasActual =
    value !== "" &&
    value !== null &&
    value !== undefined &&
    !isNaN(Number(value));

  if (!hasActual) {
    return <Typography variant="body2">-</Typography>;
  }

  const num = Number(value);
  const color =
    num > 0 ? "success.main" : num < 0 ? "error.main" : "text.secondary";
  const sign = num > 0 ? "+" : "";

  const formatted = formatNumber(num, { suffix: "%", decimals: 2 });

  return (
    <Typography
      variant="body2"
      sx={{
        color,
        fontWeight: 600,
      }}
    >
      {sign}
      {formatted}
    </Typography>
  );
};

const getPredictionMeta = (
  pred: string
): {
  displayLabel: React.ReactNode;
  tone: Tone;
  icon: React.ReactNode | null;
} => {
  const normalized = pred?.trim().toLowerCase() || "";

  if (!normalized) {
    return {
      displayLabel: "No Prediction",
      tone: "neutral",
      icon: null,
    };
  }

  if (normalized.includes("extreme")) {
    return {
      displayLabel: "Extreme Return",
      tone: "extreme",
      icon: <BoltIcon fontSize="small" />,
    };
  }

  if (
    normalized.includes("positive") ||
    normalized.includes("pos") ||
    normalized.includes("up")
  ) {
    return {
      displayLabel: <span style={{ fontSize: "10px" }}>Positive Return</span>,
      tone: "positive",
      icon: <TrendingUpIcon fontSize="small" />,
    };
  }

  if (
    normalized.includes("negative") ||
    normalized.includes("neg") ||
    normalized.includes("down")
  ) {
    return {
      displayLabel: <span style={{ fontSize: "10px" }}>Negative Return</span>,
      tone: "negative",
      icon: <TrendingDownIcon fontSize="small" />,
    };
  }

  // Fallback: show the original text nicely
  const display =
    pred.length > 0
      ? pred.charAt(0).toUpperCase() + pred.slice(1)
      : "Prediction";

  return {
    displayLabel: display,
    tone: "neutral",
    icon: null,
  };
};

const PredictionCell: React.FC<{
  pred: string;
  confidence: number | string;
  trailingAdornment?: React.ReactNode;
}> = ({ pred, confidence, trailingAdornment }) => {
  const confRaw = parseConfidence(confidence);
  const confPct =
    confRaw !== null ? (confRaw <= 1 ? confRaw * 100 : confRaw) : null;
  const confClamped =
    confPct !== null ? Math.min(100, Math.max(0, confPct)) : null;

  const hasPred = !!pred;
  const hasConf = confClamped !== null;

  if (!hasPred && !hasConf) {
    return <Typography variant="body2">-</Typography>;
  }

  const { displayLabel, tone, icon } = getPredictionMeta(pred);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        rowGap: 0.75,
        minWidth: 150,
      }}
    >
      {/* Prediction pill + trailing dot */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          columnGap: 0.75,
        }}
      >
        <Box
          sx={(theme) => {
            const { palette } = theme;

            let bg = alpha(palette.info.main, 0.08);
            let border = alpha(palette.info.main, 0.3);
            let text = palette.info.dark;

            if (tone === "positive") {
              bg = alpha(palette.success.main, 0.08);
              border = alpha(palette.success.main, 0.4);
              text = palette.success.dark;
            } else if (tone === "negative") {
              bg = alpha(palette.error.main, 0.08);
              border = alpha(palette.error.main, 0.4);
              text = palette.error.dark;
            } else if (tone === "extreme") {
              bg = alpha(palette.warning.main, 0.1);
              border = alpha(palette.warning.main, 0.5);
              text = palette.warning.dark;
            }

            return {
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              columnGap: 0.75,
              paddingX: 1.2,
              paddingY: 0.4,
              borderRadius: 999,
              backgroundColor: bg,
              border: `1px solid ${border}`,
              minWidth: 0,
            };
          }}
        >
          {icon && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mt: "1px",
              }}
            >
              {icon}
            </Box>
          )}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.4,
              textAlign: "center",
            }}
          >
            {displayLabel}
          </Typography>
        </Box>
        {trailingAdornment}
      </Box>

      {/* Confidence block */}
      <Box sx={{ display: "flex", flexDirection: "column", rowGap: 0.4 }}>
        {hasConf && (
          <LinearProgress
            variant="determinate"
            value={confClamped!}
            sx={(theme) => {
              const { palette } = theme;

              let bar = palette.info.main;
              let track = alpha(palette.info.main, 0.12);

              if (tone === "positive") {
                bar = palette.success.main;
                track = alpha(palette.success.main, 0.12);
              } else if (tone === "negative") {
                bar = palette.error.main;
                track = alpha(palette.error.main, 0.12);
              } else if (tone === "extreme") {
                bar = palette.warning.main;
                track = alpha(palette.warning.main, 0.16);
              }

              return {
                height: 4,
                borderRadius: 999,
                backgroundColor: track,
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  backgroundColor: bar,
                },
              };
            }}
          />
        )}
        <Typography variant="caption" color="text.secondary" textAlign="center">
          {hasConf
            ? `${formatPercent(confClamped!)} Confidence`
            : "Confidence N/A"}
        </Typography>
      </Box>
    </Box>
  );
};

export default PredictionCell;
