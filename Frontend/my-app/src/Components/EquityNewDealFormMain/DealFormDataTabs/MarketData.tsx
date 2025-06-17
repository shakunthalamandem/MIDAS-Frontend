import React from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { TrendingUp } from "lucide-react";
import { FormSectionProps } from "../../../types/NewDealFormData";

const MarketData: React.FC<FormSectionProps> = ({
  data,
  editable,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <>
      <Typography variant="h6" gutterBottom align="center" color="#002060">
        <Box display="inline-flex" alignItems="center" gap={1}>
          <TrendingUp size={20} />
          Market Data
        </Box>
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="LTM Dividend Yield"
            name="ltm_dividend_yield"
            value={data.ltm_dividend_yield || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="LTM FCF Yield"
            name="ltm_fcf_yield"
            value={data.ltm_fcf_yield || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="% of Free Float (Current Float)"
            name="percent_of_free_float_current_float"
            value={data.percent_of_free_float_current_float || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Short Interest Dollar Amount"
            name="short_interest_dollar_amount"
            value={data.short_interest_dollar_amount || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Short Interest % of Deal"
            name="short_interest_percentage_of_deal"
            value={data.short_interest_percentage_of_deal || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Shares Outstanding Pre-Deal"
            name="shares_outstanding_pre_deal"
            value={data.shares_outstanding_pre_deal || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Market Cap Pre-Deal (USD)"
            name="market_cap_pre_deal_usd"
            value={data.market_cap_pre_deal_usd || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Launch Date"
            name="launch_date"
            type="date"
            value={data.launch_date || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Trade Date"
            name="trade_date"
            type="date"
            value={data.trade_date || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="% Change Last 7 Days"
            name="percent_change_last_7_days"
            value={data.percent_change_last_7_days || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="52 Week High"
            name="week_52_high"
            value={data.week_52_high || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="% Below 52 Week High"
            name="percent_below_52_week_high"
            value={data.percent_below_52_week_high || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default MarketData;
