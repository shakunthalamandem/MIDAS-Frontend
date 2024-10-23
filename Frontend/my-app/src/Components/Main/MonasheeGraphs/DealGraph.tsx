import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Container, Grid, Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";

// Mock data
const initialData = [
  { name: "2001", ipo: 3200, fo: 2500, us: false },
  { name: "2002", ipo: 2700, fo: 2400, us: true },
  { name: "2003", ipo: 3500, fo: 2900, us: false },
  { name: "2004", ipo: 3100, fo: 2100, us: true },
  { name: "2005", ipo: 2800, fo: 3000, us: false },
  { name: "2006", ipo: 4000, fo: 3300, us: true },
  { name: "2007", ipo: 3700, fo: 3600, us: false },
  { name: "2008", ipo: 2900, fo: 2200, us: true },
  { name: "2009", ipo: 2600, fo: 1800, us: false },
  { name: "2010", ipo: 3100, fo: 2400, us: true },
  { name: "2011", ipo: 3400, fo: 2600, us: true },
  { name: "2012", ipo: 3900, fo: 2800, us: false },
  { name: "2013", ipo: 3600, fo: 2900, us: true },
  { name: "2014", ipo: 3300, fo: 3000, us: false },
  { name: "2015", ipo: 4100, fo: 3200, us: true },
  { name: "2016", ipo: 3800, fo: 2700, us: false },
  { name: "2017", ipo: 3200, fo: 2300, us: true },
  { name: "2018", ipo: 2900, fo: 2400, us: false },
  { name: "2019", ipo: 3700, fo: 3000, us: true },
  { name: "2020", ipo: 4000, fo: 2400, us: true },
  { name: "2021", ipo: 3000, fo: 1398, us: false },
  { name: "2022", ipo: 2000, fo: 9800, us: true },
  { name: "2023", ipo: 2780, fo: 3908, us: true },
  { name: "2024", ipo: 1890, fo: 4800, us: false }
];

const DealGraph: React.FC = () => {
  const [type, setType] = useState("all"); // IPO, FO, All
  const [period, setPeriod] = useState("yearly"); // Year, Quarterly, Monthly
  const [region, setRegion] = useState("all"); // US, International, All

  // Function to filter data based on selected region
  const filterData = () => {
    let filteredData = initialData;

    // Filter by region
    if (region === "US") {
      filteredData = filteredData.filter((d) => d.us);
    } else if (region === "International") {
      filteredData = filteredData.filter((d) => !d.us);
    }

    return filteredData;
  };

  // Event handlers for dropdown selections
  const handleTypeChange = (event: SelectChangeEvent) => {
    setType(event.target.value);
  };

  const handlePeriodChange = (event: SelectChangeEvent) => {
    setPeriod(event.target.value);
  };

  const handleRegionChange = (event: SelectChangeEvent) => {
    setRegion(event.target.value);
  };

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Typography
        variant="h6"
        sx={{
          maxWidth: '600px',
          fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
          lineHeight: '1.6',
          marginBottom: '10px',
          color: '#002060',
          fontWeight: 'bold'
        }}
      >
        # Of Deals Graph
      </Typography>
      
      {/* Dropdowns Row */}
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Type</InputLabel>
            <Select value={type} onChange={handleTypeChange} label="Type">
              <MenuItem value="ipo">IPO</MenuItem>
              <MenuItem value="fo">FO</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Period</InputLabel>
            <Select value={period} onChange={handlePeriodChange} label="Period">
              <MenuItem value="yearly">Yearly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Region</InputLabel>
            <Select value={region} onChange={handleRegionChange} label="Region">
              <MenuItem value="US">US</MenuItem>
              <MenuItem value="International">International</MenuItem>
              <MenuItem value="all">All</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Bar Chart */}
      <Box sx={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filterData()}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {/* Stacked Bars for IPO and FO */}
            {type === "ipo" || type === "all" ? (
              <Bar dataKey="ipo" stackId="a" fill="#8884d8">
                <LabelList dataKey="ipo" position="inside" fill="white" />
              </Bar>
            ) : null}
            {type === "fo" || type === "all" ? (
              <Bar dataKey="fo" stackId="a" fill="#82ca9d">
                <LabelList dataKey="fo" position="inside" fill="white" />
              </Bar>
            ) : null}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Container>
  );
};

export default DealGraph;
