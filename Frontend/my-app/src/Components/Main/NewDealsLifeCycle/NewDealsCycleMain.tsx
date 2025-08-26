import React, { useState } from "react";
import { Grid, Box, Typography } from "@mui/material";
import NewDealsUpcomingRecent from "./NewDealsUpcomingRecent";
import DealColorInfo from "./DealsCyclesSections/DealColorInfo";
import DealWriteUpInfo from "./DealsCyclesSections/DealWriteUpInfo";
import AIMLModelPredictionInfo from "./DealsCyclesSections/AIMLModelPredictionInfo";

const NewDealsCycleMain: React.FC = () => {
  const [selectedDeal, setSelectedDeal] = useState<any>(null);

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
        }}
      >
        Welcome to 📊 Deal Flow Tracker: IPOs, Follow-Ons & Key Highlights.
      </Typography>

      <NewDealsUpcomingRecent onDealSelect={setSelectedDeal} />

      {selectedDeal && (
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} md={4}>
            <DealColorInfo data={selectedDeal} />
          </Grid>
          <Grid item xs={12} md={4}>
            <DealWriteUpInfo data={selectedDeal} />
          </Grid>
          <Grid item xs={12} md={4}>
            <AIMLModelPredictionInfo data={selectedDeal} />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default NewDealsCycleMain;
