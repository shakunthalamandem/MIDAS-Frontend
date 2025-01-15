import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box } from "@mui/material";

interface NumberOfDealsProps {
  data: Record<string, any>;
  selectedMetric: string;
}

const NumberOfDeals: React.FC<NumberOfDealsProps> = ({ data, selectedMetric }) => {
  // Prepare the data for the chart, based on the selected metric
  const chartData = Object.entries(data).map(([year, stats]) => {
    const ipoValue = stats[selectedMetric]?.IPO || 0; // IPO value for the selected metric
    const foValue = stats[selectedMetric]?.FO || 0; // FO value for the selected metric
    return {
      year,
      IPO: ipoValue,
      FO: foValue,
    };
  });

  // Number formatter function
  const formatNumber = (value: number): string => {
    if (selectedMetric === "count") {
      return value.toString(); // No formatting for 'count'
    }
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`; // Format billions
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`; // Format millions
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`; // Format thousands
    return value.toString(); // Default format
  };

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: any[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, item) => sum + (item.value || 0), 0);
      return (
        <div
          style={{
            background: "#fff",
            border: "1px solid #ccc",
            padding: "10px",
          }}
        >
          <p style={{ margin: 0 }}>{`Year: ${label}`}</p>
          {payload.map((entry, index) => (
            <p
              key={`item-${index}`}
              style={{
                margin: 0,
                color: entry.color,
              }}
            >
              {`${entry.name}: ${selectedMetric === "count" ? entry.value : formatNumber(entry.value)}`}
            </p>
          ))}
          <p style={{ margin: 0, fontWeight: "bold",color:'#002060' }}>{`Total: ${
            selectedMetric === "count" ? total : formatNumber(total)
          }`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Box>
      {/* Stacked Bar Chart using Recharts */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <XAxis dataKey="year" />
          <YAxis tickFormatter={formatNumber} /> {/* Conditional formatting */}
          <Tooltip content={<CustomTooltip />} /> {/* Custom tooltip with conditional formatting */}
          <Legend />
          <Bar dataKey="IPO" stackId="a" fill="#8884d8" />
          <Bar dataKey="FO" stackId="a" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default NumberOfDeals;
