import React from 'react';
import { Grid, Box, Paper } from '@mui/material';
import EquityDashboard from './Equity/EquityDashboard';
import InsightsMain from './InsightsAi/InsightsMain';
import MDDDashboardMain from './MonasheeMDD/MDDDashboardMain';
import UpcomingIpoTable from './Equity/UpcomingIpoTable';


const LandingPageMain: React.FC = () => {
  return (
    <><UpcomingIpoTable />
    <Box display="flex">

      {/* Left side: 85% */}
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
      <Box sx={{ width: '15%', p: 2, backgroundColor: '#00b49c' }}>
        <InsightsMain />
      </Box>
    </Box></>

  );
};

export default LandingPageMain;
