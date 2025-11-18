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
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import FOWeeklyMonthlyPredictionResults from "./FOWeeklyMonthlyPredictionResults";
import FOPredictionResults from "./FOPredictionResults";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";


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
  issue_to_pre_day_close_return_category: number; // %
  t1d_open_return_category: number | null; // %
  t1d_return_from_bloomberg_category: number | null; // %

  // create new record flag
  request_from: string;
  create_new_record: boolean;
}



interface FOFormFieldsSectionProps {
  values: FOFormValues;
  formErrors: { [key: string]: string };
  options: OptionsData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FOFormFieldsSection: React.FC<FOFormFieldsSectionProps> = ({
  values,
  formErrors,
  options,
  onChange,
}) => {
  const formatSector = (sectorCode: string): string => {
    if (!sectorCode) return "";
    const cleaned = sectorCode.replace(/^(sp500_|nasdaq_|nyse_)/i, "");
    return cleaned
      .split("_")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const fields: Array<{
    label: string;
    name: keyof FOFormValues | "target_variable";
    type?: string;
    placeholder?: string;
    selectOptions?: string[];
    adornment?: string;
    disabled?: boolean;
    tooltip?: React.ReactNode;
  }> = [
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

    // NEW: Fundamentals and price-feature
    {
      label: "Current Year Revenue ($ M)",
      name: "revenue_category",
      type: "number",
      adornment: "$M",
      placeholder: "e.g., 250",
    },
    {
      label: "Revenue Growth (%) (YOY)",
      name: "revenue_growth_category",
      type: "number",
      adornment: "%",
      placeholder: "e.g., 12.5",
    },
    {
      label: "Net Profit Margin",
      name: "net_profit_margin_category",
      selectOptions: ["Negative", "Positive"],
    },
    {
      label: "Change in Price from T-1D to Issue(%)",
      name: "issue_to_pre_day_close_return_category",
      type: "number",
      adornment: "%",
      placeholder: "e.g., -3.2",
      tooltip: (
        <Tooltip
          title={
            <Typography
              variant="body2"
              sx={{
                fontSize: 13,
                color: "#fff",
              }}
            >
              • This value represents the percentage change in the stock price
              from the previous day's close (T-1D) to the price at the time of
              the issue. <br />
              • The formula used is: <br />
              ((T-1D Close Price / Issue Price) - 1) * 100.
              <br />
            </Typography>
          }
          arrow
          placement="top"
          slotProps={{
            popper: {
              sx: {
                "& .MuiTooltip-tooltip": {
                  backgroundColor: "#002060",
                  borderRadius: 2,
                  padding: "10px 14px",
                  maxWidth: 320,
                },
              },
            },
          }}
        >
          <IconButton size="small" sx={{ verticalAlign: "middle" }}>
            <InfoOutlinedIcon />
          </IconButton>
        </Tooltip>
      ),
    },

    {
      label: "Deal Status",
      name: "deal_status",
      selectOptions: options.deal_status,
    },
  ];

  return (
    <Grid container spacing={2}>
      {fields.map((field, idx) => {
        let value: any;
        if (field.name === "target_variable") {
          value = "1st Day Return (close)";
        } else {
          value = values[field.name as keyof FOFormValues] ?? "";
        }
        const isLastSingle = idx === fields.length - 1 && fields.length % 2 === 1;

        return (
          <Grid
            item
            xs={12}
            sm={isLastSingle ? 12 : 6}
            key={String(field.name)}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { sm: "center" },
                gap: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: { xs: "100%", sm: "180px", md: "200px" },
                  minWidth: { sm: "180px", md: "200px" },
                  fontWeight: 500,
                }}
              >
                <Typography component="span" sx={{ fontWeight: 500 }}>
                  {field.label}
                  {field.tooltip && (
                    <Box component="span" sx={{ ml: 0.5 }}>
                      {field.tooltip}
                    </Box>
                  )}
                </Typography>
              </Box>

              {field.selectOptions ? (
                <TextField
                  select
                  size="small"
                  name={String(field.name)}
                  value={value}
                  onChange={onChange}
                  disabled={!!field.disabled}
                  error={!!formErrors[String(field.name)]}
                  helperText={formErrors[String(field.name)]}
                  fullWidth
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: { maxHeight: 300, overflowY: "auto" },
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
                  name={String(field.name)}
                  type={field.type || "text"}
                  value={
                    field.type === "date" && value
                      ? new Date(value).toISOString().split("T")[0]
                      : value
                  }
                  onChange={onChange}
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
    </Grid>
  );
};

export default FOFormFieldsSection;