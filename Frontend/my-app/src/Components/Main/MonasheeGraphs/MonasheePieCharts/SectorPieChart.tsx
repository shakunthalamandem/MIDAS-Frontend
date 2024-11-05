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

interface YearResponse {
  years: number[]; // Assuming the API returns an object with a years array
}

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface SectorPieChartProps {
  initialData: ChartData[]; // New prop for initial data
}

const SectorPieChart: React.FC<SectorPieChartProps> = ({ initialData }) => {
  const [sectorData, setSectorData] = useState<ChartData[]>(initialData);
  const [startYear, setStartYear] = useState<number | undefined>();
  const [endYear, setEndYear] = useState<number | undefined>(); // End year to be calculated based on start year
  const [type, setType] = useState<"IPO" | "FO" | "all">("all");
  const [region, setRegion] = useState<"US" | "International" | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<number[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Fetch distinct years from API
  const fetchYears = useCallback(async () => {
    try {
      const response = await axios.get<YearResponse>("http://192.168.1.59:9000/api/distinct_years/");
      const yearList = response.data.years.sort((a, b) => a - b);
      setYears(yearList);
      if (yearList.length > 0) {
        setStartYear(yearList[0]);
        setEndYear(yearList[0] + 1); // Set default end year as start year + 1
      }
    } catch (error) {
      console.error("Error fetching years:", error);
      setError("Failed to fetch years. Please try again later.");
    }
  }, []);

  // Fetch data based on selected years, type, and region
  const fetchData = useCallback(async () => {
    setError(null);
    if (startYear === undefined || endYear === undefined) return; // Don't fetch if years are not set

    try {
      const requestData = {
        type,
        year_range: [startYear, endYear], // Ensure these are numbers
        period: "monthly",
        region,
      };

      const response = await axios.post<ApiResponse>(
        "http://192.168.1.59:9000/api/deals_graph/",
        requestData
      );

      const apiData = response.data;
      transformSectorData(apiData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again later.");
    }
  }, [startYear, endYear, type, region]);

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
    fetchYears(); // Fetch years on component mount
  }, [fetchYears]);

  useEffect(() => {
    fetchData(); // Fetch data when the year, type, or region changes
  }, [fetchData]);

  const onPieEnter = (_: any, index: number) => setActiveIndex(index);

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Typography
        variant="h6"
        sx={{ color: "#002060", fontWeight: "bold", marginBottom: "30px" }}
      >
        Sector Distribution
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 100, bgcolor: "#e8f5e9" }}>
          <InputLabel>Start Year</InputLabel>
          <Select
            value={startYear || ""}
            onChange={(e) => {
              const newStartYear = Number(e.target.value);
              setStartYear(newStartYear);
              setEndYear(newStartYear + 1); // Update end year when start year changes
            }}
            label="Start Year"
            MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small" sx={{ minWidth: 100, bgcolor: "#ffebee" }}>
          <InputLabel>End Year</InputLabel>
          <Select
            value={endYear || ""}
            onChange={(e) => setEndYear(Number(e.target.value))}
            label="End Year"
            MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="small" sx={{ minWidth: 120, bgcolor: "#e3f2fd" }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as "IPO" | "FO" | "all")}
            label="Type"
            MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
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
            activeIndex={activeIndex}
            data={sectorData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#82ca9d"
            onMouseEnter={onPieEnter}
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
