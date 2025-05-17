import React, { useState } from "react";
import {
  Box,
  Card,
  Container,
  Typography,
} from "@mui/material";
import MLInputForm from "./MLInputForm";

const MlEquityMain: React.FC = () => {

  return (
    <>
      <Box
        sx={{
          fontWeight: 500,
          color: "#FFFFFF",
          fontSize: { xs: "1rem", sm: "1.2rem" },
          backgroundColor: "#002060",
          textAlign: "center",
          py: 1,
          borderRadius: 2,
          mb: 2,
          boxShadow: 2,
        }}
      >
        Welcome to the Prediction Dashboard! Effortlessly input data and track all model outcomes, from feature details to prediction results and confidence levels.
      </Box>

      <Container maxWidth="lg" sx={{ padding: 2 }}>
        <Box py={2} display="flex" flexDirection="column" alignItems="center">
          <Card sx={{ width: "100%", p: 2, boxShadow: 3, borderRadius: 2, mb: 4 }}>
            {/* <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center" color="#002060">
              Indicative Deal Performance
            </Typography> */}
            <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center" color="#002060">
              Indicative Deal Performance - 🧠 Machine Learning Equity Deal Predictor (US Follow-Ons)
            </Typography>
            <Typography variant="body2" sx={{marginLeft: 5, mt: 2, mb: 2}}>
              Welcome to the ML-powered equity deal predictor for US follow-on offerings. Input key market and macroeconomic parameters to forecast deal outcomes using advanced machine learning models trained on over 4000 historical deal records.
            </Typography>
            <MLInputForm/>
          </Card>
        </Box>

      </Container>
    </>
  );
};

export default MlEquityMain;
