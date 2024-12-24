import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Typography, Grid } from '@mui/material';

interface FilterOption {
  label: string;
  description: string;
  options: string[];
}

interface MonasheeS3Props {
  data: Record<string, FilterOption>; // Define the structure of the `data` prop
  selectedValues: Record<string, string>; // Selected values for the filters
  onValueChange: (filterName: string, value: string) => void; // Handler to update parent state
}

const MonasheeS3: React.FC<MonasheeS3Props> = ({ data, selectedValues, onValueChange }) => {
  return (
    <div>

      
      {/* Correct Grid Layout */}
      <Grid container spacing={2}>
        {Object.entries(data).map(([key, value]) => (
          <Grid item xs={12} sm={8} md={3} key={key} container alignItems="center">
            {/* Label */}
            <Grid item xs={4}>
              <Typography variant="body2" color='#5a5959'>{value.label}</Typography>
            </Grid>

            {/* Select Dropdown */}
            <Grid item xs={8}>
              <FormControl variant="outlined" fullWidth>
              <Select
                  value={selectedValues[key] || ''}
                  onChange={(e) => onValueChange(key, e.target.value)}
                  label={value.label}
                  sx={{ height: 30 }} // Adjust dropdown height
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300, // Set max height of the dropdown
                        overflowY: 'auto', // Enable vertical scrolling
                      },
                    },
                  }}
                >
            
                  {value.options.map((option, index) => (
                    <MenuItem key={index} value={option}>
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
