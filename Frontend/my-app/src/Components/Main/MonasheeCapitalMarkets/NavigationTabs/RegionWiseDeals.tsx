import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';

interface RegionWiseDealsProps {
  data: Record<string, any>;
  selectedMetric: string;
}

const RegionWiseDeals: React.FC<RegionWiseDealsProps> = ({ data, selectedMetric }) => {
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
    "#2E3A87", "#1D9C63", "#D75F01", "#1ea5db", "#B72B72", "#D94E8A",
    "#5B9E6E", "#C8A700", "#D2768F", "#7B4C92", "#4A88B6", 
    "#3E7A3B", "#C04C97", "#7A3F5F", "#A16329", "#4D7893", "#9C6F1F",
    "#5F4774", "#DE5D85", "#83C3DA", "#4B3563"
  ];

  return (
    <Box>
      <Typography variant="h5" align="center" gutterBottom sx={{ color: '#002060', fontWeight: 'bold' }}>
        Region Wise Deals
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
            label={({ name, value }) => `${name}: ${value}`} // Use raw value without formatting
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => value} /> {/* Show raw value in tooltip */}
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default RegionWiseDeals;