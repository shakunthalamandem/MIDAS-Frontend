import React from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { BarChart3 } from "lucide-react";
import { FormSectionProps } from "../../../types/NewDealFormData";

const TechnicalMarketData: React.FC<FormSectionProps> = ({
  data,
  editable,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  const renderField = (label: string, name: string) => (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
        {label}
      </Typography>
      <TextField
        name={name}
        value={data[name] || ""}
        onChange={handleChange}
        fullWidth
        size="small"
        variant="standard"
        disabled={!editable}
        InputProps={{
          disableUnderline: !editable, // No underline if not editable
          style: { color: "#002060" },
        }}
        InputLabelProps={{
          style: { color: "#002060" },
        }}
      />
    </Grid>
  );

  return (
    <>
      <Typography variant="h6" gutterBottom align="center" color="#002060" fontWeight={600} mb={2}>
        <Box display="inline-flex" alignItems="center" gap={1}>
          <BarChart3 size={20} />
          Technical Market Data
        </Box>
      </Typography>

      <Grid container spacing={2}>
        {renderField("3-Month ADTV Local (USD)", "three_month_adtv_local_usd")}
        {renderField("3-Month ADTV Local (Shares)", "three_month_adtv_local_shares")}
        {renderField("Beta", "beta_sx5e")}
        {renderField("3-Month Volatility", "three_month_volatility")}
        {renderField("RSI 14D", "rsi_14d")}
        {renderField("RSI 30D", "rsi_30d")}
        {renderField("DMI 14D", "dmi_14d")}
        {renderField("MACD 9D", "macd_9d")}
        {renderField("Stock Relative to MA 50D", "stock_relative_to_ma_50d")}
        {renderField("Stock Relative to MA 100D", "stock_relative_to_ma_100d")}
      </Grid>
    </>
  );
};

export default TechnicalMarketData;
