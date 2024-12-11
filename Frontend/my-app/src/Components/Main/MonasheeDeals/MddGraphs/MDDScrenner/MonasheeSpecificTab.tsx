import React, { useState, useEffect } from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Checkbox,
  Grid,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

// Define the types for Monashee filtersData
interface MonasheeSpecificFilterConfig {
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

interface MonasheeSpecificTabProps {
  filtersData: {
    [key: string]: MonasheeSpecificFilterConfig;
  };
}

const MonasheeSpecificTab: React.FC<MonasheeSpecificTabProps> = ({ filtersData }) => {
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: (string | number)[] }>({});
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

    if (value === "" || (parsedValue >= -100 && parsedValue <= 100)) {
      setInputErrors((prevErrors) => ({
        ...prevErrors,
        [key]: "", // Clear any previous error
      }));

      setSelectedValues((prevState) => {
        const newState = { ...prevState };

        if (!newState[key]) {
          newState[key] = [];
        }

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

  const renderFilter = (key: string, filter: MonasheeSpecificFilterConfig) => {
    switch (filter.type) {
      case "dropdown":
        return (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {key}
                {filter.description && (
                  <Tooltip title={filter.description} arrow>
                    <InfoIcon sx={{ ml: 1, fontSize: "1rem", color: "#cfcfcf" }} />
                  </Tooltip>
                )}
              </Typography>
              <FormControl fullWidth margin="normal">
                <Select
                  multiple
                  value={selectedValues[key] || []}
                  onChange={(e) => handleSelectionChange(key, e.target.value as (string | number)[])}
                  sx={{
                    "& .MuiSelect-select": {
                      padding: "8px", // Decrease padding for smaller height
                      fontSize: "0.875rem", // Adjust font size for smaller text
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderRadius: "4px", // Make border radius smaller if desired
                    },
                    maxWidth: "150px", // Decrease width of dropdown
                  }}                  renderValue={(selected) => {
                    const formattedTags = formatSelectedTags(selected as (string | number)[]);
                    return formattedTags.join(", ");
                  }}
                >
                  {filter.options?.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
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
          flexWrap: "wrap",
        }}
      >
        {Object.keys(filtersData)
          .map((key) => {
            const filter = filtersData[key];
            return renderFilter(key, filter);
          })}
      </Grid>
    </Box>
  );
};

export default MonasheeSpecificTab;
