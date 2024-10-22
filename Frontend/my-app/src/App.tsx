// App.tsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouters from './Routes/AppRouters';
import NavbarMain from './Components/Navbar/NavBarMain';
import FooterMain from './Components/Footer/FooterMain';
import ScrollToTopButton from './Components/Main/HomePage/Authentication/ScrollToTopButton';



const App: React.FC = () => {

  return (
      <Router>
          <NavbarMain />
          <div style={{ paddingTop: '100px' }}> </div>
          <AppRouters />
          <FooterMain />
          <ScrollToTopButton />
      </Router>
  );
};


export default App;
