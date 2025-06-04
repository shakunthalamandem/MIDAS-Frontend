import React from "react";
import {
  Paper,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { Alert } from "@mui/material";
import PredictionResults from "./PredictionResults"; // Assuming this component is defined elsewhere

interface EquityMLFormDataProps {
  snackbar: { open: boolean; severity: "success" | "info" | "warning" | "error"; message: string };
  handleSnackbarClose: () => void;
  formData: {
    ticker: string;
    pricing_date: Date | string | null;
    deal_size_category: number | string;
    sponsor_yn_category: string;
    discount_from_announcement_price_category: number | string;
    sector_category: string;
    percentage_primary_category: number | string;
    selected_bank_category: string;
    allocation_deal_size_percentage_category: number | string;
    GDP: string;
    allocation_percentage_category: number | string;
    Inflation: string;
    Treasury: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  formErrors: { [key: string]: string };
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleReset: () => void;
  handlePredict: () => void;
  loading: boolean;
  prediction: any;
  options: {
    sponsor: string[];
    sector: string[];
    selected_bank: string[];
    gdp: string[];
    inflation: string[];
    treasury_rates: string[];
  };
  sectorLabels: { [key: string]: string };
  inputWidth: number | string;
  menuProps: object;
}

const EquityMLFormData: React.FC<EquityMLFormDataProps> = ({
  snackbar,
  handleSnackbarClose,
  formData,
  setFormData,
  formErrors,
  handleChange,
  handleReset,
  handlePredict,
  loading,
  prediction,
  options,
  sectorLabels,
  inputWidth,
  menuProps,
}) => {

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
                  setFormData((prev: typeof formData) => ({
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
                    InputProps={{ sx: { width: inputWidth, color: "#e8f4fc", fontWeight: 600 } }}
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
                    InputProps={{ sx: { width: inputWidth, color: "#e8f4fc", fontWeight: 600 } }}
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
                    // select
                    size="small"
                    // name="GDP"
                    value="Stable"
                    disabled
                    // value={formData.GDP}
                    // onChange={handleChange}
                    // error={!!formErrors.GDP}
                    // helperText={formErrors.GDP}
                    InputProps={{ sx: { width: inputWidth, color: "#e8f4fc", fontWeight: 600 } }}
                    // SelectProps={{
                    //   MenuProps: menuProps,
                    // }}
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
                    // select
                    size="small"
                    value="Stable"
                    disabled
                    // name="Inflation"
                    // value={formData.Inflation}
                    // onChange={handleChange}
                    // error={!!formErrors.Inflation}
                    // helperText={formErrors.Inflation}
                    InputProps={{ sx: { width: inputWidth, color: "#e8f4fc", fontWeight: 600 } }}
                    // SelectProps={{
                    //   MenuProps: menuProps,
                    // }}
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
                    // select
                    size="small"
                    value="Stable"
                    disabled
                    // name="Treasury"
                    // value={formData.Treasury}
                    // onChange={handleChange}
                    // error={!!formErrors.Treasury}
                    // helperText={formErrors.Treasury}
                    InputProps={{ sx: { width: inputWidth, color: "#e8f4fc", fontWeight: 600 } }}
                    // SelectProps={{
                    //   MenuProps: menuProps,
                    // }}
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
                <Grid item xs={6} sx={{color: "#002060"}}>
                  <TextField
                    size="small"
                    value="T+1 Day Return"
                    disabled
                    InputProps={{ sx: { width: inputWidth, color: "#e8f4fc", fontWeight: 600 } }}
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
    
    export default EquityMLFormData;
    