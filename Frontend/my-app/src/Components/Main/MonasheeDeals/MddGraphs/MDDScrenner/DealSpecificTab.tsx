import React from "react";
import {
  TextField,
  FormControl,
  Box,
  Grid,
  Tooltip,
  Typography,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { Field, useFormikContext } from "formik";
import LeadBankFilter from "./LeadBankFilter"; // Import the LeadBankFilter component

interface DealSpecificFilterConfig {
  type: string;
  description: string;
  label: string;
  options?: string[];
  fields?: {
    type: string;
    operator: string;
    label: string;
    placeholder: string;
  }[];
}

interface DealSpecificTabProps {
  filtersData: {
    [key: string]: DealSpecificFilterConfig;
  };
}

const DealSpecificTab: React.FC<DealSpecificTabProps> = ({ filtersData }) => {
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();

  const formatSelectedTags = (values: (string | number)[]) => {
    if (values.length === 0) return [];
    const firstValue = values[0];
    return values.length === 1
      ? [firstValue]
      : [firstValue, `+${values.length - 1}`];
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
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {filter.label}
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
                      displayEmpty
                      sx={{
                        "& .MuiSelect-select": {
                          padding: "8px",
                          fontSize: "0.875rem",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderRadius: "4px",
                        },
                        maxWidth: "150px",
                      }}
                      renderValue={(selected) => {
                        if (!selected || selected.length === 0) {
                          return (
                            <Typography sx={{ color: "#aaa", fontSize: "0.875rem" }}>
                              Select
                            </Typography>
                          );
                        }
                        const formattedTags = formatSelectedTags(
                          selected as (string | number)[]
                        );
                        return formattedTags.join(", ");
                      }}
                    >
                      {filter.options?.map((option, index) => (
                        <MenuItem key={index} value={option}>
                          <Checkbox
                            checked={field.value?.includes(option) || false}
                          />
                          <ListItemText primary={option} />
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
                {filter.label}
                {filter.description && (
                  <Tooltip title={filter.description} arrow>
                    <InfoIcon sx={{ ml: 1, fontSize: "1rem", color: "#cfcfcf" }} />
                  </Tooltip>
                )}
              </Typography>
              {filter.fields?.map((fieldConfig, index) => (
                <Field name={`${key}[${index}]`} key={index}>
                  {({ field, form }: any) => (
                    <TextField
                      {...field}
                      type="number"
                      label={fieldConfig.label}
                      placeholder={fieldConfig.placeholder || "Enter a value"}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      size="small"
                      value={field.value || ""}
                      onChange={(e) => {
                        const inputValue = e.target.value;

                        // Handle positive, negative, decimal values or 0
                        const value = 
                          inputValue === "" ? null : // Empty input should clear the value
                          !isNaN(Number(inputValue)) ? Number(inputValue) : null; // Only accept valid numbers

                        const currentValues = form.values[key] || [null, null];
                        const updatedValues = [...currentValues];
                        updatedValues[index] = value;

                        form.setFieldValue(key, updatedValues);
                      }}
                      sx={{
                        maxWidth: "100px",
                        "& input": {
                          textAlign: "center",
                        },
                        marginBottom: "20px",
                        marginRight: "20px",
                      }}
                      error={!!(touched[key] && errors[key])}
                      helperText={touched[key] && errors[key]}
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
        {Object.keys(filtersData).map((key) => {
          const filter = filtersData[key];
          return renderFilter(key, filter);
        })}

        {/* LeadBankFilter will be used here */}
        <LeadBankFilter values={values} setFieldValue={setFieldValue} />
      </Grid>
    </Box>
  );
};

export default DealSpecificTab;
