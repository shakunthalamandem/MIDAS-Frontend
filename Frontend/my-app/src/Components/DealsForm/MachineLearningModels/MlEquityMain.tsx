import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Grid,
  Container,
  Typography,
  CircularProgress,
} from "@mui/material";
import MLInputForm from "./MLInputForm";
import RandomInfoPanel from "./RandomInfoPanel";
import axios from "axios";

type OptionsResponse = {
  deal_type: string[];
  region: string[];
  selected_bank: string[];
  sponsor: string[];
  sector: string[];
  gdp: string[];
  inflation: string[];
  treasury_rates: string[];
  target: string[];
};

const MlEquityMain: React.FC = () => {
  const [options, setOptions] = useState<OptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null); // <-- Selected form data
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get<OptionsResponse>(`${apiUrl}/api/ml_input_parameters/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        setOptions(response.data);
      } catch (err) {
        console.error("Failed to fetch options", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handleFormSelect = (formData: any) => {
    setInitialData(formData);
  };

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
    <Typography
      variant="h5"
      fontWeight="bold"
      gutterBottom
      textAlign="center"
      color="#002060"
    >
      Indicative Deal Performance - 🧠 Machine Learning Equity Deal Predictor
    </Typography>

    <Typography variant="body1" gutterBottom sx={{ marginLeft: 5, mt: 2, mb: 2 }}>
      Welcome to the ML-powered equity deal predictor for{" "}
      <strong>US follow-on offerings</strong>. Input key market and macroeconomic
      parameters to forecast deal outcomes using advanced machine learning models
      trained on over 4000 historical deal records.
    </Typography>

    <Box sx={{ backgroundColor: "#f4f6f8", p: 4 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : options ? (
        <MLInputForm options={options} initialData={initialData} />
      ) : (
        <Typography color="error">Failed to load options.</Typography>
      )}
    </Box>
  </Card>
</Box>

{/* RandomInfoPanel completely outside, 25% width, next to the container */}
<Box sx={{ width: "25%", display: "inline-block", verticalAlign: "top" }}>
  <RandomInfoPanel onSelect={handleFormSelect} />
</Box>


      </Container>
    </>
  );
};

export default MlEquityMain;
