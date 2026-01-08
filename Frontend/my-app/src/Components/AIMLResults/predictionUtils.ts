// src/Components/AIMLResults/predictionUtils.ts

export type T1DPred =
  | "Positive"
  | "Low Return"
  | "Neutral Return"
  | "Positive Return"
  | "Negative";

export type BinaryPred = "Positive" | "Negative";

export interface PredictionMarkerInput {
  key: "t1d" | "t1w" | "t1m";
  title: "1D" | "1W" | "1M";
  pred: string | null | undefined;
  targetDateISO: string; // desired target date
}

export interface PredictionMarkerResolved {
  key: "t1d" | "t1w" | "t1m";
  title: "1D" | "1W" | "1M";
  pred: string; // normalized
  color: string;
  index: number; // resolved bar index
  date: string; // resolved bar date
  tooltipText: string;
}

/** Safer ISO parsing: returns timestamp, or NaN. */
export const toTime = (isoLike: string): number => {
  const t = new Date(isoLike).getTime();
  return Number.isFinite(t) ? t : Number.NaN;
};

export const addDaysISO = (baseISO: string, days: number): string => {
  const t = toTime(baseISO);
  if (!Number.isFinite(t)) return baseISO;
  const d = new Date(t);
  d.setDate(d.getDate() + days);
  // Keep ISO date-only if input looks date-only, else full ISO
  // Most APIs give YYYY-MM-DD so we return YYYY-MM-DD.
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Find bar index for a target date:
 * - exact match preferred (>= target date)
 * - else "upcoming bar": first entry with date >= target
 * - if none, fallback to last bar
 */
export const resolveUpcomingIndex = (
  chartDatesISO: string[],
  targetISO: string
): number => {
  const targetT = toTime(targetISO);
  if (!Number.isFinite(targetT)) return chartDatesISO.length - 1;

  // Build list of [time, index] (stable)
  const times = chartDatesISO.map((d, i) => ({ t: toTime(d), i }));
  // Filter invalid dates out
  const valid = times.filter((x) => Number.isFinite(x.t));
  if (!valid.length) return chartDatesISO.length - 1;

  // Find first with t >= targetT in original order
  const upcoming = valid.find((x) => x.t >= targetT);
  if (upcoming) return upcoming.i;

  // No upcoming, fallback to last valid, else last
  return valid[valid.length - 1]?.i ?? chartDatesISO.length - 1;
};

const normalize = (s: string | null | undefined): string => {
  if (!s) return "—";
  return String(s).trim();
};

export const markerColor = (
  key: "t1d" | "t1w" | "t1m",
  predRaw: string
): string => {
  const p = predRaw.toLowerCase();

  if (key === "t1d") {
    // Negative is the only one meaning < issue price
    if (p.includes("negative")) return "#B00020";
    // Strong positive
    if (p.includes("positive return")) return "#0B6E4F";
    // Neutral-ish / low return / positive
    if (p.includes("neutral")) return "#8A6D3B";
    if (p.includes("low")) return "#1E6FB8";
    if (p.includes("positive")) return "#1F7A1F";
    return "#374151";
  }

  // t1w / t1m: Positive/Negative
  if (p.includes("negative")) return "#B00020";
  if (p.includes("positive")) return "#1F7A1F";
  return "#374151";
};

export const markerTooltipText = (
  key: "t1d" | "t1w" | "t1m",
  predRaw: string
): string => {
  const p = predRaw.toLowerCase();

  if (key === "t1d") {
    // You said: Negative < issue price.
    // Positive/Low Return > issue price.
    // Neutral Return means > 3% or 5% of issue price (ambiguous).
    // Positive Return means > 10% of issue price.
    if (p.includes("negative")) return "T1D: below Issue Price";
    if (p.includes("positive return"))
      return "T1D: > 10% above Issue Price";
    if (p.includes("neutral"))
      return "T1D: neutral (typically > ~3–5% above Issue Price)";
    if (p.includes("low"))
      return "T1D: low return (above Issue Price)";
    if (p.includes("positive"))
      return "T1D: positive (above Issue Price)";
    return "T1D prediction";
  }

  if (key === "t1w") {
    if (p.includes("negative")) return "T1W: < 0% vs 1D close";
    if (p.includes("positive")) return "T1W: > 0% vs 1D close";
    return "T1W prediction";
  }

  // t1m
  if (p.includes("negative")) return "T1M: < 0% vs 1D close";
  if (p.includes("positive")) return "T1M: > 0% vs 1D close";
  return "T1M prediction";
};

export const buildPredictionMarkers = (
  inputs: PredictionMarkerInput[],
  chartDatesISO: string[]
): PredictionMarkerResolved[] => {
  if (!chartDatesISO.length) return [];

  return inputs
    .map((m) => {
      const pred = normalize(m.pred);
      const idx = resolveUpcomingIndex(chartDatesISO, m.targetDateISO);
      const date = chartDatesISO[idx] ?? chartDatesISO[chartDatesISO.length - 1];

      return {
        key: m.key,
        title: m.title,
        pred,
        index: Math.max(0, Math.min(idx, chartDatesISO.length - 1)),
        date,
        color: markerColor(m.key, pred),
        tooltipText: markerTooltipText(m.key, pred),
      };
    })
    .filter((m) => m.pred !== "—"); // hide empty predictions
};

export const clampIndex = (idx: number, len: number): number => {
  if (len <= 0) return -1;
  return Math.max(0, Math.min(idx, len - 1));
};
