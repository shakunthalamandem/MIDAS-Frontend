// src/components/FilterTabs/GeneralTab.tsx

import React from "react";
import { TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const GeneralTab: React.FC = () => {
  return (
    <div>
      <TextField label="General Field 1" fullWidth margin="normal" />
      <TextField label="General Field 2" fullWidth margin="normal" />

      <FormControl fullWidth margin="normal">
        <InputLabel>General Combo</InputLabel>
        <Select defaultValue="" label="General Combo">
          <MenuItem value={10}>Option 1</MenuItem>
          <MenuItem value={20}>Option 2</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
};

export default GeneralTab;
