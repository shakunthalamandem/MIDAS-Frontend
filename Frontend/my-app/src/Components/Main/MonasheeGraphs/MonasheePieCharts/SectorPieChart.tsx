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
  const [type, setType] = useState<"IPO" | "FO" | "all">("all");
  const [region, setRegion] = useState<"US" | "International" | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<number[]>([]);

  const fetchData = useCallback(async () => {
    setError(null);

    try {
      const requestData = {
        type,
        year_range: [startYear, endYear],
        period: "monthly",
        region,
      };
      console.log("Sending request with data:", requestData);

      const response = await axios.post<ApiResponse>(
        "http://192.168.1.59:9000/api/deals_graph/",
        requestData
      );

      const apiData = response.data;
      transformSectorData(apiData);
      extractYears(apiData);
      console.log("API Response:", apiData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again later.");
    }
  }, [startYear, endYear, type, region]);

  const extractYears = (apiData: ApiResponse) => {
    const yearList = Object.keys(apiData)
      .map(year => parseInt(year))
      .sort((a, b) => a - b);

    setYears(yearList);
    if (yearList.length > 0) {
      setStartYear(yearList[0]);
      setEndYear(yearList[yearList.length - 1]);
    }
  };

  const transformSectorData = (apiData: ApiResponse) => {
    const aggregatedData: Record<string, number> = {};

    Object.values(apiData).forEach((yearData) => {
      const categories = type === "all" ? ["FO", "IPO"] : [type];

      categories.forEach((category) => {
        const categoryData = yearData[category as keyof typeof yearData];
        if (categoryData) {
          const regions = region === "all" ? ["US", "International"] : [region];

          regions.forEach((regionKey) => {
            const regionData = categoryData[regionKey as keyof typeof categoryData];
            if (regionData) {
              Object.entries(regionData).forEach(([sector, { count }]) => {
                aggregatedData[sector] = (aggregatedData[sector] || 0) + count;
              });
            }
          });
        }
      });
    });

    const transformedData = Object.entries(aggregatedData).map(
      ([name, value]) => ({ name, value })
    );
    setSectorData(transformedData);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Typography
        variant="h6"
        sx={{ color: "#002060", fontWeight: "bold", marginBottom: "30px" }}
      >
        Sector Distribution
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-around", mb: 1 }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 100, bgcolor: "#ffebee", marginRight: 1 }}>
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

        <FormControl variant="outlined" size="small" sx={{ minWidth: 100, bgcolor: "#e3f2fd", marginRight: 1 }}>
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

        <FormControl variant="outlined" size="small" sx={{ minWidth: 120, bgcolor: "#e8f5e9", marginRight: 1 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as "IPO" | "FO" | "all")}
            label="Type"
          >
            <MenuItem value="IPO">IPO</MenuItem>
            <MenuItem value="FO">FO</MenuItem>
            <MenuItem value="all">All</MenuItem>
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small" sx={{ minWidth: 220, bgcolor: "#fff3e0" }}>
          <InputLabel>Region</InputLabel>
          <Select
            value={region}
            onChange={(e) => setRegion(e.target.value as "US" | "International" | "all")}
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
            labelLine={true} // Enable lines to labels
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`} // Show only percentage
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
