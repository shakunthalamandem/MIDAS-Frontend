import React, { useState } from 'react';
import { Box, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

interface RegionWiseChartProps {
  data: Record<string, any>; // API response for regions
  selectedMetric: string; // Metric to display (e.g., 'count', 'deal_value', 'opportunity_value_ex')
  checkedItems: string[]; // List of initially checked regions
}

const RegionWiseChart: React.FC<RegionWiseChartProps> = ({ data, selectedMetric, checkedItems }) => {
  const [visibleRegions, setVisibleRegions] = useState<string[]>(checkedItems || []); // Manage checked regions

  // Transform the data into a format suitable for the chart
  const chartData = Object.entries(data).map(([year, regions]) => {
    const yearData: any = { year };
    Object.entries(regions).forEach(([region, metrics]: [string, any]) => {
      yearData[region] = metrics[selectedMetric]; // Add selected metric for each region
    });
    return yearData;
  });

  // Extract all regions from the first year to use as keys for the lines
  const allRegions = Object.keys(data[Object.keys(data)[0]] || {});

  // Handle checkbox changes
  const handleCheckboxChange = (region: string) => {
    setVisibleRegions((prev) =>
      prev.includes(region) ? prev.filter((item) => item !== region) : [...prev, region]
    );
  };

  return (
    <Box>
        <Typography variant="h5" align="center" gutterBottom sx={{ color: '#002060', fontWeight: 'bold' }}>
            Region-wise Data Over the Years
        </Typography>
      <Box display="flex" justifyContent="center" flexWrap="wrap" mb={2}>
        {allRegions.map((region) => (
          <FormControlLabel
            key={region}
            control={
              <Checkbox
                checked={visibleRegions.includes(region)}
                onChange={() => handleCheckboxChange(region)}
                color="primary"
              />
            }
            label={region}
          />
        ))}
      </Box>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          {/* Dynamically create a line for each visible region */}
          {visibleRegions.map((region) => (
            <Line
              key={region}
              type="monotone"
              dataKey={region}
              stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`} // Random color for each line
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default RegionWiseChart;
