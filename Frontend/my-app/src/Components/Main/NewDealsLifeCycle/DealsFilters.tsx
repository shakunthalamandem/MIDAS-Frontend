import React from "react";
import { Stack, Checkbox, FormControlLabel } from "@mui/material";

interface DealsFiltersProps {
  selectedOp: string;
  onChange: (value: string) => void;
}

const DealsFilters: React.FC<DealsFiltersProps> = ({ selectedOp, onChange }) => {
  return (
    <Stack direction="row" spacing={4} justifyContent="center" sx={{ mb: 2 }}>
      {["all upcoming", "next 2 weeks", "all recent"].map((value) => (
        <FormControlLabel
          key={value}
          control={
            <Checkbox
              checked={selectedOp === value}
              onChange={() => onChange(value)}
            />
          }
          label={value.replace(/^\w/, (c) => c.toUpperCase())}
        />
      ))}
    </Stack>
  );
};

export default DealsFilters;
