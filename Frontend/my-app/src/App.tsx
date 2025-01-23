import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouters from './Routes/AppRouters';
import NavbarMain from './Components/Navbar/NavBarMain';
import FooterMain from './Components/Footer/FooterMain';
import ScrollToTopButton from './Components/Main/HomePage/Authentication/ScrollToTopButton';
import Box from '@mui/material/Box';

const App: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh', // Ensures the page takes the full viewport height
      }}
    >
      <Router>
        <NavbarMain />
        <Box
          sx={{
            flex: 1, // Pushes the footer to the bottom when content is low
          }}
        >
          <AppRouters />
        </Box>
        <FooterMain />
        <ScrollToTopButton />
      </Router>
    </Box>
  );
};

export default App;
