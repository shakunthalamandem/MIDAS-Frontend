import React from 'react';
import { Grid, Box, Paper, Typography } from '@mui/material';
import EquityDashboard from './Equity/EquityDashboard';
import InsightsMain from './InsightsAi/InsightsMain';
import MDDDashboardMain from './MonasheeMDD/MDDDashboardMain';


const LandingPageMain: React.FC = () => {
  return (
    <>
    <Box display="flex">
      <Box sx={{ width: '85%', p: 2, overflowY: 'auto' }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Paper elevation={3} sx={{ p: 2, backgroundColor: '#f4f7ff' }}>
            <EquityDashboard />
          </Paper>
          <Paper elevation={3} sx={{ p: 2, backgroundColor: '#fcfbe8' }}>
            <MDDDashboardMain />
          </Paper>
        </Box>
      </Box>

      {/* Right side: 15% */}
      <Box sx={{ width: '15%', p: 2, backgroundColor: '#f8f9ea', mt: 2, mb: 2}}>
        <InsightsMain />
      </Box>
    </Box></>

  );
};

export default LandingPageMain;
