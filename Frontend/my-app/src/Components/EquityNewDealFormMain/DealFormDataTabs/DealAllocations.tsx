import React from "react";
import {
  Grid,
  TextField,
  Typography,
  InputAdornment,
  Box,
} from "@mui/material";
import { PieChart } from "lucide-react";
import { FormSectionProps } from "../../../types/NewDealFormData";

const DealAllocations: React.FC<FormSectionProps> = ({
  data,
  editable,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

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
          <PieChart size={20} />
          Deal Allocations
        </Box>
      </Typography>

      <Grid container spacing={2}>
        {renderField("Sponsor", "sponsor")}
        {renderField("Percentage Primary", "percentage_primary", "%")}
        {renderField("Price (Local Currency)", "price_local_currency")}
        {renderField("Discount Percentage", "discount_percentage")}
        {renderField("Final Indication Amount (USD)", "final_indication_amount_usd")}
        {renderField("Final Indication Deal Percentage", "final_indication_deal_percentage")}
        {renderField("Allocation Amount (USD)", "allocation_amount_usd")}
        {renderField("Allocation Deal Size Percentage", "allocation_deal_size_percentage")}
        {renderField("Allocation Percentage", "allocation_percentage")}
        {renderField("Invitation Bank", "invitation_bank")}
      </Grid>
    </>
  );
};

export default DealAllocations;
