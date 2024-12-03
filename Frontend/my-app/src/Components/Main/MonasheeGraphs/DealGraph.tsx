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
import { Container, Box, Typography } from "@mui/material";
import axios from "axios";
import DealsDataFilter from "../MonasheeDeals/DeoLogicData/DealsDataFilter";

// Define interfaces for API response and chart data
interface ApiResponse {
  [key: string]: {
    FO: {
      US: { [sector: string]: { count: number } };
      International: { [sector: string]: { count: number } };
    };
    IPO: {
      US: { [sector: string]: { count: number } };
      International: { [sector: string]: { count: number } };
    };
  };
}

interface ChartData {
  name: string;
  IPO?: number;
  FO?: number;
  total?: number;
}


const DealGraph: React.FC = () => {
  // State for chart data and filters
  const [data, setData] = useState<ChartData[]>([]);
  const [filters, setFilters] = useState({
    years: [] as string[],
    regions: [] as string[],
    sectors: [] as string[],
    deal_types: [] as string[],
    period: [] as string[],
  });

  // Fetch data from the API based on the applied filters
  const fetchData = async (appliedFilters: typeof filters) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;

      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }

      const response = await axios.post<ApiResponse>(`${apiUrl}/api/deals_graph/`, appliedFilters);
      setData(transformData(response.data));
    } catch (error) {
      console.error("Error fetching data from API:", error);
    }
  };

  // Transform API response data into a format suitable for the chart
  const transformData = (apiData: ApiResponse): ChartData[] => {
    return Object.keys(apiData).map((key) => {
      const { IPO, FO } = apiData[key];

      const ipoTotal =
        Object.values(IPO.US || {}).reduce((sum, { count }) => sum + count, 0) +
        Object.values(IPO.International || {}).reduce((sum, { count }) => sum + count, 0);
      const foTotal =
        Object.values(FO.US || {}).reduce((sum, { count }) => sum + count, 0) +
        Object.values(FO.International || {}).reduce((sum, { count }) => sum + count, 0);

      return {
        name: key,
        IPO: ipoTotal,
        FO: foTotal,
        total: ipoTotal + foTotal,
      };
    });
  };

  // Fetch data whenever filters change
  useEffect(() => {
    fetchData(filters);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters); // Update the filters state when user changes them
  };

  // Custom Tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, IPO, FO, total } = payload[0].payload;
      return (
        <div style={{ backgroundColor: "white", border: "1px solid #ccc", padding: "10px" }}>
          <h4>{name}</h4>
          {IPO !== undefined && <p>IPO: {IPO}</p>}
          {FO !== undefined && <p>FO: {FO}</p>}
          <p>Total Deals: {total}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="xl" sx={{ paddingY: 4, display: "flex",marginLeft:0 }}>
      {/* Filters Section */}
      <Box width="300px" sx={{ marginRight: 10 }}>
      <DealsDataFilter appliedFilters={filters} onFiltersChange={handleFilterChange} />
      </Box>

      {/* Chart Section */}
      <Box flex={1}>
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
          Number Of Deals
        </Typography>

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
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="IPO" stackId="a" fill="#8884d8" name="IPO" />
              <Bar dataKey="FO" stackId="a" fill="#82ca9d" name="FO" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Container>
  );
};

export default DealGraph;
