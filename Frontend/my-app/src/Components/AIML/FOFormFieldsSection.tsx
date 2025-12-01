import React from "react";
import {
  Grid,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
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

  // fundamentals + price features
  revenue_category: string; // e.g. in $M
  revenue_growth_category: string; // %
  net_profit_margin_category: string; // "Negative" | "Positive"
  issue_price: number;
  issue_to_pre_day_close_return_category: number; // %
  t1d_open_return_category: number | null; // %
  t1d_return_from_bloomberg_category: number | null; // %

  // NEW: T-1D close price
  t1d_close_price_category: number; // $

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

interface FieldConfig {
  label: string;
  name: keyof FOFormValues;
  type?: string;
  placeholder?: string;
  selectOptions?: string[];
  adornment?: string;
  disabled?: boolean;
  tooltip?: React.ReactNode;
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

  /**
   * Helper to push a derived value up to the parent
   * without re-running our custom logic (no infinite loops).
   */
  const triggerValueChange = (name: keyof FOFormValues, value: any) => {
    const syntheticEvent = {
      target: { name, value },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  /**
   * Central handler to support auto-calculation behavior.
   */
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FOFormValues;

    // First, notify parent about the direct change
    onChange(e);

    // Parse numbers safely
    const parseNum = (v: any): number | null => {
      if (v === "" || v === null || v === undefined) return null;
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    };

    const issuePrice = parseNum(values.issue_price);

    // 1) If user changes T-1D close price or Issue Price => recompute change %
    if (
      (fieldName === "t1d_close_price_category" ||
        fieldName === "issue_price") &&
      issuePrice !== null &&
      issuePrice > 0
    ) {
      const t1Close =
        fieldName === "t1d_close_price_category"
          ? parseNum(value)
          : parseNum(values.t1d_close_price_category);

      if (t1Close !== null) {
        // ((T-1D Close / Issue Price) - 1) * 100
        const changePct = (t1Close / issuePrice - 1) * 100;
        triggerValueChange(
          "issue_to_pre_day_close_return_category",
          Number.isFinite(changePct) ? Number(changePct.toFixed(2)) : ""
        );
      }
    }

    // 2) If user changes change % => recompute T-1D close price
    if (
      fieldName === "issue_to_pre_day_close_return_category" &&
      issuePrice !== null &&
      issuePrice > 0
    ) {
      const changePct = parseNum(value);
      if (changePct !== null) {
        // From ((C / I) - 1) * 100 = r  =>  C = I * (1 + r/100)
        const t1Close = issuePrice * (1 + changePct / 100);
        triggerValueChange(
          "t1d_close_price_category",
          Number.isFinite(t1Close) ? Number(t1Close.toFixed(2)) : ""
        );
      }
    }
  };

  // ---- FIELD GROUPS ----

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
      label: "Discount from Announcement Price (%)",
      name: "discount_from_announcement_price_category",
      type: "number",
      adornment: "%",
      placeholder: "e.g., 2",
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
      label: "T-1D Close Price ($)",
      name: "t1d_close_price_category",
      type: "number",
      adornment: "$",
      placeholder: "Auto or manual",
    },
    {
      label: "Change in Price from T-1D to Issue (%)",
      name: "issue_to_pre_day_close_return_category",
      type: "number",
      adornment: "%",
      placeholder: "e.g., -3.2",
      tooltip: (
        <Tooltip
          title={
            <Typography variant="body2" sx={{ fontSize: 13, color: "#fff" }}>
              • Percentage change in price from previous trading day&apos;s
              close (T-1D) to the issue price. <br />• Formula: ((T-1D Close
              Price / Issue Price) - 1) * 100
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
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
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
  ];

  // ---- RENDER HELPERS ----

  const renderField = (field: FieldConfig, index: number, total: number) => {
    const value = values[field.name] ?? "";
    const isLastSingle = index === total - 1 && total % 2 === 1;

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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", sm: "180px", md: "200px" },
              minWidth: { sm: "180px", md: "200px" },
            }}
          >
            <Typography component="span" sx={{ fontWeight: 500 }}>
              {field.label}
            </Typography>
            {field.tooltip && (
              <Box component="span" sx={{ ml: 0.5 }}>
                {field.tooltip}
              </Box>
            )}
          </Box>

          {field.selectOptions ? (
            <TextField
              select
              size="small"
              name={String(field.name)}
              value={value}
              onChange={handleFieldChange}
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
                  ? new Date(value as any).toISOString().split("T")[0]
                  : value
              }
              onChange={handleFieldChange}
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
          <Box>
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
      <Section
        title="Fundamental Metrics & Price Action"
        fields={fundamentalFields}
      />
    </Grid>
  );
};

export default FOFormFieldsSection;
