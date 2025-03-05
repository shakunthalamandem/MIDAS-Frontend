import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Box, Button, Checkbox, FormControlLabel, CardContent, Card, Container } from '@mui/material';
import HyDealStatGraph from './HyDealStatGraph';
import HYsppiechart from './HYsppiechart';

interface HighYieldOptions {
  start_year: number[];
  end_year: number[];
  sector: string[];
  sp_rating: string[];
}

const DealStatsMain = () => {
  const [filters, setFilters] = useState<HighYieldOptions>({
    start_year: [],
    end_year: [],
    sector: [],
    sp_rating: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<{
    start_year: number;
    end_year: number;
    sector: string;
    sp_rating: string[];
    year_period: string;
  }>({
    start_year: 2012,
    end_year: 2025,
    sector: '',
    sp_rating: [],
    year_period: 'Yearly',
  });
  const [appliedFilters, setAppliedFilters] = useState<{
    start_year: number;
    end_year: number;
    sector: string;
    sp_rating: string[];
    year_period: string;
  }>({
    start_year: 2012,
    end_year: 2025,
    sector: '',
    sp_rating: [],
    year_period: 'Yearly',
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

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, rating: string) => {
    setSelectedFilters((prev) => {
      const newSPRatings = event.target.checked
        ? [...prev.sp_rating, rating]
        : prev.sp_rating.filter((item) => item !== rating);

      return { ...prev, sp_rating: newSPRatings };
    });
  };

  const handleApply = () => {
    setAppliedFilters({ ...selectedFilters });
    console.log('Applied Filters:', selectedFilters);
  };

  const handleReset = () => {
    setSelectedFilters({
      start_year: 2012,
      end_year: 2025,
      sector: '',
      sp_rating: [],
      year_period: '',
    });
    setAppliedFilters({
      start_year: 2012,
      end_year: 2025,
      sector: '',
      sp_rating: [],
      year_period: '',
    });
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <Container>
        <Card sx={{ mt: 2, mb: 2 }}>
          <CardContent>
            <Container maxWidth="lg">
              <Grid container spacing={3}>
                {/* Start Year Filter */}
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Start Year</InputLabel>
                    <Select value={selectedFilters.start_year} onChange={handleFilterChange('start_year')} label="Start Year">
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
                      {filters.end_year.map((year) => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Sector Filter */}
                <Grid item xs={12} sm={6} md={2}>
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
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>SP Rating</InputLabel>
                    <Select
                      multiple
                      value={selectedFilters.sp_rating}
                      onChange={handleFilterChange('sp_rating')}
                      renderValue={(selected) => selected.join(', ')}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300, // Limit the dropdown height to allow scrolling
                            overflowY: 'auto',
                          },
                        },
                      }}
                    >
                      {filters.sp_rating.sort().map((rating) => (
                        <MenuItem key={rating} value={rating} sx={{ fontSize: '0.875rem' }}>
                          <Checkbox
                            checked={selectedFilters.sp_rating.includes(rating)}
                            sx={{ transform: 'scale(0.8)' }} // Scale the checkbox to make it smaller
                          />
                          <Typography sx={{ fontSize: '1rem' }}>{rating}</Typography> {/* Reduce the text size */}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>


                {/* Period Filter */}
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Period</InputLabel>
                    <Select value={selectedFilters.year_period} onChange={handleFilterChange('year_period')} label="Period">
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
      </Container>

      {/* Pass only applied filters to the graph */}
      <HyDealStatGraph selectedFilters={appliedFilters} />
      <HYsppiechart selectedFilters={appliedFilters} />
    </>
  );
};

export default DealStatsMain;
