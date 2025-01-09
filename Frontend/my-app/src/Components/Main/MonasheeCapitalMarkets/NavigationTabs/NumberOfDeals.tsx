import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography } from "@mui/material";

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

  return (
    <Box>


      {/* Stacked Bar Chart using Recharts */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="IPO" stackId="a" fill="#8884d8" />
          <Bar dataKey="FO" stackId="a" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default NumberOfDeals;
