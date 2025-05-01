import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  Container,
  LinearProgress,
  Typography,
} from "@mui/material";
import FormComponent from "./FormComponent";
import PredictionResult from "./PredictionResult";

type DealType = "IPO" | "FO";
type Region = "US" | "Non-US" | "APAC" | "EMEA";
type Target = "T1D" | "T1M";

type FormDataType = { [key: string]: string };
type PredictionResult = {
  prediction: number;
  lower_bound: number;
  upper_bound: number;
};

const IPO_FIELDS = [
  "deal_size_category",
  "percentage_primary_category",
  "allocation_deal_size_percentage_category",
  "allocation_percentage_category",
  "issue_offer_price_category",
  "number_of_shares_offered_category",
  "allocation_price_category",
  "allocated_shares_category",
  "subscription_bid_shares_category",
  "total_shares_offered_category",
];

const FO_FIELDS = [
  "deal_size_category",
  "discount_from_announcement_price_category",
  "percentage_primary_category",
  "allocation_deal_size_percentage_category",
  "allocation_percentage_category",
];

const MlEquityMain: React.FC = () => {
  const [dealType, setDealType] = useState<DealType>("IPO");
  const [region, setRegion] = useState<Region>("US");
  const [target, setTarget] = useState<Target>("T1D");
  const [formData, setFormData] = useState<FormDataType>({});
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fields = dealType === "IPO" ? IPO_FIELDS : FO_FIELDS;

  const handlePredict = async () => {
    try {
      setLoading(true);
      setResult(null);

      const payload = {
        deal_type: dealType,
        region,
        target,
        ...formData,
      };

      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(
        `${apiUrl}/api/model_prediction/`,
        payload
      );

      setResult(response.data as PredictionResult);
    } catch (error) {
      console.error("Prediction failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset Function
  const handleReset = () => {
    setDealType("IPO");
    setRegion("US");
    setTarget("T1D");
    setFormData({});
    setResult(null);
  };

  return (
    <>
    
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
Welcome to the Prediction Dashboard! Effortlessly input data and track all model outcomes, from feature details to prediction results and confidence levels        </Typography>
    <Container maxWidth="lg" sx={{ padding: 2 }}>

      {/* Top Loading Bar */}

      <Box py={2} display="flex" flexDirection="column" alignItems="center">
        <Card
          sx={{
            margin: "0 auto",
            width: "100%",
            padding: 2,
            boxShadow: 3,
            borderRadius: 2,
            marginBottom: 4,
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            textAlign="center"
            color="#002060"
          >
            ML Equity Predictor
          </Typography>
          <FormComponent
            dealType={dealType}
            setDealType={setDealType}
            region={region}
            setRegion={setRegion}
            target={target}
            setTarget={setTarget}
            formData={formData}
            setFormData={setFormData}
            fields={fields}
          />
          <Box
            py={2}
            display="flex"
            flexDirection="row" // Align buttons horizontally
            justifyContent="center" // Center the buttons horizontally
            gap={2} // Add space between buttons
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#002060",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100px", // Optional: You can define a fixed width if needed
              }}
              onClick={handlePredict}
              size="small"
              disabled={loading}
            >
              {loading ? "Predicting..." : "Predict"}
            </Button>

            <Button
              variant="outlined"
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100px", // Optional: You can define a fixed width if needed
                backgroundColor: "#f0f0f0",
                color: "#002060",
              }}
              onClick={handleReset}
              size="small"
            >
              Reset
            </Button>
          </Box>

          {result && (
            <PredictionResult
              result={{
                prediction: result.prediction.toString(),
                lower_bound: result.lower_bound.toString(),
                upper_bound: result.upper_bound.toString(),
              }}
            />
          )}
        </Card>
      </Box>
    </Container>
    </>

  );
};

export default MlEquityMain;
