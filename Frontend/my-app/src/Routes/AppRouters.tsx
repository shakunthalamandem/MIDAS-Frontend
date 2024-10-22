// AppRouters.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignUp from '../Components/Main/HomePage/Authentication/SignUp';
import CapitalMarkets from '../Components/Main/HomePage/Dashboard/CapitalMarkets';
import MonasheeDeals from '../Components/Main/HomePage/Dashboard/MonasheeDeals';
import Strategies from '../Components/Main/HomePage/Dashboard/Strategies';
import Login from '../Components/Main/HomePage/Authentication/Login';


const AppRouters: React.FC = () => {
  return (
      <Routes>
        <Route path="/" element={<CapitalMarkets />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/capital-markets" element={<CapitalMarkets />} />
        <Route path="/monashee-deals" element={<MonasheeDeals />} />
        <Route path="/strategies" element={<Strategies />} />

      </Routes>
  );
};

export default AppRouters;
