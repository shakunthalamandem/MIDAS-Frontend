import React, { useEffect, useState } from "react";
import { Typography, MenuProps } from "@mui/material";
import EquityMLFormData from "./EquityMLFormData";

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

  const inputWidth = 250;
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  // Fill formData when initialData arrives
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  // Compare formData with initialData
  const isFormDataReady = (initial: Partial<FormData>, current: FormData): boolean => {
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
      } else {
        console.log("Error");
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
        key !== "target"
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
  );
};

export default MLInputForm;
