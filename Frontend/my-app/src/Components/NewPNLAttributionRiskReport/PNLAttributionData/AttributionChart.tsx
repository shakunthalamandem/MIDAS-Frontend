import React, { useState, useEffect, useCallback } from "react";
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
import type { AttributionGroupBy } from "./types";
import { formatCurrency, formatDate, formatChartXAxis } from "./utils";

const apiUrl = process.env.REACT_APP_API_URL;

interface ChartPoint {
  date: string;
  value: number;
}

const METRIC_LABELS: Record<string, string> = {
  dtd_pnl: "DTD P&L",
  wtd_pnl: "WTD P&L",
  ytd_pnl: "YTD P&L",
  net_exp: "Net Exp",
  beta_adj_net: "Beta Adj Net",
  delta_adj_net: "Delta Adj Net",
};

interface AttributionChartProps {
  selectedFunds: string[];
  selectedDate: string;
  groupBy: AttributionGroupBy;
  groupValue: string;
  metric: string;
  accentColor: string;
}

const AttributionChart: React.FC<AttributionChartProps> = ({
  selectedFunds,
  selectedDate,
  groupBy,
  groupValue,
  metric,
  accentColor,
}) => {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChartData = useCallback(async () => {
    if (selectedFunds.length === 0 || !selectedDate || !groupValue || !metric) return;
    const token = localStorage.getItem("access_token");
    setLoading(true);
    try {
      const res = await fetch(
        `${apiUrl}/api/risk_attribution_wise_chart/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fund: selectedFunds,
            date: selectedDate,
            group_by: groupBy,
            [groupBy]: groupValue,
            metric,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to fetch chart data");
      const result = await res.json();
      setChartData(result.chart_data || []);
    } catch {
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFunds, selectedDate, groupBy, groupValue, metric]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const gradientId = `attrChartGradient-${metric}`;

  return (
    <Box className="attr-chart-section">
      <Box className="attr-chart-header">
        <Box className="attr-chart-title" sx={{ color: accentColor }}>
          {groupValue} — {METRIC_LABELS[metric] || metric}
        </Box>
        <Box className="attr-chart-legend">
          <Box className="attr-chart-legend-dot" sx={{ background: accentColor }} />
          {METRIC_LABELS[metric] || metric}
        </Box>
      </Box>

      {loading ? (
        <Box className="attr-chart-loading">
          <CircularProgress size={28} />
        </Box>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accentColor} stopOpacity={0.15} />
                <stop offset="95%" stopColor={accentColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatChartXAxis}
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
              width={70}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), METRIC_LABELS[metric] || metric]}
              labelFormatter={(label: string) => formatDate(label)}
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: "13px",
                fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
              }}
            />
            <Area
              type="linear"
              dataKey="value"
              stroke={accentColor}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 5, fill: accentColor, stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <Box className="attr-chart-empty">No chart data available</Box>
      )}
    </Box>
  );
};

export default AttributionChart;
