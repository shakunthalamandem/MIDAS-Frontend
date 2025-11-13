// src/components/IPODashboardMain/IPODashboardMainTable.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  CircularProgress,
  Alert,
  Paper,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import MetricsTableMain from "./IPODashboardMain/IPOCompsTableMain/MetricsTableMain";
import IPOCompsChart from "./IPODashboardMain/IPOCompsTableMain/IPOCompsChart";

type ComparableMetric = {
  ticker: string;
  competitor: string;
  price_usd: string;
  market_cap: number | null;
  ev_usd_million: number | null;
  present_year_ev_sales: number | null;
  one_year_later_ev_sales: number | null;
  present_year_price_earning: number | null;
  one_year_later_price_earning: number | null;
  present_year_ev_ebitda: number | null;
  one_year_later_ev_ebitda: number | null;
  sales_growth: number | null;
  eps_growth: number | null;
  ai_generated: boolean;
};

type AveragesType = {
  [key: string]: { average?: number; median?: number };
};

type ApiResponse = {
  [ticker: string]: { data: ComparableMetric[]; Averages?: AveragesType };
};

interface Props {
  ticker: string;
}

type ViewMode = "table" | "chart";

const IPODashboardMainTable: React.FC<Props> = ({ ticker }) => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("table");

  const fetchData = useCallback(
    async (customTicker?: string) => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          `${apiUrl}/api/companymetric_data_view/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ ticker: customTicker ?? ticker }),
          }
        );

        const json = await response.json();
        if (!response.ok) throw new Error(json.error || json.message);
        setData(json);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    },
    [ticker]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewChange = (selected: ViewMode) => {
    setView(selected);
  };

  return (
    <Box sx={{ p: 0, width: "100%", position: "relative" }}>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && data && (
        <Box sx={{ display: "grid", gap: 2 }}>
          {view === "table" && (
            <MetricsTableMain
              ticker={ticker}
              data={data}
              onRefresh={fetchData}
            />
          )}

          {view === "chart" && <IPOCompsChart ticker={ticker} data={data} />}
        </Box>
      )}

      {/* Bottom View Mode Checkboxes */}
      <Paper
        elevation={3}
        sx={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          mt: 2,
          py: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          gap: 3,
          backdropFilter: "blur(6px)",
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={view === "table"}
              onChange={() => handleViewChange("table")}
            />
          }
          label="Table View"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={view === "chart"}
              onChange={() => handleViewChange("chart")}
            />
          }
          label="Chart View"
        />
      </Paper>
    </Box>
  );
};

export default IPODashboardMainTable;
