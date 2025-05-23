import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Box, Button, Checkbox, CardContent, Card, Container, Snackbar } from '@mui/material';

import HyDealMainTable from './HyDealMainTable';
import { useNavigate } from 'react-router-dom';

interface HighYieldOptions {
  start_year: number[];
  end_year: number[];
  sector: string[];
  snp_rating: string[];
}

const DealStatsMain = () => {
  const [filters, setFilters] = useState<HighYieldOptions>({
    start_year: [],
    end_year: [],
    sector: [],
    snp_rating: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate(); 

  const [error, setError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Manage Snackbar open state
    const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message content
  const [selectedFilters, setSelectedFilters] = useState<{
    start_year: number;
    end_year: number;
    sector: string[];  // Change sector to an array of strings
    snp_rating: string[];
    year_period: string;
  }>({
    start_year: 2012,
    end_year: 2025,
    sector: [],  // This should be an array
    snp_rating: [],
    year_period: 'Yearly',
  });
  const [appliedFilters, setAppliedFilters] = useState<{
    start_year: number;
    end_year: number;
    sector: string[];  // Change sector to an array of strings
    snp_rating: string[];
    year_period: string;
  }>({
    start_year: 2012,
    end_year: 2025,
    sector: [],
    snp_rating: [],
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
        // navigate("/error");  

      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleFilterChange = (category: string) => (event: any) => {
    setSelectedFilters({ ...selectedFilters, [category]: event.target.value });
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false); // Close Snackbar when the user dismisses it
  };


  const handleApply = () => {
    const startYear = selectedFilters["start_year"];
    const endYear = selectedFilters["end_year"];

    if (startYear && endYear && startYear > endYear) {
      setSnackbarMessage(
        "Start year should be less than or equal to end year."
      );
      setSnackbarOpen(true);
    } else {
      setSnackbarOpen(false); // Close the Snackbar if validation passes
      setAppliedFilters(selectedFilters); // Apply filters
    }
  };


  const handleReset = () => {
    setSelectedFilters({ start_year: 2012,
      end_year: 2025,
      sector: [],
      snp_rating: [],
      year_period: 'Yearly',});
    setAppliedFilters({
      start_year: 2012,
      end_year: 2025,
      sector: [],
      snp_rating: [],
      year_period: 'Yearly',
    });
    setSnackbarOpen(false); // Close Snackbar on reset
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

                {/* Sector Filter with checkboxes */}
                <Grid item xs={12} sm={6} md={2}>

                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Sector</InputLabel>
                    <Select
                      multiple
                      value={selectedFilters.sector}
                      onChange={handleFilterChange('sector')}
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
                      {filters.sector.map((sec) => (
                        <MenuItem key={sec} value={sec} sx={{ fontSize: '0.875rem' }}>
                          <Checkbox
                            checked={selectedFilters.sector.includes(sec)}
                            sx={{ transform: 'scale(0.8)' }} // Scale the checkbox to make it smaller
                          />
                          <Typography sx={{ fontSize: '1rem' }}>{sec}</Typography> {/* Reduce the text size */}
                        </MenuItem>
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
                      value={selectedFilters.snp_rating}
                      onChange={handleFilterChange('snp_rating')}
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
                      {filters.snp_rating.sort().map((rating) => (
                        <MenuItem key={rating} value={rating} sx={{ fontSize: '0.875rem' }}>
                          <Checkbox
                            checked={selectedFilters.snp_rating.includes(rating)}
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
      <HyDealMainTable selectedFilters={appliedFilters} handleReset={handleReset}  />

       <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
            >
              <Alert
                onClose={handleSnackbarClose}
                severity="error"
                sx={{ width: "100%" }}
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>
 
    </>
  );
};

export default DealStatsMain;
