import React from 'react';
import { Box, Typography } from '@mui/material';

const MonasheeDeals: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh', // Ensure it takes up most of the page height
        padding: '2rem',
        backgroundColor: '#f9f9f9',
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
        Monashee Deals
      </Typography>
      <Typography
        variant="body1"
        sx={{
          maxWidth: '600px',
          fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' }, // Responsive text size
          lineHeight: '1.6',
        }}
      >
        Here are the latest deals from Monashee. Stay tuned for exciting investment opportunities and market insights curated by our experts.
      </Typography>
    </Box>
  );
};

export default MonasheeDeals;
