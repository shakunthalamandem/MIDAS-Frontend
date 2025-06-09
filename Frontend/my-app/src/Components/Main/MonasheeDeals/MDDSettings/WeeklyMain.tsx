import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
} from "@mui/material";
import WeeklyStatsChart from "./WeeklyStatsChart";
import GapDealDeatilsTable from "./GapDealDeatilsTable";
import TwoWeekDealData from "./TwoweekDealData";

interface FiltersResponse {
  deal_type: string[];
  broad_region: string[];
  week: string[];
  fo_type: string[];
}

interface AppliedFilters {
  deal_type: string[];
  broad_region: string[];
  week: number[]; // 🔄 Change from string[] to number[]
  fo_type: string[];
}

const WeeklyMain: React.FC = () => {
  const [dealTypes, setDealTypes] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [weeks, setWeeks] = useState<string[]>([]);
  const [foTypes, setFoTypes] = useState<string[]>([]);

  const [selectedDealTypes, setSelectedDealTypes] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
  const [selectedFoTypes, setSelectedFoTypes] = useState<string[]>([]);

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
    deal_type: [],
    broad_region: [],
    week: [],
    fo_type: [],
  });

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/weekly_stat_filters/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch filters: ${response.statusText}`);
        }

        const data: FiltersResponse = await response.json();
        setDealTypes(data.deal_type);
        setRegions(data.broad_region);
        setWeeks(data.week);
        setFoTypes(data.fo_type);
      } catch (error) {
        console.error("Error loading filters:", error);
      }
    };

    fetchFilters();
  }, [apiUrl, token, navigate]);

  const formatMultiSelect = (selected: readonly string[]) => selected.join(", ");

const handleApply = () => {
  const numericWeeks = selectedWeeks.map((w) =>
    typeof w === "string" ? parseInt(w.replace(/\D/g, ""), 10) : w
  );

  setAppliedFilters({
    deal_type: selectedDealTypes,
    broad_region: selectedRegions,
    week: numericWeeks,
    fo_type: selectedFoTypes,
  });
};


  const handleReset = () => {
    setSelectedDealTypes([]);
    setSelectedRegions([]);
    setSelectedWeeks([]);
    setSelectedFoTypes([]);
    setAppliedFilters({
      deal_type: [],
      broad_region: [],
      week: [],
      fo_type: [],
    });
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 0 }} id="details-section">
        <Card sx={{ boxShadow: 3, p: 3, mb: 2 }}>
          <Typography variant="h5" color="#002060" align="center" gutterBottom>
            2025 Weekly Deal Filters
          </Typography>

          <Grid container spacing={2} justifyContent="center" alignItems="center" flexWrap="wrap">
            {/* Deal Type */}
            <Grid item>
              <FormControl variant="outlined" size="small" sx={{ width: 160 }}>
                <InputLabel>Deal Type</InputLabel>
                <Select
                  multiple
                  value={selectedDealTypes}
                  onChange={(e) => setSelectedDealTypes(e.target.value as string[])}
                  input={<OutlinedInput label="Deal Type" sx={{ height: 40 }} />}
                  renderValue={formatMultiSelect}
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

            {/* Region */}
            <Grid item>
              <FormControl variant="outlined" size="small" sx={{ width: 160 }}>
                <InputLabel>Region</InputLabel>
                <Select
                  multiple
                  value={selectedRegions}
                  onChange={(e) => setSelectedRegions(e.target.value as string[])}
                  input={<OutlinedInput label="Region" sx={{ height: 40 }} />}
                  renderValue={formatMultiSelect}
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

            {/* Week */}
            <Grid item>
              <FormControl variant="outlined" size="small" sx={{ width: 160 }}>
                <InputLabel>Week</InputLabel>
                <Select
                  multiple
                  value={selectedWeeks}
                  onChange={(e) => setSelectedWeeks(e.target.value as string[])}
                  input={<OutlinedInput label="Week" sx={{ height: 40 }} />}
                  renderValue={formatMultiSelect}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
                >
                  {weeks.map((week) => (
                    <MenuItem key={week} value={week}>
                      <Checkbox checked={selectedWeeks.includes(week)} />
                      <ListItemText primary={week} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* FO Type */}
            <Grid item>
              <FormControl variant="outlined" size="small" sx={{ width: 160 }}>
                <InputLabel>FO Type</InputLabel>
                <Select
                  multiple
                  value={selectedFoTypes}
                  onChange={(e) => setSelectedFoTypes(e.target.value as string[])}
                  input={<OutlinedInput label="FO Type" sx={{ height: 40 }} />}
                  renderValue={formatMultiSelect}
                >
                  {foTypes.map((foType) => (
                    <MenuItem key={foType} value={foType}>
                      <Checkbox checked={selectedFoTypes.includes(foType)} />
                      <ListItemText primary={foType} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Apply / Reset Buttons */}
            <Grid item>
              <Box display="flex" gap={1}>
                <Button variant="contained" color="primary" size="small" onClick={handleApply}>
                  Apply
                </Button>
                <Button variant="outlined" color="secondary" size="small" onClick={handleReset}>
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Container>

      {/* Charts and Tables */}
      <WeeklyStatsChart filters={appliedFilters} />
      {/* <TwoWeekDealData filters={appliedFilters} />
      <GapDealDeatilsTable filters={appliedFilters} /> */}
    </>
  );
};

export default WeeklyMain;