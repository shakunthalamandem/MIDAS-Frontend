import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import DealGraph from '../../MonasheeGraphs/DealGraph';
import DealVolume from '../../MonasheeGraphs/DealVolume';
import OpportunityMain from '../../MonasheeGraphs/OpportunityMain';
import OpportunityAbsBasis from '../../MonasheeGraphs/OpportunityAbsBasis';
import SkewMain from '../../MonasheeGraphs/SkewMain';
import SkewCombo from '../../MonasheeGraphs/MonasheePieCharts/SkewCombo';
import SkewTableMain from '../../MonasheeGraphs/SkewTableMain';


const CapitalMarkets: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          padding: '2rem',
          backgroundColor: '#f5f5f5',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 'bold',
            marginBottom: '1rem',
            fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' },
          }}
        >
          Capital Markets
        </Typography>
        <Typography
          variant="body1"
          sx={{
            maxWidth: '600px',
            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
            lineHeight: '1.6',
          }}
        >
          Welcome to the Capital Markets page. Here, you will find the latest information about financial markets, investment strategies, and more. Stay updated on global market trends and insights.
        </Typography>
      </Box>

      <Box sx={{ width: '100%', backgroundColor: '#fff' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          centered
          TabIndicatorProps={{
            style: { backgroundColor: value === 0 ? '#FF5722' : value === 1 ? '#4CAF50' : '#3F51B5' },
          }}
        >
          <Tab
            label="Deal Graph"
            sx={{
              color: value === 0 ? '#FF5722' : '#777',
              '&.Mui-selected': { color: '#FF5722', fontWeight: 'bold' },
            }}
          />
          <Tab
            label="Deal Volume"
            sx={{
              color: value === 1 ? '#4CAF50' : '#777',
              '&.Mui-selected': { color: '#4CAF50', fontWeight: 'bold' },
            }}
          />
          <Tab
            label="Opportunity Value Ex"
            sx={{
              color: value === 2 ? '#3F51B5' : '#777',
              '&.Mui-selected': { color: '#3F51B5', fontWeight: 'bold' },
            }}
          />
          <Tab
            label="Opportunity Value Abs"
            sx={{
              color: value === 3 ? '#3F51B5' : '#777',
              '&.Mui-selected': { color: '#3F51B5', fontWeight: 'bold' },
            }}
          />
            <Tab
            label="Skew Table"
            sx={{
              color: value === 4 ? '#3F51B5' : '#777',
              '&.Mui-selected': { color: '#3F51B5', fontWeight: 'bold' },
            }}
          />
        </Tabs>

        {value === 0 && <DealGraph />}
        {value === 1 && <DealVolume />}
        {value === 2 && <OpportunityMain />}
        {value === 3 && <OpportunityAbsBasis />}
        {value === 4 && <SkewTableMain />}


      </Box>
    </>
  );
};

export default CapitalMarkets;
