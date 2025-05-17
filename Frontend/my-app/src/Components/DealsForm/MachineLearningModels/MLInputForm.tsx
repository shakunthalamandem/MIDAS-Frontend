import React, { useEffect, useState } from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Button,
  Paper,
  Typography,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import PredictionResults from "./PredictionResults";

type OptionsResponse = {
  deal_type: string[];
  region: string[];
  selected_bank: string[];
  sponsor: string[];
  sector: string[];
  target: string[];
};

type FormData = {
  dealSize: string;
  percentagePrimary: string;
  discountFromAnnPrice: string;
  allocationPercentDeal: string;
  allocationPercentIOI: string;
  selectedBank: string;
  sponsor: string;
  sector: string;
};

const MLInputForm: React.FC = () => {
  const defaultFormData = {
    sponsor: "",
    dealSize: "",
    selectedBank: "",
    percentagePrimary: "",
    sector: "",
    discountFromAnnPrice: "",
    allocationPercentDeal: "",
    allocationPercentIOI: "",
  };
  const [options, setOptions] = useState<OptionsResponse | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const inputWidth = 250;

  useEffect(() => {
    // Simulate fetching dropdown options
    const fetchOptions = async () => {
      // Replace with API call
      const response: OptionsResponse = {
        deal_type: ["FO"],
        region: ["US"],
        selected_bank: [
          /* full bank list here */
        ],
        sponsor: ["Y", "N"],
        sector: [
          "Communication Services",
          "Consumer Discretionary",
          "Consumer Staples",
          "Energy",
          "Financials",
          "Health Care",
          "Industrials",
          "Information Technology",
          "Materials",
          "Real Estate",
          "Utilities",
        ],
        target: ["T+1 Day Return"],
      };
      setOptions(response);
    };

    fetchOptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
    // Replace this with your prediction API call
    const fakePrediction = {
      model1: "Positive Deal",
      model2: "Yes",
      model3: "No",
    };
    setTimeout(() => {
      setPrediction(fakePrediction);
      setLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    setFormData(defaultFormData);
  };

  if (!options) return <CircularProgress />;

  return (
    <>
      <Paper sx={{ p: 4, borderRadius: 2, backgroundColor: "e6f2ff" }}>
        <Grid container spacing={2}>
          <Grid item xs={6} container alignItems="center">
            <Grid item xs={6}>
              <Typography>Deal Type</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                value="FO"
                disabled
                InputProps={{ sx: { width: inputWidth } }}
              />
            </Grid>
          </Grid>
          <Grid item xs={6} container alignItems="center">
            <Grid item xs={6}>
              <Typography>Region</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                value="US"
                disabled
                InputProps={{ sx: { width: inputWidth } }}
              />
            </Grid>
          </Grid>
          <Grid item xs={6} container alignItems="center">
            <Grid item xs={6}>
              <Typography>Deal Size (in Million $)</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                name="dealSize"
                value={formData.dealSize}
                onChange={handleChange}
                type="number"
                InputProps={{
                  sx: { width: inputWidth },
                  endAdornment: (
                    <InputAdornment position="end">M</InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          <Grid item xs={6} container alignItems="center">
            <Grid item xs={6}>
              <Typography>Sponsor (Y/N)</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                size="small"
                name="sponsor"
                value={formData.sponsor}
                onChange={handleChange}
                InputProps={{ sx: { width: inputWidth } }}
              >
                {options.sponsor.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid item xs={6} container alignItems="center">
            <Grid item xs={6}>
              <Typography>Percentage Primary (%)</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                name="percentagePrimary"
                value={formData.percentagePrimary}
                onChange={handleChange}
                type="number"
                InputProps={{ sx: { width: inputWidth } }}
              />
            </Grid>
          </Grid>
          <Grid item xs={6} container alignItems="center">
            <Grid item xs={6}>
              <Typography>Selected Bank</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                size="small"
                name="selectedBank"
                value={formData.selectedBank}
                onChange={handleChange}
                InputProps={{ sx: { width: inputWidth } }}
              >
                {options.selected_bank.map((bank) => (
                  <MenuItem key={bank} value={bank}>
                    {bank}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid item xs={6} container alignItems="center">
            <Grid item xs={6}>
              <Typography>Discount from Announcement Price (%)</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                name="discountFromAnnPrice"
                value={formData.discountFromAnnPrice}
                onChange={handleChange}
                type="number"
                InputProps={{ sx: { width: inputWidth } }}
              />
            </Grid>
          </Grid>
          <Grid item xs={6} container alignItems="center">
            <Grid item xs={6}>
              <Typography>Sector</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                size="small"
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                InputProps={{ sx: { width: inputWidth } }}
              >
                {options.sector.map((sector) => (
                  <MenuItem key={sector} value={sector}>
                    {sector}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid item xs={6} container alignItems="center">
            <Grid item xs={6}>
              <Typography>Allocation as % of Deal Size</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                name="allocationPercentDeal"
                value={formData.allocationPercentDeal}
                onChange={handleChange}
                type="number"
                InputProps={{ sx: { width: inputWidth } }}
              />
            </Grid>
          </Grid>
          <Grid item xs={6} container alignItems="center">
            <Grid item xs={6}>
              <Typography>Allocation as % of IOI</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                name="allocationPercentIOI"
                value={formData.allocationPercentIOI}
                onChange={handleChange}
                type="number"
                InputProps={{ sx: { width: inputWidth } }}
              />
            </Grid>
          </Grid>
          <Grid item xs={6} container alignItems="center">
            <Grid item xs={6}>
              <Typography>Target Variable</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                value="T+1 Day Return"
                disabled
                InputProps={{ sx: { width: inputWidth } }}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} container justifyContent="flex-end" spacing={2}>
            <Grid item>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                disabled={loading}
              >
                Reset
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePredict}
                disabled={loading}
              >
                {loading ? "Predicting..." : "Predict"}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      {prediction && <PredictionResults result={prediction} />}
    </>
  );
};

export default MLInputForm;
