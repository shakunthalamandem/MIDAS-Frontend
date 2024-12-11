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

// Define types for filtersData
interface FilterConfig {
  options: (string | number)[];
  label: string;
  description?: string;
}

interface FiltersData {
  [key: string]: FilterConfig;
}

interface GeneralTabProps {
  filtersData: FiltersData;
}

const GeneralTab: React.FC<GeneralTabProps> = ({ filtersData }) => {
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: (string | number)[] }>({});

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
    return values.length === 1 ? [firstValue] : [firstValue, `+${values.length - 1}`];
  };

  return (
    <FormControl fullWidth margin="normal">
      <Grid container spacing={2} sx={{ backgroundColor: "#f7f8f8", maxHeight: "370px", overflowY: "auto", padding: 2 }}>
        {Object.keys(filtersData).map((key) => {
          const { options, label, description } = filtersData[key];

          return (
            <Grid item xs={12} sm={6} md={3} key={key}>
              <Box mb={2} width="100%">
                <Typography sx={{ fontSize: "0.75rem", marginBottom: "4px", display: "flex", alignItems: "center" }}>
                  {label}
                  {description && (
                    <Tooltip title={description} arrow>
                      <InfoIcon sx={{ ml: 1, fontSize: "1rem", color: "#cfcfcf" }} />
                    </Tooltip>
                  )}
                </Typography>
                <Autocomplete
                  multiple
                  options={options}
                  getOptionLabel={(option) => option.toString()}
                  disableCloseOnSelect
                  value={selectedValues[key] || []}
                  onChange={(_, value) => handleSelectionChange(key, value as (string | number)[])}
                  renderInput={(params) => <TextField {...params} variant="outlined" size="small" fullWidth />}
                  renderTags={(value) => {
                    const formattedTags = formatSelectedTags(value);
                    return formattedTags.map((tag, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          backgroundColor: "#e0e0e0",
                          borderRadius: "4px",
                          padding: "4px 8px",
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
                      <ListItemText primary={option.toString()} sx={{ fontSize: "0.875rem" }} />
                    </ListItem>
                  )}
                />
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </FormControl>
  );
};

export default GeneralTab;
