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
import SummaryPopup from "../Components/Main/HomePage/Authentication/SummaryPopup";
import DetailedGapData from "../Components/Main/MonasheeDeals/MDDSettings/DetailedGapData";
import DealFormMain from "../Components/DealsForm/DealFormMain";

import Logs from "../Components/Main/HomePage/Authentication/Logs";
import DealStats from "../Components/Main/MonasheeDeals/MddGraphs/DealStats";
import WeeklyStatsChart from "../Components/Main/MonasheeDeals/MDDSettings/WeeklyStatsChart";
import FOllowOnDiscount from "../Components/Main/MonasheeDeals/MddGraphs/FOllowOnDiscount";
import MDDScreener from "../Components/Main/MonasheeDeals/MddGraphs/MDDScreener";
import AllocationCaptureReturn from "../Components/Main/MonasheeDeals/MddGraphs/AllocationCaptureReturn";
import PortfolioAttribution from "../Components/Main/PortfolioAttribution/PortfolioAttribution";
import BankTable from "../Components/Main/MonasheeDeals/MDDSettings/BankTable";
import SelectedTicker from "../Components/Main/MonasheeGraphs/SelectedTicker";
import FundWiseTable from "../Components/Main/PortfolioAttribution/FundwiseTable";
import HighYieldsMain from "../Components/HighYields/HighYieldsMain";
import DealStatsMain from "../Components/HighYields/Tabs/DealStatsMain";
import HYSkewTableMain from "../Components/HighYields/Tabs/HYSkewTableMain";
import MDDSelectedTicker from "../Components/Main/MonasheeDeals/MddGraphs/MDDSelectedTicker";
import MarketFilters from "../Components/Main/MonasheeCapitalMarkets/MarketFilters";
import ScreenerMain from "../Components/Main/MonasheeGraphs/ScreenerTable/ScreenerMain";
import SkewTableMain from "../Components/Main/MonasheeGraphs/SkewTableMain";
import MacroMain from "../Components/Macro/MacroMain";
import News from "../Components/Macro/News";
import ConvertsMain from "../Components/Converts/ConvertsMain";
import ConvertsDealStatsMain from "../Components/Converts/Tabs/ConvertsDealStatsMain";
import ConvertsSkewMain from "../Components/Converts/Tabs/ConvertsSkewMain";
import UploadMarketIndices from "../Components/Macro/UploadMarketindeces";


import MonasheDataDump from "../Components/Uploads/MonasheDataDump";

import MainUpload from "../Components/Uploads/MainUpload";







const AppRouters: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<CapitalMarketsStatic />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        {/* <Route path="/logout" element={<Logout />} /> */}
        <Route path="/summarypopup" element={<SummaryPopup />} />
        <Route path="/user_log" element={<Logs />} />
        <Route path="/equity/issue_market" element={<AuthGuard><DealFormMain /></AuthGuard>} />




        <Route path="/equity/capital-markets" element={<AuthGuard><CapitalMarkets /></AuthGuard>} >
          <Route path="search" element={<SelectedTicker ticker={'AS'}/>} />
          <Route path="deal-stats" element={<MarketFilters />} />
          <Route path="skew-table" element={<SkewTableMain />} />
          <Route path="deal-filter" element={<ScreenerMain />} />
        </Route>

        <Route path="/highyield/capital-markets" element={<AuthGuard><HighYieldsMain /></AuthGuard>} >
          <Route path="search" element={<HighYieldsMain/>} />
          <Route path="deal-stats" element={<DealStatsMain />} />
          <Route path="skew-table" element={<HYSkewTableMain />} />
        </Route>


        <Route path="/converts/capital-markets" element={<AuthGuard><ConvertsMain /></AuthGuard>} >
          <Route path="search" element={<ConvertsMain/>} />
          <Route path="deal-stats" element={<ConvertsDealStatsMain />} />
          <Route path="skew-table" element={<ConvertsSkewMain />} />
        </Route>




        <Route path="/equity/monashee-deals" element={<AuthGuard><MonasheeDeals /></AuthGuard>}>
          <Route path="search" element={<MDDSelectedTicker ticker={'CGRX'}/>} />
          <Route path="deal-stats" element={<DealStats />} />
          <Route path="gap-analysis" element={<AllocationCaptureReturn />} />
          <Route path="follow-on-discount" element={<FOllowOnDiscount />} />
          <Route path="weekly-tracking" element={<WeeklyStatsChart />} />
          <Route path="by-bank" element={<BankTable selectedFilters={{}} />} />
          <Route path="screener" element={<MDDScreener />} />
        </Route>



        <Route path="/equity/portfolio-attribution" element={<AuthGuard><PortfolioAttribution /></AuthGuard>} />
        <Route path="/equity/monashee-deals" element={<AuthGuard><MonasheeDeals /></AuthGuard>} />
        <Route path="/equity/strategies" element={<AuthGuard><InvestmentMain /></AuthGuard>} />
        <Route path="/equity/technical/:ticker" element={<AuthGuard><TechnicalMain /></AuthGuard>} />
        <Route path="/equity/monasheeperformance/:ticker" element={<AuthGuard><MonasheeDeals /></AuthGuard>} />
        <Route path="/equity/tickerperformance/:ticker" element={<AuthGuard><CapitalMarkets /></AuthGuard>} />
        <Route path="/equity/portfolio-attribution/fund/:fund" element={<AuthGuard><FundWiseTable /></AuthGuard>} />

        <Route path="/equity/detailed_gap_analysis" element={<AuthGuard><DetailedGapData /></AuthGuard>} />



        <Route path="/highyield/dealperformance/:deal" element={<AuthGuard><HighYieldsMain /></AuthGuard>} />
        <Route path="/converts/dealperformance/:deal" element={<AuthGuard><ConvertsMain /></AuthGuard>} />





        <Route path="/macro/sector" element={<AuthGuard><MacroMain /></AuthGuard>} />
        <Route path="/upload" element={<AuthGuard><UploadMarketIndices/></AuthGuard>} />
        <Route path="/macro/news" element={<AuthGuard><News /></AuthGuard>} />



        <Route path="/mdd_upload" element={<AuthGuard><MainUpload /></AuthGuard>} />
        <Route path="/upload" element={<AuthGuard><UploadMarketIndices/></AuthGuard>} />




        <Route path="/error" element={<ErrorPage />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </ErrorBoundary>
  );
};



export default AppRouters;
