import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Container,
  Grid,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import axios from "axios";

// Define the type for the nested data response
interface ApiResponse {
  [key: string]: {
    FO: { International: number; US: number };
    IPO: { International: number; US: number };
  };
}

// Define the type for chart data
interface ChartData {
  name: string;
  IPO?: number;
  FO?: number;
  total?: number; // Add total to ChartData
}

const DealGraph: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]); // Chart data after transformation
  const [type, setType] = useState("all"); // IPO, FO, All
  const [period, setPeriod] = useState("yearly"); // Yearly, Quarterly, Monthly
  const [region, setRegion] = useState("all"); // US, International, All

  // Function to fetch data from API based on selected filters
  const fetchData = async () => {
    try {
      const response = await axios.post<ApiResponse>("http://192.168.1.59:9000/api/deals_graph/", {
        type,
        period,
        region,
      });
      console.log(response.data); // Debugging line
      const transformedData = transformData(response.data);
      setData(transformedData); // Set transformed data
    } catch (error) {
      console.error("Error fetching data from API:", error);
    }
  };

  // Transform API response data into a format suitable for Recharts
  const transformData = (apiData: ApiResponse): ChartData[] => {
    return Object.keys(apiData).map((key) => {
      const ipoUS = apiData[key].IPO.US || 0;
      const ipoInternational = apiData[key].IPO.International || 0;
      const foUS = apiData[key].FO.US || 0;
      const foInternational = apiData[key].FO.International || 0;

      const combinedIPO =
        region === "all"
          ? ipoUS + ipoInternational
          : region === "US"
          ? ipoUS
          : ipoInternational;

      const combinedFO =
        region === "all"
          ? foUS + foInternational
          : region === "US"
          ? foUS
          : foInternational;

      const totalDeals = combinedIPO + combinedFO; // Calculate total deals

      return {
        name: key,
        IPO: combinedIPO,
        FO: combinedFO,
        total: totalDeals, // Include total in the returned data
      };
    });
  };

  // Call fetchData whenever a dropdown selection changes
  useEffect(() => {
    fetchData();
  }, [type, period, region]);

  // Event handlers for dropdown selections
  const handleTypeChange = (event: SelectChangeEvent) => setType(event.target.value);
  const handlePeriodChange = (event: SelectChangeEvent) => setPeriod(event.target.value);
  const handleRegionChange = (event: SelectChangeEvent) => setRegion(event.target.value);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, IPO, FO, total } = payload[0].payload;
      return (
        <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '10px' }}>
          <h4>{name}</h4>
          {type === "ipo" || type === "all" ? <p>IPO: {IPO}</p> : null}
          {type === "fo" || type === "all" ? <p>FO: {FO}</p> : null}
          <p>Total Deals: {total}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Typography
        variant="h6"
        sx={{
          maxWidth: "600px",
          fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
          lineHeight: "1.6",
          marginBottom: "10px",
          color: "#002060",
          fontWeight: "bold",
        }}
      >
        # Of Deals Graph
      </Typography>

      {/* Dropdowns Row */}
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Type</InputLabel>
            <Select value={type} onChange={handleTypeChange} label="Type">
              <MenuItem value="ipo">IPO</MenuItem>
              <MenuItem value="fo">FO</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Period</InputLabel>
            <Select value={period} onChange={handlePeriodChange} label="Period">
              <MenuItem value="yearly">Yearly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Region</InputLabel>
            <Select value={region} onChange={handleRegionChange} label="Region">
              <MenuItem value="US">US</MenuItem>
              <MenuItem value="International">International</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Bar Chart */}
      <Box sx={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} /> {/* Use custom tooltip */}
            <Legend />
            {/* Conditional rendering of bars based on type */}
            {type === "ipo" || type === "all" ? (
              <Bar dataKey="IPO" stackId="a" fill="#8884d8" name="IPO" />
            ) : null}
            {type === "fo" || type === "all" ? (
              <Bar dataKey="FO" stackId="a" fill="#82ca9d" name="FO" />
            ) : null}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Container>
  );
};

export default DealGraph;
