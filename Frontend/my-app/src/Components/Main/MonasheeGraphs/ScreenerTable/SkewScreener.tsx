import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Grid,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Checkbox,
  ListItemText,
} from "@mui/material";
import axios from "axios";
import YearlyTableData from "../SkewTables/YearlyTableData";

interface SkewTableOptions {
  "start year": number[];
  "end year": number[];
  dealType: string[];
  region: string[];
  sector: string[];
}

const SkewScreener: React.FC = () => {
  const [startYear, setStartYear] = useState<number>(2001);
  const [endYear, setEndYear] = useState<number>(2002);
  const [dealType, setDealType] = useState<string[]>(["All"]);
  const [region, setRegion] = useState<string[]>(["All"]);
  const [sector, setSector] = useState<string[]>(["All"]);
  const [t1Return, setT1Return] = useState<string[]>(["All"]);
  const [tmReturn, setTmReturn] = useState<string[]>(["All"]);

  const [startYearOptions, setStartYearOptions] = useState<number[]>([]);
  const [endYearOptions, setEndYearOptions] = useState<number[]>([]);
  const [dealTypeOptions, setDealTypeOptions] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);

  const [sectorwiseData, setSectorwiseData] = useState<any>(null);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await axios.get(
          "http://192.168.1.59:9000/api/skew_table_filters/"
        );
        const data = response.data as SkewTableOptions;

        setStartYearOptions(data["start year"]);
        setEndYearOptions(data["end year"]);
        setDealTypeOptions(data["dealType"]);
        setRegionOptions(data["region"]);
        setSectorOptions(data["sector"]);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const requestData = {
        filters: {
          year_range: [startYear, endYear],
          deal_type: dealType.includes("All") ? dealTypeOptions : dealType,
          region: region.includes("All") ? regionOptions : region,
          sector: sector.includes("All") ? sectorOptions : sector,
          t1return:
            t1Return.includes("All")
              ? ["<3%", "(0-(-3))", "0-3", ">3%"]
              : t1Return,
          tmreturn:
            tmReturn.includes("All")
              ? ["<3%", "(0-(-3))", "0-3", ">3%"]
              : tmReturn,
        },
      };

      // Log the filter data
      console.log("Filter Data:", requestData.filters);

      try {
        const response = await axios.post(
          "http://192.168.1.59:9000/api/skewtable/calculations/",
          requestData
        );
        setSectorwiseData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (dealType && region && endYear && startYear && sector) {
      fetchData();
    }
  }, [
    startYear,
    endYear,
    dealType,
    region,
    sector,
    t1Return,
    tmReturn,
    dealTypeOptions,
    regionOptions,
    sectorOptions,
  ]);

  const handleStartYearChange = (event: SelectChangeEvent<number | string>) => {
    setStartYear(Number(event.target.value));
  };

  const handleEndYearChange = (event: SelectChangeEvent<number | string>) => {
    setEndYear(Number(event.target.value));
  };

  const handleMultiSelectChange = (
    setter: React.Dispatch<React.SetStateAction<any[]>>,
    options: string[],
    event: SelectChangeEvent<string[]>
  ) => {
    let selectedValues = event.target.value;
    
    // Ensure selectedValues is always an array
    if (typeof selectedValues === 'string') {
      selectedValues = [selectedValues]; // Convert string to array if necessary
    }
  
    // If "All" is selected, set to all options
    if (selectedValues.includes("All")) {
      setter(options);  // Set all available options when "All" is selected
    } else {
      setter(selectedValues);  // Set selected values as usual
    }
  };
  
  const handleSubmit = () => {
    const fetchData = async () => {
      const requestData = {
        filters: {
          year_range: [startYear, endYear],
          deal_type: dealType.includes("All") ? dealTypeOptions : dealType,
          region: region.includes("All") ? regionOptions : region,
          sector: sector.includes("All") ? sectorOptions : sector,
          t1return:
            t1Return.includes("All")
              ? ["<3%", "(0-(-3))", "0-3", ">3%"]
              : t1Return,
          tmreturn:
            tmReturn.includes("All")
              ? ["<3%", "(0-(-3))", "0-3", ">3%"]
              : tmReturn,
        },
      };

      // Log the filter data before submitting
      console.log("Submitting Filter Data:", requestData.filters);

      try {
        const response = await axios.post(
          "http://192.168.1.59:9000/api/skewtable/calculations/",
          requestData
        );
        setSectorwiseData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  };

  const handleReset = () => {
    // Reset all filter values to default
    setStartYear(2001);
    setEndYear(2002);
    setDealType(["All"]);
    setRegion(["All"]);
    setSector(["All"]);
    setT1Return(["All"]);
    setTmReturn(["All"]);
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box p={3} sx={{ backgroundColor: "#f0f4ff", borderRadius: 2 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: "#3b3f57", fontWeight: "bold" }}
            >
              MIDAS Screener 
            </Typography>
            <Grid container spacing={2}>
              {/* Start Year Selector */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Start Year</InputLabel>
                  <Select
                    value={startYear}
                    onChange={handleStartYearChange}
                    sx={{ backgroundColor: "#e0f7fa", color: "#006064" }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200, // Adjust the height as needed
                          overflow: 'auto',
                        },
                      },
                    }}
                  >
                    {startYearOptions.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* End Year Selector */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>End Year</InputLabel>
                  <Select
                    value={endYear}
                    onChange={handleEndYearChange}
                    sx={{ backgroundColor: "#e8eaf6", color: "#1a237e" }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200, // Adjust the height as needed
                          overflow: 'auto',
                        },
                      },
                    }}
                  >
                    {endYearOptions.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Deal Type Selector */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Deal Type</InputLabel>
                  <Select
                    multiple
                    value={dealType}
                    onChange={(e) => handleMultiSelectChange(setDealType, dealTypeOptions, e)}
                    renderValue={(selected) => selected.join(", ")}
                  >
                    <MenuItem value="All">
                      <Checkbox checked={dealType.includes("All")} />
                      <ListItemText primary="All" />
                    </MenuItem>
                    {dealTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        <Checkbox checked={dealType.includes(type)} />
                        <ListItemText primary={type} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Region Selector */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Region</InputLabel>
                  <Select
                    multiple
                    value={region}
                    onChange={(e) => handleMultiSelectChange(setRegion, regionOptions, e)}
                    renderValue={(selected) => selected.join(", ")}
                  >
                    <MenuItem value="All">
                      <Checkbox checked={region.includes("All")} />
                      <ListItemText primary="All" />
                    </MenuItem>
                    {regionOptions.map((region) => (
                      <MenuItem key={region} value={region}>
                        <Checkbox checked={region.includes(region)} />
                        <ListItemText primary={region} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Sector Selector */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Sector</InputLabel>
                  <Select
                    multiple
                    value={sector}
                    onChange={(e) => handleMultiSelectChange(setSector, sectorOptions, e)}
                    renderValue={(selected) => selected.join(", ")}
                  >
                    <MenuItem value="All">
                      <Checkbox checked={sector.includes("All")} />
                      <ListItemText primary="All" />
                    </MenuItem>
                    {sectorOptions.map((sector) => (
                      <MenuItem key={sector} value={sector}>
                        <Checkbox checked={sector.includes(sector)} />
                        <ListItemText primary={sector} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* T1 Return Selector */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>T1 Return</InputLabel>
                  <Select
                    multiple
                    value={t1Return}
                    onChange={(e) => handleMultiSelectChange(setT1Return, ["< -3%", "(0 to -3)%", "(0 to 6)%", "> 6%"], e)}
                    renderValue={(selected) => selected.join(", ")}
                  >
                    <MenuItem value="All">
                      <Checkbox checked={t1Return.includes("All")} />
                      <ListItemText primary="All" />
                    </MenuItem>
                    {["< -3%", "(0 to -3)%", "(0 to 6)%", "> 6%"].map((value) => (
                      <MenuItem key={value} value={value}>
                        <Checkbox checked={t1Return.includes(value)} />
                        <ListItemText primary={value} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* TM Return Selector */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>TM Return</InputLabel>
                  <Select
                    multiple
                    value={tmReturn}
                    onChange={(e) => handleMultiSelectChange(setTmReturn, ["< -3%", "(0 to -3)%", "(0 to 6)%", "> 6%"], e)}
                    renderValue={(selected) => selected.join(", ")}
                  >
                    <MenuItem value="All">
                      <Checkbox checked={tmReturn.includes("All")} />
                      <ListItemText primary="All" />
                    </MenuItem>
                    {["< -3%", "(0 to -3)%", "(0 to 6)%", "> 6%"].map((value) => (
                      <MenuItem key={value} value={value}>
                        <Checkbox checked={tmReturn.includes(value)} />
                        <ListItemText primary={value} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Buttons Section */}
              <Grid item xs={12} sm={6} md={3} sx={{ display: "flex", alignItems: "center" }}>
                <Box display="flex" gap={2}>
                  <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Submit
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={handleReset}>
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Pass the fetched data to YearlyTableData for rendering */}
      {sectorwiseData && <YearlyTableData data={sectorwiseData} />}
    </Container>
  );
};

export default SkewScreener;
