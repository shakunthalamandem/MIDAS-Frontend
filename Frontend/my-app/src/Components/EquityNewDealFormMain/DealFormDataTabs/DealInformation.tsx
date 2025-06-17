import React from "react";
import {
  Card,
  CardContent,
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


  return (
    <>
      <Typography variant="h6" gutterBottom align="center" color="#002060">
        <Box display="inline-flex" alignItems="center" gap={1}>
          <Info size={20} />
          Deal Information
        </Box>
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Ticker"
            name="ticker"
            value={data.ticker || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Pricing Date"
            name="pricing_date"
            type="date"
            value={data.pricing_date || ""}
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
            label="Vendor/Issuer"
            name="vendor_issuer"
            value={data.vendor_issuer || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Region"
            name="region"
            select
            value={data.region || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
          >
            {regions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Deal Type"
            name="deal_type"
            select
            value={data.deal_type || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
          >
            {dealTypes.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="FO Type"
            name="fo_type"
            select
            value={data.fo_type || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
          >
            {foTypes.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Sector"
            name="sector"
            select
            value={data.sector || ""}
            onChange={handleChange}
            fullWidth
            size="small"
            disabled={!editable}
            variant={editable ? "outlined" : "filled"}
          >
            {sectors.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Deal Captain"
            name="deal_captain"
            value={data.deal_captain || ""}
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

export default DealInformation;
