import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Tabs, Tab, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation, Link } from 'react-router-dom';

// Import your logo
import logo from '../../Assets/images/monashee_logo.png';

const pages = ['Capital Markets', 'Monashee Deals', 'Strategies'];

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
    if (page === 'Capital Markets') navigate('/capital-markets');
    if (page === 'Monashee Deals') navigate('/monashee-deals');
    if (page === 'Strategies') navigate('/strategies');
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
    <AppBar position="static" sx={{ backgroundColor: '#001E3C', paddingX: { xs: 2, sm: 5 } }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo and Title */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#FFFFFF' }}>
          <img src={logo} alt="MIDAS Logo" style={{ width: '130px', height: '60px', marginRight: '10px' }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              fontSize: '24px',
              flexGrow: 1,
              fontFamily: 'Roboto, sans-serif',
              color: '#FFFFFF',
            }}
          >
            MIDAS
          </Typography>
        </Link>

        {isMobile ? (
          <>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleOpenNavMenu}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => handleNavigate(page)}>
                  <Typography textAlign="center" sx={{ color: '#001E3C', fontWeight: 'bold' }}>
                    {page}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Tabs
              value={getTabIndex()}
              textColor="inherit"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#FFEB3B', // Set the custom indicator color here
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
                    color: '#B2DFDB',
                    textTransform: 'none',
                    '&.Mui-selected': {
                      color: '#FFEB3B',
                      backgroundColor: '#0A1929',
                      borderRadius: '4px',
                    },
                    '&:hover': {
                      backgroundColor: '#0A1929',
                      borderRadius: '4px',
                      color: '#FFEB3B',
                    },
                  }}
                />
              ))}
            </Tabs>

          </Box>
        )}

        <Button
          sx={{
            color: '#FFEB3B',
            fontWeight: 'bold',
            fontFamily: 'Roboto, sans-serif',
            '&:hover': { backgroundColor: '#0A1929' },
          }}
          onClick={() => navigate('/login')}
        >
          Login
        </Button>
        <Button
          sx={{
            ml: 2,
            border: '1px solid #FFEB3B',
            color: '#FFEB3B',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#FFEB3B',
              color: '#001E3C',
            },
          }}
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default NavbarMain;
