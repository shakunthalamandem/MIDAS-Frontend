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
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]); 
  const [regions, setRegions] = useState<string[]>([]);
  const [dealTypes, setDealTypes] = useState<string[]>([]);
  const [weeks, setWeeks] = useState<number[]>([]);

  const [appliedRegions, setAppliedRegions] = useState<string[]>([]);
  const [appliedDealTypes, setAppliedDealTypes] = useState<string[]>([]);
  const [appliedWeeks, setAppliedWeeks] = useState<number[]>([]); 

  useEffect(() => {
    fetchFilters();
    fetchData();
  }, [appliedRegions, appliedDealTypes, appliedWeeks]);

  const fetchFilters = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }

      const response = await fetch(`${apiUrl}/api/weekly_stat_filters/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const result = await response.json();

      if (response.ok) {
        setDealTypes(result.deal_type || []);
        setRegions(result.broad_region || []);
        setWeeks(result.week.map((w: string) => parseInt(w.replace("Week ", ""))));
      } else {
        throw new Error("Failed to fetch filters");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
    }
  };

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
console.log("data",appliedRegions)
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
            <Grid container spacing={2} justifyContent="center" alignItems="center">
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
                    {dealTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        <Checkbox checked={selectedDealTypes.includes(type)} />
                        <ListItemText primary={type} />
                      </MenuItem>
                    ))}
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
                    {regions.map((region) => (
                      <MenuItem key={region} value={region}>
                        <Checkbox checked={selectedRegions.includes(region)} />
                        <ListItemText primary={region} />
                      </MenuItem>
                    ))}
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
                      <MenuItem key={week} value={week}>
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
