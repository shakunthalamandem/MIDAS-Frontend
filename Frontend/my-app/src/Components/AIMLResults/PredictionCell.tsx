import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Chip } from "@mui/material";

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

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

const getPredictionChipConfig = (
  pred: string
): { label: string; color: ChipColor } => {
  const normalized = pred.trim().toLowerCase();

  if (!normalized) {
    return { label: "N/A", color: "default" };
  }

  if (normalized.includes("extreme")) {
    return { label: "Ext", color: "warning" };
  }
  if (
    normalized.includes("positive") ||
    normalized.includes("pos") ||
    normalized.includes("up")
  ) {
    return { label: "Pos", color: "success" };
  }
  if (
    normalized.includes("negative") ||
    normalized.includes("neg") ||
    normalized.includes("down")
  ) {
    return { label: "Neg", color: "error" };
  }

  return { label: pred, color: "info" };
};

const PredictionCell: React.FC<{
  pred: string;
  confidence: number | string;
}> = ({ pred, confidence }) => {
  const confNum = parseConfidence(confidence);
  const hasPred = !!pred;
  const hasConf = confNum !== null;

  if (!hasPred && !hasConf) {
    return <Typography variant="body2">-</Typography>;
  }

  const { label, color } = getPredictionChipConfig(pred);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        rowGap: 0.5,
      }}
    >
      {hasPred && (
        <Chip
          size="small"
          label={label}
          color={color}
          variant="outlined"
          sx={{
            fontWeight: 600,
            height: 22,
          }}
        />
      )}
      {hasConf && (
        <Typography variant="caption" color="text.secondary">
          {confNum!.toFixed(1)}%
        </Typography>
      )}
    </Box>
  );
};

export default PredictionCell;
