import React, { useState } from "react";
import MarketCapitalFilters from "./MarketCapitalFilters";
import MarketCapitalMain from "./MarketCapitalMain";
import {
  Box,
  Card,
  Typography,
  FormControl,
  MenuItem,
  Select,
  Grid,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
  Button,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

interface FilterOption {
  label: string;
  options: (string | number)[];
  description: string;
}

const MarketFilters: React.FC = () => {
  const [filtersData, setFiltersData] = useState<
    Record<string, FilterOption>[]
  >([]);
  const [selectedValues, setSelectedValues] = useState<
    Record<string, string | number | (string | number)[]>
  >({});
  const [appliedFilters, setAppliedFilters] = useState<
    Record<string, string | number | (string | number)[]>
  >({});
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Manage Snackbar open state
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message content

  const handleDataLoaded = (data: any) => {
    setFiltersData(data.market_capital);
  };

  const handleChange =
    (filterKey: string) =>
    (event: SelectChangeEvent<string | number | (string | number)[]>) => {
      const value = event.target.value;
      setSelectedValues((prev) => ({
        ...prev,
        [filterKey]: Array.isArray(value) ? value : [value],
      }));
    };

  const handleApply = () => {
    // Check if start_year is less than end_year
    const startYear = selectedValues["start_year"];
    const endYear = selectedValues["end_year"];

    if (startYear && endYear && startYear > endYear) {
      // Open Snackbar with error message if validation fails
      setSnackbarMessage(
        "Start year should be less than or equal to end year."
      );
      setSnackbarOpen(true);
    } else {
      setSnackbarOpen(false); // Close the Snackbar if validation passes
      console.log("Applied Filters:", selectedValues);
      setAppliedFilters(selectedValues); // Apply filters
    }
  };

  const handleReset = () => {
    setSelectedValues({});
    setAppliedFilters({});
    setSnackbarOpen(false); // Close Snackbar on reset
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false); // Close Snackbar when the user dismisses it
  };

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: 300,
        width: 120,
      },
    },
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
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
          <Grid
            container
            spacing={3}
            direction="row"
            justifyContent="space-between"
          >
            {filtersData.map((filter, index) => {
              const [key, value] = Object.entries(filter)[0] as [
                string,
                FilterOption,
              ];
              const isMultiSelect =
                Array.isArray(value.options) &&
                key !== "start_year" &&
                key !== "end_year" &&
                key !== "year_period";


              return (
                <Grid item xs={2} key={index}>
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
                        <InfoIcon
                          sx={{ ml: 1, fontSize: "0.9rem", color: "#cfcfcf" }}
                        />
                      </Tooltip>
                    )}
                  </Typography>

                  <FormControl fullWidth>
                    <Box>
                      <Select
                        id={key}
                        multiple={isMultiSelect}
                        value={selectedValues[key] || (isMultiSelect ? [] : "")}
                        onChange={handleChange(key)}
                        MenuProps={MenuProps}
                        renderValue={(selected) => {
                          if (Array.isArray(selected)) {
                            return selected.length > 1
                              ? `${selected[0]} +${selected.length - 1}`
                              : selected[0];
                          }
                          return selected as string | number;
                        }}
                        sx={{
                          fontSize: "12px",
                          height: "40px",
                          width:'100%'
                        }}
                      >
                        {value.options.map((option, idx) => (
                          <MenuItem
                            key={idx}
                            value={option}
                            sx={{ fontSize: "0.8rem", padding: "4px 8px" }}
                          >
                            {isMultiSelect && (
                              <Checkbox
                                checked={(
                                  (selectedValues[key] as (
                                    | string
                                    | number
                                  )[]) || []
                                ).includes(option)}
                                sx={{ padding: "0 8px" }}
                              />
                            )}
                            <ListItemText
                              primary={option}
                              sx={{
                                "& .MuiTypography-root": {
                                  fontSize: "0.8rem",
                                },
                              }}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </FormControl>
                </Grid>
              );
            })}
          </Grid>

          <Grid container justifyContent="center" spacing={2} sx={{ mt: 2 }}>
            <Grid item>
              <Button
                variant="contained"
                type="button"
                sx={{ bgcolor: "#002060" }}
                onClick={handleApply}
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
                onClick={handleReset}
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

      {<MarketCapitalMain selectedFilters={appliedFilters} />}

      {/* Snackbar for error message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MarketFilters;
