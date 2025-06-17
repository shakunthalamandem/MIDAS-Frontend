import React from "react";
import {
  Grid,
  TextField,
  Typography,
  MenuItem,
  Box,
} from "@mui/material";
import { Info } from "lucide-react";
import { FormSectionProps } from "../../../types/NewDealFormData";

const DealInformation: React.FC<FormSectionProps> = ({
  data,
  editable,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  const dealTypes = ["FO", "IPO", "Rights Issue", "Convertible"];
  const foTypes = ["Block", "Accelerated Bookbuild", "Overnight"];
  const regions = ["APAC", "EMEA", "Americas"];
  const sectors = [
    "Industrials",
    "Technology",
    "Healthcare",
    "Financials",
    "Energy",
    "Consumer",
  ];

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

  const renderTextField = (
    label: string,
    name: string,
    type: string = "text"
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
        InputLabelProps={type === "date" ? { shrink: true } : undefined}
      />
    </Grid>
  );

  return (
    <>
      <Typography variant="h6" gutterBottom align="center" color="#002060" fontWeight={600}>
        <Box display="inline-flex" alignItems="center" gap={1}>
          <Info size={20} />
          Deal Information
        </Box>
      </Typography>

      <Grid container spacing={2}>
        {renderTextField("Ticker", "ticker")}
        {renderTextField("Pricing Date", "pricing_date", "date")}
        {renderTextField("Vendor/Issuer", "vendor_issuer")}
        {renderSelectField("Region", "region", regions)}
        {renderSelectField("Deal Type", "deal_type", dealTypes)}
        {renderSelectField("FO Type", "fo_type", foTypes)}
        {renderSelectField("Sector", "sector", sectors)}
        {renderTextField("Deal Captain", "deal_captain")}
        {renderTextField("Invitation Bank", "invitation_bank")}
      
      </Grid>
    </>
  );
};

export default DealInformation;
