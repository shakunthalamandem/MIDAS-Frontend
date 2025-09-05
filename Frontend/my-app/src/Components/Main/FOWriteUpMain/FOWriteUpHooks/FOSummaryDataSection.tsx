// FOSummaryDataSection.tsx
import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  Box,
  Typography,
  Container,
  Grid,
  IconButton,
  Stack,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import { motion } from "framer-motion";

import FODealInformation from "../FOWriteSections/FODealInformation";
import FOTradingDetails from "../FOWriteSections/FOTradingDetails";
import FOValuationWriteup from "../FOWriteSections/FOValuationWriteup";
import FOStrengthWriteUp from "../FOWriteSections/FOStrengthWriteUp";
import FOFutureOutlook from "../FOWriteSections/FOFutureOutlook";
import FOSharePricePerformance from "../FOWriteSections/FOSharePricePerformance";
import FOBusinessHighlights from "../FOWriteSections/FOBusinessHighlights";
import FOManagementWriteUp from "../FOWriteSections/FOManagementWriteUp";

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
            <Grid item xs={12} md={6}>
             <FOTradingDetails data={formData.trading_details} ticker={ticker} />

            </Grid>
            <Grid item xs={12} md={6}>
              <FOSharePricePerformance selectedData={formData.share_price_performance} ticker={ticker} />

            </Grid>
          </Grid>
        </motion.div>
      </Container>

<FOStrengthWriteUp selectedData={formData.strength_writeup} ticker={ticker} />

<FOValuationWriteup selectedData={formData.valuation_writeup} ticker={ticker} />

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FOBusinessHighlights
                selectedData={formData.business_highlights} ticker={ticker} 
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FOManagementWriteUp
                selectedData={formData.management_writeup}
                ticker={ticker}
              />
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </>
  );
};

export default FOSummaryDataSection;
