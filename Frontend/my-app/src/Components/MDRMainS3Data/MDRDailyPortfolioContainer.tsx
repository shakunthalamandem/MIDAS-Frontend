// MDRDailyPortfolioContainer.tsx
import React, { useCallback, useState } from "react";
import { Box, Container } from "@mui/material";
import {
  MDRDailyPortfolioRow,
  MDRDailyPortfolioTable,
} from "./MDRDailyPortfolioTable";

const normalizeRow = (raw: any): MDRDailyPortfolioRow => ({
  ticker: raw.ticker ?? "",
  type: raw.type ?? "",
  dealCap: raw.deal_cap ?? raw.dealCap ?? "",
  daysHeld: Number(raw.days_held ?? raw.daysHeld ?? 0),
  currentShares: Number(raw.current_shares ?? raw.currentShares ?? 0),
  currentExposure: Number(raw.current_exposure ?? raw.currentExposure ?? 0),
  maxPercent: raw["%max"] ?? raw.maxPercent ?? "0.0%",
  grossPercent: raw["gross%"] ?? raw.grossPercent ?? "0.0%",
  excessReturnPercent:
    raw["excess_return%"] ?? raw.excessReturnPercent ?? "0.0%",
  dtdPnl: Number(raw.dtd_pnl ?? raw.dtdPnl ?? 0),
  cumulativeGrossPnl: Number(
    raw.cumulative_gross_pnl ?? raw.cumulativeGrossPnl ?? 0
  ),
  cumulativeNetPnl: Number(
    raw.cumulative_net_pnl ?? raw.cumulativeNetPnl ?? 0
  ),
  issuePrice: Number(raw.issue_price ?? raw.issuePrice ?? 0),
  avgInPrice: Number(raw.avg_in_price ?? raw.avgInPrice ?? 0),
  avgExitPrice: Number(raw.avg_exit_price ?? raw.avgExitPrice ?? 0),
  currentPrice: Number(raw.current_price ?? raw.currentPrice ?? 0),
  ultimateStop: Number(raw.ultimate_stop ?? raw.ultimateStop ?? 0),
  targetPrice: Number(raw.target_price ?? raw.targetPrice ?? 0),
});

export const MDRDailyPortfolioContainer: React.FC = () => {
  const [tradeDate, setTradeDate] = useState<string>("");
  const [rows, setRows] = useState<MDRDailyPortfolioRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL ?? "";
  const getToken = () => localStorage.getItem("access_token") || "";

  const handleApply = useCallback(async () => {
    if (!tradeDate) {
      setError("Please select a trade date");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const token = getToken();

      const response = await fetch(`${apiUrl}/api/mdr_daily_portfolio/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ trade_date: tradeDate }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to fetch portfolio data");
      }

      const data = await response.json();
      const rawRows: any[] = Array.isArray(data)
        ? data
        : data.daily_portfolio || data.results || [];

      setRows(rawRows.map(normalizeRow));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, tradeDate]);

  const handleReset = useCallback(() => {
    setTradeDate("");
    setRows([]);
    setError(null);
  }, []);

  return (
    <Container maxWidth={false} sx={{ p: 3, backgroundColor: "#f5f6fa" }}>
      <Box>
        <MDRDailyPortfolioTable
          rows={rows}
          tradeDate={tradeDate}
          loading={loading}
          error={error}
          onTradeDateChange={setTradeDate}
          onApply={handleApply}
          onReset={handleReset}
        />
      </Box>
    </Container>
  );
};

export default MDRDailyPortfolioContainer;
