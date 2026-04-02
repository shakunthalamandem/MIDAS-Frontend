import React from "react";
import { Box, CircularProgress } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { IndexComparisonChartPoint } from "./types";
import { formatDate, formatChartXAxis } from "./utils";

interface MetricConfig {
  label: string;
  dataKey: keyof IndexComparisonChartPoint;
  format: "beta" | "pct";
  color: string;
}

const METRIC_MAP: Record<string, MetricConfig> = {
  one_month_beta_sp: {
    label: "1m Beta S&P",
    dataKey: "one_month_beta_sp",
    format: "beta",
    color: "#2563eb",
  },
  one_month_beta_russell: {
    label: "1m Beta Russell",
    dataKey: "one_month_beta_russell",
    format: "beta",
    color: "#2563eb",
  },
  one_month_volatility_1_sp: {
    label: "1m Volatility / S&P",
    dataKey: "one_month_volatility_1_sp",
    format: "pct",
    color: "#0891b2",
  },
  six_month_volatility_1_sp: {
    label: "6m Volatility / 1S&P",
    dataKey: "six_month_volatility_1_sp",
    format: "pct",
    color: "#ea580c",
  },
  ytd_volatility_sp: {
    label: "YTD Volatility / S&P",
    dataKey: "ytd_volatility_sp",
    format: "pct",
    color: "#db2777",
  },
  drawdown_1_sp: {
    label: "Drawdown /  S&P",
    dataKey: "drawdown_1_sp",
    format: "pct",
    color: "#b91c1c",
  },
};

interface IndexComparisonChartProps {
  chartData: IndexComparisonChartPoint[];
  loading: boolean;
  selectedMetric: string;
}

const formatValue = (value: number, format: "beta" | "pct") =>
  format === "beta" ? value.toFixed(2) : `${value.toFixed(2)}%`;

const IndexComparisonChart: React.FC<IndexComparisonChartProps> = ({
  chartData,
  loading,
  selectedMetric,
}) => {
  const cfg = METRIC_MAP[selectedMetric];
  if (!cfg) return null;

  return (
    <Box className="risk-dashboard-section">
      <Box className="pnl-chart-card">
        <Box className="pnl-chart-header">
          <Box className="pnl-chart-title">
            HISTORICAL: {cfg.label}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: cfg.color,
              }}
            />
            <Box
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: cfg.color,
              }}
            >
              {cfg.label}
            </Box>
          </Box>
        </Box>

        {loading ? (
          <Box className="risk-dashboard-loading" sx={{ minHeight: 300 }}>
            <CircularProgress size={32} />
          </Box>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatChartXAxis}
                tick={{ fontSize: 11, fill: "#000000" }}
                axisLine={{ stroke: "#000000" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={(v: number) => formatValue(v, cfg.format)}
                tick={{ fontSize: 11, fill: "#000000" }}
                axisLine={{ stroke: "#000000" }}
                tickLine={false}
                width={70}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatValue(value, cfg.format),
                  name,
                ]}
                labelFormatter={(label: string) => formatDate(label)}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                }}
              />
              <Line
                type="linear"
                dataKey={cfg.dataKey}
                name={cfg.label}
                stroke={cfg.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: cfg.color,
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              color: "#94a3b8",
              fontSize: 14,
            }}
          >
            No chart data available
          </Box>
        )}

        <Box className="pnl-chart-hint">
          Click any metric above to update this chart
        </Box>
      </Box>
    </Box>
  );
};

export default IndexComparisonChart;
