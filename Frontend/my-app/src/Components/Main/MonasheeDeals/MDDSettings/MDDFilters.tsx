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
import DealAllocationGraph from "./DealAllocationGraph";
// import ScreenerDataTable from "./ScreenerDataTable"; // Import the ScreenerDataTable component

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
  apiName: string;
}

const MDDFilters: React.FC<FiltersProps> = ({ filtersData, apiName }) => {
  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: (string | number)[]; // Store selected filter options
  }>({});
  const [appliedFilters, setAppliedFilters] = useState<{
    [key: string]: (string | number)[]; // Applied filters to pass to the table
  } | null>(null);
  const [apiData, setApiData] = useState({})

  useEffect(() => {
    // Initialize selected values with default values
    const initialSelectedValues: { [key: string]: (string | number)[] } = {};
    setSelectedValues(initialSelectedValues);
    setAppliedFilters(initialSelectedValues); // Show initial filters on page render
  }, [filtersData]); // Runs when filtersData changes

  const handleSelectionChange = (key: string, value: (string | number)[]) => {
    setSelectedValues((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        years: selectedValues.year,
        dealType: selectedValues.deal_type,
        region: selectedValues.broad_region,
        sector: selectedValues.gics_sector,
        deal_captain: selectedValues.deal_captain,
      };
  
      const apiUrl = process.env.REACT_APP_API_URL;
  
      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }
  
      const response = await fetch(`${apiUrl}/api/${apiName}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log("Applied Filters:", selectedValues);
        setApiData(result); // Save API response for DealAllocationGraph
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (error: any) {
      console.error(error.message || "An error occurred while fetching data");
    }
  };
  

  const handleCancel = () => {
    // Reset to default values
    const resetSelectedValues: { [key: string]: (string | number)[] } = {};
    setSelectedValues(resetSelectedValues);
    setAppliedFilters(resetSelectedValues); // Clear applied filters
  };

  // Format the selected tags to display +X for multiple selections
  const formatSelectedTags = (values: (string | number)[]) => {
    if (values.length === 0) return [];
    const firstValue = values[0];
    if (values.length === 1) return [firstValue];
    return [firstValue, `+${values.length - 1}`];
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ p: 2 }}>
         
            <Grid
              container
              spacing={2}
              sx={{
                backgroundColor: "#f7f8f8",
                maxHeight: "370px",
                overflowY: "scroll",
              }}
            >
              {filtersData.map((filter) => {
                const key = Object.keys(filter)[0]; // Get the key (e.g., "year", "deal_type")
                const { options, label, description } = filter[key];

                return (
                  <Grid item xs={12} sm={6} md={3} key={key} sx={{overflowY:'-moz-hidden-unscrollable'}}>
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
                        onChange={(_, value) =>
                          handleSelectionChange(key, value as (string | number)[])
                        }
                        renderInput={(params) => (
                          <TextField {...params} variant="outlined" size="small" fullWidth placeholder="Any" />
                        )}
                        renderTags={(value, getTagProps) => {
                          // Use the formatSelectedTags function to display +X for multiple selections
                          const formattedTags = formatSelectedTags(value);
                          return formattedTags.map((tag, idx) => (
                            <div
                              key={idx} // Ensure unique key
                              style={{
                                backgroundColor: '#e0e0e0',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                margin: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px', // Space between items
                              }}
                            >
                              {tag}
                            </div>
                          ));
                        }}
                        renderOption={(props, option, { selected }) => (
                          <ListItem {...props} style={{ padding: "4px" }}>
                            <Checkbox
                              checked={selected}
                              sx={{
                                padding: "4px",
                                "& .MuiSvgIcon-root": { fontSize: "1rem" },
                              }}
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
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{ mr: 2, bgcolor: "#002060" }}
              >
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
      <Box mt={4}>
        {/* <DealAllocationGraph sectorwiseData={appliedFilters || selectedValues} /> */}
        <DealAllocationGraph responseData={apiData} apiName={apiName} />
      </Box>
    </Container>
  );
};

export default MDDFilters;
