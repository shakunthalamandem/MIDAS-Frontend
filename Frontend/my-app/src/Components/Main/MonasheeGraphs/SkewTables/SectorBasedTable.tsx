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
import SectorTableData from './SectorTableData';

// Define the expected structure of the API response
interface SkewTableOptions {
  'start year': number[];
  'end year': number[];
  dealType: string[];
  region: string[];
  sector: string[];
}

const SectorBasedTable: React.FC = () => {
  // State for form values
  const [startYear, setStartYear] = useState<number>(2001);
  const [endYear, setEndYear] = useState<number | string>(2024);
  const [dealType, setDealType] = useState<string>('All');
  const [region, setRegion] = useState<string>('All');
  const [sector, setSector] = useState<string>('All');

  // State for the filter options
  const [startYearOptions, setStartYearOptions] = useState<number[]>([]);
  const [endYearOptions, setEndYearOptions] = useState<number[]>([]);
  const [dealTypeOptions, setDealTypeOptions] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);

  // State to store the response data
  const [responseData, setResponseData] = useState<any>(null);

  // Fetch the filter options on component mount
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
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch data when any filter changes
  useEffect(() => {
    const fetchData = async () => {
      const requestData = {
        filters: {
          year_range: [startYear, endYear],
          deal_type: dealType === 'All' ? dealTypeOptions : [dealType],
          region: region === 'All' ? regionOptions : [region],
          sector: sector === 'All' ? sectorOptions : [sector],
        },
      };

      try {
        const response = await axios.post(
          'http://192.168.1.59:9000/api/skewtable/calculations/',
          requestData
        );
        console.log('Response data:', response.data);
        setResponseData(response.data); // Store the response data in state
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    // Only fetch data when all required filters are selected
    if (dealType && region && sector) {
      fetchData();
    }
  }, [startYear, endYear, dealType, region, sector, dealTypeOptions, regionOptions, sectorOptions]);

  const handleDealTypeChange = (event: SelectChangeEvent<string>) => {
    setDealType(event.target.value);
  };

  const handleRegionChange = (event: SelectChangeEvent<string>) => {
    setRegion(event.target.value);
  };

  const handleSectorChange = (event: SelectChangeEvent<string>) => {
    setSector(event.target.value);
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box p={3} sx={{ backgroundColor: '#f0f4ff', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#3b3f57', fontWeight: 'bold' }}>
              Yearly Based Filtered Data
            </Typography>
            <Grid container spacing={2}>
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
            </Grid>
          </Box>

          {/* Pass responseData to SectorTableData */}
          {responseData && <SectorTableData data={responseData} />}
        </CardContent>
      </Card>
    </Container>
  );
};

export default SectorBasedTable;
