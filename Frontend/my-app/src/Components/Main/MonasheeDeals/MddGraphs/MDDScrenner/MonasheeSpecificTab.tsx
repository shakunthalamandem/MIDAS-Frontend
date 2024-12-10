// src/components/FilterTabs/MonasheeSpecificTab.tsx

import React from "react";
import { TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const MonasheeSpecificTab: React.FC = () => {
  return (
    <div>
      <TextField label="Monashee Specific Field 1" fullWidth margin="normal" />
      <TextField label="Monashee Specific Field 2" fullWidth margin="normal" />

      <FormControl fullWidth margin="normal">
        <InputLabel>Monashee Combo</InputLabel>
        <Select defaultValue="" label="Monashee Combo">
          <MenuItem value={10}>Monashee Option 1</MenuItem>
          <MenuItem value={20}>Monashee Option 2</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default MonasheeSpecificTab;
