import React, { useEffect } from "react";
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
import { Field, useFormikContext } from "formik";

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
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();

  useEffect(() => {
    // Optionally handle any side-effects when filtersData changes
  }, [filtersData]);

  const formatSelectedTags = (values: (string | number)[]) => {
    if (values.length === 0) return [];
    const firstValue = values[0];
    return values.length === 1
      ? [firstValue]
      : [firstValue, `+${values.length - 1}`];
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
                <Field name={key}>
                  {({ field, form }: any) => (
                    <Select
                      multiple
                      value={field.value || []}
                      onChange={(e) => form.setFieldValue(key, e.target.value)}
                      sx={{
                        "& .MuiSelect-select": {
                          padding: "8px", // Adjust padding for smaller height
                          fontSize: "0.875rem", // Adjust font size for smaller text
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderRadius: "4px", // Adjust border radius
                        },
                        maxWidth: "150px", // Adjust dropdown width
                      }}
                      renderValue={(selected) => {
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
                  )}
                </Field>
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
                    <InfoIcon sx={{ ml: 1, fontSize: "1rem", color: "#cfcfcf" }} />
                  </Tooltip>
                )}
              </Typography>
              {filter.fields?.map((field, index) => (
                <Field key={index} name={`${key}[${index}]`}>
                  {({ field, form }: any) => (
                    <TextField
                      {...field}
                      type="number"
                      label={field.label}
                      placeholder={field.placeholder}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      size="small"
                      value={field.value || ""}
                      onChange={(e) => form.setFieldValue(`${key}[${index}]`, e.target.value)}
                      sx={{
                        maxWidth: "100px", // Set width of the input box
                        "& input": {
                          textAlign: "center",
                        },
                        marginBottom: "20px", // Space between input boxes
                        marginRight: "20px",
                      }}
                      inputProps={{
                        min: -100,
                        max: 100,
                        step: 1,
                      }}
                      error={!!(touched[key] && errors[key])} // Display error state
                      helperText={touched[key] && errors[key]} // Show error message
                    />
                  )}
                </Field>
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
          flexWrap: "wrap",
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
          flexWrap: "wrap",
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

export default MonasheeSpecificTab;
