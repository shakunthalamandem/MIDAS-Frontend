export const forecastYearKeys = [
  "two_years_before",
  "one_year_before",
  "current_year",
  "one_year_later",
];

export const forecastYearLabels = ["2023 A", "2024 A", "2025 E", "2026 E"];

export const priorityOrder = [
  "Sales",
  "Sales Growth",
  "Net Interest Income",
  "Net Interest Income Growth",
  "Gross Profit",
  "Gross Profit Margin",
  "EBIT",
  "EBIT Margin",
  "NII after provision for credit losses",
  "NII after provision for credit losses Growth",
  "EBITDA",
  "EBITDA Margin",
  "Adj. EBITDA",
  "Adj. EBITDA Margin",
  "PBT",
  "PBT Margin",
  "Net Income",
  "Net Income Margin",
];

export const growthPairs: Record<string, string> = {
  "Sales": "Sales Growth",
  "Net Interest Income": "Net Interest Income Growth",
  "NII after provision for credit losses": "NII after provision for credit losses Growth",
};

export const marginPairs: Record<string, string> = {
  "Gross Profit": "Gross Profit Margin",
  "EBIT": "EBIT Margin",
  "EBITDA": "EBITDA Margin",
  "Adj. EBITDA": "Adj. EBITDA Margin",
  "PBT": "PBT Margin",
  "Net Income": "Net Income Margin",
};

export const safeNumber = (v: any) => {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

export const computeGrowthPct = (prev: number, curr: number) => {
  if (!prev || prev === 0) return null;
  return ((curr - prev) / prev) * 100;
};

export const computeValueFromGrowth = (prev: number, growthPct: number) => {
  return prev * (1 + growthPct / 100);
};

export const ensureMetricStructure = (data: any, metric: string) => {
  if (!data[metric]) {
    data[metric] = {};
    for (const k of forecastYearKeys) data[metric][k] = null;
  }
};

export const getOrderedMetricList = (dataObj: any) => {
  if (!dataObj) return [];
  const existing = new Set(Object.keys(dataObj));
  const ordered: string[] = [];

  for (const name of priorityOrder) {
    if (existing.has(name)) {
      ordered.push(name);
      existing.delete(name);
    }
  }
  const remaining = Array.from(existing);
  remaining.sort();
  ordered.push(...remaining);
  return ordered;
};
