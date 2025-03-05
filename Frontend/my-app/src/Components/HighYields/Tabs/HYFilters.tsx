import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Box, Button, Checkbox, FormControlLabel, CardContent, Card, Container } from '@mui/material';

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
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

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

  const handleCheckboxChange = (option: string) => {
    setSelectedOptions(prevSelected =>
      prevSelected.includes(option)
        ? prevSelected.filter(item => item !== option)
        : [...prevSelected, option]
    );
  };

  const handleApply = () => {
    console.log('Applied Filters:', selectedFilters);
    console.log('Applied Checkbox Options:', selectedOptions);
  };

  const handleReset = () => {
    setSelectedFilters({
      start_year: '',
      end_year: '',
      sector: '',
      sp_rating: '',
      period: '',
    });
    setSelectedOptions([]);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          High YieldFilters
        </Typography>

        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {/* Start Year Filter */}
            <Grid item xs={12} sm={6} md={2}>
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
            <Grid item xs={12} sm={6} md={2}>
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

            {/* Sector Filter with Checkbox Inside */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>Sector</InputLabel>
                <Select value={selectedFilters.sector} onChange={handleFilterChange('sector')} label="Sector">
                  <MenuItem value="">All</MenuItem>
                  {filters.sector.map((sec) => (
                    <MenuItem key={sec} value={sec}>{sec}</MenuItem>
                  ))}
                </Select>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedOptions.includes('sectorOption')}
                      onChange={() => handleCheckboxChange('sectorOption')}
                      sx={{
                        "&.Mui-checked": {
                          color: "#002060",
                        },
                      }}
                    />
                  }
                  label="Select Sector Option"
                />
              </FormControl>
            </Grid>

            {/* SP Rating Filter with Checkbox Inside */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel>SP Rating</InputLabel>
                <Select value={selectedFilters.sp_rating} onChange={handleFilterChange('sp_rating')} label="SP Rating">
                  <MenuItem value="">All</MenuItem>
                  {filters.sp_rating.map((rating) => (
                    <MenuItem key={rating} value={rating}>{rating}</MenuItem>
                  ))}
                </Select>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedOptions.includes('ratingOption')}
                      onChange={() => handleCheckboxChange('ratingOption')}
                      sx={{
                        "&.Mui-checked": {
                          color: "#002060",
                        },
                      }}
                    />
                  }
                  label="Select Rating Option"
                />
              </FormControl>
            </Grid>

            {/* Period Filter */}
            <Grid item xs={12} sm={6} md={2}>
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
        </Container>

        {/* Apply and Reset Buttons Centered */}
        <Box display="flex" justifyContent="center" mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApply}
            sx={{ mr: 2, bgcolor: "#002060" }}
          >
            Apply
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleReset}>
            Reset
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HYFilters;
