import { Box, Card, Container, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Button, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import WeeklyDealTable from "./WeeklyDealTable";

const TwoWeekDealData: React.FC = () => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDealTypes, setSelectedDealTypes] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string[]>([]);
  const [filtersApplied, setFiltersApplied] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }

      const body = filtersApplied
        ? {
            broad_region: selectedRegions.length > 0 ? selectedRegions : undefined,
            deal_type: selectedDealTypes.length > 0 ? selectedDealTypes : undefined,
            week: selectedWeek.length > 0 ? selectedWeek : undefined,
          }
        : {};

      const response = await fetch(`${apiUrl}/api/weekly_dealstat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!filtersApplied) {
      fetchData();
    }
  }, [filtersApplied]);

  const handleApply = () => {
    setFiltersApplied(true);
    fetchData();
  };

  const handleReset = () => {
    setSelectedRegions([]);
    setSelectedWeek([]);
    setSelectedDealTypes([]);
    setFiltersApplied(false);
    fetchData();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" color="#002060" align="center" gutterBottom>
          Weekly Deal Filters
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center" alignItems="center">
          {/* Deal Type Filter */}
          <FormControl sx={{ m: 1, width: 200 }}>
            <InputLabel>Deal Type</InputLabel>
            <Select
              multiple
              value={selectedDealTypes}
              onChange={(e) => setSelectedDealTypes(e.target.value as string[])}
              input={<OutlinedInput label="Deal Type" />}
              renderValue={(selected) => selected.join(", ")}
            >
              {["IPO", "FO", "TOTAL"].map((dealType) => (
                <MenuItem key={dealType} value={dealType}>
                  {dealType}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Region Filter */}
          <FormControl sx={{ m: 1, width: 200 }}>
            <InputLabel>Region</InputLabel>
            <Select
              multiple
              value={selectedRegions}
              onChange={(e) => setSelectedRegions(e.target.value as string[])}
              input={<OutlinedInput label="Region" />}
              renderValue={(selected) => selected.join(", ")}
            >
              {["US", "EMEA", "APAC"].map((region) => (
                <MenuItem key={region} value={region}>
                  {region}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Week Filter */}
          <FormControl sx={{ m: 1, width: 200 }}>
            <InputLabel>Week</InputLabel>
            <Select
              multiple
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value as string[])}
              input={<OutlinedInput label="Week" />}
              renderValue={(selected) => selected.join(", ")}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((week) => (
                <MenuItem key={week} value={week}>
                  {week}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Buttons */}
        <Grid container spacing={2} mt={2} justifyContent="center" alignItems="center">
          <Grid item>
            <Button variant="contained" color="primary" onClick={handleApply}>
              Apply
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" color="secondary" onClick={handleReset}>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Table Data */}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <WeeklyDealTable
          data={data}
          selectedRegions={selectedRegions}
          selectedDealTypes={selectedDealTypes}
        />
      )}
    </Container>
  );
};

export default TwoWeekDealData;
