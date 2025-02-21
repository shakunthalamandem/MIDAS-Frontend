import { Box, Card, Container, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Button, Grid, Typography, Checkbox, ListItemText } from "@mui/material";
import React, { useEffect, useState } from "react";
import WeeklyDealTable from "./WeeklyDealTable";

const TwoWeekDealData: React.FC = () => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDealTypes, setSelectedDealTypes] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number[]>([8]); // Default all weeks
  const [regions, setRegions] = useState<string[]>([]);
  const [dealTypes, setDealTypes] = useState<string[]>([]);
  
  const weeks = [1, 2, 3, 4, 5, 6, 7,8];

  // Store applied filters separately
  const [appliedRegions, setAppliedRegions] = useState<string[]>([]);
  const [appliedDealTypes, setAppliedDealTypes] = useState<string[]>([]);
  const [appliedWeek, setAppliedWeek] = useState<number[]>(weeks);

  // Fetch data on mount and when the "Apply" button is clicked
  useEffect(() => {
    fetchData();
  }, [appliedRegions, appliedDealTypes, appliedWeek]); // Fetch only when "Apply" is clicked

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }

      const body = {
        broad_region: appliedRegions.length > 0 ? appliedRegions : undefined,
        deal_type: appliedDealTypes.length > 0 ? appliedDealTypes : undefined,
        week: appliedWeek.length > 0 ? appliedWeek : undefined,
      };

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
        setRegions(Object.keys(result));

        setDealTypes(
          Object.keys(result[Object.keys(result)[0]]).filter((type) => type !== "TOTAL")
        );
        setRegions(Object.keys(result).filter((region) => region !== "SUMMARY"));
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    setAppliedRegions(selectedRegions);
    setAppliedDealTypes(selectedDealTypes);
    setAppliedWeek(selectedWeek);
  };

  const handleReset = () => {
    setSelectedRegions([]);
    setSelectedDealTypes([]);
    setSelectedWeek([]); 
    setAppliedRegions([]);
    setAppliedDealTypes([]);
    setAppliedWeek([]);
  };

  // Function to format multi-select display
  const formatMultiSelect = (selected: string[] | number[]) => {
    if (selected.length === 0) return "None";
    if (selected.length === 1) return selected[0].toString();
    return `${selected[0]}, +${selected.length - 1}`;
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
              renderValue={(selected) => formatMultiSelect(selected)}
            >
              {dealTypes.map((dealType) => (
                <MenuItem key={dealType} value={dealType}>
                  <Checkbox checked={selectedDealTypes.includes(dealType)} />
                  <ListItemText primary={dealType} />
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
              renderValue={(selected) => formatMultiSelect(selected)}
            >
              {regions.map((region) => (
                <MenuItem key={region} value={region}>
                  <Checkbox checked={selectedRegions.includes(region)} />
                  <ListItemText primary={region} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Week Filter */}
          <FormControl sx={{ m: 1, width: 200 }}>
  <InputLabel>Week</InputLabel>
  <Select
    value={selectedWeek[0]}  // Single value instead of array
    onChange={(e) => setSelectedWeek([e.target.value as number])}  // Update to set a single value
    input={<OutlinedInput label="Week" />}
  >
    {weeks.map((week) => (
      <MenuItem key={week} value={week}>
        <ListItemText primary={`Week ${week}`} />
      </MenuItem>
    ))}
  </Select>
</FormControl>


        </Box>

        {/* Apply and Reset Buttons */}
        <Grid container spacing={2} mt={2} justifyContent="center" alignItems="center">
          <Grid item>
            <Button variant="contained" sx={{ backgroundColor: "#002060", color: "white" }} onClick={handleApply}>
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

      {/* Data Display */}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <WeeklyDealTable data={data} selectedRegions={appliedRegions} selectedDealTypes={appliedDealTypes} />
      )}
    </Container>
  );
};

export default TwoWeekDealData;
