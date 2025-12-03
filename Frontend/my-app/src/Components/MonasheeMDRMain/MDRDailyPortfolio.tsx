// MDRDailyPortfolio.tsx
import React, { useEffect, useState } from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import MDRDailyPortfolioFilters, {
  FilterState,
  FilterOptions,
} from "./MDRDailyPortfolioFilters";
import MDRDailyPortfolioTable, {
  MDRDailyPortfolioRow,
} from "./MDRDailyPortfolioTable";

const PRIMARY_COLOR = "#002060";

const initialFilters: FilterState = {
  tradeDate: "",
  fund: [],   // multi-select
  asset: [],  // multi-select
  region: [], // multi-select
};

const MDRDailyPortfolio: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [rows, setRows] = useState<MDRDailyPortfolioRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    fund: [],
    assetTypes: [],
    regions: [],
  });

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleFiltersChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  // 🔹 Fetch distinct filter values from daily_trades_filters (GET)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      if (!apiUrl) {
        setError("API URL is not defined in environment variables");
        return;
      }

      try {
        const response = await fetch(
          `${apiUrl}/api/daily_trades_filters/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Failed to fetch filter options");
        }

        const data = await response.json();
        // data shape:
        // {
        //   fund: [...],
        //   asset_type: [...],
        //   deal_type: [...],    // ignored
        //   broad_region: [...]
        // }

        setFilterOptions({
          fund: data.fund || [],
          assetTypes: data.asset_type || [],
          regions: data.broad_region || [],
        });
      } catch (err: any) {
        console.error(err);
        // don't block the main page, just show error
        setError(err.message || "Failed to load filter options");
      }
    };

    fetchFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl]); // run once when apiUrl is available

  const toNumber = (value: any, fallback = 0) => {
    if (value === null || value === undefined || value === "") return fallback;
    const cleaned =
      typeof value === "string"
        ? value.replace(/[% ,]/g, "")
        : value;
    const num = Number(cleaned);
    return Number.isNaN(num) ? fallback : num;
  };

  const toNullableNumber = (value: any) => {
    if (value === null || value === undefined || value === "") return null;
    const cleaned =
      typeof value === "string"
        ? value.replace(/[% ,]/g, "")
        : value;
    const num = Number(cleaned);
    return Number.isNaN(num) ? null : num;
  };

const normalizeRow = (item: any, index: number): MDRDailyPortfolioRow => ({
  id: `${item.ticker ?? "row"}-${index}`,
  ticker: item.ticker ?? "",
  type: item.type ?? "",
  deal_cap: item.deal_cap ?? "",
  days_held: toNumber(item.days_held),
  current_shares: toNumber(item.current_shares),
  current_exposure: toNumber(item.current_exposure),
  max_pct: toNumber(item.max_pct ?? item["%max"]),
  gross_pct: toNumber(item.gross_pct ?? item["gross%"]),
  excess_return_pct: toNumber(item.excess_return_pct ?? item["excess_return%"]),
  dtd_pnl: toNumber(item.dtd_pnl),
  cumulative_gross_pnl: toNumber(item.cumulative_gross_pnl),
  cumulative_net_pnl: toNumber(item.cumulative_net_pnl),
  issue_price: toNumber(item.issue_price),
  avg_in_price: toNumber(item.avg_in_price),
  avg_exit_price: toNullableNumber(item.avg_exit_price),
  current_price: toNullableNumber(item.current_price),
  ultimate_stop: toNullableNumber(item.ultimate_stop),
  target_price: toNullableNumber(item.target_price),
});

  const handleApply = async () => {
    setHasApplied(true);
    setError(null);

    if (!apiUrl) {
      setError("API URL is not defined in environment variables");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/mdr_portfolio_main/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to fetch portfolio data");
      }

      const data = await response.json();
      const rawRows: any[] = Array.isArray(data)
        ? data
        : data.daily_portfolio || data.results || [];
      const portfolioRows: MDRDailyPortfolioRow[] = rawRows.map(
        (row, index) => normalizeRow(row, index)
      );

      setRows(portfolioRows);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setRows([]);
    setError(null);
    setHasApplied(false);
  };

  return (
    <>
    <Container maxWidth="xl">
    <Box sx={{ p: 3, backgroundColor: "#f5f6fa" }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: "#ffffff",
        }}
      >
        <Typography
          variant="h6"
          align="center"
          sx={{ mb: 2, fontWeight: 600, color: PRIMARY_COLOR }}
        >
          Daily Portfolio Report
        </Typography>

        <MDRDailyPortfolioFilters
          filters={filters}
          filterOptions={filterOptions}
          onChange={handleFiltersChange}
          onApply={handleApply}
          onReset={handleReset}
          loading={loading}
        />

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <MDRDailyPortfolioTable
          rows={rows}
          hasApplied={hasApplied}
          loading={loading}
          error={error}
        />
      </Paper>
    </Box>
    </Container>
    </>
  );
};

export default MDRDailyPortfolio;
