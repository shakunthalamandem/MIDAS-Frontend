import { Container, Grid, Typography, TextField, CircularProgress } from '@mui/material';
import Background from './SectionForms/Background';
import DealActivity from './SectionForms/DealActivity';
import DealDetailsForm from './SectionForms/DealDetailsForm';
import FormalIndicators from './SectionForms/FormalIndicators';
import HistoricalData from './SectionForms/HistoricalData';
import Participation from './SectionForms/Participation';
import PerformanceStatergy from './SectionForms/PerformanceStatergy';
import TechnicalInsights from './SectionForms/TechnicalInsights';
import TempJsonData from './TempJsonData';
import { useState } from 'react';

// Define TypeScript interfaces
interface VendorIssuer {
  type: string;
  from: string[];
}

interface Company {
  name: string;
  description: string;
}

interface DealFormData {
  deal_captain: string;
  team: string;
  participants: string[];
  ticker: string;
  company: Company;
  vendor_issuer: VendorIssuer;
}

const DealFormMain: React.FC = () => {
  const [formData, setFormData] = useState<DealFormData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);


  // Handle JSON data loaded from TempJsonData component
  const handleDataLoaded = (data: DealFormData) => {
    setFormData(data);
    setLoading(false);
  };


  if (loading) return <CircularProgress />;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Deal Form Main
      </Typography>

      {/* Section Forms */}
      {formData ? (
        <Grid container spacing={3}>
          <Grid item xs={4}><Background data={formData} /></Grid>
          {/* <Grid item xs={4}><DealActivity data={formData} /></Grid>
          <Grid item xs={4}><DealDetailsForm data={formData} /></Grid>
          <Grid item xs={4}><FormalIndicators data={formData} /></Grid>
          <Grid item xs={4}><HistoricalData data={formData} /></Grid>
          <Grid item xs={4}><Participation data={formData} /></Grid>
          <Grid item xs={4}><PerformanceStatergy data={formData} /></Grid>
          <Grid item xs={4}><TechnicalInsights data={formData} /></Grid> */}
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
