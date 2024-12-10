import React, { useState, useEffect } from "react";
import { TextField, FormControl, Autocomplete, Box, Checkbox, Grid, ListItem, ListItemText, Tooltip, Typography } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

interface GeneralTabProps {
  filtersData: {
    [key: string]: {
      options: (string | number)[];
      label: string;
      description?: string;
    };
  }[];
}

const GeneralTab: React.FC<GeneralTabProps> = ({ filtersData }) => {
  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: (string | number)[];
  }>({});

  const [appliedFilters, setAppliedFilters] = useState<{
    [key: string]: (string | number)[];
  } | null>(null);

  useEffect(() => {
    if (filtersData.length > 0) {
      const initialSelectedValues: { [key: string]: (string | number)[] } = {};
      filtersData.forEach((filter) => {
        const key = Object.keys(filter)[0];
        initialSelectedValues[key] = [];
      });
      console.log("Initial Selected Values:", initialSelectedValues); // Debug here
      setSelectedValues(initialSelectedValues);
      setAppliedFilters(initialSelectedValues);
    }
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
    if (values.length === 1) return [firstValue];
    return [firstValue, `+${values.length - 1}`];
  };
  return (
    <FormControl fullWidth margin="normal">
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
          const key = Object.keys(filter)[0];
          const { options, label, description } = filter[key];

          return (
            <Grid item xs={12} sm={6} md={3} key={key}>
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
                  getOptionLabel={(option) => option.toString()}
                  disableCloseOnSelect
                  value={selectedValues[key] || []}
                  onChange={(_, value) => handleSelectionChange(key, value as (string | number)[])}
                  renderInput={(params) => (
                    <TextField {...params} variant="outlined" size="small" fullWidth placeholder="Any" />
                  )}
                  renderTags={(value) => {
                    const formattedTags = formatSelectedTags(value);
                    return formattedTags.map((tag, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: "#e0e0e0",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          margin: "2px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
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
                          fontSize: "0.875rem",
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
    </FormControl>
  );
};

export default GeneralTab;
