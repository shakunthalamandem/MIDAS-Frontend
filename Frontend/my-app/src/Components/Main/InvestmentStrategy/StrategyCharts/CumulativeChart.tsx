import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Checkbox, FormControlLabel, Card, CardContent, Typography } from '@mui/material';

// Type definition for the API data structure
interface ApiData {
  chartdata: {
    [key: string]: {
      [week: string]: {
        deal_count: number;
        deal_size: number;
      };
    };
  };
}

interface ChartData {
  week: string;
  cumulative_avg: number;
  [year: string]: number | string;  // Add index signature here
}


const ChartComponent: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [showDealCount, setShowDealCount] = useState(true);
  const [showDealSize, setShowDealSize] = useState(false);

  // Fetch data from the API
  useEffect(() => {
    axios.get<ApiData>('http://192.168.1.59:9000/api/cummulatives_monashee/')
      .then(response => {
        const fetchedData = processData(response.data);
        setData(fetchedData);
      })
      .catch(error => {
        console.error('Error fetching the data:', error);
      });
  }, []);

  // Process the API response to transform it into the format needed for the chart
  const processData = (data: ApiData): ChartData[] => {
    const chartData: ChartData[] = [];
    const weeks = Object.keys(data.chartdata['2022']); // Assuming all years have the same weeks

    weeks.forEach((week) => {
      const weekData: ChartData = { week, '2022': 0, '2023': 0, '2024': 0, cumulative_avg: 0 };
      let totalDealCount = 0;
      let totalDealSize = 0;
      let count = 0;

      // Accumulate values for each year
      for (const year of ['2022', '2023', '2024']) {
        if (data.chartdata[year] && data.chartdata[year][week]) {
          const weekInfo = data.chartdata[year][week];
          weekData[year] = weekInfo.deal_count || weekInfo.deal_size;
          totalDealCount += weekInfo.deal_count;
          totalDealSize += weekInfo.deal_size;
          count++;
        }
      }

      // Calculate cumulative averages
      weekData.cumulative_avg = (totalDealCount + totalDealSize) / (2 * count);  // Example avg calculation

      chartData.push(weekData);
    });

    return chartData;
  };

  // Handle checkbox changes to toggle data
  const handleDealCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowDealCount(event.target.checked);
  };

  const handleDealSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowDealSize(event.target.checked);
  };

  return (
    <div>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Deal Count and Deal Size Chart</Typography>

          {/* Checkboxes for toggling data */}
          <FormControlLabel
            control={<Checkbox checked={showDealCount} onChange={handleDealCountChange} />}
            label="Show Deal Count"
          />
          <FormControlLabel
            control={<Checkbox checked={showDealSize} onChange={handleDealSizeChange} />}
            label="Show Deal Size"
          />

          {/* Chart */}
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              {showDealCount && (
                <>
                  <Line type="monotone" dataKey="2022" stroke="#8884d8" name="2022 Deal Count" />
                  <Line type="monotone" dataKey="2023" stroke="#82ca9d" name="2023 Deal Count" />
                  <Line type="monotone" dataKey="2024" stroke="#ffc658" name="2024 Deal Count" />
                </>
              )}
              {showDealSize && (
                <>
                  <Line type="monotone" dataKey="2022" stroke="#8884d8" name="2022 Deal Size" />
                  <Line type="monotone" dataKey="2023" stroke="#82ca9d" name="2023 Deal Size" />
                  <Line type="monotone" dataKey="2024" stroke="#ffc658" name="2024 Deal Size" />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartComponent;
