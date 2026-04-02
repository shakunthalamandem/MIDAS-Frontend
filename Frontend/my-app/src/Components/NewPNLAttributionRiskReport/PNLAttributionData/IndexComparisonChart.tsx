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
  secondDataKey?: keyof IndexComparisonChartPoint;
  dataLabel: string;
  secondDataLabel?: string;
  format: "beta" | "pct";
  color: string;
  secondColor?: string;
}

const METRIC_MAP: Record<string, MetricConfig> = {
  one_month_beta_sp: {
    label: "1m Beta S&P",
    dataKey: "one_month_beta_sp",
    dataLabel: "1m Beta S&P",
    format: "beta",
    color: "#2563eb",
  },
  one_month_beta_russell: {
    label: "1m Beta Russell",
    dataKey: "one_month_beta_russell",
    dataLabel: "1m Beta Russell",
    format: "beta",
    color: "#2563eb",
  },
  one_month_volatility_1_sp: {
    label: "1m Volatility (Portfolio vs S&P)",
    dataKey: "one_month_volatility_portfolio",
    secondDataKey: "one_month_volatility_sp",
    dataLabel: "Portfolio",
    secondDataLabel: "S&P",
    format: "pct",
    color: "#0891b2",
    secondColor: "#225253",
  },
  six_month_volatility_1_sp: {
    label: "6m Volatility (Portfolio vs S&P)",
    dataKey: "six_month_volatility_portfolio",
    secondDataKey: "six_month_volatility_sp",
    dataLabel: "Portfolio",
    secondDataLabel: "S&P",
    format: "pct",
    color: "#ea580c",
    secondColor: "#225253",
  },
  ytd_volatility_sp: {
    label: "YTD Volatility (Portfolio vs S&P)",
    dataKey: "ytd_volatility_portfolio",
    secondDataKey: "ytd_volatility_sp_value",
    dataLabel: "Portfolio",
    secondDataLabel: "S&P",
    format: "pct",
    color: "#db2777",
    secondColor: "#225253",
  },
  drawdown_1_sp: {
    label: "Drawdown (Portfolio vs S&P)",
    dataKey: "drawdown_portfolio",
    secondDataKey: "drawdown_sp",
    dataLabel: "Portfolio",
    secondDataLabel: "S&P",
    format: "pct",
    color: "#b91c1c",
    secondColor: "#225253",
  },
};

interface IndexComparisonChartProps {
  chartData: IndexComparisonChartPoint[];
  loading: boolean;
  selectedMetric: string;
}

const formatValue = (value: number, format: "beta" | "pct") =>
  format === "beta" ? value.toFixed(2) : `${value.toFixed(2)}%`;

const CustomTooltip = ({ active, payload, label, cfg }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
      padding: "10px 14px",
      minWidth: 180,
      fontFamily: "Inter, sans-serif",
    }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color: "#092d5f",
        textTransform: "uppercase",
        letterSpacing: "0.8px",
        marginBottom: 6,
        borderBottom: "1px solid #f1f5f9",
        paddingBottom: 5,
      }}>
        {cfg.label}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 7 }}>
        {formatDate(label)}
      </div>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: i < payload.length - 1 ? 4 : 0 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: entry.color || (i === 0 ? cfg.color : cfg.secondColor),
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 12, color: "#64748b", flex: 1 }}>{entry.name} :</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: entry.color || (i === 0 ? cfg.color : cfg.secondColor) }}>
            {formatValue(entry.value, cfg.format)}
          </span>
        </div>
      ))}
    </div>
  );
};

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
            HISTORICAL: {cfg.label.toUpperCase()}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: cfg.color,
                }}
              />
              <Box sx={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>
                {cfg.dataLabel}
              </Box>
            </Box>
            {cfg.secondDataKey && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: cfg.secondColor,
                  }}
                />
                <Box sx={{ fontSize: 13, fontWeight: 600, color: cfg.secondColor }}>
                  {cfg.secondDataLabel}
                </Box>
              </Box>
            )}
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
              <Tooltip content={<CustomTooltip cfg={cfg} />} />
              {cfg.secondDataKey && (
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
                />
              )}
              <Line
                type="linear"
                dataKey={cfg.dataKey}
                name={cfg.dataLabel}
                stroke={cfg.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: cfg.color, stroke: "#fff", strokeWidth: 2 }}
              />
              {cfg.secondDataKey && (
                <Line
                  type="linear"
                  dataKey={cfg.secondDataKey}
                  name={cfg.secondDataLabel}
                  stroke={cfg.secondColor}
                  strokeWidth={2.5}
                  strokeDasharray="5 3"
                  dot={false}
                  activeDot={{ r: 5, fill: cfg.secondColor, stroke: "#fff", strokeWidth: 2 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              color: "#225253",
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
