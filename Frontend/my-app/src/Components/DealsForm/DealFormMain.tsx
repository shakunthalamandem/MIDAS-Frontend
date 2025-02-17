import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Typography } from '@mui/material';
import Background from './SectionForms/Background';
import DealActivity from './SectionForms/DealActivity';
import DealDetailsForm from './SectionForms/DealDetailsForm';
import FormalIndicators from './SectionForms/FormalIndicators';
import HistoricalData from './SectionForms/HistoricalData';
import Participation from './SectionForms/Participation';
import PerformanceStatergy from './SectionForms/PerformanceStatergy';
import TechnicalInsights from './SectionForms/TechnicalInsights';

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const response = await axios.post<FormData>(`${apiUrl}/api/formdeatils/`, {
          ticker, // Send ticker in the request body
        }, {
          headers: {
            "Authorization": token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });

        setFormData(response.data); // Now response.data is of type FormData
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]); // Dependency array includes ticker to fetch new data when ticker changes

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
    </Container>
  );
};

export default DealFormMain;
