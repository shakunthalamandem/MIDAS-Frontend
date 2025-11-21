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
import IPOPredictionResults from "./IPOPredictionResults";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import IPOWeeklyMonthlyPredictionResults from "./IPOWeeklyMonthlyPredictionResults";
import IPOFormFieldsSection from "./IPOFormFieldsSection";

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
  t1d_open_return_category: number | null; // %
  t1d_return_from_bloomberg_category: number | null; // (%), can be negative

  // create new record flag
  request_from: string;
  create_new_record: boolean;
}

interface IPOFormProps {
  values: IPOFormValues;
  setValues: React.Dispatch<React.SetStateAction<IPOFormValues>>;
  options: OptionsData;
  autoPredict?: boolean;
  onAutoPredictComplete?: () => void;
  onPredicted?: () => void;
}

const IPOForm: React.FC<IPOFormProps> = ({
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

  // ✅ IPOForm: validateForm (t1d_return_from_bloomberg_category is optional; validate only if present)
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

    // Deal Size > 0
    if (parseFloat(data.deal_size_category) < 0) {
      errors.deal_size_category = "Must be greater than 0";
      isValid = false;
    }

    // Revenue >= 0
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

    // growth in [-100, 100]
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

  // ✅ IPOForm: handlePredict (now includes request_from + create_new_record)
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
      if (!res.ok) throw new Error("Prediction request failed");
      const data = await res.json();
      setPrediction(data.predictions);
      setWeeklyPrediction(null); // clear any stale weekly/monthly results
      onPredicted?.();
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
      deal_type: "IPO",
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
      deal_type: "IPO",
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

  // const handleRepredictWithPrice = async (openPrice: number) => {
  //   setLoading(true);
  //   const apiUrl = process.env.REACT_APP_API_URL;
  //   const token = localStorage.getItem("access_token");
  //   const payload = {
  //     ...values,
  //     deal_type: "IPO",
  //     GDP: "Stable",
  //     Inflation: "Stable",
  //     Treasury: "Stable",
  //     t1d_open_category: openPrice,
  //     expectations: ["T1D"],
  //     revenue_category: values.revenue_category,
  //     revenue_growth_category: values.revenue_growth_category,
  //     net_profit_margin_category: values.net_profit_margin_category,
  //     request_from: "ai_ml",
  //     create_new_record: values.create_new_record ?? false,
  //   };
  //   try {
  //     const res = await fetch(`${apiUrl}/api/ai_ml_predictions/`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: token ? `Bearer ${token}` : "",
  //       },
  //       body: JSON.stringify(payload),
  //     });
  //     if (!res.ok) throw new Error("Repredict request failed");
  //     const data = await res.json();
  //     setPrediction(data.predictions);
  //   } catch (error) {
  //     console.error("Repredict error:", error);
  //     setSnackbar({
  //       open: true,
  //       message: "Failed to update prediction. Please try again.",
  //       severity: "error",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
      revenue_category: "",
      revenue_growth_category: "",
      net_profit_margin_category: "",
      t1d_open_return_category: null,
      // keep t1d_return_from_bloomberg_category as-is or reset if you prefer:
      // t1d_return_from_bloomberg_category: null,
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
        <IPOFormFieldsSection
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
          <InfoOutlinedIcon
            fontSize="small"
            sx={{ color: "text.secondary" }}
          />
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
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : undefined
              }
            >
              {loading ? "Predicting..." : "Predict"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {prediction && (
        <>
          <IPOPredictionResults
            result={prediction}
            onRepredict={handleRepredictWithPrice}
            initialT1dOpenReturn={values.t1d_open_return_category ?? null}
          />
          <IPOWeeklyMonthlyPredictionResults
            result={weeklyPrediction}
            onWeeklyMonthlyRepredict={handleWeeklyMonthlyRepredict}
            // prefill input when backend provided T+1D close return exists
            initialT1dCloseReturn={
              values.t1d_return_from_bloomberg_category ?? null
            }
          />
        </>
      )}
    </>
  );
};

export default IPOForm;
