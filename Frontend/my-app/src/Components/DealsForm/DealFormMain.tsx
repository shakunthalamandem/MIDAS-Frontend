import { Container, Grid, Typography, CircularProgress, Box } from '@mui/material';
import Background from './SectionForms/Background';
import DealActivity from './SectionForms/DealActivity';
import DealDetailsForm from './SectionForms/DealDetailsForm';
import HistoricalData from './SectionForms/HistoricalData';
import Participation from './SectionForms/Participation';
import PerformanceStatergy from './SectionForms/PerformanceStatergy';
import TechnicalInsights from './SectionForms/TechnicalInsights';
import TempJsonData from './TempJsonData';
import { DealFormData } from '../../types/DealFormData';
import AfterMarketAnalysis from './SectionForms/AfterMarketAnalysis';
import DealFormSearch from './DealFormSearch';
import { useState, useCallback } from "react";
import NewDealFormMain from '../NewDealForm/NewDealFormMain';


const DealFormMain: React.FC = () => {
  const [formData, setFormData] = useState<DealFormData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);




  const handleDataLoaded = useCallback((data: DealFormData) => {
    setFormData(data);
    setLoading(false);
  }, []);

  return (
    <>
      <Box sx={{ width: "100%", backgroundColor: "#fff" }}>

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
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            animation: "fadeIn 1.5s ease-in-out",
            "@keyframes fadeIn": {
              "0%": { opacity: 0 },
              "100%": { opacity: 1 },
            },
          }}
        >
         Welcome to the Deal Form! Seamlessly input and track all deal parameters, from company details to allocation and pricing information
        </Typography>

        <Container sx={{ mb: 5 }}>
          <Typography variant="h5" color="#002060" sx={{ textAlign: 'center', mt: 2 }}>
            Deal Information Form
          </Typography>

          <NewDealFormMain />
          {/* 🔹 Color Legend - Aligned to the Left */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Note:</Typography>
            <Grid container spacing={1}>
              {[
                { color: '#b7cdf7', label: 'Bloomberg data pulled automatically by ticker' },

              ].map((item, index) => (
                <Grid item key={index} sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                  <Box sx={{ width: 16, height: 16, backgroundColor: item.color, border: '1px solid #000', mr: 1 }} />
                  <Typography variant="body2">{item.label}</Typography>
                </Grid>
              ))}
            </Grid>
          </Box>
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
      </>
      );
  
  
};

      export default DealFormMain;
