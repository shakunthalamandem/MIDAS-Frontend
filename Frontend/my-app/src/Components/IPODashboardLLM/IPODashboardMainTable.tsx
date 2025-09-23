import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Alert, Button } from "@mui/material";
import MetricsTable from "./MetricsTable";
import MetricsTableMain from "./IPODashboardMain/IPOCompsTableMain/MetricsTableMain";

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



  useEffect(() => {
    fetchData(ticker);
  }, [ticker]);

  return (
    <Box sx={{ p: 0, width: "100%" }}>


      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && data && <MetricsTableMain ticker={ticker} data={data} />}
            {/* {!loading && !error && data && <MetricsTableMain ticker={ticker} data={data} />} */}

    </Box>
  );
};

export default IPODashboardMainTable;
