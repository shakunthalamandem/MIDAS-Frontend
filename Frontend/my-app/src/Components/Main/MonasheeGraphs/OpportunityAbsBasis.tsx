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
import DealPieChart from "./MonasheePieCharts/DealPieChart";

interface ApiResponse {
  [key: string]: {
    FO: {
      US: { [sector: string]: { opportunity_value_on_abs_basis: number } };
      International: { [sector: string]: { opportunity_value_on_abs_basis: number } };
    };
    IPO: {
      US: { [sector: string]: { opportunity_value_on_abs_basis: number } };
      International: { [sector: string]: { opportunity_value_on_abs_basis: number } };
    };
  };
}

interface ChartData {
  name: string;
  IPO?: number;
  FO?: number;
  total?: number;
}

interface PieChartData {
  name: string;
  value: number;
}

interface DealPieChartData {
  sectorData: PieChartData[];
  regionData: PieChartData[];
}

const OpportunityAbsBasis: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [pieChartData, setPieChartData] = useState<DealPieChartData>({
    sectorData: [],
    regionData: [],
  });
  const [type, setType] = useState("all");
  const [period, setPeriod] = useState("yearly");
  const [region, setRegion] = useState("all");
  const [sector, setSector] = useState("all");
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const response = await axios.post<ApiResponse>("http://192.168.1.59:9000/api/deals_graph/", {
        period,
        opportunity_value_on_abs_basis: "true",
      });
      console.log(response.data);

      // Collect unique sectors
      const sectors = new Set<string>();
      Object.values(response.data).forEach((deal) => {
        (["FO", "IPO"] as const).forEach((category) => {
          (["US", "International"] as const).forEach((regionKey) => {
            Object.keys(deal[category][regionKey] || {}).forEach((sec) => sectors.add(sec));
          });
        });
      });

      setSectorOptions(Array.from(sectors));
      setData(transformData(response.data));
      setPieChartData(transformPieChartData(response.data)); // Set the pie chart data
    } catch (error) {
      console.error("Error fetching data from API:", error);
    }
  };

  const transformData = (apiData: ApiResponse): ChartData[] => {
    return Object.keys(apiData).map((key) => {
      const ipoData = apiData[key].IPO;
      const foData = apiData[key].FO;

      const filterBySector = (regionData: Record<string, { opportunity_value_on_abs_basis: number }>) =>
        Object.entries(regionData || {})
          .filter(([sect]) => sector === "all" || sect === sector)
          .reduce((sum, [, { opportunity_value_on_abs_basis }]) => sum + opportunity_value_on_abs_basis, 0);

      const ipoUS = filterBySector(ipoData.US);
      const ipoInternational = filterBySector(ipoData.International);
      const foUS = filterBySector(foData.US);
      const foInternational = filterBySector(foData.International);

      const combinedIPO = region === "all" ? ipoUS + ipoInternational : region === "US" ? ipoUS : ipoInternational;
      const combinedFO = region === "all" ? foUS + foInternational : region === "US" ? foUS : foInternational;

      const totalDeals = combinedIPO + combinedFO;

      return {
        name: key,
        IPO: combinedIPO / 1e9, // Convert to billions
        FO: combinedFO / 1e9, // Convert to billions
        total: totalDeals / 1e9, // Convert to billions
      };
    });
  };

  const transformPieChartData = (apiData: ApiResponse): DealPieChartData => {
    const sectorDataMap: Record<string, number> = {};
    const regionDataMap: Record<string, number> = {};

    Object.values(apiData).forEach((deal) => {
      (["FO", "IPO"] as const).forEach((category) => {
        (["US", "International"] as const).forEach((regionKey) => {
          Object.entries(deal[category][regionKey] || {}).forEach(([sector, { opportunity_value_on_abs_basis }]) => {
            // Accumulate sector data
            sectorDataMap[sector] = (sectorDataMap[sector] || 0) + opportunity_value_on_abs_basis;

            // Accumulate region data
            const regionKeyCount = regionKey === "US" ? "US" : "International";
            regionDataMap[regionKeyCount] = (regionDataMap[regionKeyCount] || 0) + opportunity_value_on_abs_basis;
          });
        });
      });
    });

    const sectorData = Object.entries(sectorDataMap).map(([name, value]) => ({ name, value: value / 1e9 })); // Convert to billions
    const regionData = Object.entries(regionDataMap).map(([name, value]) => ({ name, value: value / 1e9 })); // Convert to billions

    return { sectorData, regionData };
  };

  useEffect(() => {
    fetchData();
  }, [type, period, region, sector]);

  const handleTypeChange = (event: SelectChangeEvent) => setType(event.target.value);
  const handlePeriodChange = (event: SelectChangeEvent) => setPeriod(event.target.value);
  const handleRegionChange = (event: SelectChangeEvent) => setRegion(event.target.value);
  const handleSectorChange = (event: SelectChangeEvent) => setSector(event.target.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, IPO, FO, total } = payload[0].payload;
      return (
        <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '10px' }}>
          <h4>{name}</h4>
          {type === "ipo" || type === "all" ? <p>IPO: {IPO.toFixed(2)}B</p> : null}
          {type === "fo" || type === "all" ? <p>FO: {FO.toFixed(2)}B</p> : null}
          <p>Total Deals: {total.toFixed(2)}B</p>
        </div>
      );
    }
    return null;
  };

  const formatYAxisTick = (value: number) => {
    return `${value.toFixed(0)}B`; // Format Y-axis tick values in billions
  };

  return (
    <>
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
          Opportunity Value on Abs Basis
        </Typography>

        <Grid container spacing={2} sx={{ justifyContent: "flex-start", paddingLeft: '50px', marginBottom: '10px' }}>
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth variant="outlined" size="small" sx={{ maxWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select value={type} onChange={handleTypeChange} label="Type">
                <MenuItem value="ipo">IPO</MenuItem>
                <MenuItem value="fo">FO</MenuItem>
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth variant="outlined" size="small" sx={{ maxWidth: 150 }}>
              <InputLabel>Period</InputLabel>
              <Select value={period} onChange={handlePeriodChange} label="Period">
                <MenuItem value="yearly">Yearly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth variant="outlined" size="small" sx={{ maxWidth: 150 }}>
              <InputLabel>Region</InputLabel>
              <Select value={region} onChange={handleRegionChange} label="Region">
                <MenuItem value="US">US</MenuItem>
                <MenuItem value="International">International</MenuItem>
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth variant="outlined" size="small" sx={{ minWidth: 250 }}>
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
              <YAxis tickFormatter={formatYAxisTick} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {type === "ipo" || type === "all" ? (
                <Bar dataKey="IPO" stackId="a" fill="#8884d8" name="IPO" />
              ) : null}
              {type === "fo" || type === "all" ? (
                <Bar dataKey="FO" stackId="a" fill="#82ca9d" name="FO" />
              ) : null}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Container>
      <DealPieChart opportunity_value_on_abs_basis = {"true"} /> {/* Pass the pie chart data here */}
    </>
  );
};

export default OpportunityAbsBasis;
