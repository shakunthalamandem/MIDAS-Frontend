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
  "primary_percentage",
  "discount_from_announcement_price",
  "ioi_as_percentage_of_deal_size",
  "allocation_as_percentage_of_deal_size",
  "allocation_as_percentage_of_ioi"
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
          sx: {
            "&.Mui-disabled": {
              WebkitTextFillColor: "#b1062e",
            },
            "& input.Mui-disabled": {
              WebkitTextFillColor: "#b1062e",
            },
          },
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
        
        {renderField("Deal Size ($)", "deal_size")}
        {renderField("Percentage Primary", "primary_percentage")}
        {renderField("Issue Price($) ", "issue_price")}
        {renderField("Discount From Announcement Price", "discount_from_announcement_price")}
        {renderField("IOI Amount ($)", "ioi_amount")}
        {renderField("IOI as % of Deal Size", "ioi_as_percentage_of_deal_size")}
        {renderField("Allocation Amount ($)", "allocation_amount")}
        {renderField("Allocation as % of Deal Size ", "allocation_as_percentage_of_deal_size")}
        {renderField("Allocation as % of IOI", "allocation_as_percentage_of_ioi")}
      </Grid>
    </>
  );
};

export default DealAllocations;
