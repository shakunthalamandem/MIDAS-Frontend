import React from 'react';
import { Box, Typography } from '@mui/material';
import DealGraph from '../../MonasheeGraphs/DealGraph';
import DealVolume from '../../MonasheeGraphs/DealVolume';
import OpportunityMain from '../../MonasheeGraphs/OpportunityMain';

const CapitalMarkets: React.FC = () => {
  return (
    <>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh', // Ensure it fills most of the page
        padding: '2rem',
        backgroundColor: '#f5f5f5', // Light background color for better visual
        textAlign: 'center',
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 'bold',
          marginBottom: '1rem',
          fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' }, // Responsive font size
        }}
      >
        Capital Markets
      </Typography>
      <Typography
        variant="body1"
        sx={{
          maxWidth: '600px',
          fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' }, // Responsive body text size
          lineHeight: '1.6',
        }}
      >
        Welcome to the Capital Markets page. Here, you will find the latest information about financial markets, investment strategies, and more. Stay updated on global market trends and insights.
      </Typography>
    </Box>
    <DealGraph />
    <DealVolume />
    <OpportunityMain />
    </>
    
  );
};

export default CapitalMarkets;
