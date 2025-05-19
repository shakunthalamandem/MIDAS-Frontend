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
import { MenuProps } from "@mui/material";

const menuProps: Partial<MenuProps> = {
  PaperProps: {
    style: {
      maxHeight: 200,
      width: 250,
    },
  },
};

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

type FormData = {
  dealSize: string;
  percentagePrimary: string;
  discountFromAnnPrice: string;
  allocationPercentDeal: string;
  allocationPercentIOI: string;
  selectedBank: string;
  sponsor: string;
  sector: string;
  gdp: string;
  inflation: string;
  treasury_rates: string;
};
type MLInputFormProps = {
  options: OptionsResponse;
};

const MLInputForm: React.FC<MLInputFormProps> = ({ options }) => {
  const defaultFormData = {
    sponsor: "",
    dealSize: "",
    selectedBank: "",
    percentagePrimary: "",
    sector: "",
    discountFromAnnPrice: "",
    allocationPercentDeal: "",
    allocationPercentIOI: "",
    gdp: "",
    inflation: "",
    treasury_rates: "",
  };
  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const inputWidth = 250;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
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

  if (!options || !options.selected_bank?.length)
    return <Typography>Loading form options...</Typography>;

  return (
    <>
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          backgroundColor: "#ffffff",
          boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.06)",
          border: "1px solid #e0e0e0",
        }}
      >
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
              <Typography>Deal Size ($ Million)</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                name="dealSize"
                value={formData.dealSize}
                onChange={handleChange}
                type="number"
                placeholder="e.g., 100"
                InputProps={{
                  sx: { width: inputWidth },
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">Million</InputAdornment>
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
                SelectProps={{
                  MenuProps: menuProps,
                }}
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
              <Typography>Discount from Announcement Price (%)</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                name="discountFromAnnPrice"
                value={formData.discountFromAnnPrice}
                onChange={handleChange}
                type="number"
                placeholder="e.g., 2"
                InputProps={{
                  sx: { width: inputWidth },
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
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
                SelectProps={{
                  MenuProps: menuProps,
                }}
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
              <Typography>Percentage Primary (%)</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                name="percentagePrimary"
                value={formData.percentagePrimary}
                onChange={handleChange}
                type="number"
                placeholder="e.g., 100"
                InputProps={{
                  sx: { width: inputWidth },
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
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
                SelectProps={{
                  MenuProps: menuProps,
                }}
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
              <Typography>Allocation as % of Deal Size</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                name="allocationPercentDeal"
                value={formData.allocationPercentDeal}
                onChange={handleChange}
                type="number"
                placeholder="e.g., 0.5"
                InputProps={{
                  sx: { width: inputWidth },
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          <Grid item xs={6} container alignItems="center">
            <Grid item xs={6}>
              <Typography>GDP Growth</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                size="small"
                name="gdp"
                value={formData.gdp}
                onChange={handleChange}
                InputProps={{ sx: { width: inputWidth } }}
                SelectProps={{
                  MenuProps: menuProps,
                }}
              >
                {options.gdp.map((gdp_value) => (
                  <MenuItem key={gdp_value} value={gdp_value}>
                    {gdp_value}
                  </MenuItem>
                ))}
              </TextField>
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
                placeholder="e.g., 30"
                InputProps={{
                  sx: { width: inputWidth },
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          <Grid item xs={6} container alignItems="center">
            <Grid item xs={6}>
              <Typography>Infaltion Rate</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                size="small"
                name="inflation"
                value={formData.inflation}
                onChange={handleChange}
                InputProps={{ sx: { width: inputWidth } }}
                SelectProps={{
                  MenuProps: menuProps,
                }}
              >
                {options.inflation.map((inflation_value) => (
                  <MenuItem key={inflation_value} value={inflation_value}>
                    {inflation_value}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Grid item xs={6} container alignItems="center">
            <Grid item xs={6}>
              <Typography>Treasury Rates</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                size="small"
                name="treasury_rates"
                value={formData.treasury_rates}
                onChange={handleChange}
                InputProps={{ sx: { width: inputWidth } }}
                SelectProps={{
                  MenuProps: menuProps,
                }}
              >
                {options.treasury_rates.map((treasury_rates_value) => (
                  <MenuItem key={treasury_rates_value} value={treasury_rates_value}>
                    {treasury_rates_value}
                  </MenuItem>
                ))}
              </TextField>
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
