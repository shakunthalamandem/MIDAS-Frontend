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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";


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

  // NEW: fundamentals + feature for APIs
  revenue_category: string;             // e.g. in $M
  revenue_growth_category: string;      // %
  net_profit_margin_category: string;   // %
  issue_to_pre_day_close_return_category: number; // %
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
  const [prediction, setPrediction] = useState<Record<string, PredictionModel> | null>(null);
  const [weeklyPrediction, setWeeklyPrediction] = useState<Record<string, PredictionModel> | null>(null);

  const formatSector = (sectorCode: string): string => {
    if (!sectorCode) return "";
    const cleaned = sectorCode.replace(/^(sp500_|nasdaq_|nyse_)/i, "");
    return cleaned
      .split("_")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "pricing_date") {
      setValues((prev) => ({ ...prev, pricing_date: value ? new Date(value) : null }));
    } else {
      setValues((prev) => ({ ...prev, [name]: value }));
    }
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    let isValid = true;
    const data = values;

    // Required fields: keep logic, but include new ones
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

    // Deal size > 0
    if (data.deal_size_category === "" || isNaN(parseFloat(data.deal_size_category)) || parseFloat(data.deal_size_category) <= 0) {
      errors.deal_size_category = "Must be greater than 0";
      isValid = false;
    }

    // Percent ranges
    const percentChecks: Array<{ key: keyof FOFormValues; label?: string; range?: [number, number] }> = [
      { key: "percentage_primary_category", range: [0, 100] },
      { key: "allocation_deal_size_percentage_category", range: [0, 100] },
      { key: "allocation_percentage_category", range: [0, 100] },

      // NEW: business-y ranges; growth/margin generally -100..100
      { key: "revenue_growth_category", range: [-1000, 1000] },

      // NEW: issue_to_pre_day_close may be negative or positive; keep a wide bound
      { key: "issue_to_pre_day_close_return_category", range: [-1000, 1000] },
    ];

    percentChecks.forEach(({ key, range }) => {
      const raw = data[key];
      const val = parseFloat(String(raw ?? ""));
      if (Number.isNaN(val)) {
        errors[String(key)] = "Enter a valid number";
        isValid = false;
      } else if (range) {
        const [lo, hi] = range;
        if (val < lo || val > hi) {
          errors[String(key)] = `Must be between ${lo} and ${hi}`;
          isValid = false;
        }
      }
    });

    // NEW: revenue non-negative
    if (data.revenue_category === "" || isNaN(parseFloat(data.revenue_category)) || parseFloat(data.revenue_category) < 0) {
      errors.revenue_category = "Must be ≥ 0";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handlePredict = async () => {
    if (!validateForm()) {
      setSnackbar({ open: true, message: "Please fill in all required fields correctly", severity: "error" });
      return;
    }
    setLoading(true);
    setSnackbar({ open: false, message: "", severity: "error" });

    const apiUrl = process.env.REACT_APP_API_URL!;
    const token = localStorage.getItem("access_token");

    // NOTE: spreading values ensures the new fields are sent
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
      setWeeklyPrediction(null);
    } catch (error) {
      console.error("Prediction error:", error);
      setSnackbar({ open: true, message: "Failed to get prediction. Please try again.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRepredictWithPrice = async (openPrice: number) => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL!;
    const token = localStorage.getItem("access_token");

    const payload = {
      ...values, // includes new fields
      deal_type: "FO",
      GDP: "Stable",
      Inflation: "Stable",
      Treasury: "Stable",
      t1d_open_return_category: openPrice,
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
    } catch (error) {
      console.error("Repredict error:", error);
      setSnackbar({ open: true, message: "Failed to update prediction. Please try again.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleWeeklyMonthlyRepredict = async (t1dCloseReturn: number): Promise<Record<string, PredictionModel>> => {
    const apiUrl = process.env.REACT_APP_API_URL!;
    const token = localStorage.getItem("access_token");
    const payload = {
      ...values, // includes new fields
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
      const simplified: Record<string, PredictionModel> = {};
      for (const key in fullData) {
        const item = fullData[key] || {};
        const prediction = item.prediction ?? item.Prediction ?? null;
        const accuracy = item.Accuracy ?? item.accuracy ?? null;
        const confidence = item.Confidence ?? item.confidence ?? null;
        const range = item.range ?? item.Range ?? null;
        const explanation = item.explanation ?? item.Explanation ?? null;
        simplified[key] = { prediction, accuracy, confidence, model: "", range, explanation };
      }
      setWeeklyPrediction(simplified);
      return simplified;
    } catch (error) {
      console.error("Weekly/Monthly repredict error:", error);
      setSnackbar({ open: true, message: "Failed to get weekly/monthly predictions.", severity: "error" });
      return {};
    }
  };

  const handleReset = () => {
    setValues((prev) => ({
      ...prev,
      ticker: "",
      pricing_date: null,
      region: "US",
      deal_type: "FO",
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

      // NEW: reset new fields
      revenue_category: "",
      revenue_growth_category: "",
      net_profit_margin_category: "",
      issue_to_pre_day_close_return_category: 0,
    }));
    setFormErrors({});
    setPrediction(null);
    setWeeklyPrediction(null);
    setSnackbar({ open: false, message: "", severity: "error" });
  };

  useEffect(() => {
    if (autoPredict) {
      (async () => {
        const valid = validateForm();
        if (valid) await handlePredict();
        onAutoPredictComplete && onAutoPredictComplete();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPredict]);

  const fields: Array<{
    label: string;
    name: keyof FOFormValues | "target_variable";
    type?: string;
    placeholder?: string;
    selectOptions?: string[];
    adornment?: string;
    disabled?: boolean;
  }> = [
    { label: "Region", name: "region", disabled: true },
    { label: "Target Variable", name: "target_variable", disabled: true },
    { label: "Ticker Symbol", name: "ticker", type: "string", placeholder: "e.g., AAPL" },
    { label: "Pricing Date", name: "pricing_date", type: "date" },

    { label: "Deal Size ($ Million)", name: "deal_size_category", type: "number", adornment: "$M", placeholder: "e.g., 100" },
    { label: "Sponsor (Y/N)", name: "sponsor_yn_category", selectOptions: options.sponsor },
    { label: "Discount from Announcement Price (%)", name: "discount_from_announcement_price_category", type: "number", adornment: "%", placeholder: "e.g., 2" },
    { label: "Sector", name: "sector_category", selectOptions: options.sector },
    { label: "Percentage Primary (%)", name: "percentage_primary_category", type: "number", adornment: "%", placeholder: "e.g., 100" },
    { label: "Selected Bank", name: "selected_bank_category", selectOptions: options.selected_bank },
    { label: "Allocation as % of Deal Size", name: "allocation_deal_size_percentage_category", type: "number", adornment: "%", placeholder: "e.g., 0.5" },
    { label: "Allocation as % of IOI", name: "allocation_percentage_category", type: "number", adornment: "%", placeholder: "e.g., 30" },

    // NEW: Fundamentals and price-feature
    { label: "Current Year Revenue ($ M)", name: "revenue_category", type: "number", adornment: "$M", placeholder: "e.g., 250" },
    { label: "Revenue Growth (%) (YOY)", name: "revenue_growth_category", type: "number", adornment: "%", placeholder: "e.g., 12.5" },
    { label: "Net Profit Margin", name: "net_profit_margin_category", selectOptions: ['Negative', 'Positive'] },
    { label: "Change in Price from T-1D to Issue(%)", name: "issue_to_pre_day_close_return_category", type: "number", adornment: "%", placeholder: "e.g., -3.2" },

    { label: "Deal Status", name: "deal_status", selectOptions: options.deal_status },
  ];

  return (
    <>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 2, borderRadius: 2, border: "1px solid #e0e0e0", boxShadow: "0px 4px 16px rgba(0,0,0,0.06)" }}>
        <Grid container spacing={2}>
          {fields.map((field, idx) => {
            let value: any;
            if (field.name === "target_variable") {
              value = "T+1 Day Return (close)";
            } else {
              value = values[field.name as keyof FOFormValues] ?? "";
            }
            const isLastSingle = idx === fields.length - 1 && fields.length % 2 === 1;

            return (
              <Grid item xs={12} sm={isLastSingle ? 12 : 6} key={String(field.name)}>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, gap: 1 }}>
                  <Typography sx={{ width: { xs: "100%", sm: "180px", md: "200px" }, minWidth: { sm: "180px", md: "200px" }, fontWeight: 500 }}>
                    {field.label}
                  </Typography>

                  {field.selectOptions ? (
                    <TextField
                      select
                      size="small"
                      name={String(field.name)}
                      value={value}
                      onChange={handleChange}
                      disabled={!!field.disabled}
                      error={!!formErrors[String(field.name)]}
                      helperText={formErrors[String(field.name)]}
                      fullWidth
                      SelectProps={{
                        MenuProps: { PaperProps: { sx: { maxHeight: 300, overflowY: "auto" } } },
                      }}
                    >
                      {field.selectOptions.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {field.name === "sector_category" ? formatSector(opt) : opt}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <TextField
                      size="small"
                      name={String(field.name)}
                      type={field.type || "text"}
                      value={
                        field.type === "date" && value
                          ? new Date(value).toISOString().split("T")[0]
                          : value
                      }
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      disabled={!!field.disabled}
                      error={!!formErrors[String(field.name)]}
                      helperText={formErrors[String(field.name)]}
                      fullWidth
                      InputProps={{
                        startAdornment:
                          field.adornment && field.adornment.startsWith("$") ? (
                            <InputAdornment position="start">$</InputAdornment>
                          ) : undefined,
                        endAdornment:
                          field.adornment &&
                          (field.adornment === "%" || field.adornment === "M" || field.adornment.endsWith("%") || field.adornment.endsWith("M")) ? (
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
            <Box sx={{ display: "flex", justifyContent: { xs: "center", sm: "flex-end" }, flexWrap: "wrap", gap: 2, mt: 2 }}>
              <Button variant="outlined" color="secondary" onClick={handleReset} disabled={loading}>
                Reset
              </Button>
              <Button variant="contained" color="primary" onClick={handlePredict} disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}>
                {loading ? "Predicting..." : "Predict"}
              </Button>
            </Box>

            <Typography
              variant="body2"
              sx={{
                mt: 1,
                textAlign: { xs: "center", sm: "right" },
                color: "text.secondary",
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "center", sm: "flex-end" },
                gap: 0.5,
              }}
            >
              <InfoOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
              {values.deal_status === "Issued" ? "Above values are original values" : "Above values are assumption values"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {prediction && (
        <>
          <FOPredictionResults result={prediction} onRepredict={handleRepredictWithPrice} />
          <FOWeeklyMonthlyPredictionResults result={weeklyPrediction} onWeeklyMonthlyRepredict={handleWeeklyMonthlyRepredict} />
        </>
      )}
    </>
  );
};

export default FOForm;
