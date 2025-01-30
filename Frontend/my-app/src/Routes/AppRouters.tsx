import React from "react";
import { Routes, Route } from "react-router-dom";
import CapitalMarketsStatic from "../Components/HomepageStatic/CapitalMarketsStatic";
import Login from "../Components/Main/HomePage/Authentication/Login";
import SignUp from "../Components/Main/HomePage/Authentication/SignUp";
import CapitalMarkets from "../Components/Main/HomePage/Dashboard/CapitalMarkets";
import MonasheeDeals from "../Components/Main/HomePage/Dashboard/MonasheeDeals";
import InvestmentMain from "../Components/Main/InvestmentStrategy/InvestmentMain";
import TechnicalMain from "../Components/Main/InvestmentStrategy/TechnicalIndicators/TechnicalMain";
import ErrorPage from "../Pages/ErrorPage";
import EmailVerification from "../Components/Main/HomePage/Authentication/EmailVerification";
import ResetPassword from "../Components/Main/HomePage/Authentication/ResetPassword";
import ErrorBoundary from "../Pages/ErrorBoundary";
import AuthGuard from "./AuthGuard";

const AppRouters: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<CapitalMarketsStatic />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route path="/capital-markets" element={<AuthGuard><CapitalMarkets /></AuthGuard>} />
        <Route path="/monashee-deals" element={<AuthGuard><MonasheeDeals /></AuthGuard>} />
        <Route path="/strategies" element={<AuthGuard><InvestmentMain /></AuthGuard>} />
        <Route path="/technical/:ticker" element={<AuthGuard><TechnicalMain /></AuthGuard>} />

        <Route path="/error" element={<ErrorPage />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRouters;
