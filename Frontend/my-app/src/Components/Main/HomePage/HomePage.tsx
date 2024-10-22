// HomePage.tsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import NavbarMain from '../../Navbar/NavBarMain';
import { Login } from '@mui/icons-material';
import SignUp from './Authentication/SignUp';
import CapitalMarkets from './Dashboard/CapitalMarkets';
import MonasheeDeals from './Dashboard/MonasheeDeals';
import Strategies from './Dashboard/Strategies';
import FooterMain from '../../Footer/FooterMain';

const HomePage: React.FC = () => {
  return (
    <>
      <NavbarMain />
      <Routes>
        <Route path="/capital-markets" element={<CapitalMarkets />} />
        <Route path="/monashee-deals" element={<MonasheeDeals />} />
        <Route path="/strategies" element={<Strategies />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
      <FooterMain />
    </>
  );
};

export default HomePage;
