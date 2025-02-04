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

const CumulativeyearlyChart: React.FC = () => {
  const [data, setData] = useState<DealData | null>(null);
  const [showCount, setShowCount] = useState(true);
  const [showSize, setShowSize] = useState(true);

  // Fetch data from the API
  useEffect(() => {
    axios
      .get<DealData>('http://192.168.1.59:9000/api/cummulatives_monashee/')
      .then((response) => setData(response.data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  // Prepare data for the chart
  let cumulativeSize2022 = 0;
  let cumulativeSize2023 = 0;
  let cumulativeSize2024 = 0;

  let cumulativeCount2022 = 0;
  let cumulativeCount2023 = 0;
  let cumulativeCount2024 = 0;


  const chartData = Object.keys(data).map((week, index) => {
    const count2022 = data[week]?.count[`2022_w${String(index + 1).padStart(2, '0')}_deal_count`] || 0;
    const count2023 = data[week]?.count[`2023_w${String(index + 1).padStart(2, '0')}_deal_count`] || 0;
    const count2024 = data[week]?.count[`2024_w${String(index + 1).padStart(2, '0')}_deal_count`] || 0;
    const cumulative_avg_count = data[week]?.count[`cumulativeavg_w${String(index + 1).padStart(2, '0')}_deal_count`] || 0;

    const size2022 = data[week]?.size[`2022_w${String(index + 1).padStart(2, '0')}_deal_size`] || 0;
    const size2023 = data[week]?.size[`2023_w${String(index + 1).padStart(2, '0')}_deal_size`] || 0;
    const size2024 = data[week]?.size[`2024_w${String(index + 1).padStart(2, '0')}_deal_size`] || 0;
    const cumulative_avg_size = data[week]?.size[`cumulativeavg_w${String(index + 1).padStart(2, '0')}_deal_size`] || 0;


    cumulativeCount2022 += count2022;
    cumulativeCount2023 += count2023;
    cumulativeCount2024 += count2024;


    // Update cumulative deal sizes
    cumulativeSize2022 += size2022;
    cumulativeSize2023 += size2023;
    cumulativeSize2024 += size2024;

    return {
      name: week,
      '2022': cumulativeCount2022,
      '2023': cumulativeCount2023,
      '2024': cumulativeCount2024,
      'CumulativeCount':cumulative_avg_count,
      cumulative_avg_2022: cumulativeSize2022 ,
      cumulative_avg_2023: cumulativeSize2023 ,
      cumulative_avg_2024: cumulativeSize2024 ,
      cumulativedata_avg_size:cumulative_avg_size
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
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />

          {showCount && (
            <>
              <Line type="monotone" dataKey="2022" stroke="#8884d8" name="2022 Deal Count" />
              <Line type="monotone" dataKey="2023" stroke="#82ca9d" name="2023 Deal Count" />
              <Line type="monotone" dataKey="2024" stroke="#ff7300" name="2024 Deal Count" />
              <Line type="monotone" dataKey="CumulativeCount" stroke="#ff7300" name="Avg Deal Count" />

            </>
          )}

          {showSize && (
            <>
              <Line type="monotone" dataKey="cumulative_avg_2022" stroke="#ff6347" name="2022 Cumulative Deal Size" />
              <Line type="monotone" dataKey="cumulative_avg_2023" stroke="#32cd32" name="2023 Cumulative Deal Size" />
              <Line type="monotone" dataKey="cumulative_avg_2024" stroke="#1e90ff" name="2024 Cumulative Deal Size" />
              <Line type="monotone" dataKey="cumulativedata_avg_size" stroke="#1e90ff" name="Avg Cumulative Deal Size" />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CumulativeyearlyChart;
