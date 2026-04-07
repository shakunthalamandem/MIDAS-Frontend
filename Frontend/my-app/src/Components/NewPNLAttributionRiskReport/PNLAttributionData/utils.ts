export const formatCurrency = (value: number): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs)}`;
};

export const formatCurrencyAsK = (value: number): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000) {
    const kValue = Math.round(abs / 1_000).toLocaleString("en-US");
    return `${sign}$${kValue}K`;
  }
  return `${sign}$${Math.round(abs).toLocaleString("en-US")}`;
};

export const formatFullCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPct = (value: number): string => {
  if (value == null) return "";
  const digits = Math.abs(value) < 0.02 ? 2 : 1;
  return `(${value.toFixed(digits)}%)`;
};

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const formatChartXAxis = (dateStr: string): string => {
  const d = new Date(dateStr + "T00:00:00");
  return `${SHORT_MONTHS[d.getMonth()]}-${d.getDate()}`;
};
