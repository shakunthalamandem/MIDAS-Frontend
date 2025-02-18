import { Container, Grid, Typography, CircularProgress } from '@mui/material';
import Background from './SectionForms/Background';
import DealActivity from './SectionForms/DealActivity';
import DealDetailsForm from './SectionForms/DealDetailsForm';
import HistoricalData from './SectionForms/HistoricalData';
import Participation from './SectionForms/Participation';
import PerformanceStatergy from './SectionForms/PerformanceStatergy';
import TechnicalInsights from './SectionForms/TechnicalInsights';
import TempJsonData from './TempJsonData';
import { useState } from 'react';
import { DealFormData } from '../../types/DealFormData';
import AfterMarketAnalysis from './SectionForms/AfterMarketAnalysis';

const DealFormMain: React.FC = () => {
  const [formData, setFormData] = useState<DealFormData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);  // Set initial loading state to true

  // Handle JSON data loaded from TempJsonData component
  const handleDataLoaded = (data: DealFormData) => {
    setFormData(data);
    setLoading(false);  // Data is loaded, so turn off loading
  };

  // if (loading) return <CircularProgress />;  // Show loading spinner if data is still loading

  return (
    <Container>
     <Typography variant="h5" color='#002060' style={{ textAlign: 'center',marginTop:10 }}>
  Deal Information Form
</Typography>


      {/* Section Forms */}
      {formData ? (
        <Grid container spacing={3}>
          {/* Render each section based on the data */}
          <Grid item xs={4}><Background data={formData.background} /></Grid>
          {/* <Grid item xs={4}><DealActivity data={formData.monashee_deal_activity} /></Grid>
          <Grid item xs={4}><DealDetailsForm data={formData.company_details} /></Grid>
          <Grid item xs={4}><HistoricalData data={formData.historical_transactions} /></Grid>
          <Grid item xs={4}><AfterMarketAnalysis data={formData.aftermarket_analysis} /></Grid>
          <Grid item xs={4}><Participation data={formData.participation} /></Grid>
          <Grid item xs={4}><PerformanceStatergy data={formData.performance_statistics} /></Grid>
          <Grid item xs={4}><TechnicalInsights data={formData.technical_sentiment_analysis} /></Grid> */}
        </Grid>
      ) : (
        <Typography variant="body1">No data found</Typography>
      )}

      {/* Fetch Temp.json Data */}
      <TempJsonData onDataLoaded={handleDataLoaded} />
    </Container>
  );
};

export default DealFormMain;
