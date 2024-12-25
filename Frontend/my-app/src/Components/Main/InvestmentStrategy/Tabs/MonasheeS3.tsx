import React from "react";
import { FormControl, InputLabel, Select, MenuItem, Typography, Grid } from "@mui/material";

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
    <div>
      <Grid container spacing={2}>
        {Object.entries(data).map(([key, value]) => (
          <Grid item xs={12} sm={8} md={3} key={key} container alignItems="center">
            {/* Label */}
            <Grid item xs={4}>
              <Typography variant="body2" color="#5a5959">
                {value.label}
              </Typography>
            </Grid>

            {/* Select Dropdown */}
            <Grid item xs={8}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel
                  sx={{
                    fontSize: "0.8rem", // Smaller font size
                    top: "50%", // Place the label vertically centered
                    transform: "translateY(-50%)",
                    paddingLeft:2 // Adjust for centering
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
    </div>
  );
};

export default MonasheeS3;
