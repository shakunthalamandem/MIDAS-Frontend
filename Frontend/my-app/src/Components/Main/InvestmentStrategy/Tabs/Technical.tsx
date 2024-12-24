import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Typography, Grid } from '@mui/material';

interface FilterOption {
  label: string;
  description: string;
  options: string[];
}

interface TechnicalProps {
  data: Record<string, FilterOption>; // Define the structure of the `data` prop
  selectedValues: Record<string, string>; // Selected values for the filters
  onValueChange: (filterName: string, value: string) => void; // Handler to update parent state
}

const Technical: React.FC<TechnicalProps> = ({ data, selectedValues, onValueChange }) => {
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

export default Technical;
