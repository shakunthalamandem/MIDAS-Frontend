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
  years: number[]; // Assuming the API returns an object with a years array
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


interface SectorPieChartProps {
  opportunity_value_on_abs_basis?: string;
  opportunity_value_ex?: string;
  deal_value?: string;
  deal_count?: string;
}

const SectorPieChart: React.FC<SectorPieChartProps> = ({ 
  opportunity_value_on_abs_basis = "false",
  opportunity_value_ex = "false",
  deal_value = "false",
  deal_count = "true",
}) => {
  const [sectorData, setSectorData] = useState<ChartData[]>([]);
  const [startYear, setStartYear] = useState<number >();
  const [endYear, setEndYear] = useState<number >(); // End year to be calculated based on start year
  const [type, setType] = useState<"IPO" | "FO" | "all">("all");
  const [region, setRegion] = useState<string  | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<number[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Fetch distinct years from API
  const fetchYears = useCallback(async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error('API URL is not defined in environment variables');
        }
      const response = await axios.get<YearResponse>(`${apiUrl}/api/distinct_years/`, 
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          }});
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
        year_range: [startYear, endYear],
        period: "yearly",
        region,
        opportunity_value_on_abs_basis,
        opportunity_value_ex,
        deal_value,
        deal_count,
      };
      const apiUrl = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error('API URL is not defined in environment variables');
        }

      const response = await axios.post<ApiResponse>(
        `${apiUrl}/api/deals_graph/`,
        requestData
      );

      const apiData = response.data;
      transformSectorData(apiData);
      extractRegions(apiData);

    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data. Please try again later.");
    }
  }, [startYear, endYear, type, region, opportunity_value_on_abs_basis, opportunity_value_ex, deal_value, deal_count]);

  const extractRegions = (apiData: ApiResponse) => {
    const allRegions = new Set<string>();

    // Iterate over each year
    Object.values(apiData).forEach((yearData) => {
        // Iterate over each category (FO, IPO, etc.)
        Object.values(yearData).forEach((categoryData) => {
            // Iterate through each region within the categoryData
            Object.keys(categoryData).forEach((region) => {
                if (region === "US" || region === "International") {
                    allRegions.add(region);
                }
            });
        });
    });

    setRegions(Array.from(allRegions));
};
 // Utility function to format numbers with units
 const formatNumberWithUnits = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1e12) return sign + (absValue / 1e12).toFixed(1) + "T"; // Trillion
  if (absValue >= 1e9) return sign + (absValue / 1e9).toFixed(1) + "B";   // Billion
  if (absValue >= 1e6) return sign + (absValue / 1e6).toFixed(1) + "M";   // Million
  // if (absValue >= 1e3) return sign + (absValue / 1e3).toFixed(1) + "K"; // Thousand
  return sign + absValue.toString();                                       // No unit
};

  const convertToNumber = (value: string): number => {
    if (value.endsWith("B")) {
      return parseFloat(value) * 1e9;
    } else if (value.endsWith("M")) {
      return parseFloat(value) * 1e6;
    } else if (value.endsWith("T")) {
      return parseFloat(value) * 1e12;
    } else {
      return parseFloat(value);
    }
  };
  const tooltipFormatter = (value: number) => formatNumberWithUnits(value);

 
  const transformSectorData = (apiData: ApiResponse) => {
    const aggregatedData: Record<string, number> = {};
  
    Object.values(apiData).forEach((yearData) => {
      const categories = type === "all" ? ["FO", "IPO"] : [type];
  
      categories.forEach((category) => {
        const categoryData = yearData[category as keyof typeof yearData];
        if (categoryData) {
          const regions = region === "all" ? ["US", "International"] : [region];
  
          regions.forEach((regionKey) => {
            const sectorData = categoryData[regionKey as keyof typeof categoryData];
            if (sectorData) {
              Object.entries(sectorData).forEach(([sector, data]) => {
                const value = 
                  opportunity_value_on_abs_basis === "true" && typeof data.opportunity_value_on_abs_basis === 'string'
                    ? convertToNumber(data.opportunity_value_on_abs_basis)
                  : opportunity_value_ex === "true" && typeof data.opportunity_value_ex === 'string'
                    ? convertToNumber(data.opportunity_value_ex)
                  : deal_value === "true" && typeof data.deal_value === 'string'
                    ? convertToNumber(data.deal_value)
                  : deal_count === "true"
                    ? data.count
                  : 0;
  
                aggregatedData[sector] = (aggregatedData[sector] || 0) + value;
              });
            }
          });
        }
      });
    });
  
    const transformedData = Object.entries(aggregatedData).map(([name, value]) => ({ name, value }));
    setSectorData(transformedData);
  };
  
  useEffect(() => {
    fetchYears(); // Fetch years on component mount
  }, [fetchYears]);

  useEffect(() => {
    if (startYear) {
      setEndYear(startYear + 1);
    }
  }, [startYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData, startYear, endYear, type, region, opportunity_value_on_abs_basis, opportunity_value_ex, deal_value, deal_count]);

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
            label={({ value }) => formatNumberWithUnits(value)} // Format label
          >
            {sectorData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={tooltipFormatter} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Container>
  );
};

export default SectorPieChart;
