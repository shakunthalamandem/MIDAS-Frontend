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
        backgroundColor: '#0A1929', // Darker background color
        padding: isMobile ? '10px 0' : '20px 0',
        color: '#FFEB3B', // Text color to match the brand accent
        textAlign: 'center',
        boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.3)', // Subtle top shadow for depth
      }}
    >
      <Typography
        variant={isMobile ? 'body1' : 'h6'}
        sx={{
          fontWeight: 'bold',
          color: '#FFEB3B', // Accent color for main text
        }}
      >
        Monashee Insights & Data Application System
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: '#B2DFDB', // Muted accent for secondary text
        }}
      >
        © 2024 MIDAS , Developed in Collobaration with Golden Hills Capital India Pvt Ltd.
      </Typography>
    </Box>
  );
};

export default FooterMain;
