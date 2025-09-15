import React from "react";
import { Box, Grid, TextField, Typography } from "@mui/material";
import { FormSectionProps } from "../../../types/NewDealFormData";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const percentFields = [
  "ltm_dividend_yield",
  "ltm_fcf_yield",
  "percent_of_free_float_current_float",
  "short_interest_percentage_of_deal",
  "percent_change_last_7_days",
  "percent_below_52_week_high",
];

const MarketData: React.FC<FormSectionProps> = ({
  data,
  editable,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    if (percentFields.includes(name)) {
      newValue = newValue.replace(/[^0-9.%$-]/g, "");
    }
    onChange({ ...data, [name]: newValue });
  };

  const renderField = (
    label: string,
    name: string,
    type: string = "text",
    shrink = false
  ) => (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
        {label}
      </Typography>
      <TextField
        name={name}
        type={type}
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
          },
        }}
        InputLabelProps={{
          shrink,
          style: { color: "#002060" },
        }}
      />
    </Grid>
  );

  return (
    <>
      <Typography
        variant="h6"
        gutterBottom
        align="center"
        color="#002060"
        fontWeight={600}
        mb={2}
      >
        <Box display="inline-flex" alignItems="center" gap={1}>
          <TrendingUpIcon />
          Market Data
        </Box>
      </Typography>

      <Grid container spacing={2}>
        {renderField("Launch Date", "launch_date", "date", true)}
        {renderField("Trade Date", "trade_date", "date", true)}
        {renderField("Market Cap($M)", "market_cap")}
        {renderField("52 Week High", "_52_week_high")}
        {renderField("% Below 52 Week High", "percentage_below_52_week_high")}
        {renderField("% Change Last 7 Days", "percentage_change_last_7_days")}
        {renderField("LTM FCF Yield", "ltm_fcf_yield")}

        {renderField("LTM Dividend Yield", "ltm_dividend_yield")}
        {renderField("Shares Outstanding", "shares_outstanding")}

        {renderField("% of Free Float", "percentage_of_free_float")}
        {renderField("Short Interest ($)", "short_interest")}
        {renderField(
          "Short Interest % of Deal",
          "short_interest_percentage_of_deal"
        )}
      </Grid>
    </>
  );
};

export default MarketData;
