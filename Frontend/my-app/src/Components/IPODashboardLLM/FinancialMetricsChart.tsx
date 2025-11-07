// src/components/FinancialMetricsBarCharts.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
  Alert,
} from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MetricsRow {
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
}

type MetricPrefix =
  | "sales_growth"
  | "gross_margin"
  | "ebitda_adj_margin"
  | "net_income_margin"
  | "roe";

interface MetricConfig {
  key: MetricPrefix;
  title: string;
  yAxisLabel: string;
}

const METRICS: MetricConfig[] = [
  {
    key: "sales_growth",
    title: "Sales Growth",
    yAxisLabel: "Sales Growth (%)",
  },
  {
    key: "gross_margin",
    title: "Gross Margin",
    yAxisLabel: "Gross Margin (%)",
  },
  {
    key: "ebitda_adj_margin",
    title: "EBITDA Adj Margin",
    yAxisLabel: "EBITDA Adj Margin (%)",
  },
  {
    key: "net_income_margin",
    title: "Net Income Margin",
    yAxisLabel: "Net Income Margin (%)",
  },
  {
    key: "roe",
    title: "Return on Equity (ROE)",
    yAxisLabel: "ROE (%)",
  },
];

const YEARS = [2024, 2025, 2026];

const COLORS = [
  "#1976d2",
  "#9c27b0",
  "#ff9800",
  "#2e7d32",
  "#d32f2f",
  "#00838f",
  "#7b1fa2",
  "#f57c00",
];

const FinancialMetricsChart: React.FC<Props> = ({ ticker }) => {
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
  }, [ticker, apiUrl, token]);

  // Get all companies from response
  const companies = useMemo(
    () => Array.from(new Set(data.map((row) => row.fs_ticker))),
    [data]
  );

  // Helper: build chart data per metric
  const buildMetricChartData = (metric: MetricPrefix) => {
    return YEARS.map((year) => {
      const entry: Record<string, any> = {
        year: year.toString(),
      };

      data.forEach((row) => {
        const key = `${metric}_${year}` as keyof MetricsRow;
        const value = row[key];

        // Use undefined instead of null so Recharts can render cleanly
        entry[row.fs_ticker] = value === null ? undefined : value;
      });

      return entry;
    });
  };

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

  return (
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>
        Key Financial Metrics – Peer Comparison ({ticker.toUpperCase()})
      </Typography>

      <Grid container spacing={3}>
        {METRICS.map((metric, index) => {
          const chartData = buildMetricChartData(metric.key);

          return (
            <Grid item xs={12} md={6} key={metric.key}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {metric.title}
                  </Typography>
                  <Box height={320}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis
                          tickFormatter={(v) => `${v}`}
                          label={{
                            value: metric.yAxisLabel,
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <Tooltip
                          formatter={(value: any, name: string) => [
                            value,
                            name,
                          ]}
                        />
                        <Legend />

                        {companies.map((company, idx) => (
                          <Bar
                            key={`${metric.key}-${company}`}
                            dataKey={company}
                            name={company}
                            // each company has consistent color across metrics
                            fill={COLORS[idx % COLORS.length]}
                            barSize={18}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default FinancialMetricsChart;
