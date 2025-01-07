import React, { useState } from "react";
import MarketCapitalFilters from "./MarketCapitalFilters";
import { FormControl, InputLabel, MenuItem, Select, Typography, Box, SelectChangeEvent } from "@mui/material";

// Define a type for the filter data
interface FilterOption {
  label: string;
  options: string[] | number[];
  description: string;
}

const MarketFilters: React.FC = () => {
  const [filtersData, setFiltersData] = useState<Record<string, FilterOption>[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, string | number>>({});

  const handleDataLoaded = (data: any) => {
    setFiltersData(data.market_capital);
  };

  const handleChange = (filterKey: string) => (event: SelectChangeEvent<string | number>) => {
    setSelectedValues((prev: Record<string, string | number>) => ({
      ...prev,
      [filterKey]: event.target.value,
    }));
  };

  return (
    <Box padding={2}>
      <Typography variant="h4" gutterBottom>
        Market Filters
      </Typography>

      {/* Load the filters data */}
      <MarketCapitalFilters onDataLoaded={handleDataLoaded} />

      {/* Render dropdowns when data is available */}
      {filtersData.length > 0 ? (
        filtersData.map((filter, index) => {
          const [key, value] = Object.entries(filter)[0] as [string, FilterOption];
          return (
            <FormControl key={index} fullWidth margin="normal">
              <InputLabel id={`${key}-label`}>{value.label}</InputLabel>
              <Select
                labelId={`${key}-label`}
                id={key}
                value={selectedValues[key] || ""}
                onChange={handleChange(key)}
              >
                {value.options.map((option, idx) => (
                  <MenuItem key={idx} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        })
      ) : (
        <Typography>Loading filters...</Typography>
      )}
    </Box>
  );
};

export default MarketFilters;
