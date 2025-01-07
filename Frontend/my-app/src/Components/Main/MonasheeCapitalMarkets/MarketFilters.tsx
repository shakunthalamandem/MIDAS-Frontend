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
  Button,
  Tooltip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

// Define a type for the filter data
interface FilterOption {
  label: string;
  options: (string | number)[]; // options can be string or number
  description: string;
}

const MarketFilters: React.FC = () => {
  const [filtersData, setFiltersData] = useState<Record<string, FilterOption>[]>([]);
  const [selectedValues, setSelectedValues] = useState<
    Record<string, string | number | (string | number)[]>
  >({});

  const handleDataLoaded = (data: any) => {
    setFiltersData(data.market_capital);
  };

  const handleChange =
    (filterKey: string) =>
    (event: SelectChangeEvent<string | number | (string | number)[]>) => {
      const value = event.target.value;

      setSelectedValues((prev) => ({
        ...prev,
        [filterKey]: Array.isArray(value) ? value : [value], // Ensure array for multi-select
      }));
    };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: 300, // Set smaller max height for dropdown
        width: 120, // Set smaller width for dropdown
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
            maxWidth: "1200px", // Adjust the max width to fit the dropdowns better
            margin: "0 auto",
            borderRadius: 2,
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            backgroundColor: "#ffffff",
          }}
        >
          <Grid container spacing={3} direction="row" justifyContent="space-between">
            {filtersData.map((filter, index) => {
              const [key, value] = Object.entries(filter)[0] as [string, FilterOption];
              const isMultiSelect = Array.isArray(value.options); // Determine multi-select based on options

              return (
                <Grid item xs={2} key={index}>
                  {/* Add Label and Tooltip */}
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      marginBottom: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {value.label}
                    {value.description && (
                      <Tooltip title={value.description} arrow>
                        <InfoIcon sx={{ ml: 1, fontSize: "1rem", color: "#cfcfcf" }} />
                      </Tooltip>
                    )}
                  </Typography>

                  <FormControl fullWidth>
                    <InputLabel id={`${key}-label`} sx={{ fontSize: "0.75rem" }}>
                      {value.label}
                    </InputLabel>
                    <Select
                      labelId={`${key}-label`}
                      id={key}
                      multiple={isMultiSelect}
                      value={selectedValues[key] || (isMultiSelect ? [] : "")}
                      onChange={handleChange(key)}
                      MenuProps={MenuProps}
                      renderValue={(selected) =>
                        Array.isArray(selected)
                          ? selected.join(", ")
                          : (selected as string | number)
                      }
                      sx={{
                        fontSize: "12px", // Reduce font size in dropdown
                        height: "40px", // Adjust the height of the dropdown input
                      }}
                    >
                      {value.options.map((option, idx) => (
                        <MenuItem key={idx} value={option} sx={{ fontSize: "12px" }}>
                          {isMultiSelect && (
                            <Checkbox
                              checked={
                                (selectedValues[key] as (string | number)[] || []).includes(option)
                              }
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
          <Grid container justifyContent="center" spacing={2} sx={{ mt: 2 }}>
            <Grid item>
              <Button
                variant="contained"
                type="submit"
                sx={{ bgcolor: "#002060" }}
                disabled={!filtersData || !Object.keys(filtersData).length}
              >
                Apply
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="secondary"
                type="button"
                // onClick={handleReset}
                disabled={!filtersData || !Object.keys(filtersData).length}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Card>
      ) : (
        <Typography align="center">Loading filters...</Typography>
      )}
    </Box>
  );
};

export default MarketFilters;
