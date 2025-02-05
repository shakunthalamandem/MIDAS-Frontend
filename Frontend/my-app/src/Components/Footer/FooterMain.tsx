import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import logo from '../../Assets/images/whitelogoghc.png';

const FooterMain: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        backgroundColor: '#2a2e39', // Darker background color
        padding: isMobile ? '10px 0' : '20px 0',
        color: '#FFFFFF',
        textAlign: 'center',
        boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Typography
        variant={isMobile ? 'body1' : 'h6'}
        sx={{
          fontWeight: 'bold',
          color: '#FFFFFF',
        }}
      >
        Monashee Insights & Data Application System
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: '#FFFFFF',
          }}
        >
          © {currentYear} MIDAS, Developed in Collaboration with Golden Hills Capital India Pvt Ltd.
        </Typography>
        <img
          src={logo}
          alt="GHC Logo"
          style={{
            width: '130px',
            height: '50px',
          }}
        />
      </Box>
      <Typography
          variant="body2"
          sx={{
            color: '#FFFFFF',
          }}
        >
Version 1.0       </Typography>
    </Box>
  );
};

export default FooterMain;
