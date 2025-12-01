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

  const renderField = (field: FieldConfig, index: number, total: number) => {
    const rawValue = values[field.name];
    const value = rawValue ?? "";
    const isLastSingle = index === total - 1 && total % 2 === 1;

    // Format date inputs for the text field while ensuring the raw value is a valid date-compatible type.
    const displayValue =
      field.type === "date" &&
      rawValue &&
      (typeof rawValue === "string" ||
        typeof rawValue === "number" ||
        rawValue instanceof Date)
        ? new Date(rawValue as string | number | Date)
            .toISOString()
            .split("T")[0]
        : value;

    return (
      <Grid item xs={12} sm={isLastSingle ? 12 : 6} key={String(field.name)}>
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
        sx={{
          borderRadius: 2,
          p: 2.5,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[50]
              : theme.palette.background.paper,
          boxShadow: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            mb: 2,
          }}
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%" // or any specific height
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {fields.map((field, idx) => renderField(field, idx, fields.length))}
        </Grid>
      </Box>
    </Grid>
  );

  return (
    <Grid container spacing={3}>
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
