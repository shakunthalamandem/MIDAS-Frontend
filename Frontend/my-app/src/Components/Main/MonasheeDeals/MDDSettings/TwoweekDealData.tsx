import { Box, Card, Container, FormControlLabel, Checkbox, Typography, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Button, Grid, ListItemText } from "@mui/material";
import React, { useEffect, useState, ChangeEvent } from "react";

const TwoWeekDealData: React.FC = () => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDealTypes, setSelectedDealTypes] = useState<string[]>([]);
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);
  const [personName, setPersonName] = useState<string[]>([]); // State for Tags

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const response = await fetch(`${apiUrl}/api/weekly_dealstat/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            broad_region: selectedRegions,
            deal_type: selectedDealTypes,
            week: selectedWeeks,
            tags: personName, // Include the selected tags in the request
          }),
        });

        const result = await response.json();

        if (response.ok) {
          setData(result.data);
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedRegions, selectedDealTypes, selectedWeeks, personName]); // Re-fetch when tags change

  const handleCheckboxChange = (setState: React.Dispatch<React.SetStateAction<any>>, value: any) => (event: ChangeEvent<HTMLInputElement>) => {
    setState((prevState: any) =>
      event.target.checked ? [...prevState, value] : prevState.filter((item: any) => item !== value)
    );
  };

  const handleWeekChange = (event: any) => {
    setSelectedWeeks(event.target.value);
  };
  const handleDealTypeChange = (event: any) => {
    setSelectedDealTypes(event.target.value);
  };
  const handleRegionChange = (event: any) => {
    setSelectedRegions(event.target.value);
  };
  const handleTagChange = (event: any) => {
    setPersonName(event.target.value); // Handle Tag change
  };

  const handleReset = () => {
    setSelectedRegions([]);
    setSelectedDealTypes([]);
    setSelectedWeeks([]);
    setPersonName([]); // Reset Tags as well
  };

  const regions = ["US", "EMEA", "APAC"];
  const dealTypes = ["IPO", "FO"];
  const weeks = [1, 2, 3, 4, 5, 6, 7,8];
  const tags = ["Tag1", "Tag2", "Tag3", "Tag4"]; // Define your tags here

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Weekly Deal Filters
        </Typography>
<Box display="flex" gap={2} flexWrap="wrap" justifyContent="center" alignItems="center">
          <Box>
            <FormControl sx={{ m: 1, width: 200 }}>
              <InputLabel>Deal Type</InputLabel>
              <Select
                multiple
                value={selectedDealTypes}
                onChange={handleDealTypeChange}
                input={<OutlinedInput label="Deal Type" />}
                renderValue={(selected) => selected.join(", ")}
              >
                {dealTypes.map((week) => (
                  <MenuItem key={week} value={week}>
                    {week}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FormControl sx={{ m: 1, width: 200 }}>
              <InputLabel>Region</InputLabel>
              <Select
                multiple
                value={selectedRegions}
                onChange={handleRegionChange}
                input={<OutlinedInput label="Region" />}
                renderValue={(selected) => selected.join(", ")}
              >
                {regions.map((week) => (
                  <MenuItem key={week} value={week}>
                    {week}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FormControl sx={{ m: 1, width: 200 }}>
              <InputLabel>Weeks</InputLabel>
              <Select
                multiple
                value={selectedWeeks}
                onChange={handleWeekChange}
                input={<OutlinedInput label="Weeks" />}
                renderValue={(selected) => selected.join(", ")}
              >
                {weeks.map((week) => (
                  <MenuItem key={week} value={week}>
                    {week}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
        </Box>
        <Grid container spacing={2} mt={2} justifyContent="center" alignItems="center">

          {/* <Grid item>
            <Button variant="contained" sx={{ bgcolor: "#002060" }}>
              Apply
            </Button>
          </Grid> */}
          <Grid item>
            <Button variant="outlined" color="secondary" onClick={handleReset}>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Card>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Region</th>
            <th className="border p-2">Deal Type</th>
            <th className="border p-2">Week</th>
            <th className="border p-2">Count</th>
            <th className="border p-2">Volume</th>
            <th className="border p-2">Allocation Capital</th>
            <th className="border p-2">Allocation Deal %</th>
            <th className="border p-2">Model Actual Return</th>
            <th className="border p-2">Model Actual Total</th>
            <th className="border p-2">GAP</th>
          </tr>
        </thead>
        <tbody>
          {selectedWeeks.flatMap((week) =>
            selectedRegions.flatMap((region) =>
              selectedDealTypes.flatMap((dealType) => {
                const weekData = data[week]?.[region]?.[dealType];
                return weekData ? (
                  <tr key={`${region}-${dealType}-${week}`}>
                    <td className="border p-2">{region}</td>
                    <td className="border p-2">{dealType}</td>
                    <td className="border p-2">Week {week}</td>
                    <td className="border p-2">{weekData.count}</td>
                    <td className="border p-2">{weekData.volume.toFixed(2)}</td>
                    <td className="border p-2">{weekData.allocation_capital.toFixed(2)}</td>
                    <td className="border p-2">{weekData.allocation_deal_size_percentage.toFixed(2)}%</td>
                    <td className="border p-2">{weekData.model_actual_return.toFixed(2)}</td>
                    <td className="border p-2">{weekData.model_actual_total.toFixed(2)}</td>
                    <td className="border p-2">{weekData.GAP.toFixed(2)}</td>
                  </tr>
                ) : null;
              })
            )
          )}
        </tbody>
      </table>
    </Container>
  );
};

export default TwoWeekDealData;
