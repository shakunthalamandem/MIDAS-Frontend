export const formatPnlMillions = (val: number): string => {
  if (val === null || val === undefined || isNaN(val)) return "$0.0 M";
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : "";
  return `${sign}$${abs.toFixed(1)} M`;
};

export const formatDollarsCompact = (val: number): string => {
  if (val === null || val === undefined || isNaN(val)) return "$0";
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
};

export const formatPercent = (val: number, digits = 1): string => {
  if (val === null || val === undefined || isNaN(val)) return "0%";
  return `${val.toFixed(digits)}%`;
};

export const pnlColor = (val: number): string =>
  val < 0 ? "#dc2626" : val > 0 ? "#111827" : "#6b7280";
