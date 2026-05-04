// MDRDailyPortfolioContainer.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Box } from "@mui/material";
import MDRDailyPortfolioTableMainS3 from "./MDRDailyPortfolioTableMainS3";
import { MDRDailyPortfolioRow } from "./MDRDailyPortfolioTypes";

interface MDRDailyPortfolioContainerProps {
  pdfMode?: boolean;
  actionsSlot?: React.ReactNode;
}

const parsePercent = (value: any) => {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(String(value).replace(/[%\s,]/g, ""));
  return Number.isNaN(numeric) ? null : numeric;
};

const normalizeRow = (raw: any, index: number): MDRDailyPortfolioRow => ({
  id: `${raw.ticker ?? "row"}-${index}`,
  ticker: raw.ticker ?? "",
  dealType: raw.deal_type ?? raw.type ?? "",
  dealCaptain: raw.deal_captain ?? raw.dealCap ?? "",
  daysHeld: Number(raw.days_held ?? raw.daysHeld ?? 0),
  currentShares: Number(raw.current_shares ?? raw.currentShares ?? 0),
  currentExposure: Number(raw.current_exposure ?? raw.currentExposure ?? 0),
  maxPercent: parsePercent(raw.max_percentage ?? raw["%max"]),
  grossPercent: parsePercent(
    raw.gross_percentage ?? raw.percentage_total_return ?? raw["gross%"]
  ),
  excessReturnPercent: parsePercent(
    raw.excess_return ?? raw["excess_return%"] ?? raw.excessReturnPercent
  ),
  dtdPnl: Number(raw.dtd_pnl ?? raw.total_pnl_sum ?? raw.dtdPnl ?? 0),
  cumulativeGrossPnl: Number(
    raw.cumulative_gross_pnl ?? raw.cummulative_gross_pnl ?? 0
  ),
  cumulativeNetPnl: Number(
    raw.cumulative_net_pnl ?? raw.cummulative_net_pnl ?? 0
  ),
  issuePrice: Number(raw.issue_price ?? raw.issue_offer_price ?? 0),
  avgInPrice: Number(raw.avg_in_price ?? raw.avg_cost_incl_comm_lcl ?? 0),
  avgExitPrice:
    raw.avg_exit_price === null || raw.avg_exit_price === undefined
      ? null
      : Number(raw.avg_exit_price ?? raw.avgExitPrice ?? 0),
  currentPrice:
    raw.current_price === null || raw.current_price === undefined
      ? null
      : Number(raw.current_price ?? raw.price_value ?? 0),
  ultimateStop:
    raw.ultimate_stop === null || raw.ultimate_stop === undefined
      ? null
      : Number(raw.ultimate_stop ?? raw.ultimateStop ?? 0),
  targetPrice:
    raw.target_price === null || raw.target_price === undefined
      ? null
      : Number(raw.target_price ?? raw.targetPrice ?? 0),
  firstTradeDate: raw.first_trade_date ?? "",
});

export const MDRDailyPortfolioContainer: React.FC<
  MDRDailyPortfolioContainerProps
> = ({ pdfMode = false, actionsSlot }) => {
  const [rows, setRows] = useState<MDRDailyPortfolioRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tradeDate, setTradeDate] = useState<string>("");
  const [dealTypeFilter, setDealTypeFilter] = useState<string[]>([]);
  const [regionFilter, setRegionFilter] = useState<string[]>([]);
  const [dealTypeOptions, setDealTypeOptions] = useState<string[]>([]);
  const regionOptions = ["US", "EMEA", "APAC", "Non-US America"];

  const apiUrl = process.env.REACT_APP_API_URL ?? "";
  const getToken = () => localStorage.getItem("access_token") || "";

  const fetchPortfolio = useCallback(async () => {
    if (!apiUrl) {
      setError("API URL is not defined in environment variables");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const token = getToken();

      const response = await fetch(`${apiUrl}/api/mdr_portfolio_main/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ...(dealTypeFilter.length > 0 && { deal_type: dealTypeFilter }),
          ...(regionFilter.length > 0 && { region: regionFilter }),
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to fetch portfolio data");
      }

      const data = await response.json();
      const rawRows: any[] = Array.isArray(data)
        ? data
        : data.daily_portfolio || data.results || [];

      // Try to get trade_date from common places in the response
      let apiTradeDate: string = "";

      if (typeof data.trade_date === "string") {
        apiTradeDate = data.trade_date;
      } else if (typeof data.tradeDate === "string") {
        apiTradeDate = data.tradeDate;
      } else if (rawRows.length && typeof rawRows[0]?.trade_date === "string") {
        apiTradeDate = rawRows[0].trade_date;
      }

      setTradeDate(apiTradeDate || "");
      const normalized = rawRows.map((row, index) => normalizeRow(row, index));
      setRows(normalized);

      // Only populate deal type options on initial unfiltered load
      if (dealTypeFilter.length === 0 && regionFilter.length === 0) {
        const dealTypes = Array.from(
          new Set(rawRows.map((r: any) => r.deal_type ?? r.type ?? "").filter(Boolean))
        ).sort();
        setDealTypeOptions(dealTypes);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
      setRows([]);
      setTradeDate("");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, dealTypeFilter, regionFilter]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return (
    <Box>
      <MDRDailyPortfolioTableMainS3
        rows={rows}
        loading={loading}
        error={error}
        onRefresh={fetchPortfolio}
        tradeDate={tradeDate}
        pdfMode={pdfMode}
        actionsSlot={actionsSlot}
        dealTypeFilter={dealTypeFilter}
        onDealTypeFilterChange={setDealTypeFilter}
        dealTypeOptions={dealTypeOptions}
        regionFilter={regionFilter}
        onRegionFilterChange={setRegionFilter}
        regionOptions={regionOptions}
      />
    </Box>
  );
};

export default MDRDailyPortfolioContainer;
