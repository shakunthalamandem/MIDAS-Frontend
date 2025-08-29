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
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import SectorTableData from './SectorTableData';
import NoDataPopup from '../../../../Pages/NoDataPopup';
import { useNavigate } from 'react-router-dom';

interface SkewTableOptions {
  'start year': number[];
  'end year': number[];
  dealType: string[];
  region: string[];
  sector: string[];
  year_period: string[];
}

const SectorBasedTable: React.FC = () => {
  const [startYear, setStartYear] = useState<number>(2001);
  const [endYear, setEndYear] = useState<number>(2025);
  const [dealType, setDealType] = useState<string>('All');
  const [region, setRegion] = useState<string>('All');
  const [sector, setSector] = useState<string>('All');
  const [yearPeriod, setYearPeriod] = useState<string>('Yearly');
  const [loading, setLoading] = useState<boolean>(false);

  const [startYearOptions, setStartYearOptions] = useState<number[]>([]);
  const [endYearOptions, setEndYearOptions] = useState<number[]>([]);
  const [dealTypeOptions, setDealTypeOptions] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);
  const [yearperiodOptions, setYearPeriodOptions] = useState<string[]>([]);


  const [responseData, setResponseData] = useState<any>(null);
  const [noDataPopupOpen, setNoDataPopupOpen] = useState<boolean>(false);
  const navigate = useNavigate();

const handleStartYearChange = (event: SelectChangeEvent<number | string>) => {
  const newStartYear = Number(event.target.value);
  setStartYear(newStartYear);

  setEndYear((prevEndYear) => {
    return prevEndYear <= newStartYear ? newStartYear + 1 : prevEndYear;
  });
};



  const handleEndYearChange = (event: SelectChangeEvent<number | string>) => {
    setEndYear(Number(event.target.value));
  };

  const filteredEndYearOptions = endYearOptions.filter((year) => year >= startYear);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error('API URL is not defined in environment variables');
        }
        const response = await axios.get(`${apiUrl}/api/skew_table_filters/`, {
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
        setYearPeriodOptions(data['year_period']);
      } catch (error) {
        console.error('Error fetching filter options:', error);
        // navigate("/error");  
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
          year_period: yearPeriod,
        },
      };

      try {
        setLoading(true);
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

        const responseData = response.data as { error?: string };
        if (responseData.error === "No data found matching the specified filters.") {
          setNoDataPopupOpen(true);
          setResponseData(null);
        } else {
          setResponseData(response.data);
        }
      } catch (error) {
        // navigate("/error");  
      } finally {
        setLoading(false); // <-- Set loading false after request
      }  
    };

    if (dealType && region && sector && startYear && endYear) {
      fetchData();
    }
  }, [startYear, endYear, dealType, region, sector, yearPeriod, dealTypeOptions, regionOptions, sectorOptions]);

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
    setNoDataPopupOpen(false);  
    setStartYear(2001); 
    setEndYear(2025);
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
              {/* Start Year */}
              <Grid item xs={12} sm={6} md={2}>
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

              {/* End Year */}
              <Grid item xs={12} sm={6} md={2}>
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
                    disabled={filteredEndYearOptions.length === 0}
                  >
                    {filteredEndYearOptions.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Deal Type */}
              <Grid item xs={12} sm={6} md={2}>
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
              <Grid item xs={12} sm={6} md={2}>
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
              <Grid item xs={12} sm={6} md={2}>
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
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Period</InputLabel>
                  <Select
                    value={yearPeriod}
                    onChange={handleYearPeriodChange}
                    label="Period"
                    sx={{ backgroundColor: '#d1c4e9', color: '#311b92' }}
                  >
                    {yearperiodOptions.map((period: string) => (
                      <MenuItem key={period} value={period}>
                        {period}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
          ) : (
            responseData && <SectorTableData data={responseData} />
          )}
        </CardContent>
      </Card>

      <NoDataPopup open={noDataPopupOpen} onClose={handleClosePopup} />
    </Container>
  );
};

export default SectorBasedTable;
