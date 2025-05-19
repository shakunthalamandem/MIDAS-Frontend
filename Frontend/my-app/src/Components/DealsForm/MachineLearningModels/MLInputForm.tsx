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

const sectorLabels: Record<string, string> = {
  sp500_telecom_services: 'Communication Services',
  sp500_consumer_discretionary: 'Consumer Discretionary',
  sp500_consumer_staples: 'Consumer Staples',
  sp500_energy: 'Energy',
  sp500_financials: 'Financials',
  sp500_healthcare: 'Health Care',
  sp500_industrials: 'Industrials',
  sp500_information_technology: 'Information Technology',
  sp500_materials: 'Materials',
  sp500_real_estate: 'Real Estate',
  sp500_utilities: 'Utilities',
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
  deal_type: string;
  region: string;
  target: string;
  deal_size_category: string;
  percentage_primary_category: string;
  discount_from_announcement_price_category: string;
  allocation_deal_size_percentage_category: string;
  allocation_percentage_category: string;
  selected_bank_category: string;
  sponsor_yn_category: string;
  sector_category: string;
  GDP: string;
  Inflation: string;
  Treasury: string;
};
type MLInputFormProps = {
  options: OptionsResponse;
};

const MLInputForm: React.FC<MLInputFormProps> = ({ options }) => {
  const defaultFormData = {
    deal_type: "FO",
    region: "US",
    target: "T1D",
    sponsor_yn_category: "",
    deal_size_category: "",
    selected_bank_category: "",
    percentage_primary_category: "",
    sector_category: "",
    discount_from_announcement_price_category: "",
    allocation_deal_size_percentage_category: "",
    allocation_percentage_category: "",
    GDP: "",
    Inflation: "",
    Treasury: "",
  };
  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const inputWidth = 250;
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('access_token');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePredict = async () => {
    setLoading(true);
    const response = await fetch(`${apiUrl}/api/ml_multi_model_prediction/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    // const fakePrediction = {
    //     main_model: {
    //       prediction: "Positive",
    //       accuracy: 61.87
    //     },
    //     positive_model: {
    //       prediction: "False",
    //       confidence: 64.84
    //     },
    //     negative_model: {
    //       prediction: "False",
    //       confidence: 61
    //     }
    //   };
    
    setTimeout(() => {
      setPrediction(data);
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
                name="deal_size_category"
                value={formData.deal_size_category}
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
                name="sponsor_yn_category"
                value={formData.sponsor_yn_category}
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
                name="discount_from_announcement_price_category"
                value={formData.discount_from_announcement_price_category}
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
              name="sector_category"
              value={formData.sector_category}
              onChange={handleChange}
              InputProps={{ sx: { width: inputWidth } }}
              SelectProps={{
                MenuProps: menuProps,
              }}
            >
              {options.sector.map((sectorSlug) => (
                <MenuItem key={sectorSlug} value={sectorSlug}>
                  {sectorLabels[sectorSlug] || sectorSlug}
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
                name="percentage_primary_category"
                value={formData.percentage_primary_category}
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
                name="selected_bank_category"
                value={formData.selected_bank_category}
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
                name="allocation_deal_size_percentage_category"
                value={formData.allocation_deal_size_percentage_category}
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
                name="GDP"
                value={formData.GDP}
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
                name="allocation_percentage_category"
                value={formData.allocation_percentage_category}
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
              <Typography>Inflation Rate</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                size="small"
                name="Inflation"
                value={formData.Inflation}
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
                name="Treasury"
                value={formData.Treasury}
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
