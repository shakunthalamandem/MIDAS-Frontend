import React, { useState } from "react";
import MarketCapitalFilters from "./MarketCapitalFilters";
import {
  Box,
  Card,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
} from "@mui/material";

// Define a type for the filter data
interface FilterOption {
  label: string;
  options: (string | number)[];
  description: string;
}

const MarketFilters: React.FC = () => {
  const [filtersData, setFiltersData] = useState<Record<string, FilterOption>[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, string | number | (string | number)[]>>({});

  const handleDataLoaded = (data: any) => {
    setFiltersData(data.market_capital);
  };

  const handleChange = (filterKey: string) => (
    event: SelectChangeEvent<string | number | (string | number)[]>
  ) => {
    setSelectedValues((prev) => ({
      ...prev,
      [filterKey]: event.target.value,
    }));
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: 400, // Set max height for dropdown
        width: 250,
      },
    },
  };

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: "#f4f6f8",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h4" color="#002060" align="center" sx={{ fontWeight: "bold" }}>
        Market Filters
      </Typography>

      {/* Load the filters data */}
      <MarketCapitalFilters onDataLoaded={handleDataLoaded} />

      {filtersData.length > 0 ? (
        <Card
          sx={{
            padding: 3,
            maxWidth: "1200px",
            margin: "0 auto",
            borderRadius: 2,
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            backgroundColor: "#ffffff",
          }}
        >
          <Grid container spacing={3}>
            {filtersData.map((filter, index) => {
              const [key, value] = Object.entries(filter)[0] as [string, FilterOption];
              const isMultiSelect = Array.isArray(selectedValues[key]); // Detect multi-select based on stored value

              return (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <FormControl fullWidth>
                    <InputLabel id={`${key}-label`}>{value.label}</InputLabel>
                    <Select
                      labelId={`${key}-label`}
                      id={key}
                      multiple={isMultiSelect} // Enable multi-select for options requiring checkboxes
                      value={selectedValues[key] || (isMultiSelect ? [] : "")}
                      onChange={handleChange(key)}
                      MenuProps={MenuProps}
                      renderValue={(selected) =>
                        Array.isArray(selected)
                          ? selected.join(", ")
                          : (selected as string | number)
                      }
                    >
                      {value.options.map((option, idx) => (
                        <MenuItem key={idx} value={option}>
                          {isMultiSelect && Array.isArray(selectedValues[key]) && (
                            <Checkbox
                              checked={(selectedValues[key] as (string | number)[]).includes(option)}
                            />
                          )}
                          <ListItemText primary={option} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              );
            })}
          </Grid>
        </Card>
      ) : (
        <Typography align="center">Loading filters...</Typography>
      )}
    </Box>
  );
};

export default MarketFilters;
