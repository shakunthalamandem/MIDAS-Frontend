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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  Bar,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
  Line,
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

// 10 distinct, clean colors for peers (matplotlib default palette style)
const BAR_COLORS = [
  "#264653", // deep teal blue
  "#2A9D8F", // dark turquoise green
  "#8E3B46", // dark rose red
  "#E76F51", // muted coral
  "#6D597A", // dark mauve purple
  "#457B9D", // slate blue
  "#1D3557", // navy blue
  "#7B904B", // olive green
  "#B56576", // warm plum
  "#3D5A80", // steel blue
  "#F4A261", // sandy orange
  "#E9C46A", // mustard yellow  
  "#90BE6D", // soft green
  "#F3722C", // vibrant orange
  "#F9C74F", // bright yellow
  "#43AA8B", // teal
  "#577590", // cool blue
];

// Accent for the selected ticker line
const SELECTED_LINE_COLOR = "#e42d36ff";

const FinancialMetricsChart: React.FC<Props> = ({ ticker }) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const [data, setData] = useState<MetricsRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [includeInPdf, setIncludeInPdf] = useState<boolean>(false);

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

  // All fs_ticker strings
  const companies = useMemo(
    () => Array.from(new Set(data.map((row) => row.fs_ticker))),
    [data]
  );

  const selectedBaseTicker = ticker.toUpperCase();

  // Find which fs_ticker corresponds to the selected ticker (e.g. LIFE -> LIFE-US)
  const selectedCompanyKey = useMemo(() => {
    const match = data.find(
      (row) => row.fs_ticker.split("-")[0].toUpperCase() === selectedBaseTicker
    );
    return match ? match.fs_ticker : null;
  }, [data, selectedBaseTicker]);

  // Peer companies = all except the selected one
  const peerCompanies = useMemo(
    () =>
      companies.filter(
        (c) => !selectedCompanyKey || c !== selectedCompanyKey
      ),
    [companies, selectedCompanyKey]
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
        entry[row.fs_ticker] = value === null ? undefined : value;
      });

      return entry;
    });
  };

  // Helper: check if this metric has at least one non-null value
  const metricHasData = (metric: MetricPrefix): boolean => {
    for (const row of data) {
      for (const year of YEARS) {
        const key = `${metric}_${year}` as keyof MetricsRow;
        const value = row[key];
        if (value !== null && value !== undefined) {
          return true;
        }
      }
    }
    return false;
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
    <Card className={includeInPdf ? "" : "pdf-hidden"}>
    <Box mt={3}>
      <Box
        mb={3}
        position="relative"
        display="flex"
        alignItems="center"
        minHeight={48}
      >
        <Typography
          variant="h6"
          color="#002060"
          sx={{ fontWeight: 600, textAlign: "center", width: "100%" }}
        >
          Key Financial Metrics - Peer Comparison ({ticker.toUpperCase()})
        </Typography>
        <Box
          sx={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={includeInPdf}
                onChange={(event) => setIncludeInPdf(event.target.checked)}
                size="small"
              />
            }
            label="Include in the PDF"
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {METRICS.filter((m) => metricHasData(m.key)).map((metric) => {
          const chartData = buildMetricChartData(metric.key);

          return (
            <Grid item xs={12} md={6} key={metric.key}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  boxShadow: 2,
                  backgroundColor: "#fafafa",
                  borderColor: "#e0e0e0",
                  p: 2,
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    align="center"
                    sx={{ fontWeight: 600, color: "#002060" }}
                  >
                    {metric.title}
                  </Typography>
                  <Box height={320}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={chartData}
                        margin={{ top: 20, right: 20, left: 50, bottom: 20 }}
                      >
                        <XAxis dataKey="year" />
                        <YAxis
                          tickFormatter={(v) => `${v}`}
                          label={{
                            value: metric.yAxisLabel,
                            angle: -90,
                            position: "insideLeft",
                            offset: 10,
                            style: { fontSize: 11 },
                          }}
                        />
                        <Tooltip
                          formatter={(value: any, name: string) => [
                            value,
                            name,
                          ]}
                        />
                        <Legend />

                        {/* Bars for peers */}
                        {peerCompanies.map((company, idx) => (
                          <Bar
                            key={`${metric.key}-${company}`}
                            dataKey={company}
                            name={company}
                            fill={BAR_COLORS[idx % BAR_COLORS.length]}
                            barSize={18}
                          />
                        ))}

                        {/* Line for the selected ticker */}
                        {selectedCompanyKey && (
                          <Line
                            type="monotone"
                            dataKey={selectedCompanyKey}
                            name={`${selectedCompanyKey}`}
                            stroke={SELECTED_LINE_COLOR}
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 5 }}
                          />
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
    </Card>
  );
};

export default FinancialMetricsChart;
