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

interface HYBarChartsProps {
  data: Record<string, any>;
  selectedMetric: string;
}

const HYBarCharts: React.FC<HYBarChartsProps> = ({ data, selectedMetric }) => {
  
  
  // Prepare the data for the chart, based on the selected metric
  const chartData = Object.entries(data).map(([year, stats]) => {
    const metricValue = stats[selectedMetric] || 0; // Get the value based on selectedMetric

    return {
      year,
      [selectedMetric]: metricValue, // Dynamically set the key based on selectedMetric
    };
  });

  // Format numbers conditionally based on the metric
  const formatNumber = (value: number): string => {
    if (selectedMetric === "count") {
      return value.toString(); // Just show the number for count
    }

    const absValue = Math.abs(value);
    let formattedValue: string;

    if (absValue >= 1e9) {
      formattedValue = `${(absValue / 1e9).toFixed(1)}B`; // Billion
    } else if (absValue >= 1e6) {
      formattedValue = `${(absValue / 1e6).toFixed(1)}M`; // Million
    } else if (absValue >= 1e3) {
      formattedValue = `${(absValue / 1e3).toFixed(1)}K`; // Thousand
    } else {
      formattedValue = absValue.toString(); // No formatting for values < 1000
    }

    return value < 0 ? `-${formattedValue}` : formattedValue;
  };

  // Custom tooltip to display detailed information
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
          <p style={{ margin: 0, fontWeight: "bold", color: "#002060" }}>
            {`Total: ${selectedMetric === "count" ? total : formatNumber(total)}`}
          </p>
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
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey={selectedMetric} stackId="a" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default HYBarCharts;
