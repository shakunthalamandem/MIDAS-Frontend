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

interface RegionPieChartProps {
  initialData: ChartData[]; // New prop for initial data
}

const RegionPieChart: React.FC<RegionPieChartProps> = ({ initialData }) => {
  const [regionData, setRegionData] = useState<ChartData[]>(initialData);
  const [startYear, setStartYear] = useState<number>();
  const [endYear, setEndYear] = useState<number>(); // Set end year as undefined initially
  const [type, setType] = useState<"IPO" | "FO" | "all">("all");
  const [sector, setSector] = useState<string | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<number[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Fetch distinct years from API
  const fetchYears = useCallback(async () => {
    try {
      const response = await axios.get<YearResponse>("http://192.168.1.59:9000/api/distinct_years/");
      const yearList = response.data.years;
      setYears(yearList);
      if (yearList.length > 0) {
        // Filter out values that are true from the yearList
        const filteredYears = yearList
    
        if (filteredYears.length > 0) {
            setStartYear(filteredYears[0]); // Set start year to the first filtered year
    
            // Set end year to start year + 1
            const newEndYear = filteredYears[0] + 1;
            if (filteredYears[0] < newEndYear) { // Ensure startYear < endYear
                setEndYear(newEndYear);
            }
        }
    }
    
    
    } catch (error) {
      console.error("Error fetching years:", error);
      setError("Failed to fetch years. Please try again later.");
    }
  }, []);

  // Fetch the deal data based on selected years, type, and sector
  const fetchData = useCallback(async () => {
    setError(null);
    if (startYear === undefined || endYear === undefined) return; // Don't fetch if years are not set

    try {
      const requestData = {
        type,
        year_range: [startYear, endYear], // Ensure these are numbers
        period: "monthly",
        sector,
      };

      const response = await axios.post<ApiResponse>(
        "http://192.168.1.59:9000/api/deals_graph/",
        requestData
      );

      const apiData = response.data;
      transformRegionData(apiData);
      extractSectors(apiData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again later.");
    }
  }, [startYear, endYear, type, sector]);

  const extractSectors = (apiData: ApiResponse) => {
    const allSectors = new Set<string>();

    Object.values(apiData).forEach((yearData) => {
      Object.values(yearData).forEach((categoryData) => {
        ["US", "International"].forEach((region) => {
          const regionData = categoryData[region as keyof typeof categoryData];
          if (regionData) {
            Object.keys(regionData).forEach((sector) => allSectors.add(sector));
          }
        });
      });
    });

    setSectors(Array.from(allSectors));
  };

  const transformRegionData = (apiData: ApiResponse) => {
    const aggregatedData: Record<string, number> = {};

    Object.values(apiData).forEach((yearData) => {
      const categories = type === "all" ? ["FO", "IPO"] : [type];

      categories.forEach((category) => {
        const categoryData = yearData[category as keyof typeof yearData];
        if (categoryData) {
          const regions = ["US", "International"];

          regions.forEach((region) => {
            const regionData = categoryData[region as keyof typeof categoryData];
            if (regionData) {
              Object.entries(regionData).forEach(([sectorName, { count }]) => {
                if (sector === "all" || sector === sectorName) {
                  aggregatedData[region] = (aggregatedData[region] || 0) + count;
                }
              });
            }
          });
        }
      });
    });

    const transformedData = Object.entries(aggregatedData).map(
      ([name, value]) => ({ name, value })
    );
    setRegionData(transformedData);
  };

  useEffect(() => {
    fetchYears(); // Fetch years on component mount
  }, [fetchYears]);

  useEffect(() => {
    if (startYear) {
      setEndYear(startYear + 1); // Set end year to start year + 1 whenever start year changes
    }
  }, [startYear]);

  useEffect(() => {
    fetchData(); // Fetch data when the year, type, or sector changes
  }, [fetchData]);

  const onPieEnter = (_: any, index: number) => setActiveIndex(index);

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Typography
        variant="h6"
        sx={{ color: "#002060", fontWeight: "bold", marginBottom: "30px" }}
      >
        Region Distribution
      </Typography>

      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 100, bgcolor: "#e8f5e9" }}>
          <InputLabel>Start Year</InputLabel>
          <Select
            value={startYear || ""}
            onChange={(e) => setStartYear(Number(e.target.value))}
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
          <InputLabel>Sector</InputLabel>
          <Select
            value={sector}
            onChange={(e) => setSector(e.target.value as string | "all")}
            label="Sector"
            MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
          >
            <MenuItem value="all">All</MenuItem>
            {sectors.map((sec) => (
              <MenuItem key={sec} value={sec}>
                {sec}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && <Typography color="error">{error}</Typography>}

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            data={regionData}
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
            {regionData.map((entry, index) => (
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

export default RegionPieChart;
