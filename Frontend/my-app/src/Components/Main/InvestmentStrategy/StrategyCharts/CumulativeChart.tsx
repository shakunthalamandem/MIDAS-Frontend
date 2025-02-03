import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Checkbox, FormControlLabel, Box, Typography } from '@mui/material';
import axios from 'axios';

// Define the DealData interface
interface DealData {
  [week: string]: {
    count: {
      [key: string]: number;
    };
    size: {
      [key: string]: number;
    };
  };
}

const Graph: React.FC = () => {
  const [data, setData] = useState<DealData | null>(null);
  const [showCount, setShowCount] = useState(true);
  const [showSize, setShowSize] = useState(true);

  // Fetch data from the API
  useEffect(() => {
    axios.get<DealData>('http://192.168.1.59:9000/api/cummulatives_monashee/')
      .then((response) => setData(response.data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  // Prepare data for the chart
  let cumulativeAvg2022 = 0;
  let cumulativeAvg2023 = 0;
  let cumulativeAvg2024 = 0;

  const chartData = Object.keys(data).map((week, index) => {
    const count2022 = data[week]?.count[`2022_w${String(index + 1).padStart(2, '0')}_deal_count`] || 0;
    const count2023 = data[week]?.count[`2023_w${String(index + 1).padStart(2, '0')}_deal_count`] || 0;
    const count2024 = data[week]?.count[`2024_w${String(index + 1).padStart(2, '0')}_deal_count`] || 0;

    // Update cumulative averages for each year
    cumulativeAvg2022 += count2022;
    cumulativeAvg2023 += count2023;
    cumulativeAvg2024 += count2024;

    return {
      name: week,
      '2022': count2022,
      '2023': count2023,
      '2024': count2024,
      cumulative_avg_2022: cumulativeAvg2022 / (index + 1),
      cumulative_avg_2023: cumulativeAvg2023 / (index + 1),
      cumulative_avg_2024: cumulativeAvg2024 / (index + 1),
    };
  });

  return (
    <Box>
      <Typography variant="h5">Cumulative Deal Data</Typography>

      <Box>
        <FormControlLabel
          control={<Checkbox checked={showCount} onChange={() => setShowCount(!showCount)} />}
          label="Show Deal Count"
        />
        <FormControlLabel
          control={<Checkbox checked={showSize} onChange={() => setShowSize(!showSize)} />}
          label="Show Deal Size"
        />
      </Box>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />

          {showCount && (
            <>
              <Line
                type="monotone"
                dataKey="2022"
                stroke="#8884d8"
                name="2022 Deal Count"
              />
              <Line
                type="monotone"
                dataKey="2023"
                stroke="#82ca9d"
                name="2023 Deal Count"
              />
              <Line
                type="monotone"
                dataKey="2024"
                stroke="#ff7300"
                name="2024 Deal Count"
              />
            </>
          )}

          {showSize && (
            <>
              <Line
                type="monotone"
                dataKey="cumulative_avg_2022"
                stroke="#ff6347"
                name="2022 Cumulative Avg Deal Count"
              />
              <Line
                type="monotone"
                dataKey="cumulative_avg_2023"
                stroke="#32cd32"
                name="2023 Cumulative Avg Deal Count"
              />
              <Line
                type="monotone"
                dataKey="cumulative_avg_2024"
                stroke="#1e90ff"
                name="2024 Cumulative Avg Deal Count"
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default Graph;
