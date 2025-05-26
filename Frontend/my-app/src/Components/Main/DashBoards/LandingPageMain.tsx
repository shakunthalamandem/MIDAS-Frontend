import React from 'react';
import { Grid, Box, Paper } from '@mui/material';
import EquityDashboard from './Equity/EquityDashboard';
import InsightsMain from './InsightsAi/InsightsMain';
import MDDDashboardMain from './MonasheeMDD/MDDDashboardMain';



const LandingPageMain: React.FC = () => {
  return (
<>     {/* Left side: 75% */}
<EquityDashboard />
<MDDDashboardMain />

      {/* Right side: 25% */}
      <Grid item xs={3} p={2} sx={{ backgroundColor: '#f5f5f5' }}>
        <InsightsMain />
      </Grid>
</>  );
};

export default LandingPageMain;
