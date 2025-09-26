// FOSummaryDataSection.tsx
import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  Box,
  Typography,
  Container,
  Grid,

} from "@mui/material";

import { motion } from "framer-motion";

import FODealInformation from "../FOWriteSections/FODealInformation";

import FOCombined from "../FOWriteSections/FOCombined";


interface ChildProps {
  ticker: string;
  deal_id: string;
}

interface ApiResponse {
  [key: string]: Record<string, any>;
}

const FOSummaryDataSection: React.FC<ChildProps> = ({ ticker, deal_id }) => {
  const [formData, setFormData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${apiUrl}/api/fo_writeup_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker, deal_id }),
        });

        const result = await response.json();
        setFormData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker, deal_id]);



  if (loading) {
    return (
      <Box display="flex" justifyContent="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!formData) return null;

  return (
    <>
      {/* Top Action Bar */}


 <FODealInformation data={formData.deal_information} ticker={ticker} />


      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Grid container spacing={3}>

<FOCombined 
  shareData={formData.share_price_performance} 
  tradingData={formData.trading_details} 
  ticker={ticker} 
/>

          </Grid>
        </motion.div>
      </Container>


    </>
  );
};

export default FOSummaryDataSection;
