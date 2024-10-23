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

// Mock data with number of deals (instead of volume)
const initialData = [
    { name: "2001", ipoDeals: 4, foDeals: 5, us: true },
    { name: "2002", ipoDeals: 6, foDeals: 7, us: false },
    { name: "2003", ipoDeals: 3, foDeals: 6, us: true },
    { name: "2004", ipoDeals: 5, foDeals: 4, us: false },
    { name: "2005", ipoDeals: 7, foDeals: 8, us: true },
    { name: "2006", ipoDeals: 9, foDeals: 6, us: false },
    { name: "2007", ipoDeals: 5, foDeals: 9, us: true },
    { name: "2008", ipoDeals: 6, foDeals: 7, us: false },
    { name: "2009", ipoDeals: 3, foDeals: 8, us: true },
    { name: "2010", ipoDeals: 7, foDeals: 5, us: true },
    { name: "2011", ipoDeals: 4, foDeals: 6, us: false },
    { name: "2012", ipoDeals: 8, foDeals: 9, us: true },
    { name: "2013", ipoDeals: 6, foDeals: 4, us: false },
    { name: "2014", ipoDeals: 5, foDeals: 7, us: true },
    { name: "2015", ipoDeals: 9, foDeals: 6, us: false },
    { name: "2016", ipoDeals: 3, foDeals: 8, us: true },
    { name: "2017", ipoDeals: 7, foDeals: 5, us: false },
    { name: "2018", ipoDeals: 6, foDeals: 9, us: true },
    { name: "2019", ipoDeals: 8, foDeals: 7, us: false },
    { name: "2020", ipoDeals: 5, foDeals: 8, us: true },
    { name: "2021", ipoDeals: 7, foDeals: 6, us: false },
    { name: "2022", ipoDeals: 3, foDeals: 9, us: true },
    { name: "2023", ipoDeals: 6, foDeals: 4, us: true },
    { name: "2024", ipoDeals: 4, foDeals: 10, us: false }
];

const OpportunityMain: React.FC = () => {
  const [type, setType] = useState("all"); // IPO, FO, All
  const [period, setPeriod] = useState("yearly"); // Year, Quarterly, Monthly
  const [region, setRegion] = useState("all"); // US, International, All

  // Function to handle filtering and formatting
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
          fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' }, // Responsive text size
          lineHeight: '1.6',
          marginBottom:'10px',
          color:'#002060',
          fontWeight:'bold'
        }}
      >
        Opportunity Value based Graph 
      </Typography>
      {/* Dropdowns Row */}
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={12} sm={4} md={3}>
          {/* Type Combo */}
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
          {/* Period Combo */}
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
          {/* Region Combo */}
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
            {/* Stacked Bars for IPO and FO Deals */}
            {type === "ipo" || type === "all" ? (
              <Bar dataKey="ipoDeals" stackId="a" fill="#8884d8">
                <LabelList dataKey="ipoDeals" position="inside" fill="white" />
              </Bar>
            ) : null}
            {type === "fo" || type === "all" ? (
              <Bar dataKey="foDeals" stackId="a" fill="#82ca9d">
                <LabelList dataKey="foDeals" position="inside" fill="white" />
              </Bar>
            ) : null}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Container>
  );
};

export default OpportunityMain;
