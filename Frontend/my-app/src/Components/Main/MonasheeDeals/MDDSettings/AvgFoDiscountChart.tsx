import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Box, Typography } from "@mui/material";

interface YearData {
  [year: string]: {
    count: number;
    avg_fo_discount: number;
  };
}

interface Props {
  data: YearData;
}

const AvgFoDiscountChart: React.FC<Props> = ({ data }) => {
  const chartData = Object.entries(data).map(([year, values]) => ({
    year,
    avgFoDiscount: values.avg_fo_discount,
    count: values.count,
  }));

  if (chartData.length === 0) {
    return (
      <Box sx={{ textAlign: "center", padding: 4 }}>
        <Typography variant="h6" color="textSecondary">
          No Data Available for the selected filters.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Please change the selected filters to show the Plot.
        </Typography>
      </Box>
    );
  }

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { year, avgFoDiscount, count } = payload[0].payload;
      return (
        <Box sx={{ padding: 2, backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px" }}>
          <Typography variant="body1" fontWeight="bold">
            Year: {year}
          </Typography>
          <Typography variant="body2">Avg FO Discount: {avgFoDiscount}</Typography>
          <Typography variant="body2">Count: {count}</Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="avgFoDiscount" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default AvgFoDiscountChart;
