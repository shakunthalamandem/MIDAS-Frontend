import React, { useEffect, useState } from "react";
import { Typography, MenuProps } from "@mui/material";
import EquityMLFormData from "./EquityMLFormData";
import PredictionResults from "./PredictionResults";
import WeeklyMonthlyPredictionResults from "./WeeklyMonthlyPredictionResults";

interface PredictionModel {
  prediction: string | null;
  Accuracy: number;
  Confidence: number;
  range?: string | null;
}

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
  initialData?: Partial<FormData>;
  autoPredict?: boolean;
};

const MLInputForm: React.FC<MLInputFormProps> = ({
  options,
  initialData,
  autoPredict,
}) => {
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
    GDP: "Stable",
    Inflation: "Stable",
    Treasury: "Stable",
  };

  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error" as "error" | "success",
  });

  const [newWeeklyMonthlyPredictionData, setnewWeeklyMonthlyPredictionData] =
    useState<Record<string, PredictionModel> | null>(null);

  const inputWidth = 250;
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const isFormDataReady = (
    initial: Partial<FormData>,
    current: FormData
  ): boolean => {
    return Object.entries(initial).every(([key, value]) => {
      const currentValue = current[key as keyof FormData];
      if (value instanceof Date && currentValue instanceof Date) {
        return value.getTime() === currentValue.getTime();
      }
      return value === currentValue;
    });
  };

  useEffect(() => {
    if (autoPredict && initialData && isFormDataReady(initialData, formData)) {
      const isValid = validateForm();
      if (isValid) {
        handlePredict();
      }
    }
  }, [autoPredict, initialData, formData]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    Object.entries(formData).forEach(([key, value]) => {
      if (
        !value &&
        key !== "deal_type" &&
        key !== "region" &&
        key !== "target" &&
        key !== "GDP" &&
        key !== "Inflation" &&
        key !== "Treasury"
      ) {
        errors[key as keyof FormData] = "This field is required";
        isValid = false;
      }
    });

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
    const payload = {
    ...formData,
    GDP: "Stable",       // enforce
    Inflation: "Stable", // enforce
    Treasury: "Stable",  // enforce
  };
    try {
      const response = await fetch(`${apiUrl}/api/ml_prediction_v2/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
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

  const handleRepredictWithPrice = async (t1dOpenPrice: number) => {
    const updatedPayload = {
      ...formData,
      t1d_open_category: t1dOpenPrice,
    };

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/ml_prediction_v2/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(updatedPayload),
      });

      if (!response.ok) {
        throw new Error("Reprediction failed");
      }

      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error("Reprediction error:", error);
      setSnackbar({
        open: true,
        message: "Failed to repredict. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWeeklyMonthlyRepredictionRequest = async (
    t1dCloseReturn: number
  ): Promise<Record<string, PredictionModel>> => {
    console.log(`Repredicting with T+1 Day Close Return: ${t1dCloseReturn}%`);

    const weeklyMonthlyPayload = {
      ...formData,
      t1d_return_from_bloomberg_category: t1dCloseReturn,
    };

    try {
      const response = await fetch(`${apiUrl}/api/ml_weekly_monthly/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(weeklyMonthlyPayload),
      });

      if (!response.ok) {
        throw new Error("Reprediction failed");
      }

      const fullResponse = await response.json();

      // Extract only prediction and Accuracy from each key
      const simplifiedResponse: Record<string, PredictionModel> = {};
      for (const key in fullResponse) {
        const { prediction, Accuracy, Confidence, range } = fullResponse[key];
        simplifiedResponse[key] = { prediction, Accuracy, Confidence, range };
      }

      setnewWeeklyMonthlyPredictionData(simplifiedResponse);
      console.log("Received new prediction data:", simplifiedResponse);
      return simplifiedResponse;
    } catch (error) {
      console.error("Weekly/Monthly reprediction error:", error);
      setSnackbar({
        open: true,
        message: "Failed to repredict weekly/monthly. Please try again.",
        severity: "error",
      });
      return {};
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
      <EquityMLFormData
        snackbar={snackbar}
        handleSnackbarClose={handleSnackbarClose}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        handleChange={handleChange}
        handleReset={handleReset}
        handlePredict={handlePredict}
        loading={loading}
        prediction={prediction}
        options={options}
        sectorLabels={sectorLabels}
        inputWidth={inputWidth}
        menuProps={menuProps}
      />
      {prediction && (
        <PredictionResults
          result={prediction}
          onRepredict={handleRepredictWithPrice}
        />
      )}
      {prediction && (
        <WeeklyMonthlyPredictionResults
          result={newWeeklyMonthlyPredictionData}
          onWeeklyMonthlyRepredict={handleWeeklyMonthlyRepredictionRequest}
        />
      )}
    </>
  );
};

export default MLInputForm;
