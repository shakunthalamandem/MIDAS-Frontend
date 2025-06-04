import React from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";
import SectorwiseTable from "./SectorwiseTable";
import QuarterlyDealsTable from "./QuarterlyDealsTable";
import RegionWiseTable from "./RegionWiseTable";
import NumerSummary from "./NumerSummary";

const EquityDashboard = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3, backgroundColor: "#f5faff", mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ color: "#002060", fontWeight: "bold", mb: 1 }}
        >
          📊 Equity Markets Deep Dive – Deal Trends & Insights
        </Typography>
        <Typography variant="body2" sx={{ color: "#000000"}}>
          This dashboard provides a comprehensive view of equity deal activity across various dimensions time, geography, and sector. 
          It summarizes key indicators such as deal count, total volume, opportunity value, and excess returns. 
          Use this tab to understand market performance dynamics, evaluate emerging patterns, and uncover regional or sectoral strengths based on 2025 activity and year-on-year quarterly trends.
        </Typography>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <NumerSummary />
        </Grid>

        <Grid item xs={12} md={6}>
          <QuarterlyDealsTable />
        </Grid>

        <Grid item xs={12} md={6}>
          <RegionWiseTable />
        </Grid>

        <Grid item xs={12}>
          <SectorwiseTable />
        </Grid>
      </Grid>
    </Box>
  );
};

export default EquityDashboard;
