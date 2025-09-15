import React from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import AssessmentIcon from '@mui/icons-material/Assessment';
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
          },        }}
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
          <AssessmentIcon  />
          Technical Market Data
        </Box>
      </Typography>

      <Grid container spacing={2}>
        {renderField("3-Month ADTV ($M)", "_3_month_adtv")}
        {renderField("3-Month ADTV Shares", "_3_month_adtv_shares")}
        {renderField("Beta (S&P500)", "beta_snp_500")}
        {renderField("3-Month Volatility", "_3_month_volatility")}
        {renderField("RSI 14D", "rsi_14d")}
        {renderField("RSI 30D", "rsi_30d")}
        {renderField("DMI 14D", "dmi_14d")}
        {renderField("MACD 9D", "macd_9d")}
        {renderField("DMA 50", "dma_50")}
        {renderField("DMA 100", "dma_100")}
      </Grid>
    </>
  );
};

export default TechnicalMarketData;
