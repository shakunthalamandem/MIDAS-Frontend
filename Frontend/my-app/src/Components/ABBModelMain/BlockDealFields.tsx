import React from "react";
import { Grid, TextField } from "@mui/material";
import { blockDealFields, DiscountFormValues } from "./DiscountDataModel/ABBDiscountConfig";
import { baseTextFieldProps, gridItemProps } from "./formConstants";

interface BlockDealFieldsProps {
  values: DiscountFormValues;
  errors: Record<string, string>;
  onChange: (key: keyof DiscountFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const BlockDealFields: React.FC<BlockDealFieldsProps> = ({
  values,
  errors,
  onChange,
}) => (
  <>
    {blockDealFields.map((field) => (
      <Grid item {...gridItemProps} key={field.key}>
        <TextField
          type="number"
          label={field.label}
          value={values[field.key]}
          onChange={onChange(field.key)}
          {...baseTextFieldProps}
          required
          error={Boolean(errors[field.key])}
          helperText={errors[field.key] || ""}
        />
      </Grid>
    ))}
  </>
);

export default BlockDealFields;
