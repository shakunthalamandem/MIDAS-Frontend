import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, CircularProgress, Typography, Card, CardContent, CardHeader, Paper } from '@mui/material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Define the structure of the API response
interface APIResponse {
  [year: string]: {
    us: string;
    international: string;
  };
}

const AreaChartComponent: React.FC = () => {
  const [data, setData] = useState<any[]>([]); // Chart data
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the data and type the response
        const response = await axios.get<APIResponse>(
          'http://192.168.1.59:9000/api/regionwise_data'
        );
        
        // Transform the data to the format required for the chart
        const chartData = Object.keys(response.data).map((year) => ({
          year,
          us: parseFloat(response.data[year].us), // Convert percentage string to number
        }));

        // Set the data for the chart
        setData(chartData);
      } catch (err) {
        setError('Error fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run once when the component mounts

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: { xs: 2, sm: 3 }, width: "100%" }}>
      <Typography variant="h6" gutterBottom align="center" color="#002060">
        US Region Percentage (Area Chart)
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <Paper
          elevation={3}
          sx={{
            padding: { xs: 2, sm: 3 },
            width: "100%",
            maxWidth: "1200px", // Max width on large screens
            margin: "0 auto", // Center the Paper on the screen
          }}
        >
 <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={data}>
              <XAxis 
                dataKey="year" 
                tick={{ fill: "#002060", fontSize: 12 }}  // Adjust font size and color
                />
                <YAxis
                  domain={[0, 100]} // Set Y-axis range to 0 to 100
                  tickFormatter={(tick) => `${tick}%`} 
                  tick={{ fill: "#002060", fontSize: 12 }}  // Adjust font size and color
                  // Add % symbol to the ticks
                />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="us"
                  stroke="#166103"
                  fillOpacity={0.3}
                  fill="#c0d8ba"
                />
              </AreaChart>
            </ResponsiveContainer>
            </Paper>

      </Box>
    </Box>
  );
};

export default AreaChartComponent;
