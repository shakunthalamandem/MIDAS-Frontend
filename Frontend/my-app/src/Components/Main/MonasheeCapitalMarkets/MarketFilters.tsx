import React, { useState } from "react";
import MarketCapitalFilters from "./MarketCapitalFilters";
import MarketCapitalMain from "./MarketCapitalMain";
import {
  Box,
  Card,
  Typography,
  FormControl,
  MenuItem,
  Select,
  Grid,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
  Button,
  Tooltip,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

interface FilterOption {
  label: string;
  options: (string | number)[];
  description: string;
}

const MarketFilters: React.FC = () => {
  const [filtersData, setFiltersData] = useState<Record<string, FilterOption>[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, string | number | (string | number)[]>>({});
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string | number | (string | number)[]>>({});

  const handleDataLoaded = (data: any) => {
    setFiltersData(data.market_capital);
  };

  const handleChange =
    (filterKey: string) =>
    (event: SelectChangeEvent<string | number | (string | number)[]>) => {
      const value = event.target.value;
      setSelectedValues((prev) => ({
        ...prev,
        [filterKey]: Array.isArray(value) ? value : [value],
      }));
    };

  const handleApply = () => {
    console.log("Applied Filters:", selectedValues);
    setAppliedFilters(selectedValues);
  };

  const handleReset = () => {
    setSelectedValues({});
    setAppliedFilters({});
  };

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: 300,
        width: 120,
      },
    },
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <Typography variant="h4" color="#002060" align="center" sx={{ fontWeight: "bold" }}>
        Market Filters
      </Typography>

      <MarketCapitalFilters onDataLoaded={handleDataLoaded} />

      {filtersData.length > 0 ? (
        <Card sx={{ padding: 3, maxWidth: "1200px", margin: "0 auto", borderRadius: 2, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", backgroundColor: "#ffffff" }}>
          <Grid container spacing={3} direction="row" justifyContent="space-between">
            {filtersData.map((filter, index) => {
              const [key, value] = Object.entries(filter)[0] as [string, FilterOption];
              const isMultiSelect = Array.isArray(value.options) && key !== "start_year" && key !== "end_year";

              return (
                <Grid item xs={2} key={index}>
                  <Typography sx={{ fontSize: "0.75rem", marginBottom: "4px", display: "flex", alignItems: "center" }}>
                    {value.label}
                    {value.description && (
                      <Tooltip title={value.description} arrow>
                        <InfoIcon sx={{ ml: 1, fontSize: "1rem", color: "#cfcfcf" }} />
                      </Tooltip>
                    )}
                  </Typography>

                  <FormControl fullWidth>
                    <Select
                      id={key}
                      multiple={isMultiSelect}
                      value={selectedValues[key] || (isMultiSelect ? [] : "")}
                      onChange={handleChange(key)}
                      MenuProps={MenuProps}
                      renderValue={(selected) => {
                        if (Array.isArray(selected)) {
                          return selected.length > 1 ? `${selected[0]} +${selected.length - 1}` : selected[0];
                        }
                        return selected as string | number;
                      }}
                      sx={{ fontSize: "12px", height: "40px" }}
                    >
                      {value.options.map((option, idx) => (
                        <MenuItem key={idx} value={option} sx={{ fontSize: "0.8rem", padding: "4px 8px" }}>
                          {isMultiSelect && (
                            <Checkbox
                              checked={(selectedValues[key] as (string | number)[] || []).includes(option)}
                              sx={{ padding: "0 8px" }}
                            />
                          )}
                          <ListItemText primary={option} sx={{ fontSize: "0.8rem" }} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              );
            })}
          </Grid>

          <Grid container justifyContent="center" spacing={2} sx={{ mt: 2 }}>
            <Grid item>
              <Button variant="contained" type="button" sx={{ bgcolor: "#002060" }} onClick={handleApply} disabled={!filtersData || !Object.keys(filtersData).length}>
                Apply
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="secondary" type="button" onClick={handleReset} disabled={!filtersData || !Object.keys(filtersData).length}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </Card>
      ) : (
        <Typography align="center">Loading filters...</Typography>
      )}

      {Object.keys(appliedFilters).length > 0 && <MarketCapitalMain selectedFilters={appliedFilters} />}
    </Box>
  );
};

export default MarketFilters;
