import React, { useState, useEffect } from "react";
import {
  TextField,
  FormControl,
  Autocomplete,
  Box,
  Checkbox,
  Grid,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

// Define the types for DealSpecific filtersData
interface DealSpecificFilterConfig {
  type: string;
  description: string;
  options?: string[];
  fields?: {
    type: string;
    operator: string;
    label: string;
    placeholder: string;
  }[];
  api?: string;
}

interface DealSpecificTabProps {
  filtersData: {
    [key: string]: DealSpecificFilterConfig;
  };
}

const DealSpecificTab: React.FC<DealSpecificTabProps> = ({ filtersData }) => {
  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: (string | number)[];
  }>({});
  const [inputErrors, setInputErrors] = useState<{ [key: string]: string }>({});


  useEffect(() => {
    const initialSelectedValues: { [key: string]: (string | number)[] } = {};
    Object.keys(filtersData).forEach((key) => {
      initialSelectedValues[key] = [];
    });
    setSelectedValues(initialSelectedValues);
  }, [filtersData]);

  const handleSelectionChange = (key: string, value: (string | number)[]) => {
    setSelectedValues((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const formatSelectedTags = (values: (string | number)[]) => {
    if (values.length === 0) return [];
    const firstValue = values[0];
    return values.length === 1
      ? [firstValue]
      : [firstValue, `+${values.length - 1}`];
  };
  const handleInputChange = (key: string, value: string, index: number) => {
    const parsedValue = parseInt(value, 10);
  
    // Check if the value is valid (empty or within range)
    if (value === "" || (parsedValue >= -100 && parsedValue <= 100)) {
      setInputErrors((prevErrors) => ({
        ...prevErrors,
        [key]: "", // Clear any previous error
      }));
  
      setSelectedValues((prevState) => {
        const newState = { ...prevState };
  
        // Ensure the field has an array to store its values
        if (!newState[key]) {
          newState[key] = [];
        }
  
        // Update the specific field value based on its index
        newState[key][index] = value;
        
        return newState;
      });
    } else {
      setInputErrors((prevErrors) => ({
        ...prevErrors,
        [key]: "Value must be between -100 and 100", // Show error message
      }));
    }
  };
  

  const renderFilter = (key: string, filter: DealSpecificFilterConfig) => {
    switch (filter.type) {
      case "dropdown":
        return (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  // marginBottom: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {key}
                {filter.description && (
                  <Tooltip title={filter.description} arrow>
                    <InfoIcon
                      sx={{ ml: 1, fontSize: "1rem", color: "#cfcfcf" }}
                    />
                  </Tooltip>
                )}
              </Typography>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  options={filter.options || []}
                  getOptionLabel={(option) => option.toString()}
                  disableCloseOnSelect
                  value={selectedValues[key] || []}
                  onChange={(_, value) =>
                    handleSelectionChange(key, value as (string | number)[])
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      fullWidth
                    />
                  )}
                  renderTags={(value) => {
                    const formattedTags = formatSelectedTags(value);
                    return formattedTags.map((tag, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          backgroundColor: "#e0e0e0",
                          borderRadius: "4px",
                          // padding: "4px 8px",
                          margin: "2px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.875rem",
                        }}
                      >
                        {tag}
                      </Box>
                    ));
                  }}
                  renderOption={(props, option, { selected }) => (
                    <ListItem {...props} sx={{ padding: "4px" }}>
                      <Checkbox checked={selected} sx={{ padding: "4px" }} />
                      <ListItemText
                        primary={option.toString()}
                        sx={{ fontSize: "0.875rem" }}
                      />
                    </ListItem>
                  )}
                />
              </FormControl>
            </Box>
          </Grid>
        );

        case "input":
      return (
        <Grid item xs={12} sm={6} md={3} key={key}>
          <Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                marginBottom: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {key}
              {filter.description && (
                <Tooltip title={filter.description} arrow>
                  <InfoIcon
                    sx={{ ml: 1, fontSize: "1rem", color: "#cfcfcf" }}
                  />
                </Tooltip>
              )}
            </Typography>
            {filter.fields?.map((field, index) => (
              <TextField
                key={index}
                type="number"
                label={field.label}
                placeholder={field.placeholder}
                fullWidth
                margin="normal"
                variant="outlined"
                size="small"
                value={selectedValues[key]?.[index] || ""} // Make sure each input field gets its own value
                onChange={(e) => handleInputChange(key, e.target.value, index)} // Pass the field index to update the correct field
                sx={{
                  maxWidth: "100px", // Small size for the input box
                  "& input": {
                    textAlign: "center",
                  },
                  marginBottom: "20px", // At least 20px margin between input boxes
                  marginRight: "20px"
                }}
                inputProps={{
                  min: -100,
                  max: 100,
                  step: 1,
                }}
                error={!!inputErrors[key]} // Display error state
                helperText={inputErrors[key]} // Show error message
              />
            ))}
          </Box>
        </Grid>
      );


      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Dropdown Filters Grid */}
      <Grid
        container
        spacing={2}
        sx={{
          backgroundColor: "#f7f8f8",
          maxHeight: "370px",
          overflowY: "auto",
          padding: 2,
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap", // Allow wrapping of items
        }}
      >
        {Object.keys(filtersData)
          .filter((key) => filtersData[key].type === "dropdown")
          .map((key) => {
            const filter = filtersData[key];
            return renderFilter(key, filter);
          })}
      </Grid>

      {/* Input Filters Grid */}
      <Grid
        container
        spacing={2}
        sx={{
          backgroundColor: "#f7f8f8",
          maxHeight: "370px",
          overflowY: "auto",
          padding: 2,
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap", // Allow wrapping of items
        }}
      >
        {Object.keys(filtersData)
          .filter((key) => filtersData[key].type === "input")
          .map((key) => {
            const filter = filtersData[key];
            return renderFilter(key, filter);
          })}
      </Grid>
    </Box>
  );
};

export default DealSpecificTab;
