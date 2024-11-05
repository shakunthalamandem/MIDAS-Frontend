import React from 'react';
import RegionPieChart from './RegionPieChart';
import SectorPieChart from './SectorPieChart';
import { Container, Grid } from '@mui/material';

// Define props interface to receive pie chart data
interface DealPieChartProps {
  data: {
    sectorData: { name: string; value: number }[]; // Assuming this structure for sector data
    regionData: { name: string; value: number }[]; // Assuming this structure for region data
  };
}

const DealPieChart: React.FC<DealPieChartProps> = ({ data }) => {
  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          {/* Pass region data to RegionPieChart */}
          <RegionPieChart initialData={data.regionData} />
        </Grid>
        <Grid item xs={12} sm={6}>
          {/* Pass sector data to SectorPieChart */}
          <SectorPieChart initialData={data.sectorData} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default DealPieChart;
