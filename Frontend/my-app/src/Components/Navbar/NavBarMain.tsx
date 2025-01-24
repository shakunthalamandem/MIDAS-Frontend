import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Tabs, Tab, Button, Box } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation, Link } from 'react-router-dom';

// Import your logo
import logo from '../../Assets/images/Monashee-Cap-Logos.png';
import TradingViewTickerTape from '../Main/InvestmentStrategy/Tradingview/TradingViewTickerTape';

const pages = ['Equity Market Opportunity', 'Monashee Performance & Efficiency', 'PRIME Investment Strategies'];

const NavbarMain: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleNavigate = (page: string) => {
    if (page === 'Equity Market Opportunity') navigate('/capital-markets');
    if (page === 'Monashee Performance & Efficiency') navigate('/monashee-deals');
    if (page === 'PRIME Investment Strategies') navigate('/strategies');
    handleCloseNavMenu();
  };

  const getTabIndex = () => {
    switch (location.pathname) {
      case '/capital-markets':
        return 0;
      case '/monashee-deals':
        return 1;
      case '/strategies':
        return 2;
      default:
        return false;
    }
  };

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: '#FFFFFF', paddingX: { xs: 2, sm: 5 } }}>
        {/* Conditionally show TradingViewTickerTape only when on the 'Investment Strategies' page */}
        {(location.pathname === '/strategies' || location.pathname.startsWith('/technical/')) && (
          <Box sx={{ marginBottom: '50px' }}>
            <TradingViewTickerTape />
          </Box>
        )}

      

        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo and Title */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#FFFFFF' }}>
            <img src={logo} alt="MIDAS Logo" style={{ width: '130px', height: '60px', marginRight: '10px' }} />
          </Link>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Tabs
              value={getTabIndex()}
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#002060',
                  display: 'none', // Set the custom indicator color here
                },
              }}
            >
              {pages.map((page) => (
                <Tab
                  key={page}
                  label={page}
                  onClick={() => handleNavigate(page)}
                  sx={{
                    minWidth: 100,
                    fontWeight: 'bold',
                    fontSize: '16px',
                    color: '#bb4401', // Dark gray for unselected tabs
                    textTransform: 'none',
                    '&.Mui-selected': {
                      color: '#FFFFFF', // White text for the selected tab
                      backgroundColor: '#002060', // Deep maroon background for selected tab
                      borderRadius: '6px',
                    },
                    '&:hover': {
                      backgroundColor: '#002060', // Soft taupe for hover effect
                      borderRadius: '6px',
                      color: '#FFFFFF', // Deep maroon text for hover state
                    },
                  }}
                />
              ))}
            </Tabs>
          </Box>

          <Button
            sx={{
              color: '#FFFFFF',
              backgroundColor: '#002060',
              fontWeight: 'bold',
              fontFamily: 'Roboto, sans-serif',
              '&:hover': { backgroundColor: '#002060' },
            }}
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Button
            sx={{
              ml: 2,
              border: '1px solid #FFFFFF',
              color: '#FFFFFF',
              backgroundColor: '#002060',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#FFFFFF',
                color: '#002060',
              },
            }}
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </Button>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default NavbarMain;
