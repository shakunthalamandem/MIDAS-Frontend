export type ColumnDef = { key: string; label: string; minWidth?: number };

const DEFAULT_BASE_YEAR = 2026;

const getYearParts = (pricingYear?: number) => {
  const baseYear =
    typeof pricingYear === "number" && Number.isFinite(pricingYear)
      ? pricingYear
      : DEFAULT_BASE_YEAR;
  const nextYear = baseYear + 1;

  return {
    baseYear,
    nextYear,
    baseYY: `${baseYear}`.slice(-2),
    nextYY: `${nextYear}`.slice(-2),
  };
};

export const createColumns = (pricingYear?: number): ColumnDef[] => {
  const { baseYear, nextYear, baseYY, nextYY } = getYearParts(pricingYear);

  return [
    { key: "competitor", label: "Ticker", minWidth: 80 },
    { key: "price_usd", label: "Price (USD)" },
    { key: "market_cap", label: "Market Cap (USDm)" },
    { key: "ev_usd_million", label: "EV (USDm)" },
    { key: "present_year_ev_sales", label: `${baseYear} EV/Sales` },
    { key: "one_year_later_ev_sales", label: `${nextYear} EV/Sales` },
    { key: "present_year_price_earning", label: `${baseYear} P/E` },
    { key: "one_year_later_price_earning", label: `${nextYear} P/E` },
    { key: "present_year_ev_ebitda", label: `${baseYear} EV/EBITDA` },
    { key: "one_year_later_ev_ebitda", label: `${nextYear} EV/EBITDA` },
    {
      key: "sales_growth",
      label: `Sales Growth (${baseYY}-${nextYY})`,
      minWidth: 80,
    },
    { key: "eps_growth", label: `EPS Growth (${baseYY}-${nextYY})` },
  ];
};
