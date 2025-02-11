import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
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
import Logout from "../Components/Main/HomePage/Authentication/Logout";
import SummaryPopup from "../Components/Main/HomePage/Authentication/SummaryPopup";
import AllocationCaptureReturn from "../Components/Main/MonasheeDeals/MddGraphs/AllocationCaptureReturn";
import DealStats from "../Components/Main/MonasheeDeals/MddGraphs/DealStats";
import FOllowOnDiscount from "../Components/Main/MonasheeDeals/MddGraphs/FOllowOnDiscount";
import MDDScreener from "../Components/Main/MonasheeDeals/MddGraphs/MDDScreener";
import MDDSelectedTicker from "../Components/Main/MonasheeDeals/MddGraphs/MDDSelectedTicker";

// Your tab components (example imports)


const AppRouters: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<CapitalMarketsStatic />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/summarypopup" element={<SummaryPopup />} />

        {/* Protected Routes */}
        <Route path="/capital-markets" element={<AuthGuard><CapitalMarkets /></AuthGuard>} />
        <Route path="/monashee-deals" element={<AuthGuard><MonasheeDeals /></AuthGuard>} />
        <Route path="/strategies" element={<AuthGuard><InvestmentMain /></AuthGuard>} />
        <Route path="/technical/:ticker" element={<AuthGuard><TechnicalMain /></AuthGuard>} />
        <Route path="/monasheeperformance/:ticker" element={<AuthGuard><MonasheeDeals /></AuthGuard>} />
        <Route path="/tickerperformance/:ticker" element={<AuthGuard><CapitalMarkets /></AuthGuard>} />



      

        <Route path="/error" element={<ErrorPage />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </ErrorBoundary>
  );
};



export default AppRouters;
