import React from "react";
import { Box, CircularProgress } from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint, DashboardCategory, MetricChartDataPoint } from "./types";
import { formatCurrency, formatDate, formatChartXAxis } from "./utils";

interface CumulativePnLChartProps {
  chartData: ChartDataPoint[];
  loading: boolean;
  period: string;
  category?: DashboardCategory;
  metricChartData?: MetricChartDataPoint[];
  metricChartLoading?: boolean;
  exchrateLatestPnl?: number | null;
}

const PERIOD_LABELS: Record<string, string> = {
  mtd: "MTD",
  ytd: "YTD",
};

const CATEGORY_LABELS: Record<string, string> = {
  pnl: "P&L",
  gross_market_value: "Gross Market Value",
  delta_adj_net_mv: "Delta Adj. Net Exposure",
  beta_adj_net_mv: "Beta Adj. Net Exposure",
};

const CATEGORY_COLORS: Record<string, string> = {
  pnl: "#7c3aed",
  gross_market_value: "#2563eb",
  delta_adj_net_mv: "#0891b2",
  beta_adj_net_mv: "#ea580c",
};

const CumulativePnLChart: React.FC<CumulativePnLChartProps> = ({
  chartData,
  loading,
  period,
  category = "pnl",
  metricChartData = [],
  metricChartLoading = false,
  exchrateLatestPnl,
}) => {
  const isPnl = category === "pnl";
  const activeData = isPnl ? chartData : metricChartData;
  const activeLoading = isPnl ? loading : metricChartLoading;
  const dataKey = isPnl ? (period === "dtd" ? "daily_pnl" : "cumulative_pnl") : "value";
  const color = CATEGORY_COLORS[category] || "#7c3aed";
  const label = CATEGORY_LABELS[category] || "P&L";
  const gradientId = `chartGradient_${category}`;

  const periodLabel = PERIOD_LABELS[period] || "YTD";
  const chartTitle = isPnl
    ? `HISTORICAL: ${periodLabel} P&L`
    : `HISTORICAL: ${periodLabel} ${label}`;

  const legendLabel = isPnl ? (period === "dtd" ? "Daily P&L" : "Cumulative P&L") : label;

  return (
    <Box className="risk-dashboard-section">
      <Box className="pnl-chart-card">
        <Box className="pnl-chart-header">
          <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <Box className="pnl-chart-title">{chartTitle}</Box>
            {isPnl && exchrateLatestPnl != null && (
              <Box sx={{ fontSize: "11px", color: "#64748b", fontWeight: 500, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                YTD P&L (excluding P&L values where Security Type = 'Exchrate') is {formatCurrency(exchrateLatestPnl)}
              </Box>
            )}
          </Box>
          <Box className="pnl-chart-legend">
            <Box className="pnl-chart-legend-dot" sx={{ background: `${color} !important` }} />
            {legendLabel}
          </Box>
        </Box>

        {activeLoading ? (
          <Box className="risk-dashboard-loading" sx={{ minHeight: 300 }}>
            <CircularProgress size={32} />
          </Box>
        ) : activeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={activeData}
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatChartXAxis}
                tick={{ fontSize: 11, fill: "#000000" }}
                axisLine={{ stroke: "#000000" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 11, fill: "#000000" }}
                axisLine={{ stroke: "#000000" }}
                tickLine={false}
                width={70}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), legendLabel]}
                labelFormatter={(label: string) => formatDate(label)}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                }}
              />
              <Area
                type="linear"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ textAlign: "center", py: 6, color: "#94a3b8", fontSize: 14 }}>
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

export default CumulativePnLChart;
