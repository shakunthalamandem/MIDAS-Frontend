// NavbarMain.tsx
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Tabs, Tab, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const pages = ['Capital Markets', 'Monashee Deals', 'Strategies'];

const NavbarMain: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

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

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            fontSize: '24px',
            color: 'white',
            flexGrow: 1,
          }}
        >
          MIDAS
        </Typography>

        {isMobile ? (
          <>
            {/* Hamburger Menu for mobile */}
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
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
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          // Tabs for desktop view
          <Box sx={{ flexGrow: 2, display: 'flex', justifyContent: 'center' }}>
            <Tabs value={0} textColor="inherit" indicatorColor="secondary">
              {pages.map((page) => (
                <Tab
                  key={page}
                  label={page}
                  onClick={() => handleNavigate(page)}
                  sx={{ minWidth: 100, fontWeight: 'bold' }}
                />
              ))}
            </Tabs>
          </Box>
        )}

        {/* Login and Signup */}
        <Button sx={{ color: 'white', fontWeight: 'bold' }} onClick={() => navigate('/login')}>
          Login
        </Button>
        <Button
          sx={{
            color: 'white',
            fontWeight: 'bold',
            ml: 2,
            border: '1px solid white',
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
