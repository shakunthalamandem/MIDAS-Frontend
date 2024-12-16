import React, { useEffect, useState } from "react";
import {
  TextField,
  FormControl,
  Select,
  MenuItem,
  Box,
  Grid,
  Tooltip,
  Typography,
  Checkbox,
  ListItemText,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { Field, useFormikContext } from "formik";
import axios from "axios";

// Define the types for Monashee filtersData
interface MonasheeSpecificFilterConfig {
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
  api?: string;
}

interface MonasheeSpecificTabProps {
  filtersData: {
    [key: string]: MonasheeSpecificFilterConfig;
  };
}

const MonasheeSpecificTab: React.FC<MonasheeSpecificTabProps> = ({
  filtersData,
}) => {
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();
  const [dealCaptainOptions, setDealCaptainOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch deal_captain options from API
    const fetchDealCaptainOptions = async () => {
      setLoading(true); // Set loading to true before the API request
      try {
        const response = await axios.get<{
          deal_captain?: { options: string[] };
        }>("http://192.168.1.59:9000/api/mdd_screener_filters/");
        console.log(response.data); // Log to check the response structure

        const dealCaptainData = response.data?.deal_captain;

        if (dealCaptainData?.options) {
          setDealCaptainOptions(dealCaptainData.options);
        } else {
          console.warn("Deal Captain options not found in the API response.");
        }
      } catch (error) {
        console.error("Error fetching deal_captain options:", error);
      } finally {
        setLoading(false); // Set loading to false after the API request
      }
    };

    fetchDealCaptainOptions();
  }, []);

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
                {filter.label}
                {filter.description && (
                  <Tooltip title={filter.description} arrow>
                    <InfoIcon
                      sx={{ ml: 1, fontSize: "1rem", color: "#cfcfcf" }}
                    />
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
                    <InfoIcon
                      sx={{ ml: 1, fontSize: "1rem", color: "#cfcfcf" }}
                    />
                  </Tooltip>
                )}
              </Typography>
              {filter.fields?.map((fieldConfig, index) => (
                <Field key={index} name={`${key}[${index}]`}>
                  {({ field, form }: any) => (
                    <TextField
                      {...field}
                      type="float"
                      label={fieldConfig.label}
                      placeholder={fieldConfig.placeholder || "Enter a value"} // Add placeholder here
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      size="small"
                      value={field.value || ""}
                      onChange={(e) =>
                        form.setFieldValue(`${key}[${index}]`, e.target.value)
                      }
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
        {/* Render existing filters */}
        {Object.keys(filtersData).map((key) => {
          const filter = filtersData[key];
          return renderFilter(key, filter);
        })}

        {/* Render Deal Captain Dropdown */}
        {loading ? (
          <Grid item xs={12}>
            <Typography>Loading Deal Captain options...</Typography>
          </Grid>
        ) : (
          dealCaptainOptions.length > 0 && (
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Deal Captain
                </Typography>
                <FormControl fullWidth margin="normal">
                  <Select
                    multiple
                    displayEmpty
                    value={values["deal_captain"] || []}
                    onChange={(e) =>
                      setFieldValue("deal_captain", e.target.value)
                    }
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
                      if (!selected.length) return "Select"; // Placeholder when no value is selected
                      const formattedTags = formatSelectedTags(
                        selected as (string | number)[]
                      );
                      return formattedTags.join(", ");
                    }}
                  >
                    {dealCaptainOptions.map((option, index) => (
                      <MenuItem key={index} value={option}>
                        <Checkbox
                          checked={
                            values["deal_captain"]?.includes(option) || false
                          }
                        />
                        <ListItemText primary={option} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          )
        )}
      </Grid>
    </Box>
  );
};

export default MonasheeSpecificTab;
