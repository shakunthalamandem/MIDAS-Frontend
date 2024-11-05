import React from 'react';
import RegionPieChart from './RegionPieChart';
import SectorPieChart from './SectorPieChart';
import { Container, Grid } from '@mui/material';

const DealPieChart = () => {
  return (
    <>
        <Container maxWidth="lg" sx={{ paddingY: 4 }}>

    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <RegionPieChart />
      </Grid>
      <Grid item xs={12} sm={6}>
        <SectorPieChart />
      </Grid>
    </Grid>
    </Container>

    </>

  );
};

export default DealPieChart;
