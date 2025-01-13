import React, { useState } from 'react';
import { Box, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: Record<string, any>; // API response
  selectedMetric: string; // Metric to display (e.g., 'count', 'deal_value', 'opportunity_value_ex')
  checkedItems?: string[]; // List of initially checked sectors (optional)
}

const YearlySectorChart: React.FC<LineChartProps> = ({ data, selectedMetric, checkedItems }) => {
  const [visibleSectors, setVisibleSectors] = useState<string[]>(
    checkedItems && checkedItems.length > 0 
      ? checkedItems 
      : Object.keys(data[Object.keys(data)[0]] || []) // All sectors from the first year
  );

  const chartData = Object.entries(data).map(([year, sectors]) => {
    const yearData: any = { year };
    Object.entries(sectors).forEach(([sector, metrics]: [string, any]) => {
      yearData[sector] = metrics[selectedMetric];
    });
    return yearData;
  });

  const allSectors = Object.keys(data[Object.keys(data)[0]] || {});

  const handleCheckboxChange = (sector: string) => {
    setVisibleSectors((prev) =>
      prev.includes(sector) ? prev.filter((item) => item !== sector) : [...prev, sector]
    );
  };

  const formatNumber = (value: number): string => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`; // Format billions
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`; // Format millions
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`; // Format thousands
    return value.toString(); // Default format
  };

  // Define colors for the lines
  const colors = [
    "#2E3A87", "#1D9C63", "#D75F01", "#C35A2C", "#B72B72", "#D94E8A",
    "#5B9E6E", "#C8A700", "#D2768F", "#7B4C92", "#4A88B6", 
    "#3E7A3B", "#C04C97", "#7A3F5F", "#A16329", "#4D7893", "#9C6F1F",
    "#5F4774", "#DE5D85", "#83C3DA", "#4B3563"
  ];

  return (
    <Box>
      <Typography variant="h5" align="center" gutterBottom sx={{ color: '#002060', fontWeight: 'bold' }}>
        Sector-wise Data Over the Years
      </Typography>
      <Box display="flex" justifyContent="center" flexWrap="wrap" mb={2}>
        {allSectors.map((sector) => (
          <FormControlLabel
            key={sector}
            control={
              <Checkbox
              checked={visibleSectors.includes(sector)}
              onChange={() => handleCheckboxChange(sector)}
              color="primary"
              sx={{
                "&.Mui-checked": {
                  color: "#a20000", // Change the color of the tick (red, in this case)
                },
              }}
            />
            
            }
            label={
              <Typography
                sx={{
                  color: "#626262",  // Set label color
                }}
              >
                {sector}
              </Typography>
            }          />
        ))}
      </Box>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis dataKey="year" />
          <YAxis tickFormatter={formatNumber} /> {/* Apply custom formatter */}
          <Tooltip formatter={(value: number) => formatNumber(value)} />
          <Legend />
          {visibleSectors.map((sector, index) => (
            <Line
              key={sector}
              type="monotone"
              dataKey={sector}
              stroke={colors[index % colors.length]} // Assign color from the colors array
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default YearlySectorChart;
