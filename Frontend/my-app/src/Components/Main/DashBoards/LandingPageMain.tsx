import React from 'react';
import { Grid, Box, Paper } from '@mui/material';
import EquityDashboard from './Equity/EquityDashboard';
import InsightsMain from './InsightsAi/InsightsMain';
import MDDDashboardMain from './MonasheeMDD/MDDDashboardMain';


const LandingPageMain: React.FC = () => {
  return (
    <Grid container height="100vh">
      {/* Left side: 75% */}
      <Grid item xs={9} p={2} sx={{ overflowY: 'auto' }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <EquityDashboard />
          </Paper>
          <Paper elevation={3} sx={{ p: 2 }}>
            <MDDDashboardMain />
          </Paper>
          {/* Add more components here as needed */}
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
