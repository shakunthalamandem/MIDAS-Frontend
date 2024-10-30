import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, Legend } from "recharts";
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

interface ApiResponse {
  [key: string]: {
    FO: { US: Record<string, { count: number }>; International: Record<string, { count: number }> };
    IPO: { US: Record<string, { count: number }>; International: Record<string, { count: number }> };
  };
}

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const DealPieChart: React.FC = () => {
  const [regionData, setRegionData] = useState<ChartData[]>([]);
  const [sectorData, setSectorData] = useState<ChartData[]>([]);
  const [type, setType] = useState("all");
  const [period, setPeriod] = useState("yearly");
  const [region, setRegion] = useState("all");
  const [sector, setSector] = useState("all");
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const response = await axios.post<ApiResponse>("http://192.168.1.59:9000/api/deals_graph/", {
        type,
        period,
        region,
      });

      // Collect unique sectors from the API data for the sector filter
      const sectors = new Set<string>();
      Object.values(response.data).forEach((deal) => {
        (["FO", "IPO"] as const).forEach((category) => {
          (["US", "International"] as const).forEach((regionKey) => {
            Object.keys(deal[category][regionKey] || {}).forEach((sec) => sectors.add(sec));
          });
        });
      });
      setSectorOptions(Array.from(sectors));

      transformRegionData(response.data);
      transformSectorData(response.data);
    } catch (error) {
      console.error("Error fetching data from API:", error);
    }
  };

  const transformRegionData = (apiData: ApiResponse) => {
    const regionData: { US: number; International: number } = { US: 0, International: 0 };

    Object.values(apiData).forEach((deal) => {
      (["FO", "IPO"] as const).forEach((category) => {
        Object.entries(deal[category].US || {}).forEach(([, { count }]) => {
          regionData.US += count;
        });
        Object.entries(deal[category].International || {}).forEach(([, { count }]) => {
          regionData.International += count;
        });
      });
    });

    setRegionData([
      { name: "US", value: regionData.US },
      { name: "International", value: regionData.International },
    ]);
  };

  const transformSectorData = (apiData: ApiResponse) => {
    const sectorData: Record<string, number> = {};

    Object.values(apiData).forEach((deal) => {
      (["FO", "IPO"] as const).forEach((category) => {
        (["US", "International"] as const).forEach((regionKey) => {
          Object.entries(deal[category][regionKey] || {}).forEach(([sec, { count }]) => {
            if (sector === "all" || sec === sector) {
              sectorData[sec] = (sectorData[sec] || 0) + count;
            }
          });
        });
      });
    });

    const transformedSectorData = Object.entries(sectorData).map(([name, value]) => ({ name, value }));
    setSectorData(transformedSectorData);
  };

  useEffect(() => {
    fetchData();
  }, [type, period, region, sector]);

  const handleTypeChange = (event: SelectChangeEvent) => setType(event.target.value);
  const handlePeriodChange = (event: SelectChangeEvent) => setPeriod(event.target.value);
  const handleRegionChange = (event: SelectChangeEvent) => setRegion(event.target.value);
  const handleSectorChange = (event: SelectChangeEvent) => setSector(event.target.value);

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Typography variant="h6" sx={{ color: "#002060", fontWeight: "bold", marginBottom: "20px" }}>
        Deals Distribution
      </Typography>

      <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Type</InputLabel>
            <Select value={type} onChange={handleTypeChange} label="Type">
              <MenuItem value="ipo">IPO</MenuItem>
              <MenuItem value="fo">FO</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Period</InputLabel>
            <Select value={period} onChange={handlePeriodChange} label="Period">
              <MenuItem value="yearly">Yearly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Region</InputLabel>
            <Select value={region} onChange={handleRegionChange} label="Region">
              <MenuItem value="US">US</MenuItem>
              <MenuItem value="International">International</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Sector</InputLabel>
            <Select value={sector} onChange={handleSectorChange} label="Sector">
              <MenuItem value="all">All</MenuItem>
              {sectorOptions.map((sectorName) => (
                <MenuItem key={sectorName} value={sectorName}>
                  {sectorName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "space-around", width: "100%" }}>
        <ResponsiveContainer width="45%" height={400}>
          <PieChart>
            <Pie data={regionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
              {regionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="45%" height={400}>
          <PieChart>
            <Pie data={sectorData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#82ca9d">
              {sectorData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Container>
  );
};

export default DealPieChart;
