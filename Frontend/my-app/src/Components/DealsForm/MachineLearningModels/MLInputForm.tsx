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
  Snackbar,
  Alert,
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
  sp500_telecom_services: "Communication Services",
  sp500_consumer_discretionary: "Consumer Discretionary",
  sp500_consumer_staples: "Consumer Staples",
  sp500_energy: "Energy",
  sp500_financials: "Financials",
  sp500_healthcare: "Health Care",
  sp500_industrials: "Industrials",
  sp500_information_technology: "Information Technology",
  sp500_materials: "Materials",
  sp500_real_estate: "Real Estate",
  sp500_utilities: "Utilities",
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
  ticker: string;
  pricing_date: Date | null;
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

type FormErrors = {
  [key in keyof FormData]?: string;
};
type MLInputFormProps = {
  options: OptionsResponse;
  initialData?: Partial<FormData>; // <-- Add this
};


const MLInputForm: React.FC<MLInputFormProps> = ({ options,initialData  }) => {
const defaultFormData: FormData = {
  ticker: "",
  pricing_date: null,
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



const [formData, setFormData] = useState<FormData>(defaultFormData);

useEffect(() => {
  if (initialData) {
    setFormData((prev) => ({
      ...prev,
      ...initialData,
    }));
  }
}, [initialData]);

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error" as "error" | "success",
  });

  const inputWidth = 250;
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Check all required fields
    Object.entries(formData).forEach(([key, value]) => {
      if (
        !value &&
        key !== "deal_type" &&
        key !== "region" &&
        key !== "target"
      ) {
        errors[key as keyof FormData] = "This field is required";
        isValid = false;
      }
    });

    // Validate numeric fields
    if (parseFloat(formData.deal_size_category) <= 0) {
      errors.deal_size_category = "Must be greater than 0";
      isValid = false;
    }
    if (
      parseFloat(formData.percentage_primary_category) < 0 ||
      parseFloat(formData.percentage_primary_category) > 100
    ) {
      errors.percentage_primary_category = "Must be between 0 and 100";
      isValid = false;
    }
    if (
      parseFloat(formData.allocation_deal_size_percentage_category) < 0 ||
      parseFloat(formData.allocation_deal_size_percentage_category) > 100
    ) {
      errors.allocation_deal_size_percentage_category =
        "Must be between 0 and 100";
      isValid = false;
    }
    if (
      parseFloat(formData.allocation_percentage_category) < 0 ||
      parseFloat(formData.allocation_percentage_category) > 100
    ) {
      errors.allocation_percentage_category = "Must be between 0 and 100";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (
    e:
      | { target: { name: string; value: any } }
      | React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when field is modified
    if (formErrors[name as keyof FormData]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handlePredict = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields correctly",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/ml_multi_model_prediction/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error("Prediction error:", error);
      setSnackbar({
        open: true,
        message: "Failed to get prediction. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(defaultFormData);
    setFormErrors({});
    setPrediction(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (!options || !options.selected_bank?.length)
    return <Typography>Loading form options...</Typography>;

  return (
    <>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

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
              <Typography>Ticker Symbol</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                size="small"
                name="ticker"
                value={formData.ticker}
                onChange={handleChange}
                type="string"
                placeholder="e.g., AAPL"
                error={!!formErrors.ticker}
                helperText={formErrors.ticker}
                InputProps={{
                  sx: { width: inputWidth },
                }}
              />
            </Grid>
          </Grid>
          <Grid item xs={6} container alignItems="center">
            <Grid item xs={6}>
              <Typography>Pricing Date</Typography>
            </Grid>

            <Grid item xs={6}>
          <TextField
            size="small"
            type="date"
            name="pricing_date"
            value={
              formData.pricing_date
                ? new Date(formData.pricing_date).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                pricing_date: e.target.value ? new Date(e.target.value) : null,
              }))
            }
            InputProps={{ sx: { width: inputWidth } }}
          />
            </Grid>
          </Grid>
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
                value={String(formData.deal_size_category || "")}
                onChange={handleChange}
                type="number"
                placeholder="e.g., 100"
                error={!!formErrors.deal_size_category}
                helperText={formErrors.deal_size_category}
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
                error={!!formErrors.sponsor_yn_category}
                helperText={formErrors.sponsor_yn_category}
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
                error={!!formErrors.discount_from_announcement_price_category}
                helperText={
                  formErrors.discount_from_announcement_price_category
                }
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
                error={!!formErrors.sector_category}
                helperText={formErrors.sector_category}
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
                error={!!formErrors.percentage_primary_category}
                helperText={formErrors.percentage_primary_category}
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
                error={!!formErrors.selected_bank_category}
                helperText={formErrors.selected_bank_category}
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
                error={!!formErrors.allocation_deal_size_percentage_category}
                helperText={formErrors.allocation_deal_size_percentage_category}
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
                error={!!formErrors.GDP}
                helperText={formErrors.GDP}
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
                error={!!formErrors.allocation_percentage_category}
                helperText={formErrors.allocation_percentage_category}
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
                error={!!formErrors.Inflation}
                helperText={formErrors.Inflation}
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
                error={!!formErrors.Treasury}
                helperText={formErrors.Treasury}
                InputProps={{ sx: { width: inputWidth } }}
                SelectProps={{
                  MenuProps: menuProps,
                }}
              >
                {options.treasury_rates.map((treasury_rates_value) => (
                  <MenuItem
                    key={treasury_rates_value}
                    value={treasury_rates_value}
                  >
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
                startIcon={
                  loading && <CircularProgress size={20} color="inherit" />
                }
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
