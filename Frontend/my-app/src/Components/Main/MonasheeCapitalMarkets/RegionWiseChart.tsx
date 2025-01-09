import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';

interface RegionWiseChartProps {
  data: Record<string, any>; // API response for regions
  selectedMetric: string; // Metric to display (e.g., 'count', 'deal_value', 'opportunity_value_ex')
}

const RegionWiseChart: React.FC<RegionWiseChartProps> = ({ data, selectedMetric }) => {
  // Transform the data into a format suitable for the chart
  const chartData = Object.entries(data).map(([year, regions]) => {
    const yearData: any = { year }; // Initialize year
    Object.entries(regions).forEach(([region, metrics]: [string, any]) => {
      yearData[region] = metrics[selectedMetric]; // Add selected metric for each region
    });
    return yearData;
  });

  // Extract all regions from the first year to use as keys for the lines
  const allRegions = Object.keys(data[Object.keys(data)[0]] || {});

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        {/* Dynamically create a line for each region */}
        {allRegions.map((region) => (
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
  );
};

export default RegionWiseChart;
