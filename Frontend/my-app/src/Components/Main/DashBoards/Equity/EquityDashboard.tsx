import React from 'react';
import { Box } from '@mui/material'; // ✅ This was missing
import SectorwiseTable from './SectorwiseTable';
import QuarterlyDealsTable from './QuarterlyDealsTable';
import RegionWiseTable from './RegionWiseTable';

const SideBySideView = () => {
  return (
    <>
      <Box sx={{  gap: 2, padding: 2 ,width:'80%'}}>
        <Box sx={{ flex: 1 }}>
          <RegionWiseTable />
        </Box>
        <Box sx={{ flex: 1 }}>
          <QuarterlyDealsTable />
        </Box>
      </Box>

      <Box sx={{ padding: 2 }}>
        <SectorwiseTable />
      </Box>
    </>
  );
};

export default SideBySideView;
