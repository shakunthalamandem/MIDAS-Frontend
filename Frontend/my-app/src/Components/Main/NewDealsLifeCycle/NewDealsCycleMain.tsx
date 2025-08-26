import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import NewDealsUpcomingRecent from './NewDealsUpcomingRecent';
import DealColorInfo from './DealsCyclesSections/DealColorInfo';
import DealWriteUpInfo from './DealsCyclesSections/DealWriteUpInfo';
import AIMLModelPredictionInfo from './DealsCyclesSections/AIMLModelPredictionInfo';

// Sample payloads
const dealColorPayload = {
  id: 1,
  ticker: 'BLSH',
  pricing_date: '2025-08-13',
  deal_type: 'IPO',
  allocation_as_percentage_of_ioi: 20,
  average_ioi: 100,
  allocation_as_percentage_of_deal_size: 15,
  average_allocation: 50,
  times_covered: '5x-10x',
  deal_color_rating: 70,
};

const dealWriteUpPayload = {
  id: 2,
  average_sector_return: 12.5,
  monashee_score: 8.3,
  valuation: 'High Growth SaaS with premium pricing',
  differentiated_summary:
    'This deal stands out due to its strong market positioning and recurring revenue model.',
  deal_writeup_rating: 85,
};

const aiMlPredictionPayload = {
  id: 3,
  t1d_pred: 0.92,
  confidence: 88,
};

const NewDealsCycleMain: React.FC = () => {
  return (
    <Box>
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
        Welcome to 📊 Deal Flow Tracker: IPOs, Follow-Ons & Key Highlights.
      </Typography>
      {/* This stays full width */}
      <NewDealsUpcomingRecent />

      {/* 3 Cards in a Row */}
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} md={4}>
          <DealColorInfo data={dealColorPayload} />
        </Grid>
        <Grid item xs={12} md={4}>
          <DealWriteUpInfo data={dealWriteUpPayload} />
        </Grid>
        <Grid item xs={12} md={4}>
          <AIMLModelPredictionInfo data={aiMlPredictionPayload} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default NewDealsCycleMain;
