const toNumberIfNumeric = (input: number | string) => {
  if (typeof input === "number") return input;
  if (typeof input !== "string") return input;

  const trimmed = input.trim();
  if (!trimmed) return input;

  // Remove commas/currency symbols to allow parsing values like "1,056.94".
  const cleaned = trimmed.replace(/[$,]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : input;
};

export const FOformatValue = (key: string, value: number | string) => {
  if (value === null || value === undefined || value === "") return "nm";

  const negativeColumns = [
    "present_year_ev_sales",
    "one_year_later_ev_sales",
    "present_year_price_earning",
    "one_year_later_price_earning",
    "present_year_ev_ebitda",
    "one_year_later_ev_ebitda",
  ];
  const percentageColumns = ["sales_growth", "eps_growth"];
  const priceColumns = ["price_usd"];
  const integerNumberColumns = ["market_cap", "ev_usd_million"];

  const normalized = toNumberIfNumeric(value);

  if (typeof normalized === "string") return normalized;

  if (percentageColumns.includes(key) && normalized > 500) return "nm";
  if (negativeColumns.includes(key))
    return normalized < 0 ? "nm" : `${Math.round(normalized * 10) / 10}x`;
  if (percentageColumns.includes(key))
    return normalized < 0 ? "nm" : `${Math.round(normalized * 10) / 10}%`;
  if (priceColumns.includes(key))
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    }).format(normalized);
  if (integerNumberColumns.includes(key))
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(normalized);

  return normalized;
};
