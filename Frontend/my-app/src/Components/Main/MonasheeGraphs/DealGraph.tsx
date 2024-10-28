import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
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
  ipoInternational?: number;
  ipoUS?: number;
  foInternational?: number;
  foUS?: number;
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
      const transformedData = transformData(response.data);
      setData(transformedData); // Now response.data is typed correctly
    } catch (error) {
      console.error("Error fetching data from API:", error);
    }
  };

  // Transform API response data into a format suitable for Recharts
  const transformData = (apiData: ApiResponse): ChartData[] => {
    return Object.keys(apiData).map((key) => ({
      name: key,
      ipoInternational: apiData[key].IPO?.International,
      ipoUS: apiData[key].IPO?.US,
      foInternational: apiData[key].FO?.International,
      foUS: apiData[key].FO?.US,
    }));
  };

  // Call fetchData whenever a dropdown selection changes
  useEffect(() => {
    fetchData();
  }, [type, period, region]);

  // Event handlers for dropdown selections
  const handleTypeChange = (event: SelectChangeEvent) => setType(event.target.value);
  const handlePeriodChange = (event: SelectChangeEvent) => setPeriod(event.target.value);
  const handleRegionChange = (event: SelectChangeEvent) => setRegion(event.target.value);

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
            <Tooltip />
            <Legend />
            {/* Stacked Bars for IPO and FO based on selected type */}
            {type === "ipo" || type === "all" ? (
              <>
                {region !== "US" && (
                  <Bar dataKey="ipoInternational" stackId="a" fill="#8884d8">
                    <LabelList dataKey="ipoInternational" position="inside" fill="white" />
                  </Bar>
                )}
                {region !== "International" && (
                  <Bar dataKey="ipoUS" stackId="a" fill="#8dd1e1">
                    <LabelList dataKey="ipoUS" position="inside" fill="white" />
                  </Bar>
                )}
              </>
            ) : null}
            {type === "fo" || type === "all" ? (
              <>
                {region !== "US" && (
                  <Bar dataKey="foInternational" stackId="a" fill="#82ca9d">
                    <LabelList dataKey="foInternational" position="inside" fill="white" />
                  </Bar>
                )}
                {region !== "International" && (
                  <Bar dataKey="foUS" stackId="a" fill="#a4de6c">
                    <LabelList dataKey="foUS" position="inside" fill="white" />
                  </Bar>
                )}
              </>
            ) : null}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Container>
  );
};

export default DealGraph;
