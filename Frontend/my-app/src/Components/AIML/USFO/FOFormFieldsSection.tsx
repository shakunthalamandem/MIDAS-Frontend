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
  issue_price: number | string;
  issue_to_pre_day_close_return_category: number | string; // % (auto-calculated)
  t1d_open_return_category: number | string | null; // %
  t1d_return_from_bloomberg_category: number | string | null; // %

  // T-1D close price
  previous_day_close_price: number | string; // $

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
}

interface SectionProps {
  title: string;
  fields: FieldConfig[];
  renderField: (field: FieldConfig) => React.ReactNode;
}

// Keep section component stable to avoid remounting inputs
const Section: React.FC<SectionProps> = ({ title, fields, renderField }) => (
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
   * Safer numeric parser that respects intermediate states
   * (e.g. "-", "1.", "") so typing feels smooth.
   */
  const parseNum = (v: any): number | null => {
    if (v === "" || v === null || v === undefined) return null;
    const str = String(v).trim();

    // Allow intermediate states while user is typing
    if (
      str === "-" ||
      str === "+" ||
      str.endsWith(".") ||
      str === "." ||
      str === "-." ||
      str === "+."
    ) {
      return null;
    }

    const n = Number(str);
    return Number.isNaN(n) ? null : n;
  };

  /**
   * Central handler to support auto-calculation behavior.
   * Uses "next" values instead of stale props to avoid
   * 1-step lag / misbehaviour.
   */
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FOFormValues;

    // First, notify parent about the direct change
    onChange(e);

    // Compute "next" values as if parent has already updated
    const currentIssuePriceRaw =
      fieldName === "issue_price" ? value : values.issue_price;
    const currentT1CloseRaw =
      fieldName === "previous_day_close_price"
        ? value
        : values.previous_day_close_price;

    const issuePrice = parseNum(currentIssuePriceRaw);
    const t1Close = parseNum(currentT1CloseRaw);

    // If user changes T-1D close price or Issue Price => recompute change %
    if (
      fieldName === "previous_day_close_price" ||
      fieldName === "issue_price"
    ) {
      if (issuePrice !== null && issuePrice > 0 && t1Close !== null) {
        // ((T-1D Close / Issue Price) - 1) * 100
        const change = (t1Close / issuePrice - 1) * 100;
        const rounded = Number.isFinite(change)
          ? Number(change.toFixed(2))
          : "";
        triggerValueChange("issue_to_pre_day_close_return_category", rounded);
      } else {
        // If one of the inputs is invalid/missing, clear the field
        triggerValueChange("issue_to_pre_day_close_return_category", "");
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
    {
      label: "Discount from Announcement Price (%)",
      name: "discount_from_announcement_price_category",
      type: "number",
      adornment: "%",
      placeholder: "e.g., 2",
    },
  ];

  const fundamentalFields: FieldConfig[] = [
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
      label: "T-1D Close Price ($)",
      name: "previous_day_close_price",
      type: "number",
      adornment: "$",
      placeholder: "Auto or manual",
    },
  ];

  // ---- RENDER HELPERS ----

  const renderField = (field: FieldConfig) => {
    const rawValue = values[field.name] ?? "";
    const value =
      field.type === "date" && rawValue
        ? new Date(rawValue as any).toISOString().split("T")[0]
        : rawValue;

    // Derived: formatted change line based on stored value
    const renderChangeLine =
      field.name === "previous_day_close_price" ? (
        <Box sx={{ mt: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: "#000000",
              display: "flex",
              alignItems: "center",
            }}
          >
            Change in Price from T-1D to Issue (%)
            <Tooltip
              title={
                <Typography
                  variant="body2"
                  sx={{ fontSize: 13, color: "#fff" }}
                >
                  • Percentage change in price from previous trading day&apos;s
                  close (T-1D) to the issue price.
                  <br />
                  • Formula: ((T-1D Close Price / Issue Price) - 1) * 100
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
              <IconButton
                size="small"
                sx={{ ml: 0.5, p: 0, color: "primary.main" }}
              >
                <InfoOutlinedIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {values.issue_to_pre_day_close_return_category === "" ||
            values.issue_to_pre_day_close_return_category === null ||
            values.issue_to_pre_day_close_return_category === undefined
              ? "—"
              : `${Number(
                  values.issue_to_pre_day_close_return_category
                ).toFixed(2)}%`}
          </Typography>
        </Box>
      ) : null;

    return (
      <Grid item xs={12} sm={6} key={String(field.name)}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { sm: "flex-start" }, // top-align so extra line doesn't look odd
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: { xs: "100%", sm: "190px", md: "210px" },
              minWidth: { sm: "190px", md: "210px" },
              pt: { sm: 0.5 }, // slight top padding for better vertical rhythm
            }}
          >
            <Typography component="span" sx={{ fontWeight: 500 }}>
              {field.label}
            </Typography>
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
            <Box sx={{ width: "100%" }}>
              <TextField
                size="small"
                name={String(field.name)}
                type={field.type || "text"}
                value={value}
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
              {renderChangeLine}
            </Box>
          )}
        </Box>
      </Grid>
    );
  };

  return (
    <Grid container spacing={2}>
      <Section
        title="Deal Overview"
        fields={dealOverviewFields}
        renderField={renderField}
      />
      <Section
        title="Deal & Allocation Parameters"
        fields={dealParametersFields}
        renderField={renderField}
      />
      <Section
        title="Fundamental Metrics & Price Action"
        fields={fundamentalFields}
        renderField={renderField}
      />
    </Grid>
  );
};

export default FOFormFieldsSection;
