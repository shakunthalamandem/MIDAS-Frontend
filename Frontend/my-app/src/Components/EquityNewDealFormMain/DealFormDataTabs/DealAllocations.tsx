import React from "react";
import {
  Grid,
  TextField,
  Typography,
  InputAdornment,
  Box,
  MenuItem,
} from "@mui/material";
import { FormSectionProps } from "../../../types/NewDealFormData";
import InfoIcon from '@mui/icons-material/Info';

const percentageFields = [
  "percentage_primary",
  "discount_percentage",
  "final_indication_deal_percentage",
  "allocation_deal_size_percentage",
  "allocation_percentage"
];

const DealAllocations: React.FC<FormSectionProps> = ({
  data,
  editable,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (percentageFields.includes(name)) {
      newValue = newValue.replace(/[^0-9.%$-]/g, "");
    }
    onChange({ ...data, [name]: newValue });
  };
  const sponsors = ["Y", "N"];
  const renderSelectField = (
    label: string,
    name: string,
    options: string[]
  ) => (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="body2" color="#002060" gutterBottom fontWeight={500}>
        {label}
      </Typography>
      <TextField
        select
        name={name}
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
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    </Grid>
  );

  const renderField = (
    label: string,
    name: string,
    adornment?: string
  ) => (
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
          disableUnderline: !editable,
          endAdornment: adornment ? (
            <InputAdornment position="end">{adornment}</InputAdornment>
          ) : undefined,
          style: { color: "#002060" },
        }}
      />
    </Grid>
  );

  return (
    <>
      <Typography variant="h6" gutterBottom align="center" color="#002060" fontWeight={600}>
        <Box display="inline-flex" alignItems="center" gap={1}>
          <InfoIcon />
          Deal Allocations
        </Box>
      </Typography>

      <Grid container spacing={2}>
        {renderField("Deal Size ", "deal_size")}
        {renderSelectField("Sponsor", "sponsor", sponsors)}
        {renderField("Percentage Primary", "percentage_primary")}
        {renderField("Issue Price ", "price_local_currency")}
        {renderField("Discount Percentage", "discount_percentage")}
        {renderField("Final Indication Amount (USD)", "final_indication_amount_usd")}
        {renderField("Final Indication Deal Percentage", "final_indication_deal_percentage")}
        {renderField("Allocation Amount (USD)", "allocation_amount_usd")}
        {renderField("Allocation Deal Size Percentage", "allocation_deal_size_percentage")}
        {renderField("Allocation Percentage", "allocation_percentage")}
      </Grid>
    </>
  );
};

export default DealAllocations;
