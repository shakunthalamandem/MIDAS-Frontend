import React, { useState } from "react";
import axios from "axios";
import { Box, Button, Card, Container, Typography } from "@mui/material";
import FormComponent from "./FormComponent";
import PredictionResult from "./PredictionResult";

type DealType = "IPO" | "FO";
type Region = "US" | "Non-US" | "APAC" | "EMEA";
type Target = "T1D" | "T1M";

type FormDataType = { [key: string]: string };
type PredictionResult = {
  prediction: string;
  lower_bound: string;
  upper_bound: string;
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
  "selected_bank_category",
];

const FO_FIELDS = [
  "deal_size_category",
  "discount_from_announcement_price_category",
  "percentage_primary_category",
  "allocation_deal_size_percentage_category",
  "allocation_percentage_category",
  "selected_bank_category",
];

const MlEquityMain: React.FC = () => {
  const [dealType, setDealType] = useState<DealType>("IPO");
  const [region, setRegion] = useState<Region>("US");
  const [target, setTarget] = useState<Target>("T1D");
  const [formData, setFormData] = useState<FormDataType>({});
  const [result, setResult] = useState<PredictionResult | null>(null);

  const fields = dealType === "IPO" ? IPO_FIELDS : FO_FIELDS;

  const handlePredict = async () => {
    try {
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
    }
  };

  return (
    <Container maxWidth="lg">
      <Box py={5} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center" color="#002060">
          ML Equity Predictor
        </Typography>

        <Card sx={{ margin: "0 auto", width: "100%", padding: 2, boxShadow: 3, borderRadius: 2, marginBottom: 4 }}>
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
        </Card>

        <Box mb={4}>
          <Button variant="contained" sx={{ backgroundColor: "#002060" }} onClick={handlePredict} size="large">
            Predict
          </Button>
        </Box>

        {result && <PredictionResult result={result} />}
      </Box>
    </Container>
  );
};

export default MlEquityMain;
