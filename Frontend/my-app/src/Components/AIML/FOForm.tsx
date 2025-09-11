import React, { useEffect, useState } from "react";
import {
  Paper,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import FOWeeklyMonthlyPredictionResults from "./FOWeeklyMonthlyPredictionResults";
import FOPredictionResults from "./FOPredictionResults";

interface PredictionModel {
  prediction: string | null;
  accuracy: number;
  confidence: number;
  model: string;
  range: string;
  explanation?: string;
}

interface OptionsData {
  region: string[];
  selected_bank: string[];
  sponsor: string[];
  sector: string[];
  target: string[];
  deal_status: string[];
  // deal_type, gdp, inflation, treasury_rates not used in form UI
}

interface FOFormValues {
  ticker: string;
  pricing_date: Date | null;
  deal_type: string;
  region: string;
  deal_size_category: string;
  percentage_primary_category: string;
  discount_from_announcement_price_category: string;
  allocation_deal_size_percentage_category: string;
  allocation_percentage_category: string;
  selected_bank_category: string;
  sponsor_yn_category: string;
  sector_category: string;
  deal_status: string;
  GDP: string;
  Inflation: string;
  Treasury: string;
  target: string;
}

interface FOFormProps {
  values: FOFormValues;
  setValues: React.Dispatch<React.SetStateAction<FOFormValues>>;
  options: OptionsData;
  autoPredict?: boolean;
  onAutoPredictComplete?: () => void;
}

const FOForm: React.FC<FOFormProps> = ({
  values,
  setValues,
  options,
  autoPredict = false,
  onAutoPredictComplete,
}) => {
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "success";
  }>({ open: false, message: "", severity: "error" });
  const [prediction, setPrediction] = useState<Record<
    string,
    PredictionModel
  > | null>(null);
  const [weeklyPrediction, setWeeklyPrediction] = useState<Record<
    string,
    PredictionModel
  > | null>(null);

  // Utility to format sector codes (e.g., "sp500_energy" -> "Energy")
  const formatSector = (sectorCode: string): string => {
    if (!sectorCode) return "";
    // Remove common prefixes and capitalize words
    const cleaned = sectorCode.replace(/^(sp500_|nasdaq_|nyse_)/i, "");
    return cleaned
      .split("_")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Handle input field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "pricing_date") {
      setValues((prev) => ({
        ...prev,
        pricing_date: value ? new Date(value) : null,
      }));
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
    // Clear any existing error on this field when user modifies it
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate form fields before prediction
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    let isValid = true;
    const data = values;
    // Required field check (skip optional fields and those with default values)
    Object.entries(data).forEach(([key, val]) => {
      if (
        !val &&
        val !== 0 && // empty (treat 0 as filled)
        key !== "region" &&
        key !== "target" &&
        key !== "GDP" &&
        key !== "Inflation" &&
        key !== "Treasury"
      ) {
        errors[key] = "This field is required";
        isValid = false;
      }
    });
    // Additional numeric validations
    if (parseFloat(data.deal_size_category) <= 0) {
      errors.deal_size_category = "Must be greater than 0";
      isValid = false;
    }
    const percentFields: Array<keyof FOFormValues> = [
      "percentage_primary_category",
      "allocation_deal_size_percentage_category",
      "allocation_percentage_category",
    ];
    percentFields.forEach((field) => {
      const rawValue = data[field];
      const val = parseFloat(
        typeof rawValue === "string"
          ? rawValue
          : rawValue instanceof Date
            ? rawValue.toString()
            : rawValue === null || rawValue === undefined
              ? ""
              : String(rawValue)
      );
      if (val < 0 || val > 100) {
        errors[field] = "Must be between 0 and 100";
        isValid = false;
      }
    });
    setFormErrors(errors);
    return isValid;
  };

  // Submit prediction request
  const handlePredict = async () => {
    if (!validateForm()) {
      // Show a general error message if form invalid
      setSnackbar({
        open: true,
        message: "Please fill in all required fields correctly",
        severity: "error",
      });
      return;
    }
    setLoading(true);
    setSnackbar({ open: false, message: "", severity: "error" });
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");
    // Prepare payload (enforce some fields to default stable values)
    const payload = {
      ...values,
      deal_type: "FO",
      GDP: "Stable",
      Inflation: "Stable",
      Treasury: "Stable",
      expectations: ["T1D"],
    };
    try {
      const res = await fetch(`${apiUrl}/api/ai_ml_predictions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Prediction request failed");
      const data = await res.json();
      setPrediction(data.predictions);
      setWeeklyPrediction(null); // reset any previous weekly/monthly predictions
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

  // Handle repredict with open price (for T+1 Day open price scenario)
  const handleRepredictWithPrice = async (openPrice: number) => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");
    const payload = {
      ...values,
      deal_type: "FO",
      GDP: "Stable",
      Inflation: "Stable",
      Treasury: "Stable",
      t1d_open_category: openPrice,
      expectations: ["T1D"],
    };
    try {
      const res = await fetch(`${apiUrl}/api/ai_ml_predictions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Repredict request failed");
      const data = await res.json();
      setPrediction(data.predictions);
      // Note: weeklyPrediction remains as is; user can still use previous T+1D return or re-enter
    } catch (error) {
      console.error("Repredict error:", error);
      setSnackbar({
        open: true,
        message: "Failed to update prediction. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle request for weekly/monthly prediction after user provides T+1D return
  const handleWeeklyMonthlyRepredict = async (
    t1dCloseReturn: number
  ): Promise<Record<string, PredictionModel>> => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");
    const payload = {
      ...values,
      deal_type: "FO",
      GDP: "Stable",
      Inflation: "Stable",
      Treasury: "Stable",
      t1d_return_from_bloomberg_category: t1dCloseReturn,
      expectations: ["T1W", "T1M"],
    };
    try {
      const res = await fetch(`${apiUrl}/api/ai_ml_predictions/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Weekly/Monthly prediction failed");
      const fullResponse = await res.json();
      const fullData = fullResponse.predictions;
      // Simplify the response to only include prediction, Accuracy, Confidence, range
      const simplified: Record<string, PredictionModel> = {};
      for (const key in fullData) {
        const { prediction, Accuracy, Confidence, range } = fullData[key];
        simplified[key] = {
          prediction,
          accuracy: Accuracy,
          confidence: Confidence,
          model: "",
          range,
        };
      }
      setWeeklyPrediction(simplified);
      return simplified;
    } catch (error) {
      console.error("Weekly/Monthly repredict error:", error);
      setSnackbar({
        open: true,
        message: "Failed to get weekly/monthly predictions.",
        severity: "error",
      });
      return {};
    }
  };

  // Reset form to default values
  const handleReset = () => {
    // Default values for FO form
    setValues((prev) => ({
      ...prev,
      ticker: "",
      pricing_date: null,
      region: "US",
      deal_size_category: "",
      percentage_primary_category: "",
      discount_from_announcement_price_category: "",
      allocation_deal_size_percentage_category: "",
      allocation_percentage_category: "",
      selected_bank_category: "",
      sponsor_yn_category: "",
      sector_category: "",
      deal_status: "Announced",
      GDP: "Stable",
      Inflation: "Stable",
      Treasury: "Stable",
      target: "T1D",
    }));
    setFormErrors({});
    setPrediction(null);
    setWeeklyPrediction(null);
    setSnackbar({ open: false, message: "", severity: "error" });
  };

  // Auto-predict effect: trigger prediction when autoPredict flag is set
  useEffect(() => {
    if (autoPredict) {
      (async () => {
        const valid = validateForm();
        if (valid) {
          await handlePredict();
        }
        onAutoPredictComplete && onAutoPredictComplete();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPredict]);

  const fields = [
    { label: "Region", name: "region", disabled: true },
    { label: "Target Variable", name: "target_variable", disabled: true },
    {
      label: "Ticker Symbol",
      name: "ticker",
      type: "string",
      placeholder: "e.g., AAPL",
    },
    { label: "Pricing Date", name: "pricing_date", type: "date" },

    {
      label: "Deal Size ($ Million)",
      name: "deal_size_category",
      type: "number",
      adornment: "$M",
      placeholder: "e.g., 100",
    },
    {
      label: "Sponsor (Y/N)",
      name: "sponsor_yn_category",
      selectOptions: options.sponsor,
    },
    {
      label: "Discount from Announcement Price (%)",
      name: "discount_from_announcement_price_category",
      type: "number",
      adornment: "%",
      placeholder: "e.g., 2",
    },
    { label: "Sector", name: "sector_category", selectOptions: options.sector },
    {
      label: "Percentage Primary (%)",
      name: "percentage_primary_category",
      type: "number",
      adornment: "%",
      placeholder: "e.g., 100",
    },
    {
      label: "Selected Bank",
      name: "selected_bank_category",
      selectOptions: options.selected_bank,
    },
    {
      label: "Allocation as % of Deal Size",
      name: "allocation_deal_size_percentage_category",
      type: "number",
      adornment: "%",
      placeholder: "e.g., 0.5",
    },
    {
      label: "Allocation as % of IOI",
      name: "allocation_percentage_category",
      type: "number",
      adornment: "%",
      placeholder: "e.g., 30",
    },

    {
      label: "Deal Status",
      name: "deal_status",
      selectOptions: options.deal_status,
    },
  ];

  return (
    <>
      {/* Snackbar for form errors or API errors */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Paper
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          mb: 2,
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          boxShadow: "0px 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        <Grid container spacing={2}>
          {fields.map((field, idx) => {
            // Determine current value or default display value
            let value: any;
            if (field.name === "target_variable") {
              value = "T+1 Day Return (close)"; // display only
            } else {
              value = values[field.name as keyof FOFormValues] ?? "";
            }
            // Compute if this is the last single field needing full width
            const isLastSingle =
              idx === fields.length - 1 && fields.length % 2 === 1;
            return (
              <Grid item xs={12} sm={isLastSingle ? 12 : 6} key={field.name}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { sm: "center" },
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      width: { xs: "100%", sm: "180px", md: "200px" },
                      minWidth: { sm: "180px", md: "200px" },
                      fontWeight: 500,
                    }}
                  >
                    {field.label}
                  </Typography>
                  {/* Select vs Input field rendering */}
                  {field.selectOptions ? (
                    <TextField
                      select
                      size="small"
                      name={field.name}
                      value={value}
                      onChange={handleChange}
                      disabled={!!field.disabled}
                      error={!!formErrors[field.name]}
                      helperText={formErrors[field.name]}
                      fullWidth
                      SelectProps={{
                        MenuProps: {
                          PaperProps: {
                            sx: {
                              maxHeight: 300, // limit height
                              overflowY: "auto", // enable scroll
                            },
                          },
                        },
                      }}
                    >
                      {field.selectOptions.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {field.name === "sector_category"
                            ? formatSector(opt)
                            : opt}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <TextField
                      size="small"
                      name={field.name}
                      type={field.type || "text"}
                      value={
                        field.type === "date" && value
                          ? new Date(value).toISOString().split("T")[0]
                          : value
                      }
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      disabled={!!field.disabled}
                      error={!!formErrors[field.name]}
                      helperText={formErrors[field.name]}
                      fullWidth
                      InputProps={{
                        startAdornment:
                          field.adornment && field.adornment.startsWith("$") ? (
                            <InputAdornment position="start">$</InputAdornment>
                          ) : undefined,
                        endAdornment:
                          field.adornment &&
                          (field.adornment === "%" ||
                            field.adornment === "M" ||
                            field.adornment.endsWith("%") ||
                            field.adornment.endsWith("M")) ? (
                            <InputAdornment position="end">
                              {field.adornment.replace("$", "")}
                            </InputAdornment>
                          ) : undefined,
                      }}
                    />
                  )}
                </Box>
              </Grid>
            );
          })}
          {/* Action buttons */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", sm: "flex-end" },
                flexWrap: "wrap",
                gap: 2,
                mt: 2,
              }}
            >
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                disabled={loading}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePredict}
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : undefined
                }
              >
                {loading ? "Predicting..." : "Predict"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Prediction Results (displayed after a prediction is made) */}
      {prediction && (
        <>
          <FOPredictionResults
            result={prediction}
            onRepredict={handleRepredictWithPrice}
          />
          <FOWeeklyMonthlyPredictionResults
            result={weeklyPrediction}
            onWeeklyMonthlyRepredict={handleWeeklyMonthlyRepredict}
          />
        </>
      )}
    </>
  );
};

export default FOForm;
