import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const FooterMain: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        backgroundColor: '#1A237E',
        padding: isMobile ? '10px 0' : '20px 0',
        color: 'white',
        textAlign: 'center',
      }}
    >
      <Typography
        variant={isMobile ? 'body1' : 'h6'}
        sx={{ fontWeight: 'bold' }}
      >
        Stock Screener & Data Visualization
      </Typography>
      <Typography variant="body2">
        © 2024 MIDAS - Your trusted source for market data and analytics.
      </Typography>
    </Box>
  );
};

export default FooterMain;
