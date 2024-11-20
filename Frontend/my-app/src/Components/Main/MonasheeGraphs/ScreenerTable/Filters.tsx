import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Button,
  Typography,
  Tooltip,
  TextField,
  Checkbox,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Container,
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import ScreenerDataTable from "./ScreenerDataTable"; // Import the ScreenerDataTable component

interface FilterOption {
  options: (string | number)[]; // Options can be either string or number
  label: string;
  description: string;
}

interface Filter {
  [key: string]: FilterOption;
}

interface FiltersProps {
  filtersData: Filter[]; // Accept filters as prop
}

const Filters: React.FC<FiltersProps> = ({ filtersData }) => {
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: (string | number)[] }>({});
  const [appliedFilters, setAppliedFilters] = useState<{ [key: string]: (string | number)[] } | null>(null);

  useEffect(() => {
    // Initialize selected values with default values
    const initialSelectedValues: { [key: string]: (string | number)[] } = {};


    setSelectedValues(initialSelectedValues);
  }, [filtersData]); // Runs when filtersData changes

  const handleSelectionChange = (key: string, value: (string | number)[]) => {
    setSelectedValues((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Applied Filters:", selectedValues);
    setAppliedFilters(selectedValues); // Save applied filters
  };

  const handleCancel = () => {
    // Reset to default values
    const resetSelectedValues: { [key: string]: (string | number)[] } = {};

  
    setSelectedValues(resetSelectedValues);
    setAppliedFilters(null); // Clear applied filters
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Screener Filters
            </Typography>
            <Grid container spacing={2} sx={{ backgroundColor: "#f7f8f8", maxHeight: "370px", overflowY: "scroll" }}>
              {filtersData.map((filter) => {
                const key = Object.keys(filter)[0]; // Get the key (e.g., "year", "deal_type")
                const { options, label, description } = filter[key];

                return (
                  <Grid item xs={12} sm={6} md={3} key={key}>
                    {/* Updated layout to 4x3 grid */}
                    <Box mb={2} width="100%">
                      <Typography
                        style={{
                          fontSize: "0.75rem",
                          marginBottom: "4px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <span>{label}:</span>
                        {description && (
                          <Tooltip title={description} arrow>
                            <InfoIcon sx={{ ml: 1, fontSize: "1rem", color: "#cfcfcf" }} />
                          </Tooltip>
                        )}
                      </Typography>
                      <Autocomplete
                        multiple
                        options={options}
                        getOptionLabel={(option) => option.toString()} // Ensure the option is treated as string
                        disableCloseOnSelect
                        value={selectedValues[key] || []}
                        onChange={(_, value) => handleSelectionChange(key, value as (string | number)[])}
                        renderInput={(params) => (
                          <TextField {...params} variant="outlined" size="small" fullWidth placeholder="Any" />
                        )}
                        renderOption={(props, option, { selected }) => (
                          <ListItem {...props} style={{ padding: "4px" }}>
                            <Checkbox
                              checked={selected}
                              sx={{ padding: "4px", "& .MuiSvgIcon-root": { fontSize: "1rem" } }}
                            />
                            <ListItemText
                              primary={option.toString()}
                              sx={{
                                fontSize: "0.875rem", // Reduce font size of the options
                              }}
                            />
                          </ListItem>
                        )}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>

            {/* Center the buttons */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mr: 2 }}>
                Apply
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleCancel}>
                Reset
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Render ScreenerDataTable */}
      {appliedFilters && (
        <Box mt={4}>
          <ScreenerDataTable sectorwiseData={appliedFilters} />
        </Box>
      )}
    </Container>
  );
};

export default Filters;
