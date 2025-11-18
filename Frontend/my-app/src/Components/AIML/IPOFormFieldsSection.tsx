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

interface IPOFormFieldsSectionProps {
  values: IPOFormValues;
  formErrors: { [key: string]: string };
  options: OptionsData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

  const fields: Array<{
    label: string;
    name: keyof IPOFormValues | "target_variable";
    type?: string;
    placeholder?: string;
    selectOptions?: string[];
    adornment?: string;
    disabled?: boolean;
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
    // No Discount field for IPO
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
          value = values[field.name as keyof IPOFormValues] ?? "";
        }
        const isLastSingle =
          idx === fields.length - 1 && fields.length % 2 === 1;

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

export default IPOFormFieldsSection;