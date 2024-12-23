import React from 'react';
import { Box, Typography } from '@mui/material';
import DealsDataFilter from '../../MonasheeDeals/DeoLogicData/DealsDataFilter';
import InvestmentMain from '../../InvestmentStrategy/InvestmentMain';

const Strategies: React.FC = () => {
  return (
    <>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh', // Takes up most of the page height
        padding: '2rem',
        backgroundColor: '#f0f0f0', // Light background color
        textAlign: 'center',
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' }, // Responsive font size
        }}
      >
        Strategies
      </Typography>
      <Typography
        variant="body1"
        sx={{
          maxWidth: '700px',
          fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' }, // Responsive text size
          lineHeight: '1.6',
        }}
      >
        Learn about various strategies here, including investment, growth, and market entry strategies tailored for diverse market conditions.
      </Typography>
      {/* <DealsDataFilter /> */}

    </Box>
    <InvestmentMain />
  </>
  );
};

export default Strategies;
