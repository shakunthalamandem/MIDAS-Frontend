import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Legend } from "recharts";
import {
  Container,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";

interface ChartData {
  name: string;
  value: number;
}

interface ApiResponse {
  [year: string]: {
    FO: { US: Record<string, { count: number }>; International: Record<string, { count: number }> };
    IPO: { US: Record<string, { count: number }>; International: Record<string, { count: number }> };
  };
}

const COLORS = ["#0088FE", "#00C49F"];

const RegionPieChart: React.FC = () => {
  const [regionData, setRegionData] = useState<ChartData[]>([]);
  const [type, setType] = useState("all");
  const [startYear, setStartYear] = useState("2020");
  const [endYear, setEndYear] = useState("2023");
  const [sector, setSector] = useState("all");

  const fetchData = async () => {
    try {
      const response = await axios.post<ApiResponse>("http://192.168.1.59:9000/api/deals_graph/", {
        type,
        startYear,
        endYear,
        sector,
      });
      transformRegionData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const transformRegionData = (apiData: ApiResponse) => {
    const regionData = { US: 0, International: 0 };

    const years = Object.keys(apiData)
      .map(Number)
      .filter((year) => year >= parseInt(startYear) && year <= parseInt(endYear));

    years.forEach((year) => {
      const yearData = apiData[year as keyof ApiResponse];
      (type === "all" ? ["FO", "IPO"] : [type]).forEach((category) => {
        const categoryData = yearData[category as keyof typeof yearData];
        if (categoryData) {
          ["US", "International"].forEach((regionKey) => {
            const regionCounts = categoryData[regionKey as keyof typeof categoryData];
            if (regionCounts) {
              Object.entries(regionCounts).forEach(([sec, { count }]) => {
                if (sector === "all" || sec === sector) {
                  regionData[regionKey as keyof typeof regionData] += count;
                }
              });
            }
          });
        }
      });
    });

    setRegionData([
      { name: "US", value: regionData.US },
      { name: "International", value: regionData.International },
    ]);
  };

  useEffect(() => {
    fetchData();
  }, [type, startYear, endYear, sector]);

  return (
    <Container maxWidth="sm">
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Region Distribution
      </Typography>
      <Grid container spacing={2} sx={{ marginBottom: 3 }}>
        <Grid item xs={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select value={type} onChange={(e) => setType(e.target.value)} label="Type">
              <MenuItem value="ipo">IPO</MenuItem>
              <MenuItem value="fo">FO</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Start Year</InputLabel>
            <Select value={startYear} onChange={(e) => setStartYear(e.target.value)} label="Start Year">
              <MenuItem value="2020">2020</MenuItem>
              <MenuItem value="2021">2021</MenuItem>
              <MenuItem value="2022">2022</MenuItem>
              <MenuItem value="2023">2023</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth size="small">
            <InputLabel>End Year</InputLabel>
            <Select value={endYear} onChange={(e) => setEndYear(e.target.value)} label="End Year">
              <MenuItem value="2020">2020</MenuItem>
              <MenuItem value="2021">2021</MenuItem>
              <MenuItem value="2022">2022</MenuItem>
              <MenuItem value="2023">2023</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie data={regionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
            {regionData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
