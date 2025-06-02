import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import SectorwiseTable from './SectorwiseTable';
import QuarterlyDealsTable from './QuarterlyDealsTable';
import RegionWiseTable from './RegionWiseTable';
import NumerSummary from './NumerSummary';
import AiDashboard from './AiDashboard';

const EquityDashboard = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        
        {/* First Row: Single full-width component */}
        <Grid item xs={12}>
            <NumerSummary />
        </Grid>

        {/* Second Row: Two components side by side */}
        <Grid item xs={12} md={6}>
            <QuarterlyDealsTable />
        </Grid>
        <Grid item xs={12} md={6}>
            <RegionWiseTable />
        </Grid>

        {/* Third Row: Single full-width component */}
        <Grid item xs={12}>
            <SectorwiseTable />
        </Grid>

      
             
      </Grid>
    </Box>
  );
};

export default EquityDashboard;
