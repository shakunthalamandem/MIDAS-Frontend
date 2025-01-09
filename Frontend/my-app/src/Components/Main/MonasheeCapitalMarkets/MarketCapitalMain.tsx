import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, FormControlLabel, Checkbox, Typography } from '@mui/material';
import NumberOfDeals from './NavigationTabs/NumberOfDeals';
import RegionWiseDeals from './NavigationTabs/RegionWiseDeals';
import SectorWiseDeals from './NavigationTabs/SectorWiseDeals';
import YearlySectorChart from './YearlySectorChart';
import RegionWiseChart from './RegionWiseChart';

interface MarketCapitalMainProps {
  selectedFilters: Record<string, string | number | (string | number)[]>;
}

const MarketCapitalMain: React.FC<MarketCapitalMainProps> = ({ selectedFilters }) => {
  const [apiData, setApiData] = useState<any>(null); // Store the API response
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [selectedMetric, setSelectedMetric] = useState<string>('count'); // Default to "count" (Deal Count)

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMetric(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Reset error

      try {
        const apiUrl = process.env.REACT_APP_API_URL;

        if (!apiUrl) {
          throw new Error('API URL is not defined in environment variables');
        }

        // Make the POST request with selectedFilters as the payload
        const response = await fetch(`${apiUrl}/api/dealogic_graph/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(selectedFilters), // Payload from selected filters
        });

        if (response.ok) {
          const result = await response.json();
          setApiData(result); // Store API response data
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

      fetchData(); // Fetch data when selectedFilters change
  }, [selectedFilters]); // Dependency array to trigger useEffect when selectedFilters change

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Display loading state */}
      {loading && <p>Loading...</p>}

      {/* Display error message if any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Checkboxes for selecting the metric */}
      <Box display="flex" justifyContent="center" mb={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedMetric === 'count'}
              onChange={handleCheckboxChange}
              value="count"
              color="primary"
            />
          }
          label="Deal Count"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedMetric === 'deal_value'}
              onChange={handleCheckboxChange}
              value="deal_value"
              color="primary"
            />
          }
          label="Deal Value"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedMetric === 'opportunity_value_ex'}
              onChange={handleCheckboxChange}
              value="opportunity_value_ex"
              color="primary"
            />
          }
          label="Opportunity Exits Return"
        />
      </Box>

      {/* Display the API data */}
      {apiData && (
        <>
         
          <Grid item xs={12} md={6}>
                <NumberOfDeals data={apiData.deal_type} selectedMetric={selectedMetric} />
              </Grid>
          <Box sx={{ px: 4, py: 2 }}>
            <Grid container spacing={4}>
              {/* Number of Deals */}
            

              {/* Region Wise Deals */}
              <Grid item xs={12} md={6}>
                <RegionWiseDeals data={apiData.regions} selectedMetric={selectedMetric} />
              </Grid>

              {/* Sector Wise Deals */}
              <Grid item xs={12} md={6}>
                <SectorWiseDeals data={apiData.sectors} selectedMetric={selectedMetric} />
              </Grid>
            </Grid>
          </Box>
          <Grid item xs={12} md={6}>
            <YearlySectorChart
              data={apiData.year_wise_sector}
              selectedMetric={selectedMetric}
              checkedItems={
                Array.isArray(selectedFilters?.sector)
                  ? selectedFilters.sector.filter((item): item is string => typeof item === 'string') // Ensure only strings
                  : typeof selectedFilters?.sector === 'string'
                  ? [selectedFilters.sector] // Convert single string to array
                  : [] // Default to empty array
              }
            />
          </Grid>
              <Grid item xs={12} md={6}>
                <RegionWiseChart data={apiData.year_wise_region} selectedMetric={selectedMetric} />
              </Grid>
        </>
      )}
    </Container>
  );
};

export default MarketCapitalMain;
 