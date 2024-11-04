import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Legend } from "recharts";
import {
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Box,
} from "@mui/material";

interface ApiResponse {
  [year: string]: {
    FO: {
      US: Record<string, { count: number }>;
      International: Record<string, { count: number }>;
    };
    IPO: {
      US: Record<string, { count: number }>;
      International: Record<string, { count: number }>;
    };
  };
}

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const SectorPieChart: React.FC = () => {
  const [sectorData, setSectorData] = useState<ChartData[]>([]);
  const [startYear, setStartYear] = useState<number>(2001);
  const [endYear, setEndYear] = useState<number>(2021);
  const [type, setType] = useState("all");
  const [region, setRegion] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearList = Array.from(
      { length: currentYear - 2000 },
      (_, i) => 2001 + i
    );
    setYears(yearList);
  }, []);

  const fetchData = useCallback(async () => {
    setError(null);

    if (startYear >= endYear) {
      setError("Start year must be less than End year.");
      return;
    }

    try {
      const requestData = {
        type,
        startYear,
        endYear,
        region,
      };
      console.log("Sending request with data:", requestData);

      const response = await axios.post<ApiResponse>(
        "http://192.168.1.59:9000/api/deals_graph/",
        requestData
      );

      transformSectorData(response.data);
      console.log("API Response:", response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      // if (axios.isAxiosError(error) && error.response) {
      //   console.error("Response data:", error.response.data);
      //   console.error("Response status:", error.response.status);
      //   console.error("Response headers:", error.response.headers);
      // }
      setError("Failed to fetch data. Please try again later.");
    }
  }, [startYear, endYear, type, region]);

  const transformSectorData = (apiData: ApiResponse) => {
    const sectorData: Record<string, number> = {};

    Object.keys(apiData).forEach((year) => {
      const yearData = apiData[year];
      const categories = type === "all" ? ["FO", "IPO"] : [type];

      categories.forEach((category) => {
        const categoryData = yearData[category as keyof typeof yearData];
        if (categoryData) {
          const regions = region === "all" ? ["US", "International"] : [region];

          regions.forEach((regionKey) => {
            const regionData = categoryData[regionKey as keyof typeof categoryData];
            if (regionData) {
              Object.entries(regionData).forEach(([sector, { count }]) => {
                sectorData[sector] = (sectorData[sector] || 0) + count;
              });
            }
          });
        }
      });
    });

    const transformedSectorData = Object.entries(sectorData).map(
      ([name, value]) => ({ name, value })
    );
    setSectorData(transformedSectorData);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Typography
        variant="h6"
        sx={{ color: "#002060", fontWeight: "bold", marginBottom: "20px" }}
      >
        Sector Distribution
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-around", mb: 3 }}>
        <FormControl variant="outlined" size="small">
          <InputLabel>Start Year</InputLabel>
          <Select
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            label="Start Year"
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small">
          <InputLabel>End Year</InputLabel>
          <Select
            value={endYear}
            onChange={(e) => setEndYear(Number(e.target.value))}
            label="End Year"
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small">
          <InputLabel>Type</InputLabel>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value)}
            label="Type"
          >
            <MenuItem value="IPO">IPO</MenuItem>
            <MenuItem value="FO">FO</MenuItem>
            <MenuItem value="all">All</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small">
          <InputLabel>Region</InputLabel>
          <Select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            label="Region"
          >
            <MenuItem value="US">US</MenuItem>
            <MenuItem value="International">International</MenuItem>
            <MenuItem value="all">All</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && <Typography color="error">{error}</Typography>}

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={sectorData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#82ca9d"
          >
            {sectorData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Container>
  );
};

export default SectorPieChart;
