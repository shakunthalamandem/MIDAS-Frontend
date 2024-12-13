import React, { useEffect, useState } from "react";
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
import axios from "axios";

// Define the types for DealSpecific filtersData
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
        const response = await axios.get<{ lead_bank?: { options: string[] } }>(
          "http://192.168.1.59:9000/api/mdd_screener_filters/"
        );
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
                          <Checkbox checked={field.value?.includes(option) || false} />
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
                      onChange={(e) => form.setFieldValue(`${key}[${index}]`, e.target.value)}
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
  <Select
    multiple
    value={values["lead_bank"] || []}
    onChange={(e) => setFieldValue("lead_bank", e.target.value)}
    sx={{
      "& .MuiSelect-select": {
        padding: "8px", // Adjust padding for smaller height
        fontSize: "0.75rem", // Reduce font size for selected values
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
    MenuProps={{
      PaperProps: {
        style: {
          maxHeight: 300, // Set max height of dropdown
          width: 250, // Set a smaller dropdown width
        },
      },
    }}
  >
    {leadBankOptions.map((option, index) => (
      <MenuItem
        key={index}
        value={option}
        sx={{
          fontSize: "0.75rem", // Decrease font size of dropdown items
        }}
      >
        <Checkbox
          checked={values["lead_bank"]?.includes(option) || false}
          sx={{
            "& .MuiSvgIcon-root": {
              fontSize: "1.25rem", // Slightly increase checkbox icon size
            },
          }}
        />
        <ListItemText
          primary={option}
          sx={{
            "& .MuiTypography-root": {
              fontSize: "0.8rem", // Set typography font size explicitly
            },
          }}
        />
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

export default DealSpecificTab;
