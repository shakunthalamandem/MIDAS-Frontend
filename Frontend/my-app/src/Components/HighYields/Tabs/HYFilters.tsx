import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert } from '@mui/material';

interface HighYieldOptions {
  start_year: string[];
  end_year: string[];
  sector: string[];
  sp_rating: string[];
}

const HYFilters = () => {
  const [filters, setFilters] = useState<HighYieldOptions>({
    start_year: [],
    end_year: [],
    sector: [],
    sp_rating: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<any>({
    start_year: '',
    end_year: '',
    sector: '',
    sp_rating: '',
    period: '',
  });

  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem('access_token');

        if (!apiUrl) {
          throw new Error('API URL is not defined in environment variables');
        }

        const response = await axios.get(`${apiUrl}/api/high-yields/distinct/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        setFilters(response.data as HighYieldOptions);
        console.log("Fetched Filters:", response.data);
      } catch (error) {
        setError('Failed to fetch filter options');
        console.error('Error fetching filter options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleFilterChange = (category: string) => (event: any) => {
    setSelectedFilters({ ...selectedFilters, [category]: event.target.value });
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Filters
        </Typography>
      </Grid>

      {/* Start Year Filter */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>Start Year</InputLabel>
          <Select value={selectedFilters.start_year} onChange={handleFilterChange('start_year')} label="Start Year">
            <MenuItem value="">All</MenuItem>
            {filters.start_year.map((year) => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* End Year Filter */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>End Year</InputLabel>
          <Select value={selectedFilters.end_year} onChange={handleFilterChange('end_year')} label="End Year">
            <MenuItem value="">All</MenuItem>
            {filters.end_year.map((year) => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Sector Filter */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>Sector</InputLabel>
          <Select value={selectedFilters.sector} onChange={handleFilterChange('sector')} label="Sector">
            <MenuItem value="">All</MenuItem>
            {filters.sector.map((sec) => (
              <MenuItem key={sec} value={sec}>{sec}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* SP Rating Filter */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>SP Rating</InputLabel>
          <Select value={selectedFilters.sp_rating} onChange={handleFilterChange('sp_rating')} label="SP Rating">
            <MenuItem value="">All</MenuItem>
            {filters.sp_rating.map((rating) => (
              <MenuItem key={rating} value={rating}>{rating}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Period Filter */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel>Period</InputLabel>
          <Select value={selectedFilters.period} onChange={handleFilterChange('period')} label="Period">
            <MenuItem value="">All</MenuItem>
            {['Yearly', 'Quarterly', 'Monthly'].map((period) => (
              <MenuItem key={period} value={period}>{period}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default HYFilters;
