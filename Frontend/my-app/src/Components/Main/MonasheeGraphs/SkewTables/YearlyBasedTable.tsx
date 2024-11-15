import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
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
} from '@mui/material';
import axios from 'axios';

// Define the expected structure of the API response
interface SkewTableOptions {
  'start year': number[];
  'end year': number[];
  dealType: string[];
  region: string[];
  sector: string[];
}

interface YearlyBasedTableProps {
  onSubmit: (data: any) => void; // Callback function passed from parent to handle the response
}

const YearlyBasedTable: React.FC<YearlyBasedTableProps> = ({ onSubmit }) => {
  // State for form values
  const [startYear, setStartYear] = useState<number>(2001);
  const [endYear, setEndYear] = useState<number | string>(2002);
  const [dealType, setDealType] = useState<string>('All');
  const [region, setRegion] = useState<string>('All');
  const [sector, setSector] = useState<string[]>(); // Initially undefined, but will hold all sectors

  // State for the filter options
  const [startYearOptions, setStartYearOptions] = useState<number[]>([]); 
  const [endYearOptions, setEndYearOptions] = useState<number[]>([]); 
  const [dealTypeOptions, setDealTypeOptions] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]); 
  const [sectorOptions, setSectorOptions] = useState<string[]>([]); 

  // Fetch the filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await axios.get('http://192.168.1.59:9000/api/skew_table_filters/');
        const data = response.data as SkewTableOptions;
        console.log("Response Data ",data)

        setStartYearOptions(data['start year']);
        setEndYearOptions(data['end year']);
        setDealTypeOptions(data['dealType']);
        setRegionOptions(data['region']);
        setSectorOptions(data['sector']);
        setSector(data['sector']); // Set the sector state with all sectors by default
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Filter end year options based on selected start year
  useEffect(() => {
    if (startYear) {
      setEndYearOptions(endYearOptions.filter((year) => year >= startYear));
    } else {
      setEndYearOptions(endYearOptions);
    }
  }, [startYear, endYearOptions]);

  // Handle form value changes
  const handleStartYearChange = (event: SelectChangeEvent<number | string>) => {
    const newStartYear = Number(event.target.value);
    setStartYear(newStartYear);
    setEndYear(''); // Reset end year when start year is changed
  };

  const handleEndYearChange = (event: SelectChangeEvent<number | string>) => {
    const newEndYear = Number(event.target.value);
    setEndYear(newEndYear);
  };

  const handleDealTypeChange = (event: SelectChangeEvent<string>) => {
    setDealType(event.target.value);
  };

  const handleRegionChange = (event: SelectChangeEvent<string>) => {
    setRegion(event.target.value);
  };



  // Submit the form and call onSubmit with the response data
  const handleSubmit = async () => {
    const requestData = {
      filters: {
        year_range: [startYear, endYear],
        deal_type: dealType === 'All' ? dealTypeOptions : [dealType],
        region: region === 'All' ? regionOptions : [region],
        sector: sector, // Passing all sectors by default
      },
    };

    try {
      const response = await axios.post(
        'http://192.168.1.59:9000/api/skewtable/calculations/',
        requestData
      );
      console.log('Response Data:', response.data);
      onSubmit(response.data); // Pass response data to parent component
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box p={3} sx={{ backgroundColor: '#f0f4ff', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#3b3f57', fontWeight: 'bold' }}>
            Sector  Based  Filtered Data 
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
                    {regionOptions.map((region) => (
                      <MenuItem key={region} value={region}>
                        {region}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Expected Returns Selector */}
              
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

export default YearlyBasedTable;
