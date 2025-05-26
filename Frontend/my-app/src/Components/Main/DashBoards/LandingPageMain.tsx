import React from 'react';
import { Grid, Box, Paper } from '@mui/material';
import EquityDashboard from './Equity/EquityDashboard';
import InsightsMain from './InsightsAi/InsightsMain';
import MDDDashboardMain from './MonasheeMDD/MDDDashboardMain';
import NumerSummary from './Equity/NumerSummary';
import QuarterlyDealsTable from './Equity/QuarterlyDealsTable';
import RegionWiseTable from './Equity/RegionWiseTable';
import SectorwiseTable from './Equity/SectorwiseTable';


const LandingPageMain: React.FC = () => {
  return (
    <Grid container height="100vh">
      {/* Left side: 75% */}
      <Grid item xs={9} p={2} sx={{ overflowY: 'auto' }}>
      <Box sx={{  gap: 2, padding: 2 ,width:'80%'}}>
        <Box sx={{ flex: 1 }}>
          <NumerSummary />
          <QuarterlyDealsTable />
        </Box>
        <Box sx={{ flex: 1 }}>
          <RegionWiseTable />
        </Box>
      </Box>

      <Box sx={{ padding: 2 }}>
        <SectorwiseTable />
        </Box>
      </Grid>

      {/* Right side: 25% */}
      <Grid item xs={3} p={2} sx={{ backgroundColor: '#f5f5f5' }}>
        <InsightsMain />
      </Grid>
    </Grid>
  );
};

export default LandingPageMain;
