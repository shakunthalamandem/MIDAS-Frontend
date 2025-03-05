import React, { useState, useEffect } from 'react';
import { CircularProgress, Typography, Alert, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

interface SelectedFilters {
    [key: string]: any;
  }
  interface DataType {
    [key: string]: {
      count: number;
    };
}
  const HYsppiechart = ({ selectedFilters }: { selectedFilters: SelectedFilters }) => {
 
  


  
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const response = await fetch(`${apiUrl}/api/high_yields_graph/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(selectedFilters),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();
        setData(result.main_aggregation); // Assuming `main_aggregation` contains the sp_rating data
      } catch (error) {
        if (error instanceof Error) {
          setError(error);
        } 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedFilters]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="error">{error.message}</Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6">No data available</Typography>
      </Box>
    );
  }

  // Prepare data for Recharts
  const chartData = Object.keys(data).map((key) => ({
    name: key,
    value: data[key].count,
  }));

  const colors = ['#FF5733', '#33FF57', '#3357FF', '#F5A623']; // Colors for the slices

  return (
    <Box display="flex" flexDirection="column" alignItems="center" sx={{ width: '100%', padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        SP Rating Distribution
      </Typography>
      <Box sx={{ width: '100%', maxWidth: 600 }}>
        <PieChart width={400} height={400}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            label
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </Box>
    </Box>
  );
};

export default HYsppiechart;
