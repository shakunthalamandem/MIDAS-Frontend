import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Checkbox, FormControlLabel } from '@mui/material';

interface RegionWiseDealsProps {
  data: Record<string, any>;
}

const RegionWiseDeals: React.FC<RegionWiseDealsProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('count'); // Default to "count" (Deal Count)

  // Function to handle the checkbox change
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMetric(event.target.value);
  };

  // Prepare the data for the Pie Chart, based on the selected metric
  const chartData = Object.entries(data).map(([region, stats]) => {
    const regionValue = stats[selectedMetric] || 0; // Get the selected metric for each region
    return {
      name: region,
      value: regionValue,
    };
  });

  // Define colors for the pie chart sections
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#d0ed57', '#a4de6c'];

  return (
    <div>
      <h3>Region Wise Deals</h3>

      {/* Checkboxes for selecting the metric */}
      <div>
        <FormControlLabel
          control={<Checkbox checked={selectedMetric === 'count'} onChange={handleCheckboxChange} value="count" />}
          label="Deal Count"
        />
        <FormControlLabel
          control={<Checkbox checked={selectedMetric === 'volume'} onChange={handleCheckboxChange} value="volume" />}
          label="Deal Size"
        />
        <FormControlLabel
          control={<Checkbox checked={selectedMetric === 'opp_exs_return'} onChange={handleCheckboxChange} value="opp_exs_return" />}
          label="Opportunity Exits Return"
        />
      </div>

      {/* Pie Chart using Recharts */}
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} fill="#8884d8" label>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RegionWiseDeals;
