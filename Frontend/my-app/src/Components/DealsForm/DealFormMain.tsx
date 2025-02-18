import { Container, Grid, Typography } from '@mui/material';
import Background from './SectionForms/Background';
import DealActivity from './SectionForms/DealActivity';
import DealDetailsForm from './SectionForms/DealDetailsForm';
import FormalIndicators from './SectionForms/FormalIndicators';
import HistoricalData from './SectionForms/HistoricalData';
import Participation from './SectionForms/Participation';
import PerformanceStatergy from './SectionForms/PerformanceStatergy';
import TechnicalInsights from './SectionForms/TechnicalInsights';
import TempJsonData from './TempJsonData'; // Import the TempJsonData component
import { useState } from 'react';

interface VendorIssuer {
  type: string;
  from: string[];
}

interface Company {
  name: string;
  description: string;
}

interface FormData {
  deal_captain: string;
  team: string;
  participants: string[];
  ticker: string;
  company: Company;
  vendor_issuer: VendorIssuer;
}

const DealFormMain = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ticker, setTicker] = useState<string>("GALD SW"); // Set initial ticker or get it from user input

  const handleDataLoaded = (data: FormData) => {
    setFormData(data);
  };

  const handleTickerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTicker(event.target.value); // Update ticker when user changes it
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!formData) return <div>No data found</div>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Deal Form Main
      </Typography>

      {/* Ticker input to allow the user to change the ticker */}
      <input 
        type="text" 
        value={ticker} 
        onChange={handleTickerChange} 
        placeholder="Enter Ticker" 
      />

      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Background data={formData} />
        </Grid>
        <Grid item xs={4}>
          <DealActivity data={formData} />
        </Grid>
        <Grid item xs={4}>
          <DealDetailsForm data={formData} />
        </Grid>
        <Grid item xs={4}>
          <FormalIndicators data={formData} />
        </Grid>
        <Grid item xs={4}>
          <HistoricalData data={formData} />
        </Grid>
        <Grid item xs={4}>
          <Participation data={formData} />
        </Grid>
        <Grid item xs={4}>
          <PerformanceStatergy data={formData} />
        </Grid>
        <Grid item xs={4}>
          <TechnicalInsights data={formData} />
        </Grid>
      </Grid>

      {/* Pass the handleDataLoaded function to TempJsonData component */}
      <TempJsonData onDataLoaded={handleDataLoaded} />
    </Container>
  );
};

export default DealFormMain;
