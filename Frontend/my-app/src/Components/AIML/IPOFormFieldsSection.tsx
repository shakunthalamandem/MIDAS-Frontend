import React from "react";
import {
  Grid,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Box,
} from "@mui/material";

interface OptionsData {
  region: string[];
  selected_bank: string[];
  sponsor: string[];
  sector: string[];
  target: string[];
  deal_status: string[];
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
  issue_price: number;
  t1d_return_from_bloomberg_category: number | null; // (%), can be negative

  // create new record flag
  request_from: string;
  create_new_record: boolean;
}

interface IPOFormFieldsSectionProps {
  values: IPOFormValues;
  formErrors: { [key: string]: string };
  options: OptionsData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface FieldConfig {
  label: string;
  name: keyof IPOFormValues;
  type?: string;
  placeholder?: string;
  selectOptions?: string[];
  adornment?: string;
  disabled?: boolean;
}

const IPOFormFieldsSection: React.FC<IPOFormFieldsSectionProps> = ({
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
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const dealOverviewFields: FieldConfig[] = [
    { label: "Region", name: "region", disabled: true },
    {
      label: "Ticker Symbol",
      name: "ticker",
      type: "string",
      placeholder: "e.g., AAPL",
    },
    { label: "Pricing Date", name: "pricing_date", type: "date" },
    {
      label: "Deal Status",
      name: "deal_status",
      selectOptions: options.deal_status,
    },
    {
      label: "Issue Price ($)",
      name: "issue_price",
      type: "number",
      adornment: "$",
      placeholder: "e.g., 30",
    },
    {
      label: "Sector",
      name: "sector_category",
      selectOptions: options.sector,
    },
  ];

  const dealParametersFields: FieldConfig[] = [
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
  ];

  const fundamentalFields: FieldConfig[] = [
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
      selectOptions: ["Negative", "Positive"],
    },
  ];

  const renderField = (field: FieldConfig) => {
    const rawValue = values[field.name];
    const baseValue = rawValue ?? "";

    const displayValue =
      field.type === "date" && rawValue
        ? new Date(rawValue as any).toISOString().split("T")[0]
        : baseValue;

    return (
      <Grid item xs={12} sm={6} key={String(field.name)}>
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
              width: { xs: "100%", sm: "190px", md: "210px" },
              minWidth: { sm: "190px", md: "210px" },
              fontWeight: 500,
            }}
          >
            {field.label}
          </Typography>

          {field.selectOptions ? (
            <TextField
              select
              size="small"
              name={String(field.name)}
              value={baseValue}
              onChange={onChange}
              disabled={!!field.disabled}
              error={!!formErrors[String(field.name)]}
              helperText={formErrors[String(field.name)]}
              fullWidth
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      overflowY: "auto",
                    },
                  },
                },
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
              value={displayValue}
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
  };

  const Section: React.FC<{
    title: string;
    fields: FieldConfig[];
  }> = ({ title, fields }) => (
    <Grid item xs={12}>
      <Box
        sx={(theme) => ({
          borderRadius: 2,
          p: 2,
          border: "1px solid",
          borderColor:
            theme.palette.mode === "light"
              ? "rgba(25,118,210,0.25)"
              : "rgba(144,202,249,0.3)",
          background:
            theme.palette.mode === "light"
              ? "linear-gradient(135deg,#f3f6ff 0%,#ffffff 55%,#e3f2fd 100%)"
              : "linear-gradient(135deg,#0f172a 0%,#020617 50%,#0b1120 100%)",
          boxShadow:
            theme.palette.mode === "light"
              ? "0 4px 14px rgba(15,23,42,0.08)"
              : "0 6px 18px rgba(0,0,0,0.6)",
          transition: "transform 120ms ease-out, box-shadow 120ms ease-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow:
              theme.palette.mode === "light"
                ? "0 8px 22px rgba(15,23,42,0.12)"
                : "0 10px 26px rgba(0,0,0,0.8)",
          },
        })}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: 0.8,
              color: "primary.main",
            }}
          >
            {title}
          </Typography>
        </Box>

        <Grid container spacing={1.5}>
          {fields.map((field) => renderField(field))}
        </Grid>
      </Box>
    </Grid>
  );

  return (
    <Grid container spacing={2}>
      <Section title="Deal Overview" fields={dealOverviewFields} />
      <Section
        title="Deal & Allocation Parameters"
        fields={dealParametersFields}
      />
      <Section title="Fundamental Metrics" fields={fundamentalFields} />
    </Grid>
  );
};

export default IPOFormFieldsSection;
