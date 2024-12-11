import React from "react";
import { TextField, FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";

interface DealSpecificTabProps {
  filtersData: {
    [key: string]: {
      type: string;
      description: string;
      options?: string[];
      fields?: { type: string; operator: string; label: string; placeholder: string }[];
      api?: string;
    };
  };
}

const DealSpecificTab: React.FC<DealSpecificTabProps> = ({ filtersData }) => {
  const renderFilter = (key: string, filter: any) => {
    switch (filter.type) {
      case "dropdown":
        return (
          <FormControl fullWidth margin="normal" key={key}>
            <InputLabel>{key}</InputLabel>
            <Select defaultValue="" label={key}>
              {filter.options?.map((option: string, index: number) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "input":
        return (
          <Box key={key} marginY={2}>
            <InputLabel>{filter.description}</InputLabel>
            {filter.fields?.map((field: any, index: number) => (
              <TextField
                key={index}
                type={field.type}
                label={field.label}
                placeholder={field.placeholder}
                fullWidth
                margin="normal"
              />
            ))}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {Object.entries(filtersData).map(([key, filter]) => renderFilter(key, filter))}
    </div>
  );
};

export default DealSpecificTab;
