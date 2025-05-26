import React from 'react';
import { Box, Grid } from '@mui/material'; 
import SectorwiseTable from './SectorwiseTable';
import QuarterlyDealsTable from './QuarterlyDealsTable';
import RegionWiseTable from './RegionWiseTable';
import NumerSummary from './NumerSummary';

const EquityDashboard = () => {
  return (
    <>
      <Grid item  p={2} >
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            padding: 2, 
            width: '100%', 
            boxSizing: 'border-box',
            flexWrap: 'nowrap',    
            overflowX: 'auto'      
          }}
        >
          <Box >
            <NumerSummary />
          </Box>
          <Box >
            <QuarterlyDealsTable />
          </Box>
        </Box>

        <Box sx={{ padding: 2 }}>
        </Box>
            <RegionWiseTable />

        <Box sx={{ padding: 2 }}>
          <SectorwiseTable />
        </Box>



         <Box sx={{ padding: 2 }}>
          <SectorwiseTable />
        </Box>

        
      </Grid>


    </>
  );
};

export default EquityDashboard;
