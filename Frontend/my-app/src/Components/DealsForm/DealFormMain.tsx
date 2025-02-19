import { Container, Grid, Typography, CircularProgress, Box } from '@mui/material';
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
import DealFormSearch from './DealFormSearch';
import Box from '@mui/material/Box';
const DealFormMain: React.FC = () => {
  const [formData, setFormData] = useState<DealFormData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);  // Set initial loading state to true

  // Handle JSON data loaded from TempJsonData component
  const handleDataLoaded = (data: DealFormData) => {
    setFormData(data);
    setLoading(false);  // Data is loaded, so turn off loading
  };
  return (
    
    <Container sx={{ mb: 5 }}>
      <Typography variant="h5" color="#002060" sx={{ textAlign: 'center', mt: 2 }}>
        Deal Information Form
      </Typography>
  
      <DealFormSearch />
     {/* 🔹 Color Legend - Aligned to the Left */}
     <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Note:</Typography>
        <Grid container spacing={1}>
          {[
            { color: '#FF0000', label: 'Key data inputs to run model' },
            { color: '#FFFF00', label: 'Bloomberg data pulled automatically by ticker' },
            { color: '#00FF00', label: 'Model pricing/discount automatically calced' },
            { color: '#00FFFF', label: 'Proprietary deal data kept – some of which could be used for analysis' },
            { color: '#FF00FF', label: 'Proprietary deal data kept in MDD (and in past used to be able to be pulled by model from MDD for historical transactions)' }
          ].map((item, index) => (
            <Grid item key={index} sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
              <Box sx={{ width: 16, height: 16, backgroundColor: item.color, border: '1px solid #000', mr: 1 }} />
              <Typography variant="body2">{item.label}</Typography>
            </Grid>
          ))}
        </Grid>
      </Box>
    <Box sx={{ width: "100%", backgroundColor: "#fff" ,height:"40%"}}>
      <Typography
    variant="body2"
    sx={{
      fontWeight: 500,
      color: "#FFFFFF",
      fontSize: { xs: "1rem", sm: "1.2rem" },
      backgroundColor: "#002060",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "4vh",
      padding: "8px 16px",
      borderRadius: "8px",
      textAlign: "center",
      marginBottom: "20px",
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
      animation: "fadeIn 2s ease-out",
      "@keyframes fadeIn": {
        "0%": { opacity: 0, transform: "translateY(-10px)" },
        "100%": { opacity: 1, transform: "translateY(0)" },
      },
    }}
  >
    Welcome to New Deal Data...!
  </Typography>
  
    <Container sx={{mb:5}}>
    
      
            
            
     <Typography variant="h5" color='#002060' style={{ textAlign: 'center',marginTop:10 }}>
  Deal Information Form
</Typography>
<DealFormSearch />


      {/* Section Forms */}
      {formData ? (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={4}><DealDetailsForm data={formData.company_details} /></Grid>
          <Grid item xs={8}><Participation data={formData.participation} /></Grid>
          <Grid item xs={4}><Background data={formData.background} /></Grid>
          <Grid item xs={4}><DealActivity data={formData.monashee_deal_activity} /></Grid>
          <Grid item xs={4}><PerformanceStatergy data={formData.performance_statistics} /></Grid>
          <Grid item xs={4}><AfterMarketAnalysis data={formData.aftermarket_analysis} /></Grid>
          <Grid item xs={4}><TechnicalInsights data={formData.technical_sentiment_analysis} /></Grid>
          <Grid item xs={4}><HistoricalData data={formData.historical_transactions} /></Grid>
        </Grid>
      ) : (
        <Typography variant="body1">No data found</Typography>
      )}
  
      <TempJsonData onDataLoaded={handleDataLoaded} />
    </Container>
    </Box>
  );
  
  
};  

export default DealFormMain;
