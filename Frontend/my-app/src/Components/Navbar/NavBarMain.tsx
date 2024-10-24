import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Tabs, Tab, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation, Link } from 'react-router-dom';

// Make sure to import your logo image
import logo from '../../Assets/images/logomidas.png'; // Adjust the path as necessary

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
    <AppBar position="static" sx={{ backgroundColor: '#d3d290' }}>
      <Toolbar>
        {/* Logo and Title */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#293c3d' }}>
          <img
            src={logo} // Make sure to adjust this path to your logo file
            alt="MIDAS Logo"
            style={{ width: '40px', height: '40px', marginRight: '10px' }} // Adjust the size as needed
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              fontSize: '24px',
              flexGrow: 1,
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            MIDAS
          </Typography>
        </Link>

        {isMobile ? (
          <>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="Open navigation menu"
              onClick={handleOpenNavMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={() => handleNavigate(page)}>
                  <Typography textAlign="center" sx={{ color: '#d3d290', fontFamily: 'Roboto, sans-serif' }}>
                    {page}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          <Box sx={{ flexGrow: 2, display: 'flex', justifyContent: 'center' }}>
            <Tabs value={getTabIndex()} textColor="inherit"  indicatorColor="secondary">
              {pages.map((page) => (
                <Tab
                  key={page}
                  label={page}
                  onClick={() => handleNavigate(page)}
                  sx={{
                    minWidth: 100,
                    fontWeight: 'bold',
                    color: '#293c3d',
                    '&.Mui-selected': {
                      color: '#293c3d',
                      backgroundColor: '#f0ffcc',
                      borderRadius: '4px',
                    },
                    '&:hover': {
                      backgroundColor: '#f0ffcc',
                      borderRadius: '4px',
                    },
                  }}
                />
              ))}
            </Tabs>
          </Box>
        )}

        <Button sx={{ color: '#293c3d', fontWeight: 'bold', fontFamily: 'Roboto, sans-serif' }} onClick={() => navigate('/login')}>
          Login
        </Button>
        <Button
          sx={{
            color: '#293c3d',
            fontWeight: 'bold',
            ml: 2,
            border: '1px solid #293c3d',
            '&:hover': {
              backgroundColor: '#293c3d',
              color: '#d3d290',
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
