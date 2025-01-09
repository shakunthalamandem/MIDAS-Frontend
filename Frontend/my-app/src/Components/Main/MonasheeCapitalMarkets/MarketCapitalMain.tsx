import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, FormControlLabel, Checkbox, Typography } from '@mui/material';
import NumberOfDeals from './NavigationTabs/NumberOfDeals';
import RegionWiseDeals from './NavigationTabs/RegionWiseDeals';
import SectorWiseDeals from './NavigationTabs/SectorWiseDeals';

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
      {['count', 'deal_value', 'opportunity_value_ex'].map((metric, index) => {
        const labels = ['Deal Count', 'Deal Value', 'Opportunity Excess Value'];
        const colors = ['#9b0000','#9b0000','#9b0000'];
        return (
          <FormControlLabel
            key={metric}
            control={
              <Checkbox
                checked={selectedMetric === metric}
                onChange={handleCheckboxChange}
                value={metric}
                sx={{
                  color: '#3f51b5',
                  '&.Mui-checked': { color: colors[index] },
                  '&:hover': { backgroundColor: 'transparent' },
                  transition: 'color 0.3s ease',
                }}
              />
            }
            label={labels[index]}
          />
        );
      })}
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
        </>
      )}
    </Container>
  );
};

export default MarketCapitalMain;
 