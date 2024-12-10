// src/components/FilterTabs/DealSpecificTab.tsx

import React, { useEffect, useState } from "react";
import { TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress } from "@mui/material";

const DealSpecificTab: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [apiOptions, setApiOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchApiOptions = async () => {
      setLoading(true);
      setTimeout(() => {
        setApiOptions(["API Option 1", "API Option 2", "API Option 3"]);
        setLoading(false);
      }, 2000);
    };

    fetchApiOptions();
  }, []);

  return (
    <div>
      <TextField label="Deal Specific Field 1" fullWidth margin="normal" />
      <TextField label="Deal Specific Field 2" fullWidth margin="normal" />

      <FormControl fullWidth margin="normal">
        <InputLabel>Deal Specific Combo</InputLabel>
        <Select defaultValue="" label="Deal Specific Combo">
          <MenuItem value={10}>Deal Option 1</MenuItem>
          <MenuItem value={20}>Deal Option 2</MenuItem>
        </Select>
      </FormControl>

      {/* API Combo */}
      {loading ? (
        <CircularProgress />
      ) : (
        <FormControl fullWidth margin="normal">
          <InputLabel>API Combo</InputLabel>
          <Select defaultValue="" label="API Combo">
            {apiOptions.map((option, index) => (
              <MenuItem key={index} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </div>
  );
};

export default DealSpecificTab;
