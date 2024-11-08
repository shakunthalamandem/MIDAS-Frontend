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
    FO: { US: { [sector: string]: Record<string, number> }; International: { [sector: string]: Record<string, number> } };
    IPO: { US: { [sector: string]: Record<string, number> }; International: { [sector: string]: Record<string, number> } };
  };
}

interface YearResponse {
  years: number[];
}

interface ChartData {
  name: string;
  value: number;
}

const COLORS = [
  "#0A4D91", // Dark Blue
  "#006F3D", // Dark Green
  "#E59400", // Mustard Yellow
  "#D45D26", // Dark Orange
  "#B84C38", // Dark Coral
  "#80A9C2", // Steel Blue
  "#9B59B6", // Dark Purple
  "#5A8D31", // Dark Lime Green
  "#D68F00", // Dark Gold
  "#D5006A", // Fuchsia Pink
  "#6A3D9A", // Deep Purple
  "#145A32", // Dark Emerald Green
  "#C0392B", // Dark Red
  "#2980B9", // Bright Blue
  "#16A085", // Deep Turquoise
];


interface RegionPieChartProps {
  opportunity_value_on_abs_basis?: string;
  opportunity_value_ex?: string;
  deal_value?: string;
  deal_count?: string;
}

const RegionPieChart: React.FC<RegionPieChartProps> = ({
  opportunity_value_on_abs_basis = "false",
  opportunity_value_ex = "false",
  deal_value = "false",
  deal_count = "true",
}) => {
  const [regionData, setRegionData] = useState<ChartData[]>([]);
  const [startYear, setStartYear] = useState<number>();
  const [endYear, setEndYear] = useState<number>();
  const [type, setType] = useState<"IPO" | "FO" | "all">("all");
  const [sector, setSector] = useState<string | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<number[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const fetchYears = useCallback(async () => {
    try {
      const response = await axios.get<YearResponse>("http://192.168.1.59:9000/api/distinct_years/");
      const yearList = response.data.years;
      setYears(yearList);
      if (yearList.length > 0) {
        setStartYear(yearList[0]);
        setEndYear(yearList[0] + 1);
      }
    } catch (error) {
      console.error("Error fetching years:", error);
      setError("Failed to fetch years. Please try again later.");
    }
  }, []);

  const fetchData = useCallback(async () => {
    setError(null);
    if (startYear === undefined || endYear === undefined) return;

    try {
      const requestData = {
        type,
        year_range: [startYear, endYear],
        period: "yearly",
        sector,
        opportunity_value_on_abs_basis,
        opportunity_value_ex,
        deal_value,
        deal_count,
      };

      const response = await axios.post<ApiResponse>("http://192.168.1.59:9000/api/deals_graph/", requestData);

      const apiData = response.data;
      transformRegionData(apiData);
      extractSectors(apiData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again later.");
    }
  }, [startYear, endYear, type, sector, opportunity_value_on_abs_basis, opportunity_value_ex, deal_value, deal_count]);

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
              Object.entries(regionData).forEach(([sectorName, data]) => {
                if (sector === "all" || sector === sectorName) {
                  const value = 
                    opportunity_value_on_abs_basis === "true" ? data.opportunity_value_on_abs_basis :
                    opportunity_value_ex === "true" ? data.opportunity_value_ex :
                    deal_value === "true" ? data.deal_value :
                    deal_count === "true" ? data.count : 0;
                    
                  aggregatedData[region] = (aggregatedData[region] || 0) + value;
                }
              });
            }
          });
        }
      });
    });

    const transformedData = Object.entries(aggregatedData).map(([name, value]) => ({ name, value }));
    setRegionData(transformedData);
  };

  useEffect(() => {
    fetchYears();
  }, [fetchYears]);

  useEffect(() => {
    if (startYear) {
      setEndYear(startYear + 1);
    }
  }, [startYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData, startYear, endYear, type, sector, opportunity_value_on_abs_basis, opportunity_value_ex, deal_value, deal_count]);

  const onPieEnter = (_: any, index: number) => setActiveIndex(index);

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Typography variant="h6" sx={{ color: "#002060", fontWeight: "bold", marginBottom: "30px" }}>
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
    {years
      .slice() // create a copy to avoid mutating the original array
      .sort((a, b) => a - b) // sort in ascending order
      .map((year) => (
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
    {years
      .slice() // create a copy to avoid mutating the original array
      .sort((a, b) => a - b) // sort in ascending order
      .filter((year) => year >= (startYear || years[0])) // only years >= startYear
      .map((year) => (
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
            labelLine={true}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
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
