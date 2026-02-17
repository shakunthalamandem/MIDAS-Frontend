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
import type { ChartDataPoint } from "./types";
import { formatCurrency, formatDate, formatChartXAxis } from "./utils";

interface CumulativePnLChartProps {
  chartData: ChartDataPoint[];
  loading: boolean;
  period: string;
}

const PERIOD_LABELS: Record<string, string> = {
  dtd: "DTD",
  wtd: "WTD",
  mtd: "MTD",
  ytd: "YTD",
};

const CumulativePnLChart: React.FC<CumulativePnLChartProps> = ({
  chartData,
  loading,
  period,
}) => {
  return (
    <Box className="risk-dashboard-section">
      <Box className="pnl-chart-card">
        <Box className="pnl-chart-header">
          <Box className="pnl-chart-title">
            HISTORICAL: {PERIOD_LABELS[period] || "YTD"} P&L
          </Box>
          <Box className="pnl-chart-legend">
            <Box className="pnl-chart-legend-dot" />
            Cumulative P&L
          </Box>
        </Box>

        {loading ? (
          <Box className="risk-dashboard-loading" sx={{ minHeight: 300 }}>
            <CircularProgress size={32} />
          </Box>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <defs>
                <linearGradient id="cumPnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatChartXAxis}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Cumulative P&L"]}
                labelFormatter={(label: string) => formatDate(label)}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulative_pnl"
                stroke="#7c3aed"
                strokeWidth={2.5}
                fill="url(#cumPnlGradient)"
                dot={false}
                activeDot={{ r: 5, fill: "#7c3aed", stroke: "#fff", strokeWidth: 2 }}
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
