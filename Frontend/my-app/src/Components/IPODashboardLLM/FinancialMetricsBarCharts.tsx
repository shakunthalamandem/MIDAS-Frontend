// src/components/FinancialMetricsBarCharts.tsx
import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import FinancialMetricsChartsContent from "./FinancialMetricsChartsContent";

export interface MetricsRow {
  fs_ticker: string;
  sales_growth_2025: number | null;
  sales_growth_2026: number | null;
  sales_growth_2024: number | null;
  gross_margin_2024: number | null;
  gross_margin_2025: number | null;
  gross_margin_2026: number | null;
  ebitda_adj_margin_2025: number | null;
  ebitda_adj_margin_2024: number | null;
  ebitda_adj_margin_2026: number | null;
  net_income_margin_2025: number | null;
  net_income_margin_2026: number | null;
  net_income_margin_2024: number | null;
  roe_2025: number | null;
  roe_2024: number | null;
  roe_2026: number | null;
  date: string;
}

interface ApiResponse {
  data: MetricsRow[];
}

interface Props {
  ticker: string;
  refreshToken?: number;
}

const FinancialMetricsBarCharts: React.FC<Props> = ({
  ticker,
  refreshToken,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const [data, setData] = useState<MetricsRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API when ticker changes
  useEffect(() => {
    const fetchData = async () => {
      if (!apiUrl) {
        setError("API URL is not configured.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiUrl}/api/fs_competitor_metrics/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ ticker }),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(
            `Failed to fetch metrics. Status: ${response.status}. ${text}`
          );
        }

        const json: ApiResponse = await response.json();
        setData(json.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker, apiUrl, token, refreshToken]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!data.length) {
    return (
      <Box mt={2}>
        <Alert severity="info">
          No metrics data available for ticker <strong>{ticker}</strong>.
        </Alert>
      </Box>
    );
  }

  return <FinancialMetricsChartsContent ticker={ticker} data={data} />;
};

export default FinancialMetricsBarCharts;
