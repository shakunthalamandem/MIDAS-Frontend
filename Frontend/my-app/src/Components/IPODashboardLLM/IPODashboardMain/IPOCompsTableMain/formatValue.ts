export const formatValue = (key: string, value: number | string) => {
  if (value === null || value === undefined || value === "") return "nm";

  const negativeColumns = [
    "present_year_ev_sales",
    "one_year_later_ev_sales",
    "present_year_price_earning",
    "one_year_later_price_earning",
    "present_year_ev_fcf",
    "one_year_later_ev_fcf",
  ];
  const percentageColumns = ["sales_growth", "eps_growth"];
  const numberColumns = ["market_cap", "ev_usd_million", "price_usd"];

  if (typeof value === "string") return value;

  if (percentageColumns.includes(key) && value > 500) return "nm";
  if (negativeColumns.includes(key))
    return value < 0 ? "nm" : `${Math.round(value * 10) / 10}x`;
  if (percentageColumns.includes(key))
    return value < 0 ? "nm" : `${Math.round(value * 10) / 10}%`;
  if (numberColumns.includes(key))
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(
      value
    );

  return value;
};
