import React from 'react';
import { Box, Grid } from '@mui/material'; 
import SectorwiseTable from './SectorwiseTable';
import QuarterlyDealsTable from './QuarterlyDealsTable';
import RegionWiseTable from './RegionWiseTable';
import NumerSummary from './NumerSummary';

const EquityDashboard = () => {
  return (
    <>
      <Grid item xs={9} p={2} sx={{ overflowY: 'hidden' }}>
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
          <Box sx={{ flex: '1 1 50%', minWidth: 0 }}>
            <RegionWiseTable />
          </Box>
          <Box sx={{ flex: '1 1 50%', minWidth: 0 }}>
            <QuarterlyDealsTable />
          </Box>
        </Box>

        <Box sx={{ padding: 2 }}>
          <NumerSummary />
        </Box>

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
