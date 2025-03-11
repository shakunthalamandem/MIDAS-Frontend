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
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import HyRatingTableData from './HyRatingTableData';
import NoDataPopup from '../../../Pages/NoDataPopup';

interface SkewTableOptions {
  'start year': number[];
  'end year': number[];
  sector: string[];
}

const HyRatingBasedTable: React.FC = () => {
  const [startYear, setStartYear] = useState<number>(2012);
  const [endYear, setEndYear] = useState<number | string>(2025);
  const [sector, setSector] = useState<string>('All');
  const [ratingData, setRatingData] = useState<any>(null);

  const [startYearOptions, setStartYearOptions] = useState<number[]>([]);
  const [endYearOptions, setEndYearOptions] = useState<number[]>([]);
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);

  const [noDataPopupOpen, setNoDataPopupOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        if (!apiUrl) throw new Error('API URL is not defined in environment variables');
        
        const response = await axios.get(`${apiUrl}/api/hy_skew_table_filters/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          }
        });
        
        const data = response.data as SkewTableOptions;
        setStartYearOptions(data['start year']);
        setEndYearOptions(data['end year']);
        setSectorOptions(data['sector']);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading

      const requestData = {
        filters: {
          year_range: [startYear, endYear],
          sector: sector === 'All' ? sectorOptions : [sector],
        },
      };

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        if (!apiUrl) throw new Error('API URL is not defined in environment variables');

        const response = await axios.post(`${apiUrl}/api/hy_skewtable/calculations/`, requestData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          }
        });

        const responseData = response.data as { error?: string };
        if (responseData.error === "No data found matching the specified filters.") {
          setRatingData(null);
        } else {
          setRatingData(response.data);
          setNoDataPopupOpen(!response.data || Object.keys(response.data).length === 0);

        }
      } catch (error) {
        setNoDataPopupOpen(true);
      }
      finally {
        setLoading(false);
      }
    };
    if (sector && endYear && startYear) {
      fetchData();
    }
  }, [startYear, endYear, sector, sectorOptions]);

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box p={3} sx={{ backgroundColor: '#f0f4ff', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#3b3f57', fontWeight: 'bold' }}>
              Rating Based Filtered Data
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Start Year</InputLabel>
                  <Select
                    value={startYear}
                    onChange={(event) => setStartYear(Number(event.target.value))}
                    label="Start Year"
                    sx={{ backgroundColor: '#e0f7fa', color: '#006064' }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 300, // Set the dropdown height
                        },
                      },
                    }}
                  >
                    {startYearOptions.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>End Year</InputLabel>
                  <Select
                    value={endYear}
                    onChange={(event) => setEndYear(Number(event.target.value))}
                    label="End Year"
                    sx={{ backgroundColor: '#f9dc8f', color: '#1a237e' }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 300, // Set the dropdown height
                        },
                      },
                    }}
                  >
                    {endYearOptions.map((year) => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Sector</InputLabel>
                  <Select
                    value={sector}
                    onChange={(event) => setSector(event.target.value)}
                    label="Sector"
                    sx={{ backgroundColor: '#d1c4e9', color: '#311b92' }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 300, 
                        },
                      },
                    }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {sectorOptions.map((sec) => (
                      <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
            {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" mt={3} mb={3}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            ratingData && <HyRatingTableData data={ratingData} />
          )}

          {noDataPopupOpen && !loading && (
           <>
           <NoDataPopup open={noDataPopupOpen} onClose={() => setNoDataPopupOpen(false)} /></>
          )}


        </CardContent>
      </Card>  
    </Container>
  );
};

export default HyRatingBasedTable;
