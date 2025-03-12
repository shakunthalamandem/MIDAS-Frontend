import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';

interface ConvertsSpRatingWiseChartProps {
  data: Record<string, any>;
  selectedMetric: string;
}

const ConvertsSpRatingWiseChart: React.FC<ConvertsSpRatingWiseChartProps> = ({ data, selectedMetric }) => {
  // Prepare the data for the Pie Chart, based on the selected metric
  const chartData = Object.entries(data).map(([region, stats]) => {
    const regionValue = stats[selectedMetric] || 0; // Get the selected metric for each region
    return {
      name: region,
      value: regionValue,
    };
  });

  // Define colors for the pie chart sections
  const colors = [
    "#2E3A87", "#1D9C63",  "#C8A700","#D75F01", "#B72B72", "#D94E8A"

  ];

  // Updated Number formatter function based on the selected metric
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

  return (
    <Box>
      <Typography variant="h5" align="center" gutterBottom sx={{ color: '#002060', fontWeight: 'bold' }}>
        Rating Wise Deals
      </Typography>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={130}
            fill="#8884d8"
            label={({ name, value }) => `${name}: ${formatNumber(value)}`} // Use the new formatNumber function for labels
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatNumber(value)} /> {/* Use the new formatNumber function for tooltip */}
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ConvertsSpRatingWiseChart;
