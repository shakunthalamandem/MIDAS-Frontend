import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert, Button } from "@mui/material";
import MetricsTable from "./MetricsTable";

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
  present_year_ev_fcf: number | null;
  one_year_later_ev_fcf: number | null;
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

const IPODashboardMainTable: React.FC<Props> = ({ ticker }) => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (customTicker?: string) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${apiUrl}/api/companymetric_data_view/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ ticker: customTicker ?? ticker }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error || json.message);
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");
      await fetch(`${apiUrl}/api/fs_get_tickers_data/`, {
        method: "GET",
        ...(token && { headers: { Authorization: `Bearer ${token}` } }),
      });
      fetchData(ticker); // refresh table after update
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  useEffect(() => {
    fetchData(ticker);
  }, [ticker]);

  return (
    <Box sx={{ p: 0, width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" color="#002060" fontWeight={600}>
          Comparative Trading Multiples & Performance Metrics
        </Typography>
        <Button variant="contained" onClick={handleUpdateClick} sx={{ backgroundColor: "#002060" }}>
          Update
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && data && <MetricsTable ticker={ticker} data={data} />}
    </Box>
  );
};

export default IPODashboardMainTable;
