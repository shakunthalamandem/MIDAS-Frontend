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
  Box,
} from "@mui/material";
import { Alert } from "@mui/material";

interface EquityMLFormDataProps {
  snackbar: {
    open: boolean;
    severity: "success" | "info" | "warning" | "error";
    message: string;
  };
  handleSnackbarClose: () => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  formErrors: { [key: string]: string };
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
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
  sectorLabels: Record<string, string>;
  inputWidth: number | string;
  menuProps: object;
}

const inputFields: {
  label: string;
  name: string;
  type?: "string" | "number" | "date";
  placeholder?: string;
  adornment?: string;
  disabled?: boolean;
  selectOptions?: string[];
  labelMap?: Record<string, string>;
}[] = [
  { label: "Ticker Symbol", name: "ticker", type: "string", placeholder: "e.g., AAPL" },
  { label: "Pricing Date", name: "pricing_date", type: "date" },
  {
    label: "Deal Type",
    name: "deal_type",
    selectOptions: ["FO", "IPO"],
  },
  { label: "Region", name: "region", disabled: true },
  { label: "Deal Size ($ Million)", name: "deal_size_category", type: "number", adornment: "$M", placeholder: "e.g., 100" },
  { label: "Sponsor (Y/N)", name: "sponsor_yn_category", type: "string", selectOptions: [], placeholder: "Select sponsor" },
  { label: "Discount from Announcement Price (%)", name: "discount_from_announcement_price_category", type: "number", adornment: "%", placeholder: "e.g., 2" },
  { label: "Sector", name: "sector_category", selectOptions: [], labelMap: {} },
  { label: "Percentage Primary (%)", name: "percentage_primary_category", type: "number", adornment: "%", placeholder: "e.g., 100" },
  { label: "Selected Bank", name: "selected_bank_category", selectOptions: [] },
  { label: "Allocation as % of Deal Size", name: "allocation_deal_size_percentage_category", type: "number", adornment: "%", placeholder: "e.g., 0.5" },
  { label: "Allocation as % of IOI", name: "allocation_percentage_category", type: "number", adornment: "%", placeholder: "e.g., 30" },
  { label: "Target Variable", name: "target_variable", disabled: true },
];

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
  options,
  sectorLabels,
  menuProps,
}) => {
  // Separate deal_type and region so they show first
  const prioritizedFields = ["deal_type", "region"];

  const fieldsToRender = [
    // deal_type and region first
    ...inputFields.filter((f) => prioritizedFields.includes(f.name)),
    // then everything else except deal_type & region
    ...inputFields.filter((f) => !prioritizedFields.includes(f.name)),
  ];

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
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
          backgroundColor: "#fff",
          border: "1px solid #e0e0e0",
          boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.06)",
        }}
      >
        <Grid container spacing={1.5}>
          {fieldsToRender.map(
            ({
              label,
              name,
              type = "string",
              placeholder = "",
              adornment,
              disabled = false,
              selectOptions,
              labelMap,
            }) => {
              // hide discount field when deal_type is IPO
              if (
                name === "discount_from_announcement_price_category" &&
                formData.deal_type === "IPO"
              ) {
                return null;
              }

              const value =
                formData[name] ??
                (name === "deal_type"
                  ? "FO"
                  : name === "region"
                  ? "US"
                  : name === "target_variable"
                  ? "T+1 Day Return(close)"
                  : "");

              const finalSelectOptions =
                name === "sponsor_yn_category"
                  ? options.sponsor
                  : name === "sector_category"
                  ? options.sector
                  : name === "selected_bank_category"
                  ? options.selected_bank
                  : name === "GDP"
                  ? options.gdp
                  : name === "Inflation"
                  ? options.inflation
                  : name === "Treasury"
                  ? options.treasury_rates
                  : selectOptions;

              const finalLabelMap =
                name === "sector_category" ? sectorLabels : labelMap;

              return (
                <Grid item xs={12} sm={6} key={name}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { sm: "center" },
                      gap: 1,
                      minHeight: { sm: "48px" },
                    }}
                  >
                    <Typography
                      sx={{
                        width: { xs: "100%", sm: "180px", md: "200px" },
                        minWidth: { sm: "180px", md: "200px" },
                        fontSize: { xs: "0.875rem", sm: "0.875rem", md: "1rem" },
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </Typography>

                    {finalSelectOptions ? (
                      <TextField
                        select
                        size="small"
                        name={name}
                        value={value}
                        onChange={handleChange}
                        error={!!formErrors[name]}
                        helperText={formErrors[name]}
                        fullWidth
                        sx={{
                          maxWidth: { xs: "100%", sm: "200px", md: "220px" },
                          minWidth: { sm: "200px", md: "220px" },
                        }}
                        SelectProps={{ MenuProps: menuProps }}
                      >
                        {finalSelectOptions.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {finalLabelMap?.[opt] ?? opt}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <TextField
                        size="small"
                        name={name}
                        type={type}
                        value={
                          type === "date" && value
                            ? new Date(value).toISOString().split("T")[0]
                            : value
                        }
                        onChange={
                          name === "pricing_date"
                            ? (e) =>
                                setFormData((prev: typeof formData) => ({
                                  ...prev,
                                  pricing_date: e.target.value
                                    ? new Date(e.target.value)
                                    : null,
                                }))
                            : handleChange
                        }
                        placeholder={placeholder}
                        error={!!formErrors[name]}
                        helperText={formErrors[name]}
                        disabled={disabled}
                        fullWidth
                        sx={{
                          maxWidth: { xs: "100%", sm: "200px", md: "220px" },
                          minWidth: { sm: "200px", md: "220px" },
                        }}
                        InputProps={{
                          startAdornment:
                            typeof adornment === "string" &&
                            adornment.startsWith("$") ? (
                              <InputAdornment position="start">$</InputAdornment>
                            ) : undefined,
                          endAdornment:
                            typeof adornment === "string" &&
                            (adornment.endsWith("%") || adornment.endsWith("M")) ? (
                              <InputAdornment position="end">
                                {adornment.replace("$", "")}
                              </InputAdornment>
                            ) : undefined,
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              );
            }
          )}

          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", sm: "flex-end" },
                gap: 2,
                mt: 2,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                disabled={loading}
                sx={{ minWidth: "100px" }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePredict}
                disabled={loading}
                startIcon={
                  loading && <CircularProgress size={20} color="inherit" />
                }
                sx={{ minWidth: "120px" }}
              >
                {loading ? "Predicting..." : "Predict"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default EquityMLFormData;
