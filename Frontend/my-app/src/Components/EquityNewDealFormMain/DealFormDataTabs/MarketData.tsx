import React from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { FormSectionProps } from "../../../types/NewDealFormData";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const percentFields = [
  "ltm_dividend_yield",
  "ltm_fcf_yield",
  "percent_of_free_float_current_float",
  "short_interest_percentage_of_deal",
  "percent_change_last_7_days",
  "percent_below_52_week_high"
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
          style: { color: "#002060" },
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
      <Typography variant="h6" gutterBottom align="center" color="#002060" fontWeight={600} mb={2}>
        <Box display="inline-flex" alignItems="center" gap={1}>
          <TrendingUpIcon />
          Market Data
        </Box>
      </Typography>

      <Grid container spacing={2}>
        {renderField("LTM Dividend Yield", "ltm_dividend_yield")}
        {renderField("LTM FCF Yield", "ltm_fcf_yield")}
        {renderField("% of Free Float (Current Float)", "percent_of_free_float_current_float")}
        {renderField("Short Interest Dollar Amount", "short_interest_dollar_amount")}
        {renderField("Short Interest % of Deal", "short_interest_percentage_of_deal")}
        {renderField("Shares Outstanding Pre-Deal", "shares_outstanding_pre_deal")}
        {renderField("Market Cap Pre-Deal (USD)", "market_cap_pre_deal_usd")}
        {renderField("Launch Date", "launch_date", "date", true)}
        {renderField("Trade Date", "trade_date", "date", true)}
        {renderField("% Change Last 7 Days", "percent_change_last_7_days")}
        {renderField("52 Week High", "week_52_high")}
        {renderField("% Below 52 Week High", "percent_below_52_week_high")}
      </Grid>
    </>
  );
};

export default MarketData;
