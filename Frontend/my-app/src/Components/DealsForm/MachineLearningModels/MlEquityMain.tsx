import React, { useEffect, useState } from "react";
import { PredictedForm } from "../../Main/DashBoards/Equity/FoPredictionCards";
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
  const [initialData, setInitialData] = useState<any>(null);
  const [autoPredict, setAutoPredict] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const val = sessionStorage.getItem("auto_predict");
    const autoPredictFlag = val === "true";
    setAutoPredict(autoPredictFlag);
  }, []);

  useEffect(() => {
    if (autoPredict) {
      sessionStorage.removeItem("auto_predict");
    }
  }, [autoPredict]);

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

    const storedData = sessionStorage.getItem("selected_form_data");
    if (storedData) {
      try {
        const rawData: PredictedForm = JSON.parse(storedData);

        const mappedData = {
          ticker: rawData.ticker_symbol,
          pricing_date: rawData.pricing_date
            ? new Date(rawData.pricing_date)
            : null,
          deal_type: rawData.deal_type,
          region: rawData.region,
          target: rawData.target_variable,
          sponsor_yn_category: rawData.sponsor,
          deal_size_category: String(rawData.deal_size_million),
          selected_bank_category: rawData.selected_bank,
          percentage_primary_category: String(rawData.percentage_primary),
          sector_category: rawData.sector,
          discount_from_announcement_price_category: String(
            rawData.discount_announcement_price
          ),
          allocation_deal_size_percentage_category: String(
            rawData.allocation_percentage_of_deal
          ),
          allocation_percentage_category: String(
            rawData.allocation_percentage_of_ioi
          ),
          GDP: rawData.gdp_growth,
          Inflation: rawData.inflation_rate,
          Treasury: rawData.treasury_rates,
        };

        setInitialData(mappedData);
        sessionStorage.removeItem("selected_form_data");
      } catch (e) {
        console.error("Invalid JSON in sessionStorage");
      }
    }

    fetchOptions();
  }, []);

  const handleFormSelect = (formData: any) => {
    setInitialData(formData);
  };

  return (
    <Box sx={{ display: "flex", gap: 2, padding: 2 }}>
      <Box sx={{ flex: 3 }}>
        <Box
          sx={{
            fontWeight: 500,
            color: "#FFFFFF",
            fontSize: { xs: "1rem", sm: "1.2rem" },
            backgroundColor: "#002060",
            textAlign: "center",
            py: 1,
            borderRadius: 2,
            boxShadow: 2,
            mb: 2,
          }}
        >
          Welcome to the Prediction Dashboard! Effortlessly input data and track
          all model outcomes, from feature details to prediction results and
          confidence levels.
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Container maxWidth="xl" sx={{ padding: 0, flex: 3 }}>
            <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                textAlign="center"
                color="#002060"
              >
                🧠 Machine Learning Equity Deal Predictor - US Follow-on's
              </Typography>

              <Typography
                variant="body1"
                gutterBottom
                sx={{ ml: 2, mt: 2, mb: 2 }}
              >
                Welcome to the ML-powered equity deal predictor for{" "}
                <strong>US follow-on's (Marketed & Overnight)</strong>. Input key market and
                macroeconomic parameters to forecast deal outcomes using
                advanced machine learning models trained on over 4000 historical
                deal records.
              </Typography>

              <Box sx={{ backgroundColor: "#f4f6f8", p: 3, borderRadius: 1 }}>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : options ? (
                  <MLInputForm
                    options={options}
                    initialData={initialData}
                    autoPredict={autoPredict}
                  />
                ) : (
                  <Typography color="error">Failed to load options.</Typography>
                )}
              </Box>
            </Card>
          </Container>

          {/* Right-side Panel */}
          <Box
            sx={{ flex: 1, position: "sticky", top: 20, height: "fit-content" }}
          >
            <RandomInfoPanel onSelect={handleFormSelect} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MlEquityMain;
