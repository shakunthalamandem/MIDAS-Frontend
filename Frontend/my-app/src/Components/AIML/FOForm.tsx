import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import FOWeeklyMonthlyPredictionResults from "./FOWeeklyMonthlyPredictionResults";
import FOPredictionResults from "./FOPredictionResults";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FOFormFieldsSection from "./FOFormFieldsSection";

interface PredictionModel {
  prediction: string | null;
  accuracy: number;
  confidence: number;
  model: string;
  range: string;
  explanation?: string;
}

interface FOFormProps {
  values: FOFormValues;
  setValues: React.Dispatch<React.SetStateAction<FOFormValues>>;
  options: OptionsData;
  autoPredict?: boolean;
  onAutoPredictComplete?: () => void;
  onPredicted?: () => void;
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
  revenue_category: string; // e.g. in $M
  revenue_growth_category: string; // %
  net_profit_margin_category: string; // %
  issue_price: number;
  issue_to_pre_day_close_return_category: number; // %
  t1d_open_return_category: number | null; // %
  t1d_return_from_bloomberg_category: number | null; // %

  // create new record flag
  request_from: string;
  create_new_record: boolean;
}

const FOForm: React.FC<FOFormProps> = ({
  values,
  setValues,
  options,
  autoPredict = false,
  onAutoPredictComplete,
  onPredicted,
}) => {
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "error" | "success";
  }>({ open: false, message: "", severity: "error" });
  const [prediction, setPrediction] = useState<
    Record<string, PredictionModel> | null
  >(null);
  const [weeklyPrediction, setWeeklyPrediction] = useState<
    Record<string, PredictionModel> | null
  >(null);

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

  // ✅ FOForm: validateForm (t1d_return_from_bloomberg_category is optional; validate only if present)
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    let isValid = true;
    const data = values;

    // fields that are allowed to be empty / optional
    const optionalKeys = new Set([
      "region",
      "target",
      "GDP",
      "Inflation",
      "Treasury",
      "t1d_open_return_category",
      "t1d_return_from_bloomberg_category", // <-- OPTIONAL
    ]);

    // Required fields (except optionalKeys)
    Object.entries(data).forEach(([key, val]) => {
      if (!optionalKeys.has(key)) {
        if ((val === null || val === undefined || val === "") && val !== 0) {
          errors[key] = "This field is required";
          isValid = false;
        }
      }
    });

    // Deal size > 0
    if (
      data.deal_size_category === "" ||
      isNaN(parseFloat(data.deal_size_category)) ||
      parseFloat(data.deal_size_category) < 0
    ) {
      errors.deal_size_category = "Must be greater than 0";
      isValid = false;
    }

    // Percent / numeric ranges
    const percentChecks: Array<{
      key: keyof FOFormValues;
      range?: [number, number];
    }> = [
      { key: "percentage_primary_category", range: [0, 100] },
      { key: "allocation_deal_size_percentage_category", range: [0, 100] },
      { key: "allocation_percentage_category", range: [0, 100] },
      { key: "revenue_growth_category", range: [-1000, 1000] },
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

    // Revenue >= 0
    if (
      data.revenue_category === "" ||
      isNaN(parseFloat(data.revenue_category)) ||
      parseFloat(data.revenue_category) < 0
    ) {
      errors.revenue_category = "Must be ≥ 0";
      isValid = false;
    }

    // OPTIONAL: if user provided t1d_return_from_bloomberg_category, validate it
    if (data.t1d_return_from_bloomberg_category !== null) {
      const v = Number(data.t1d_return_from_bloomberg_category);
      if (!Number.isFinite(v)) {
        errors.t1d_return_from_bloomberg_category = "Enter a valid number";
        isValid = false;
      } else if (v < -1000 || v > 1000) {
        errors.t1d_return_from_bloomberg_category =
          "Must be between -1000 and 1000";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  // ✅ FOForm: handlePredict (now includes create_new_record + request_from)
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

    const apiUrl = process.env.REACT_APP_API_URL!;
    const token = localStorage.getItem("access_token");

    const payload = {
      ...values,
      deal_type: "FO",
      GDP: "Stable",
      Inflation: "Stable",
      Treasury: "Stable",
      expectations: ["T1D"],
      request_from: "ai_ml", // always send this
      create_new_record: values.create_new_record ?? false, // controlled by checkbox
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
      onPredicted?.();
      setPrediction(data.predictions);
      setWeeklyPrediction(null);
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
    const apiUrl = process.env.REACT_APP_API_URL!;
    const token = localStorage.getItem("access_token");

    const payload = {
      ...values,
      deal_type: "FO",
      GDP: "Stable",
      Inflation: "Stable",
      Treasury: "Stable",
      t1d_open_return_category: openPrice,
      expectations: ["T1D"],
      request_from: "ai_ml",
      create_new_record: values.create_new_record ?? false,
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
      onPredicted?.();
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

  const handleWeeklyMonthlyRepredict = async (
    t1dCloseReturn: number
  ): Promise<Record<string, PredictionModel>> => {
    const apiUrl = process.env.REACT_APP_API_URL!;
    const token = localStorage.getItem("access_token");
    const payload = {
      ...values,
      deal_type: "FO",
      GDP: "Stable",
      Inflation: "Stable",
      Treasury: "Stable",
      t1d_return_from_bloomberg_category: t1dCloseReturn,
      expectations: ["T1W", "T1M"],
      request_from: "ai_ml",
      create_new_record: values.create_new_record ?? false,
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
        simplified[key] = {
          prediction,
          accuracy,
          confidence,
          model: "",
          range,
          explanation,
        };
      }
      setWeeklyPrediction(simplified);
      onPredicted?.();
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
      issue_price: 0,
      issue_to_pre_day_close_return_category: 0,
      t1d_open_return_category: null,
      t1d_return_from_bloomberg_category: null,

      // NEW: reset create_new_record + request_from
      create_new_record: false,
      request_from: "ai_ml",
    }));
    setFormErrors({});
    setPrediction(null);
    setWeeklyPrediction(null);
    setSnackbar({ open: false, message: "", severity: "error" });
  };

  /** ----- NEW helper: detect presence, allow 0 as valid ----- */
  const hasBloombergT1D = () => {
    const v = values.t1d_return_from_bloomberg_category;
    return v !== null && v !== undefined && !Number.isNaN(Number(v));
  };

  /** ----- UPDATED: autoPredict chains Weekly/Monthly if bloomberg T1D present ----- */
  useEffect(() => {
    if (autoPredict) {
      (async () => {
        const valid = validateForm();
        if (valid) {
          await handlePredict(); // T+1D
          if (hasBloombergT1D()) {
            await handleWeeklyMonthlyRepredict(
              Number(values.t1d_return_from_bloomberg_category)
            );
          }
        }
        onAutoPredictComplete && onAutoPredictComplete();
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPredict]);

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
        {/* Fields grid */}
        <FOFormFieldsSection
          values={values}
          formErrors={formErrors}
          options={options}
          onChange={handleChange}
        />

        {/* Info line */}
        <Typography
          variant="body2"
          sx={{
            mt: 2,
            textAlign: { xs: "center", sm: "right" },
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", sm: "flex-end" },
            gap: 0.5,
          }}
        >
          <InfoOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
          {values.deal_status === "Issued"
            ? "Values treated as confirmed"
            : "Values used for temporary assumptions"}
        </Typography>

        {/* Bottom row: checkbox (left) + buttons (right) */}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: { xs: "center", sm: "space-between" },
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* NEW: Create new record checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={values.create_new_record}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    create_new_record: e.target.checked,
                  }))
                }
                color="primary"
              />
            }
            label="Create new record"
          />

          {/* Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", sm: "flex-end" },
              flexWrap: "wrap",
              gap: 2,
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
                loading ? <CircularProgress size={20} color="inherit" /> : undefined
              }
            >
              {loading ? "Predicting..." : "Predict"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {prediction && (
        <>
          <FOPredictionResults
            result={prediction}
            onRepredict={handleRepredictWithPrice}
            // NEW: prefill from the form’s value (number | null)
            initialT1dOpenReturn={values.t1d_open_return_category ?? null}
          />
          <FOWeeklyMonthlyPredictionResults
            result={weeklyPrediction}
            onWeeklyMonthlyRepredict={handleWeeklyMonthlyRepredict}
            // NEW: prefill input when backend provided T+1D close return exists
            initialT1dCloseReturn={
              values.t1d_return_from_bloomberg_category ?? null
            }
          />
        </>
      )}
    </>
  );
};

export default FOForm;
