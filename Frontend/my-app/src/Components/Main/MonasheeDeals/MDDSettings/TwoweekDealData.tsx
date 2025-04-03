import {
  Box,
  Card,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Button,
  Grid,
  Typography,
  Checkbox,
  ListItemText,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import WeeklyDealTable from "./WeeklyDealTable";

const TwoWeekDealData: React.FC = () => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDealTypes, setSelectedDealTypes] = useState<string[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]); // Changed to an array for multi-select
  const [regions, setRegions] = useState<string[]>([]);
  const [dealTypes, setDealTypes] = useState<string[]>([]);

  const weeks = [ 2, 3, 4, 5, 6, 7, 8,9,10,11,12,13];

  // Store applied filters separately
  const [appliedRegions, setAppliedRegions] = useState<string[]>([]);
  const [appliedDealTypes, setAppliedDealTypes] = useState<string[]>([]);
  const [appliedWeeks, setAppliedWeeks] = useState<number[]>([]); // Changed to handle multiple weeks

  // Fetch data on mount and when the "Apply" button is clicked
  useEffect(() => {
    fetchData();
  }, [appliedRegions, appliedDealTypes, appliedWeeks]); // Fetch only when "Apply" is clicked

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
        week: appliedWeeks.length > 0 ? appliedWeeks : undefined,
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
          Object.keys(result[Object.keys(result)[0]]).filter(
            (type) => type !== "TOTAL"
          )
        );
        setRegions(
          Object.keys(result).filter((region) => region !== "SUMMARY")
        );
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
    setAppliedWeeks(selectedWeeks);
  };

  const handleReset = () => {
    setSelectedRegions([]);
    setSelectedDealTypes([]);
    setSelectedWeeks([]);
    setAppliedRegions([]);
    setAppliedDealTypes([]);
    setAppliedWeeks([]);
  };

  // Function to format multi-select display
  const formatMultiSelect = (selected: string[] | number[]) => {
    if (selected.length === 0) return "None";
    if (selected.length === 1) return selected[0].toString();
    return `${selected[0]}, +${selected.length - 1}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 0 }}>
      <Card sx={{ boxShadow: 3, p: 3, mb: 2 }}>
        <Card sx={{ p: 1, mb: 2 }}>
          <Typography variant="h5" color="#002060" align="center" gutterBottom>
           2025 Weekly Deal Filters
          </Typography>
          <Box
            display="flex"
            gap={2}
            flexWrap="wrap"
            justifyContent="center"
            alignItems="center"
          >
            <Grid
              container
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              {/* Deal Type Filter */}
              <Grid item>
                <FormControl
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{ m: 1, width: 200 }}
                >
                  <InputLabel>Deal Type</InputLabel>
                  <Select
                    multiple
                    value={selectedDealTypes}
                    onChange={(e) =>
                      setSelectedDealTypes(e.target.value as string[])
                    }
                    input={
                      <OutlinedInput label="Deal Type" sx={{ height: 40 }} />
                    }
                    renderValue={(selected) => formatMultiSelect(selected)}
                  >
                    {/* Static options */}
                    <MenuItem key="IPO" value="IPO">
                      <Checkbox checked={selectedDealTypes.includes("IPO")} />
                      <ListItemText primary="IPO" />
                    </MenuItem>
                    <MenuItem key="FO" value="FO">
                      <Checkbox checked={selectedDealTypes.includes("FO")} />
                      <ListItemText primary="FO" />
                    </MenuItem>

                    {/* Dynamic options from API */}
                  </Select>
                </FormControl>
              </Grid>

              {/* Region Filter */}
              <Grid item>
                <FormControl
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{ m: 1, width: 200 }}
                >
                  <InputLabel>Region</InputLabel>
                  <Select
                    multiple
                    value={selectedRegions}
                    onChange={(e) =>
                      setSelectedRegions(e.target.value as string[])
                    }
                    input={<OutlinedInput label="Region" sx={{ height: 40 }} />}
                    renderValue={(selected) => formatMultiSelect(selected)}
                  >
                    {/* Static options */}
                    <MenuItem key="APAC" value="APAC">
                      <Checkbox checked={selectedRegions.includes("APAC")} />
                      <ListItemText primary="APAC" />
                    </MenuItem>
                    <MenuItem key="EMEA" value="EMEA">
                      <Checkbox checked={selectedRegions.includes("EMEA")} />
                      <ListItemText primary="EMEA" />
                    </MenuItem>
                    <MenuItem key="US" value="US">
                      <Checkbox checked={selectedRegions.includes("US")} />
                      <ListItemText primary="US" />
                    </MenuItem>

                    {/* Dynamic options from API use when your using dymanic filters  */}
                    {/* {regions.map((region) => (
    <MenuItem key={region} value={region}>
      <Checkbox checked={selectedRegions.includes(region)} />
      <ListItemText primary={region} />
    </MenuItem>
  ))} */}
                  </Select>
                </FormControl>
              </Grid>

              {/* Week Filter */}
              <Grid item>
                <FormControl
                  fullWidth
                  variant="outlined"
                  size="small"
                  sx={{ m: 1, width: 200 }}
                >
                  <InputLabel>Week</InputLabel>
                  <Select
                    multiple
                    value={selectedWeeks}
                    onChange={(e) =>
                      setSelectedWeeks(e.target.value as number[])
                    }
                    input={<OutlinedInput label="Week" sx={{ height: 40 }} />}
                    renderValue={(selected) => formatMultiSelect(selected)}
                  >
                    {weeks.map((week) => (
                      <MenuItem key={week} value={week}  sx={{ height: 35 }}>
                        <Checkbox checked={selectedWeeks.includes(week)} />
                        <ListItemText primary={`Week ${week}`} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Apply Button */}
              <Grid item>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#002060", color: "white" }}
                  onClick={handleApply}
                >
                  Apply
                </Button>
              </Grid>

              {/* Reset Button */}
              <Grid item>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Data Display */}
        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <WeeklyDealTable
            data={data}
            selectedRegions={appliedRegions}
            selectedDealTypes={appliedDealTypes}
          />
        )}
      </Card>
    </Container>
  );
};

export default TwoWeekDealData;
