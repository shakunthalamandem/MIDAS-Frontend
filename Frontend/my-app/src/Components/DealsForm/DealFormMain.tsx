import React from 'react';
import Background from './SectionForms/Background';
import DealActivity from './SectionForms/DealActivity';
import DealDetailsForm from './SectionForms/DealDetailsForm';
import FormalIndicators from './SectionForms/FormalIndicators';
import HistoricalData from './SectionForms/HistoricalData';
import Participation from './SectionForms/Participation';
import PerformanceStatergy from './SectionForms/PerformanceStatergy';
import TechnicalInsights from './SectionForms/TechnicalInsights';
import { Container, Grid, Typography } from '@mui/material';



const DealFormMain = () => {
  return (
    <Container>
    <Typography variant="h4" gutterBottom>
      Deal Form Main
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={4}>
        <Background />
      </Grid>
      <Grid item xs={4}>
        <DealActivity />
      </Grid>
      <Grid item xs={4}>
        <DealDetailsForm />
      </Grid>
      <Grid item xs={4}>
        <FormalIndicators />
      </Grid>
      <Grid item xs={4}>
        <HistoricalData />
      </Grid>
      <Grid item xs={4}>
        <Participation />
      </Grid>
      <Grid item xs={4}>
        <PerformanceStatergy />
      </Grid>
      <Grid item xs={4}>
        <TechnicalInsights />
      </Grid>
    </Grid>
  </Container>
  );
}

export default DealFormMain;
