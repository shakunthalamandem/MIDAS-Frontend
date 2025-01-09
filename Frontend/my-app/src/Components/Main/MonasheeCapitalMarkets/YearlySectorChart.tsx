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
              />
            }
            label={sector}
          />
        ))}
      </Box>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          {visibleSectors.map((sector) => (
            <Line
              key={sector}
              type="monotone"
              dataKey={sector}
              stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`} // Random color for each line
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default YearlySectorChart;
