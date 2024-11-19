import React, { useEffect, useState } from "react";
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

interface FilterOption {
  options: (string | number)[]; // Options can be either string or number
  label: string;
  description: string;
}

interface Filter {
  [key: string]: FilterOption;
}

const Filters: React.FC = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: (string | number)[] }>({});

  useEffect(() => {
    // Fetch the filters.json file
    fetch("/Filters.json")
      .then((response) => response.json())
      .then((data) => setFilters(data.screener))
      .catch((error) => console.error("Error loading filters:", error));
  }, []);

  const handleSelectionChange = (key: string, value: (string | number)[]) => {
    setSelectedValues((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Selected Filters:", selectedValues);
  };

  const handleCancel = () => {
    setSelectedValues({});
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Screener Filters
            </Typography>
            <Grid container spacing={2} sx={{ backgroundColor: '#f7f8f8', maxHeight: '370px', overflowY: 'scroll' }}>
              {filters.map((filter, index) => {
                const key = Object.keys(filter)[0]; // Get the key (e.g., "year", "deal_type")
                const { options, label, description } = filter[key];

                return (
                  <Grid item xs={12} sm={6} md={3} key={key}> {/* Updated layout to 4x3 grid */}
                    <Box mb={2} width="100%">
                      <Typography style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                        <span>{label}:</span>
                        {description && (
                          <Tooltip title={description} arrow>
                            <InfoIcon sx={{ ml: 1, fontSize: '1rem', color: '#cfcfcf' }} />
                          </Tooltip>
                        )}
                      </Typography>
                      <Autocomplete
                        multiple
                        options={options}
                        getOptionLabel={(option) => option.toString()} // Ensure the option is treated as string
                        disableCloseOnSelect
                        value={selectedValues[key] || []}
                        onChange={(_, value) => handleSelectionChange(key, value as (string | number)[])}
                        renderInput={(params) => (
                          <TextField {...params} variant="outlined" size="small" fullWidth placeholder="Any" />
                        )}
                        renderOption={(props, option, { selected }) => (
                          <ListItem {...props} style={{ padding: '4px' }}>
                            <Checkbox
                              checked={selected}
                              sx={{ padding: '4px', '& .MuiSvgIcon-root': { fontSize: '1.25rem' } }}
                            />
                            <ListItemText primary={option.toString()} />
                          </ListItem>
                        )}
                        renderTags={(value: (string | number)[], getTagProps) => {
                          return value.map((tag, idx) => (
                            <div
                              key={idx}
                              style={{
                                backgroundColor: '#e0e0e0',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                margin: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              {tag.toString()} {/* Ensure tag is rendered as a string */}
                            </div>
                          ));
                        }}
                      />
                    </Box>
                  </Grid>
                );
              })}
            </Grid>

            {/* Center the buttons */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mr: 2 }}>
                Submit
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Filters;
