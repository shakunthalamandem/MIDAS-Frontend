import React, { useEffect, useState } from "react";
import {
  Grid,
  TextField,
  Typography,
  MenuItem,
  Box,
  CircularProgress,
} from "@mui/material";
import { FormSectionProps } from "../../../types/NewDealFormData";
import DatasetIcon from "@mui/icons-material/Dataset";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const day = date.getDate();

  // Determine suffix
  const getDaySuffix = (d: number) => {
    if (d > 3 && d < 21) return "th"; // 4-20
    switch (d % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  const suffix = getDaySuffix(day);

  const month = date.toLocaleString("en-US", { month: "short" }); // "Sep"
  const year = date.getFullYear();

  return `${day}${suffix} ${month} ${year}`;
};


interface ApiField {
  [key: string]: {
    options: string[] | number[];
    label: string;
    description: string;
  };
}

const DealInformation: React.FC<FormSectionProps> = ({
  data,
  editable,
  onChange,
}) => {
  const [optionsData, setOptionsData] = useState<ApiField | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === "text" ? value.toUpperCase() : value;
    onChange({ ...data, [name]: newValue });
  };

  useEffect(() => {
    const fetchOptions = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) {
        setError("API URL is not defined in environment variables");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/mdd_distinct_values/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();

        // Convert the array into a key-value object
        const formatted: ApiField = {};
        result.forEach((item: any) => {
          const key = Object.keys(item)[0];
          formatted[key] = item[key];
        });

        setOptionsData(formatted);
      } catch (err: any) {
        setError(err.message || "Error fetching options");
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const sponsors = ["Y", "N"];
  const deal_status = ["Announced", "Price Range", "Issued"];

  const renderSelectField = (
    label: string,
    name: string,
    options: string[] | number[] = []
  ) => (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
        {label}
      </Typography>
      <TextField
        select
        name={name}
        value={data[name] || ""}
        onChange={handleChange}
        fullWidth
        size="small"
        variant="standard"
        disabled={!editable}
        InputProps={{
          disableUnderline: !editable,
          sx: {
            "&.Mui-disabled": {
              WebkitTextFillColor: "#b1062e",
            },
            "& input.Mui-disabled": {
              WebkitTextFillColor: "#b1062e",
            },
            "& .MuiSelect-select.Mui-disabled": {
              WebkitTextFillColor: "#b1062e",
            },
            "& .MuiSelect-icon": !editable ? { display: "none" } : {},
          },
        }}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              style: {
                maxHeight: 400,
              },
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    </Grid>
  );

  const renderTextField = (
    label: string,
    name: string,
    type: string = "text",
    overrideValue?: string,
    readOnly: boolean = false
  ) => (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
        {label}
      </Typography>
      <TextField
        name={name}
        type={type}
        value={overrideValue !== undefined ? overrideValue : data[name] || ""}
        onChange={readOnly ? undefined : handleChange}
        fullWidth
        size="small"
        variant="standard"
        disabled={!editable || readOnly}
        InputProps={{
          disableUnderline: !editable || readOnly,
          sx: {
            "&.Mui-disabled": {
              WebkitTextFillColor: "#b1062e",
            },
            "& input.Mui-disabled": {
              WebkitTextFillColor: "#b1062e",
            },
          },
        }}
      />
    </Grid>
  );

  const pricingDateStatus = data["pricing_date"]
    ? formatDate(data["pricing_date"])
    : "TBA";

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!optionsData) return null;

  return (
    <>
      <Typography
        variant="h6"
        gutterBottom
        align="center"
        color="#002060"
        fontWeight={600}
      >
        <Box display="inline-flex" alignItems="center" gap={1}>
          <DatasetIcon />
          Deal Information
        </Box>
      </Typography>

      <Grid container spacing={2}>
        {renderTextField("Ticker", "ticker")}
        {renderTextField(
          "Pricing Date Status",
          "pricing_date_status",
          "text",
          pricingDateStatus,
          true
        )}
        {renderTextField("Pricing Date", "pricing_date", "date")}
        {renderTextField("Vendor/Issuer", "issuer_name")}

        {renderSelectField(
          optionsData?.broad_region.label || "Region",
          "region",
          optionsData?.broad_region.options
        )}
        {renderSelectField(
          optionsData?.deal_type.label || "Deal Type",
          "deal_type",
          optionsData?.deal_type.options
        )}
        {renderSelectField(
          optionsData?.fo_type.label || "FO Type",
          "fo_type",
          optionsData?.fo_type.options
        )}
        {renderSelectField(
          optionsData?.gics_sector.label || "Sector",
          "sector",
          optionsData?.gics_sector.options
        )}
        {renderSelectField(
          optionsData?.deal_captain.label || "Deal Captain",
          "deal_captain",
          optionsData?.deal_captain.options
        )}
        {renderSelectField(
          optionsData?.selected_bank.label || "Lead Bank",
          "lead_bank",
          optionsData?.selected_bank.options
        )}

        {/* Hardcoded fields */}
        {renderSelectField("Sponsor", "sponsor", sponsors)}
        {renderSelectField("Deal Status", "deal_status", deal_status)}
      </Grid>
    </>
  );
};

export default DealInformation;
