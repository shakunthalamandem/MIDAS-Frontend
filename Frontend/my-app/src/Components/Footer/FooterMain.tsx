import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import logo from '../../Assets/images/GHC_Logo.png';


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
      <Box
  sx={{
    display: 'flex',
    alignItems: 'center', // Align items vertically center
    justifyContent: 'center', // Center items horizontally
    gap: '10px', // Add spacing between text and image
  }}
>
  <Typography
    variant="body2"
    sx={{
      color: '#B2DFDB', // Muted accent for secondary text
    }}
  >
    © 2024 MIDAS , Developed in Collaboration with Golden Hills Capital India Pvt Ltd.
  </Typography>
  <img
    src={logo} // Replace with the actual path to your logo
    alt="GHC Logo"
    style={{
      width: '60px',
      height: '30px',
    }}
  />
</Box>

    </Box>
  );
};

export default FooterMain;
