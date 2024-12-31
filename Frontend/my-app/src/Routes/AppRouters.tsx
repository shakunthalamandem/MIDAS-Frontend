// AppRouters.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignUp from '../Components/Main/HomePage/Authentication/SignUp';
import CapitalMarkets from '../Components/Main/HomePage/Dashboard/CapitalMarkets';
import MonasheeDeals from '../Components/Main/HomePage/Dashboard/MonasheeDeals';
import Login from '../Components/Main/HomePage/Authentication/Login';
import CapitalMarketsStatic from '../Components/HomepageStatic/CapitalMarketsStatic';
import InvestmentMain from '../Components/Main/InvestmentStrategy/InvestmentMain';
import TechnicalMain from '../Components/Main/InvestmentStrategy/TechnicalIndicators/TechnicalMain';


const AppRouters: React.FC = () => {
  return (
      <Routes>
        <Route path="/" element={<CapitalMarketsStatic />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/capital-markets" element={<CapitalMarkets />} />
        <Route path="/monashee-deals" element={<MonasheeDeals />} />
        <Route path="/strategies" element={<InvestmentMain />} />
        <Route path="/technicalanalysis" element={<TechnicalMain />} />


      </Routes>
  );
};

export default AppRouters;
