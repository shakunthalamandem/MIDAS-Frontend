import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Container,
  Typography,
  CircularProgress,
} from "@mui/material";
import PredictionLayout from "./PredictionLayout";

type OptionsData = {
  region: string[];
  selected_bank: string[];
  sponsor: string[];
  sector: string[];
  target: string[];
  deal_status: string[];
};

const EquityAiMlPage: React.FC = () => {
  const [options, setOptions] = useState<OptionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${apiUrl}/api/ml_input_parameters/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const picked: OptionsData = {
          region: data.region ?? [],
          selected_bank: data.selected_bank ?? [],
          sponsor: data.sponsor ?? [],
          sector: data.sector ?? [],
          target: data.target ?? [],
          deal_status: data.deal_status ?? [],
        };
        setOptions(picked);
      } catch (e: any) {
        setErr(e.message || "Failed to load options");
      } finally {
        setLoading(false);
      }
    })();
  }, [apiUrl]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }
  if (err || !options) {
    return (
      <Typography color="error" align="center">
        {err || "Options not available"}
      </Typography>
    );
  }

  return (
    // Full-width container with no default gutters
    <Container maxWidth={false} disableGutters>
      {/* Centered wrapper with equal margins; ~80% width on desktop */}
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Box sx={{ width: { xs: "96%", sm: "90%", md: "80%" } }}>
          {/* Hero banner sits inside the centered wrapper */}
          <Box
            sx={{
              fontWeight: 500,
              color: "#FFFFFF",
              fontSize: { xs: "1rem", sm: "1.15rem" },
              backgroundColor: "#002060",
              textAlign: "center",
              py: 1.25,
              borderRadius: 2,
              mt: 1.5,
              mb: 2,
            }}
          >
            Welcome to the Prediction Dashboard! Effortlessly input data and track
            all model outcomes, from feature details to prediction results and
            confidence levels.
          </Box>

          {/* Main working surface inside the same centered wrapper */}
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: 4,
              p: { xs: 2, md: 3 },
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              textAlign="center"
              color="#002060"
            >
              🧠 Machine Learning Equity Deal Predictor — US IPO & Follow-ons
            </Typography>

            <Typography variant="body1" gutterBottom sx={{ mt: 1, mb: 2 }}>
              Welcome to the ML-powered equity deal predictor for{" "}
              <strong>US IPOs & Follow-ons (Marketed & Overnight)</strong>.
              Input key parameters to forecast deal outcomes.
            </Typography>

            {/* Work zone */}
            <Box sx={{ backgroundColor: "#f7f9fc", p: { xs: 2, md: 3 }, borderRadius: 2 }}>
              <PredictionLayout options={options} />
            </Box>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default EquityAiMlPage;
