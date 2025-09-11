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
import IPOPredictionResults from "./IPOPredictionResults";

interface OptionsData {
  region: string[];
  selected_bank: string[];
  sponsor: string[];
  sector: string[];
  target: string[];
  deal_status: string[];
}

interface PredictionModel {
  prediction: string | null;
  accuracy: number;
  confidence: number;
  model: string;
  range: string;
  explanation?: string;
}

interface IPOFormValues {
  ticker: string;
  pricing_date: Date | null;
  deal_type: string;
  region: string;
  deal_size_category: string;
  percentage_primary_category: string;
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
  revenue_category: string; // number string ($M)
  revenue_growth_category: string; // number string (%), can be negative
  net_profit_margin_category: string; // number string (%), can be negative
}

interface IPOFormProps {
  values: IPOFormValues;
  setValues: React.Dispatch<React.SetStateAction<IPOFormValues>>;
  options: OptionsData;
  autoPredict?: boolean;
  onAutoPredictComplete?: () => void;
}

const IPOForm: React.FC<IPOFormProps> = ({
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

  const formatSector = (sectorCode: string): string => {
    if (!sectorCode) return "";
    const cleaned = sectorCode.replace(/^(sp500_|nasdaq_|nyse_)/i, "");
    return cleaned
      .split("_")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

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
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    let isValid = true;
    const data = values;

    // Required fields (same logic as before)
    Object.entries(data).forEach(([key, val]) => {
      if (
        !val &&
        val !== 0 &&
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

    // Deal Size > 0
    if (parseFloat(data.deal_size_category) <= 0) {
      errors.deal_size_category = "Must be greater than 0";
      isValid = false;
    }

    // NEW: Revenue >= 0
    const revenue = parseFloat(String(data.revenue_category ?? ""));
    if (isNaN(revenue) || revenue < 0) {
      errors.revenue_category = "Must be ≥ 0";
      isValid = false;
    }

    // % fields in [0,100]
    const percentFields: Array<keyof IPOFormValues> = [
      "percentage_primary_category",
      "allocation_deal_size_percentage_category",
      "allocation_percentage_category",
    ];
    percentFields.forEach((field) => {
      const val = parseFloat(String(data[field] ?? ""));
      if (isNaN(val) || val < 0 || val > 100) {
        errors[field] = "Must be between 0 and 100";
        isValid = false;
      }
    });

    // NEW: growth & margin in [-100, 100]
    const boundedPct = (
      field: keyof IPOFormValues,
      label = "Must be between -100 and 100"
    ) => {
      const v = parseFloat(String(data[field] ?? ""));
      if (isNaN(v) || v < -100 || v > 100) {
        errors[field] = label;
        isValid = false;
      }
    };
    boundedPct("revenue_growth_category");
    boundedPct("net_profit_margin_category");

    setFormErrors(errors);
    return isValid;
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
    setSnackbar({ open: false, message: "", severity: "error" });
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");
    const payload = {
      ...values,
      deal_type: "IPO",
      GDP: "Stable",
      Inflation: "Stable",
      Treasury: "Stable",
      expectations: ["T1D"],
      revenue_category: values.revenue_category,
      revenue_growth_category: values.revenue_growth_category,
      net_profit_margin_category: values.net_profit_margin_category,
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

  const handleRepredictWithPrice = async (openPrice: number) => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");
    const payload = {
      ...values,
      deal_type: "IPO",
      GDP: "Stable",
      Inflation: "Stable",
      Treasury: "Stable",
      t1d_open_category: openPrice,
      expectations: ["T1D"],
      revenue_category: values.revenue_category,
      revenue_growth_category: values.revenue_growth_category,
      net_profit_margin_category: values.net_profit_margin_category,
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

  const handleReset = () => {
    setValues((prev) => ({
      ...prev,
      ticker: "",
      pricing_date: null,
      region: "US",
      deal_size_category: "",
      percentage_primary_category: "",
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
      // NEW:
      revenue_category: "",
      revenue_growth_category: "",
      net_profit_margin_category: "",
    }));
    setFormErrors({});
    setPrediction(null);
    setSnackbar({ open: false, message: "", severity: "error" });
  };

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
    // No Discount field for IPO
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
      label: "Revenue ($ Million)",
      name: "revenue_category",
      type: "number",
      adornment: "$M",
      placeholder: "e.g., 250",
    },
    {
      label: "Revenue Growth (%)",
      name: "revenue_growth_category",
      type: "number",
      adornment: "%",
      placeholder: "e.g., 15",
    },
    {
      label: "Net Profit Margin (%)",
      name: "net_profit_margin_category",
      type: "number",
      adornment: "%",
      placeholder: "e.g., 12.5",
    },

    {
      label: "Deal Status",
      name: "deal_status",
      selectOptions: options.deal_status,
    },
  ];

  return (
    <>
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
            let value: any;
            if (field.name === "target_variable") {
              value = "T+1 Day Return (close)";
            } else {
              value = values[field.name as keyof IPOFormValues] ?? "";
            }
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

      {prediction && (
        <IPOPredictionResults
          result={prediction}
          onRepredict={handleRepredictWithPrice}
        />
      )}
    </>
  );
};

export default IPOForm;
