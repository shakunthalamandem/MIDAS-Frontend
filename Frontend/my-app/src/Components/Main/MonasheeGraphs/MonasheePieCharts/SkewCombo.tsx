import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  Grid,
  Container,
  Card,
  CardContent,
} from '@mui/material';
import axios from 'axios';

// Define the expected structure of the API response
interface SkewTableOptions {
  'start year': number[];
  'end year': number[];
  dealType: string[];
  region: string[];
  sector: string[];
  expectedReturns: string[];
}

const SkewCombo: React.FC = () => {
  // Default values
  const [startYear, setStartYear] = useState<number>(2001); // Default to 2001
  const [endYear, setEndYear] = useState<number | string>(2002); // Default to 2002
  const [dealType, setDealType] = useState<string>('All'); // Default to "All"
  const [region, setRegion] = useState<string>('All'); // Default to "All"
  const [sector, setSector] = useState<string>('All'); // Default to "All"
  const [expectedReturn, setExpectedReturn] = useState<string>('Absolute'); // Default to Absolute

  const [startYearOptions, setStartYearOptions] = useState<number[]>([]);
  const [endYearOptions, setEndYearOptions] = useState<number[]>([]);
  const [dealTypeOptions, setDealTypeOptions] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);
  const [expectedReturnsOptions, setExpectedReturnsOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await axios.get('http://192.168.1.59:9000/api/skew_table_filters/');
        const data = response.data as SkewTableOptions;

        setStartYearOptions(data['start year']);
        setEndYearOptions(data['end year']);
        setDealTypeOptions(data['dealType']);
        setRegionOptions(data['region']);
        setSectorOptions(data['sector']);
        setExpectedReturnsOptions(data['expectedReturns']);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Filter end year options based on selected start year
  useEffect(() => {
    if (startYear) {
      // Filter end years to only show years greater than or equal to the selected start year
      setEndYearOptions(endYearOptions.filter((year) => year >= startYear));
    } else {
      // If no start year is selected, show all end year options
      setEndYearOptions(endYearOptions);
    }
  }, [startYear, endYearOptions]);

  const handleStartYearChange = (event: SelectChangeEvent<number | string>) => {
    // Ensure startYear is treated as a number
    const newStartYear = Number(event.target.value);
    setStartYear(newStartYear);
    setEndYear(''); // Reset end year when start year is changed
  };

  const handleEndYearChange = (event: SelectChangeEvent<number | string>) => {
    // Ensure endYear is treated as a number
    const newEndYear = Number(event.target.value);
    setEndYear(newEndYear);
  };

  const handleDealTypeChange = (event: SelectChangeEvent<string>) => {
    setDealType(event.target.value);
  };

  const handleRegionChange = (event: SelectChangeEvent<string>) => {
    setRegion(event.target.value);
  };

  const handleSectorChange = (event: SelectChangeEvent<string>) => {
    setSector(event.target.value);
  };

  const handleExpectedReturnChange = (event: SelectChangeEvent<string>) => {
    setExpectedReturn(event.target.value);
  };

  const handleSubmit = async () => {
    // Construct the filters object
    const requestData = {
      filters: {
        year_range: [startYear, endYear], // Combine start and end year
        deal_type: dealType === 'All' ? dealTypeOptions : [dealType], // If 'All' selected, send all deal types
        region: region === 'All' ? regionOptions : [region], // If 'All' selected, send all regions
        sector: sector === 'All' ? sectorOptions : [sector], // If 'All' selected, send all sectors
        expected_returns: expectedReturn === 'All' ? expectedReturnsOptions : [expectedReturn], // If 'All' selected, send all expected returns
      },
    };
  
    try {
      const response = await axios.post(
        'http://192.168.1.59:9000/api/skewtable/calculations/',
        requestData
      );
      console.log('Response Data:', response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  // Function to filter options based on the "All" selection
  // const getFilteredOptions = (selectedValue: string, options: string[]) => {
  //   if (selectedValue === 'All') {
  //     return options;
  //   }
  //   return options.filter(option => option === selectedValue);
  // };

  return (
    <Container maxWidth="lg" sx={{ padding: 0 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box p={3} sx={{ backgroundColor: '#f0f4ff', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#3b3f57', fontWeight: 'bold' }}>
              Filter Data
            </Typography>
            <Grid container spacing={2}>
              {/* Start Year Selector */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Start Year</InputLabel>
                  <Select
                    value={startYear}
                    onChange={handleStartYearChange}
                    sx={{ backgroundColor: '#e0f7fa', color: '#006064' }}
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
                    sx={{ backgroundColor: '#e8eaf6', color: '#1a237e' }}
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
                    value={dealType}
                    onChange={handleDealTypeChange}
                    sx={{ backgroundColor: '#f3e5f5', color: '#6a1b9a' }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {dealTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
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
                    value={region}
                    onChange={handleRegionChange}
                    sx={{ backgroundColor: '#ffe0b2', color: '#e65100' }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    { regionOptions.map((region) => (
                      <MenuItem key={region} value={region}>
                        {region}
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
                    value={sector}
                    onChange={handleSectorChange}
                    sx={{ backgroundColor: '#d1c4e9', color: '#311b92' }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {sectorOptions.map((sec) => (
                      <MenuItem key={sec} value={sec}>
                        {sec}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Expected Returns Selector */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Expected Returns</InputLabel>
                  <Select
                    value={expectedReturn}
                    onChange={handleExpectedReturnChange}
                    sx={{ backgroundColor: '#fce4ec', color: '#880e4f' }}
                  >
                    <MenuItem value="Absolute">Absolute</MenuItem>
                    { expectedReturnsOptions.map((ret) => (
                      <MenuItem key={ret} value={ret}>
                        {ret}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              sx={{
                mt: 3,
                backgroundColor: '#6a1b9a',
                color: '#fff',
                '&:hover': { backgroundColor: '#4a148c' },
              }}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SkewCombo;
