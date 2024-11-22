import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import DealGraph from '../../MonasheeGraphs/DealGraph';
import DealVolume from '../../MonasheeGraphs/DealVolume';
import OpportunityMain from '../../MonasheeGraphs/OpportunityMain';
import OpportunityAbsBasis from '../../MonasheeGraphs/OpportunityAbsBasis';
import SkewTableMain from '../../MonasheeGraphs/SkewTableMain';
import ScreenerMain from '../../MonasheeGraphs/ScreenerTable/ScreenerMain';

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
          backgroundColor: '#002060',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color:"#FFFFFF",
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
            color:"#FFFFFF",
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
            style: {
              display: 'none', // This removes the default underline (bottom line)
            },
          }}
          sx={{
            '& .MuiTab-root': {
              borderRadius: '8px',
              padding: '6px 16px', // Reduced padding to reduce the height of the tabs
              fontSize: '0.9rem', // Smaller font size
              fontWeight: 'bold',
              transition: 'background-color 0.3s ease, transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                background: 'rgba(0, 0, 0, 0.08)',
                color: '#000000',
              },
            },
            height: '40px', // You can also set a fixed height for the tabs
          }}
        >
          <Tab
            label="Deal Count"
            sx={{
              backgroundColor: value === 0 ? '#FF5722' : '#f5f5f5',
              color: value === 0 ? '#fff' : '#777',
              '&.Mui-selected': {
                backgroundColor: '#FF5722',
                color: '#fff',
              },
            }}
          />
          <Tab
            label="Deal Volume"
            sx={{
              backgroundColor: value === 1 ? '#4CAF50' : '#f5f5f5',
              color: value === 1 ? '#fff' : '#777',
              '&.Mui-selected': {
                backgroundColor: '#4CAF50',
                color: '#fff',
              },
            }}
          />
          <Tab
            label="Opportunity Value Excess"
            sx={{
              backgroundColor: value === 2 ? '#3F51B5' : '#f5f5f5',
              color: value === 2 ? '#fff' : '#777',
              '&.Mui-selected': {
                backgroundColor: '#3F51B5',
                color: '#fff',
              },
            }}
          />
          {/* <Tab
            label="Opportunity Value Abs"
            sx={{
              backgroundColor: value === 3 ? '#00BCD4' : '#f5f5f5',
              color: value === 3 ? '#fff' : '#777',
              '&.Mui-selected': {
                backgroundColor: '#00BCD4',
                color: '#fff',
              },
            }}
          /> */}
          <Tab
            label="Skew Table"
            sx={{
              backgroundColor: value === 3 ? '#9C27B0' : '#f5f5f5',
              color: value === 3 ? '#fff' : '#777',
              '&.Mui-selected': {
                backgroundColor: '#9C27B0',
                color: '#fff',
              },
            }}
          />
          <Tab
            label="Screener"
            sx={{
              backgroundColor: value === 4 ? '#FF9800' : '#f5f5f5',
              color: value === 4 ? '#fff' : '#777',
              '&.Mui-selected': {
                backgroundColor: '#FF9800',
                color: '#fff',
              },
            }}
          />
        </Tabs>

        {value === 0 && <DealGraph />}
        {value === 1 && <DealVolume />}
        {value === 2 && <OpportunityMain />}
        {/* {value === 3 && <OpportunityAbsBasis />} */}
        {value === 3 && <SkewTableMain />}
        {value === 4 && <ScreenerMain />}
      </Box>
    </>
  );
};

export default CapitalMarkets;
