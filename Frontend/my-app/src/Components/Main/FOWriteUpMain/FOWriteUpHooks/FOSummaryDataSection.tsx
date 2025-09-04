import React, { useEffect, useState } from "react";
import FODealInformation from "../FOWriteSections/FODealInformation";
import FOTradingDetails from "../FOWriteSections/FOTradingDetails";
import FOValuationWriteup from "../FOWriteSections/FOValuationWriteup";
import FOStrengthWriteUp from "../FOWriteSections/FOStrengthWriteUp";
import FOFutureOutlook from "../FOWriteSections/FOFutureOutlook";
import FOSharePricePerformance from "../FOWriteSections/FOSharePricePerformance";
import FOBusinessHighlights from "../FOWriteSections/FOBusinessHighlights";
import FOManagementWriteUp from "../FOWriteSections/FOManagementWriteUp";

import { CircularProgress, Box, Typography, Container, Grid } from "@mui/material";
import { motion } from "framer-motion";

interface ChildProps {
  ticker: string;
  deal_id: string;
}

interface ApiResponse {
  deal_information?: Record<string, unknown>;
  trading_details?: Record<string, unknown>;
  share_price_performance?: Record<string, unknown>;
  valuation_writeup?: Record<string, unknown>;
  strength_writeup?: Record<string, unknown>;
  future_outlook?: Record<string, unknown>;
  business_highlights?: Record<string, unknown>;
  management_writeup?: Record<string, unknown>;
}

const FOSummaryDataSection: React.FC<ChildProps> = ({ ticker, deal_id }) => {
  const [selectedData, setSelectedData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        const response = await fetch(`${apiUrl}/api/fo_writeup_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker, deal_id }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const result: ApiResponse = await response.json();
        setSelectedData(result);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker, deal_id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  if (!selectedData) return null;

  return (
    <>
      {/* Deal Info */}
      <FODealInformation selectedData={selectedData.deal_information || {}} />

      {/* Trading & Share Price (Side by Side) */}
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FOTradingDetails selectedData={selectedData.trading_details || {}} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FOSharePricePerformance selectedData={selectedData.share_price_performance || {}} />
            </Grid>
          </Grid>
        </motion.div>
      </Container>

      {/* Strength, Valuation, Outlook */}
      <FOStrengthWriteUp selectedData={selectedData.strength_writeup || {}} />
      <FOValuationWriteup selectedData={selectedData.valuation_writeup || {}} />
      <FOFutureOutlook selectedData={selectedData.future_outlook || {}} />

      {/* Business Highlights & Management (Side by Side) */}
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FOBusinessHighlights selectedData={selectedData.business_highlights || {}} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FOManagementWriteUp selectedData={selectedData.management_writeup || {}} />
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </>
  );
};

export default FOSummaryDataSection;
