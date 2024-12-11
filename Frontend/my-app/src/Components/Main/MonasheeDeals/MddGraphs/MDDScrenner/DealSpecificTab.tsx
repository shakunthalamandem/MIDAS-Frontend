import React, { useEffect, useState } from "react";
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
import { Field, useFormikContext } from "formik";
import axios from "axios";

// Define the expected structure of the API response
interface LeadBankData {
  lead_bank?: {
    options: string[];
  };
}

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
  const { values, setFieldValue, errors, touched } = useFormikContext<any>();
  const [leadBankOptions, setLeadBankOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch lead_bank options from API
    const fetchLeadBankOptions = async () => {
      setLoading(true); // Set loading to true before the API request
      try {
        const response = await axios.get<LeadBankData>("http://192.168.1.59:9000/api/mdd_screener_filters/");
        console.log(response.data); // Log to check the response structure

        const leadBankData = response.data?.lead_bank;

        if (leadBankData?.options) {
          setLeadBankOptions(leadBankData.options);
        } else {
          console.warn("Lead Bank options not found in the API response.");
        }
      } catch (error) {
        console.error("Error fetching lead_bank options:", error);
      } finally {
        setLoading(false); // Set loading to false after the API request
      }
    };

    fetchLeadBankOptions();
  }, []);

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
      setFieldValue(`${key}[${index}]`, value);
    } else {
      // Optionally, handle invalid input case, e.g., set a custom error message.
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
                    <Autocomplete
                      multiple
                      options={filter.options || []}
                      getOptionLabel={(option) => option.toString()}
                      disableCloseOnSelect
                      value={field.value || []}
                      onChange={(_, value) => form.setFieldValue(key, value)}
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
                <Field name={`${key}[${index}]`} key={index}>
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
                      onChange={(e) => handleInputChange(key, e.target.value, index)}
                      sx={{
                        maxWidth: "100px",
                        "& input": {
                          textAlign: "center",
                        },
                        marginBottom: "20px",
                        marginRight: "20px",
                      }}
                      inputProps={{
                        min: -100,
                        max: 100,
                        step: 1,
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
        {/* Render existing filters */}
        {Object.keys(filtersData).map((key) => {
          const filter = filtersData[key];
          return renderFilter(key, filter);
        })}

        {/* Render Lead Bank Dropdown */}
        {loading ? (
          <Grid item xs={12}>
            <Typography>Loading Lead Bank options...</Typography>
          </Grid>
        ) : (
          leadBankOptions.length > 0 && (
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Lead Bank
                </Typography>
                <FormControl fullWidth margin="normal">
                  <Autocomplete
                    multiple
                    options={leadBankOptions}
                    getOptionLabel={(option) => option.toString()}
                    disableCloseOnSelect
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        fullWidth
                      />
                    )}
                    renderOption={(props, option, { selected }) => (
                      <ListItem {...props} sx={{ padding: "4px" }}>
                        <Checkbox checked={selected} sx={{ padding: "4px" }} />
                        <ListItemText primary={option} />
                      </ListItem>
                    )}
                  />
                </FormControl>
              </Box>
            </Grid>
          )
        )}
      </Grid>
    </Box>
  );
};

export default DealSpecificTab;
