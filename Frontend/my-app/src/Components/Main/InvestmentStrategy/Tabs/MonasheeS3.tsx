import React from "react";
import { FormControl, InputLabel, Select, MenuItem, Typography, Grid, Box } from "@mui/material";
import MonasheeS3InputFields from "./MonasheeS3InputFields";

interface FilterOption {
  label: string;
  description: string;
  options: string[];
}

interface MonasheeS3Props {
  data: Record<string, FilterOption>;
  selectedValues: Record<string, string>;
  onValueChange: (filterName: string, value: string) => void;
}

const MonasheeS3: React.FC<MonasheeS3Props> = ({ data, selectedValues, onValueChange }) => {
  return (
    <Box sx={{ padding: 3 }}>
      {/* Dropdown Filters */}
      <Grid container spacing={2}>
        {Object.entries(data).map(([key, value]) => (
           <Grid item xs={12} sm={8} md={3} key={key} container alignItems="center">

            {/* Label */}
            <Grid item xs={4}>
              <Typography variant="body2" color="#5a5959" sx={{ fontSize: "0.8rem" }}>
                {value.label}
              </Typography>
            </Grid>

            {/* Select Dropdown */}
            <Grid item xs={8}>
            <FormControl variant="outlined" fullWidth>
              <InputLabel
                  sx={{
                    fontSize: "0.8rem", // Smaller font size
                    top: selectedValues[key] ? "0" : "50%", // Adjust position based on selection
                    transform: selectedValues[key] ? "translateY(-100%)" : "translateY(-50%)",
                    transition: "all 0.2s ease-out", // Smooth transition
                    visibility: selectedValues[key] ? "hidden" : "visible", // Hide when value is selected
                    paddingLeft: 2, // Adjust for alignment
                  }}
                >
                  {value.label}
                </InputLabel>
                <Select
                  value={selectedValues[key] || ""}
                  onChange={(e) => onValueChange(key, e.target.value)}
                  label={value.label}
                  sx={{
                    height: 40, // Adjust dropdown height
                    fontSize: "0.75rem", // Match placeholder font size
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        overflowY: "auto",
                      },
                    },
                  }}
                >
            
                  {value.options.map((option, index) => (
                    <MenuItem key={index} value={option} sx={{fontSize:'0.8rem'}}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        ))}
      </Grid>

      {/* Input Fields */}
      <Box mt={4}>
        {/* <MonasheeS3InputFields /> */}
      </Box>
    </Box>
  );
};

export default MonasheeS3;
