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
import NoDataPopup from '../../../../Pages/NoDataPopup'; // Assuming this is where NoDataPopup is located

// Define the expected structure of the API response
interface SkewTableOptions {
  'start year': number[];
  'end year': number[];
  dealType: string[];
  region: string[];
  sector: string[];
  year_period: string[];
}

const SectorBasedTable: React.FC = () => {
  // State for form values
  const [startYear, setStartYear] = useState<number>(2001);
  const [endYear, setEndYear] = useState<number | string>(2024);
  const [dealType, setDealType] = useState<string>('All');
  const [region, setRegion] = useState<string>('All');
  const [sector, setSector] = useState<string>('All');
  const [year_period, setYearPeriod] = useState<string>('Yearly');

  // State for the filter options
  const [startYearOptions, setStartYearOptions] = useState<number[]>([]);
  const [endYearOptions, setEndYearOptions] = useState<number[]>([]);
  const [dealTypeOptions, setDealTypeOptions] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);
  const [year_periodOptions, setYearPeriodOptions] = useState<string[]>([]);

  // State to store the response data and the no data popup visibility
  const [responseData, setResponseData] = useState<any>(null);
  const [noDataPopupOpen, setNoDataPopupOpen] = useState<boolean>(false);

  // Fetch the filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error('API URL is not defined in environment variables');
        }
        const response = await axios.get(`${apiUrl}/api/skew_table_filters/`, 
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            }
          });
        const data = response.data as SkewTableOptions;

        setStartYearOptions(data['start year']);
        setEndYearOptions(data['end year']);
        setDealTypeOptions(data['dealType']);
        setRegionOptions(data['region']);
        setSectorOptions(data['sector']);
        setYearPeriodOptions(data['year_period']);  // Ensure year_period options are set here
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
          year_period: year_period,  // Directly pass year_period as a string
        },
      };

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error('API URL is not defined in environment variables');
        }

        const response = await axios.post(
          `${apiUrl}/api/skewtable/calculations/`,
          requestData, 
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            }
          }
        );

        // Check if the response contains the "No data found" error
        const responseData = response.data as { error?: string };
        if (responseData.error === "No data found matching the specified filters.") {
          setNoDataPopupOpen(true);
          setResponseData(null);  // Clear previous response data
        } else {
          setResponseData(response.data);  // Store the response data in state
        }
      } catch (error) {
        setNoDataPopupOpen(true); // Open the popup in case of error
      }  
    };

    // Only fetch data when all required filters are selected
    if (dealType && region && sector) {
      fetchData();
    }
  }, [startYear, endYear, dealType, region, sector, year_period]);

  const handleDealTypeChange = (event: SelectChangeEvent<string>) => {
    setDealType(event.target.value);
  };

  const handleRegionChange = (event: SelectChangeEvent<string>) => {
    setRegion(event.target.value);
  };

  const handleSectorChange = (event: SelectChangeEvent<string>) => {
    setSector(event.target.value);
  };

  const handleYearPeriodChange = (event: SelectChangeEvent<string>) => {
    setYearPeriod(event.target.value);
  };

  const handleClosePopup = () => {
    setNoDataPopupOpen(false);  // Close the NoDataPopup
    setStartYear(2001);  // Reset the filters
    setEndYear(2024);
    setDealType('All');
    setRegion('All');
    setSector('All');
  };

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
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
                    label="Deal Type"
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

              {/* Sector Selector */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Sector</InputLabel>
                  <Select
                    value={sector}
                    onChange={handleSectorChange}
                    label="Sector"
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

              {/* Year Period Selector */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Period</InputLabel>
                  <Select
                    value={year_period}
                    onChange={handleYearPeriodChange}
                    label="Period"
                    sx={{ backgroundColor: '#d1c4e9', color: '#311b92' }}
                  >
                    {year_periodOptions.map((period) => (
                      <MenuItem key={period} value={period}>
                        {period}
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
      
      {/* NoDataPopup */}
      <NoDataPopup open={noDataPopupOpen} onClose={handleClosePopup} />
    </Container>
  );
};

export default SectorBasedTable;
