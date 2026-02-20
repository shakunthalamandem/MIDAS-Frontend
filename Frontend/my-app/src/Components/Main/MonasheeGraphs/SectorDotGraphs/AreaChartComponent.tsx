import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, CircularProgress, Typography, Paper, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Define the structure of the API response
interface APIResponse {
  [year: string]: {
    count: {
      international: string;
      us: string;
    };
    deal_value: {
      international: string;
      us: string;
    };
    opportunity_value_ex: {
      international: string;
      us: string;
    };
    opportunity_value_on_abs_basis: {
      international: string;
      us: string;
    };
  };
}

// Define props for the component to select the data category dynamically
interface AreaChartComponentProps {
  dataCategory: 'count' | 'deal_value' | 'opportunity_value_ex' | 'opportunity_value_on_abs_basis';
}

const AreaChartComponent: React.FC<AreaChartComponentProps> = ({ dataCategory }) => {
  const [data, setData] = useState<any[]>([]); // Chart data
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [showUS, setShowUS] = useState<boolean>(true); // Show US line by default
  const [showInternational, setShowInternational] = useState<boolean>(false); // Hide International line by default

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the data and type the response
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error('API URL is not defined in environment variables');
        }
        const response = await axios.get<APIResponse>(
          `${apiUrl}/api/regionwise_data/`, 
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            }}
        );

        // Transform the data to the format required for the chart
        const chartData = Object.keys(response.data).map((year) => ({
          year,
          us: parseFloat(response.data[year][dataCategory].us), // Convert percentage string to number
          international: parseFloat(response.data[year][dataCategory].international),
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
  }, [dataCategory]); // Dependency on dataCategory to refetch if it changes

  const handleUSChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowUS(event.target.checked);
  };

  const handleInternationalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowInternational(event.target.checked);
  };

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
    <Box sx={{ width: "100%", marginBottom: '30px' }}>
      <Typography variant="h6" gutterBottom align="center" color="#002060">
        {`US & International ${dataCategory.replace(/_/g, ' ').toUpperCase()} (Area Chart)`}
      </Typography>

      {/* Checkbox to toggle US and International lines */}
      <Box display="flex" justifyContent="center" mb={2}>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox 
                checked={showUS} 
                onChange={handleUSChange} 
                color="primary" 
              />
            }
            label="US"
          />
          <FormControlLabel
            control={
              <Checkbox 
                checked={showInternational} 
                onChange={handleInternationalChange} 
                color="primary" 
              />
            }
            label="International"
          />
        </FormGroup>
      </Box>

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
                tick={{ fill: "#002060", fontSize: 12 }} // Adjust font size and color
              />
              <YAxis
                domain={[0, 100]} // Set Y-axis range to 0 to 100
                tickFormatter={(tick) => `${tick}%`} 
                tick={{ fill: "#002060", fontSize: 12 }} // Adjust font size and color
              />
              <Tooltip />
              <Legend />

              {/* Conditionally render US and International lines based on checkbox states */}
              {showUS && (
                <Area
                  type="linear"
                  dataKey="us"
                  stroke="#166103"
                  fillOpacity={0.3}
                  fill="#c0d8ba"
                />
              )}
              {showInternational && (
                <Area
                  type="linear"
                  dataKey="international"
                  stroke="#1b6ca8"
                  fillOpacity={0.3}
                  fill="#a0c4e2"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default AreaChartComponent;
