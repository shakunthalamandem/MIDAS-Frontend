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
import HyYearlyTableData from './HyYearlyTableData';

interface SkewTableOptions {
  'start year': number[];
  'end year': number[];
  ratings: string[];
}

const HyYearlyBasedTable: React.FC = () => {
  const [startYear, setStartYear] = useState<number>(2012);
  const [endYear, setEndYear] = useState<number>(2025);
  const [rating, setRating] = useState<string>('All');

  const [startYearOptions, setStartYearOptions] = useState<number[]>([]);
  const [endYearOptions, setEndYearOptions] = useState<number[]>([]);
  const [ratingOptions, setRatingOptions] = useState<string[]>([]);
  const [tableData, setTableData] = useState<any>(null);

  // Fetch filter options from the API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error('API URL is not defined in environment variables');
        }
        const response = await axios.get(`${apiUrl}/api/hy_skew_table_filters/`, 
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            }
          });
        const data = response.data as SkewTableOptions;
        // console.log(data,"CHinthamani");
        setRatingOptions(data['ratings'] || []);
      
        setStartYearOptions(data['start year'] || []);
        setEndYearOptions(data['end year'] || []);
        } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch table data based on the selected filters
  useEffect(() => {
    const fetchData = async () => {
      const requestData = {
        filters: {
          year_range: [startYear, endYear],
          rating: rating === 'All' ? ratingOptions : [rating],
        },
      };

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error('API URL is not defined in environment variables');
        }
        const response = await axios.post(
          `${apiUrl}/api/hy_skewtable/calculations/`,
          requestData, 
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            }
          }
        );
        setTableData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }  
    };
    
    if (rating && endYear && startYear) {
      fetchData();
    }
  }, [startYear, endYear, rating, ratingOptions]);

  // Handle changes in the year selectors
  const handleStartYearChange = (event: SelectChangeEvent<number | string>) => {
    const newStartYear = Number(event.target.value);
    setStartYear(newStartYear);
    setEndYear(newStartYear + 1);
  };

  const handleEndYearChange = (event: SelectChangeEvent<number | string>) => {
    setEndYear(Number(event.target.value));
  };

  const handleRatingChange = (event: SelectChangeEvent<string>) => {
    setRating(event.target.value);
  };

  // Ensure endYearOptions is defined before accessing .length
  const filteredEndYearOptions = Array.isArray(endYearOptions) 
    ? endYearOptions.filter(year => year >= startYear) 
    : [];

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box p={3} sx={{ backgroundColor: '#f0f4ff', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#3b3f57', fontWeight: 'bold' }}>
              Sector Filtered Data
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={8} sm={3} md={2}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Start Year</InputLabel>
                  <Select
                    value={startYear}
                    onChange={handleStartYearChange}
                    label="Start Year"                     sx={{ backgroundColor: '#e0f7fa', color: '#006064' }}

                    disabled={!Array.isArray(startYearOptions) || startYearOptions.length === 0}
                  >
                    {Array.isArray(startYearOptions) && startYearOptions.length > 0 ? (
                      startYearOptions.map((year) => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No Start Years Available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3} md={2}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>End Year</InputLabel>
                  <Select
                    value={endYear}
                    onChange={handleEndYearChange}
                    label="End Year"                     sx={{ backgroundColor: '#f9dc8f', color: '#1a237e' }}

                    disabled={filteredEndYearOptions.length === 0}
                  >
                    {filteredEndYearOptions.length > 0 ? (
                      filteredEndYearOptions.map((year) => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No End Years Available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3} md={2}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Rating</InputLabel>
                  <Select
                    value={rating}
                    onChange={handleRatingChange}
                    label="Rating"                     sx={{ backgroundColor: '#d1c4e9', color: '#311b92' }}

                    disabled={ratingOptions.length === 0}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {ratingOptions.length > 0 ? (
                      ratingOptions.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))
                    ) : (
                      <MenuItem >No Rating Options Available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Ensure tableData is available before rendering HyYearlyTableData */}
      {tableData ? (
        <HyYearlyTableData data={tableData} />
      ) : (
        <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', padding: 2 }}>
          Loading data...
        </Typography>
      )}
    </Container>
  );
};

export default HyYearlyBasedTable;
