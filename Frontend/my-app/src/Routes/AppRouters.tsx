// AppRouters.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import SignUp from "../Components/Main/HomePage/Authentication/SignUp";
import CapitalMarkets from "../Components/Main/HomePage/Dashboard/CapitalMarkets";
import MonasheeDeals from "../Components/Main/HomePage/Dashboard/MonasheeDeals";
import Login from "../Components/Main/HomePage/Authentication/Login";
import CapitalMarketsStatic from "../Components/HomepageStatic/CapitalMarketsStatic";
import InvestmentMain from "../Components/Main/InvestmentStrategy/InvestmentMain";
import TechnicalMain from "../Components/Main/InvestmentStrategy/TechnicalIndicators/TechnicalMain";
import ErrorPage from "../Pages/ErrorPage";
import ErrorBoundary from "../Pages/ErrorBoundary";
import SummaryPopup from "../Components/Main/HomePage/Authentication/SummaryPopup";

const AppRouters: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<CapitalMarketsStatic />} />
        <Route path="/dashboard" element={<CapitalMarketsStatic />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/summarypopup" element={<SummaryPopup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/capital-markets" element={<CapitalMarkets />} />
        <Route path="/monashee-deals" element={<MonasheeDeals />} />
        <Route path="/strategies" element={<InvestmentMain />} />
        <Route path="/technical/:ticker" element={<TechnicalMain />} />
        <Route path="/error" element={<ErrorPage />} />
        {/* <Route path="*" element={<Navigate to="/error" state={{ message: 'Page not found' }} />} /> */}
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRouters;
