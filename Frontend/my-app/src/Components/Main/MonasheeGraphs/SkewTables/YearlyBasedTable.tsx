import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import axios from 'axios';
import YearlyTableData from './YearlyTableData'; // Import YearlyTableData component

interface SkewTableOptions {
  'start year': number[];
  'end year': number[];
  dealType: string[];
  region: string[];
  sector: string[];
}

const YearlyBasedTable: React.FC = () => {
  const [startYear, setStartYear] = useState<number>(2001);
  const [endYear, setEndYear] = useState<number>(2002);
  const [dealType, setDealType] = useState<string>('All');
  const [region, setRegion] = useState<string>('All');
  const [sector, setSector] = useState<string[]>([]);

  const [startYearOptions, setStartYearOptions] = useState<number[]>([]);
  const [endYearOptions, setEndYearOptions] = useState<number[]>([]);
  const [dealTypeOptions, setDealTypeOptions] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);
  const [sectorwiseData, setSectorwiseData] = useState<any>(null);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;

        if (!apiUrl) {
          throw new Error('API URL is not defined in environment variables');
        }
        const response = await axios.get(`${apiUrl}/api/skew_table_filters/`);
        const data = response.data as SkewTableOptions;

        setStartYearOptions(data['start year']);
        setEndYearOptions(data['end year']);
        setDealTypeOptions(data['dealType']);
        setRegionOptions(data['region']);
        setSectorOptions(data['sector']);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const requestData = {
        filters: {
          year_range: [startYear, endYear],
          deal_type: dealType === 'All' ? dealTypeOptions : [dealType],
          region: region === 'All' ? regionOptions : [region],
          sector: sector.length > 0 ? sector : sectorOptions,
        },
      };

      try {
        const apiUrl = process.env.REACT_APP_API_URL;

        if (!apiUrl) {
          throw new Error('API URL is not defined in environment variables');
        }
        const response = await axios.post(
          `${apiUrl}/api/skewtable/calculations/`,
          requestData
        );
        setSectorwiseData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (dealType && region && endYear && startYear) {
      fetchData();
    }
  }, [startYear, endYear, dealType, region, sector, dealTypeOptions, regionOptions, sectorOptions]);

  const handleStartYearChange = (event: SelectChangeEvent<number | string>) => {
    const newStartYear = Number(event.target.value);
    setStartYear(newStartYear);
    
    // Set end year to the next year after the selected start year
    setEndYear(newStartYear + 1);
  };

  const handleEndYearChange = (event: SelectChangeEvent<number | string>) => {
    setEndYear(Number(event.target.value));
  };

  const handleDealTypeChange = (event: SelectChangeEvent<string>) => {
    setDealType(event.target.value);
  };

  const handleRegionChange = (event: SelectChangeEvent<string>) => {
    setRegion(event.target.value);
  };

  // Filter end year options based on the selected start year
  const filteredEndYearOptions = endYearOptions.filter(year => year > startYear);

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box p={3} sx={{ backgroundColor: '#f0f4ff', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#3b3f57', fontWeight: 'bold' }}>
              Sector Based Filtered Data 
            </Typography>
            <Grid container spacing={2}>
              {/* Start Year Selector */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Start Year</InputLabel>
                  <Select
                    value={startYear}
                    onChange={handleStartYearChange}
                    label="Start Year"
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
                    label="End Year"
                    sx={{ backgroundColor: '#e8eaf6', color: '#1a237e' }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200, // Adjust the height as needed
                          overflow: 'auto',
                        },
                      },
                    }}
                    disabled={filteredEndYearOptions.length === 0} // Disable if no valid options
                  >
                    {filteredEndYearOptions.map((year) => (
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
                    label="Deal Type"
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
                    label="Region"
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
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {sectorwiseData && <YearlyTableData data={sectorwiseData} />}
    </Container>
  );
};

export default YearlyBasedTable;
