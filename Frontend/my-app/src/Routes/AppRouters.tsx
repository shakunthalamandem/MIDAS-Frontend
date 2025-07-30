import React from "react";
import { Routes, Route, Navigate, } from "react-router-dom";
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

import Logs from "../Components/Main/HomePage/Authentication/Logs";
import DealStats from "../Components/Main/MonasheeDeals/MddGraphs/DealStats";
import FOllowOnDiscount from "../Components/Main/MonasheeDeals/MddGraphs/FOllowOnDiscount";
import MDDScreener from "../Components/Main/MonasheeDeals/MddGraphs/MDDScreener";
import AllocationCaptureReturn from "../Components/Main/MonasheeDeals/MddGraphs/AllocationCaptureReturn";
import BankTable from "../Components/Main/MonasheeDeals/MDDSettings/BankTable";
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



import MainUpload from "../Components/Uploads/MainUpload";
import FundamentalsTechnical from "../Components/Uploads/FundamentalsTechnical";
import MlEquityMain from "../Components/DealsForm/MachineLearningModels/MlEquityMain";


import LandingPageMain from "../Components/Main/DashBoards/LandingPageMain";
import DailyReportPost from "../Components/Main/WriteUpsRecords/DailyReportPost";
import IntelligenceDashboard from "../Components/Main/DashBoards/IntelligenceDashboard";
import WriteUpdashboardMain from "../Components/Main/WriteUpsRecords/WriteUpdashboardMain";
import PageUnderDevelopment from "../Pages/PageUnderDevelopment";
import CombinedSelectedTicker from "../Components/Main/MonasheeGraphs/CombinedSelectedTicker";
import MarketOpportnuityMain from "../Components/Main/HomePage/Dashboard/MarketOpportnuityMain";
import WeeklyMain from "../Components/Main/MonasheeDeals/MDDSettings/WeeklyMain";
import IPODashboardMain from "../Components/IPODashboardLLM/IPODashboardMain";
import DeatiledRegionPnlAttribution from "../Components/PNLAttribution/DeatiledRegionPnlAttribution";
import EquityNewDealFormMain from "../Components/EquityNewDealFormMain/EquityNewDealFormMain";
import LkFileUpload from "../Components/Uploads/LkFileUpload";
import DetailedDealsView from "../Components/Main/MonasheeGraphs/ScreenerTable/DetailedDealsView";
import DetailedLeadBankView from "../Components/Main/MonasheeGraphs/ScreenerTable/DetailedLeadBankView";
import PNLTabMain from "../Components/PNLAttribution/PNLTabMain";
import DetailedRegionView from "../Components/Main/MonasheeGraphs/ScreenerTable/DetailedRegionView";
import UploadAiInsights from "../Components/Main/DashBoards/InsightsAi/UploadsInsights/UploadAiInsights";
import VersionUploadForm from "../Components/Uploads/DailyMonasheeUploads/VersionUploadForm";
import DealDetailedGapAnalysis from "../Components/Main/DealDetailedGapAnalysis";
import GHCAIMain from "../Components/GhcAi/GHCAIMain";
import PerplexityChatMain from "../Components/GhcAi/PerplexityChatMain";
import HeatMapMain from "../Components/GhcAi/AIPages/HeatMap/HeatMapMain";











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


        <Route path="/machine_learning/equity" element={<AuthGuard><MlEquityMain /></AuthGuard>} />





        <Route path="/opportunity/equity" element={<AuthGuard><MarketOpportnuityMain /></AuthGuard>} >
          <Route path="search" element={<CombinedSelectedTicker ticker={'AS'} />} />
          <Route path="deal-stats" element={<MarketFilters />} />
          <Route path="skew-table" element={<SkewTableMain />} />
          <Route path="deal-filter" element={<ScreenerMain />} />
          <Route path="mdd_deal_stats" element={<DealStats />} />
          <Route path="weekly-tracking" element={<WeeklyMain />} />
          <Route path="gap-analysis" element={<AllocationCaptureReturn />} />
        </Route>

        <Route path="/opportunity/high-yield" element={<AuthGuard><HighYieldsMain /></AuthGuard>} >
          <Route path="search" element={<HighYieldsMain/>} />
          <Route path="deal-stats" element={<DealStatsMain />} />
          <Route path="skew-table" element={<HYSkewTableMain />} />
        </Route>


        <Route path="/opportunity/converts" element={<AuthGuard><ConvertsMain /></AuthGuard>} >
          <Route path="search" element={<ConvertsMain/>} />
          <Route path="deal-stats" element={<ConvertsDealStatsMain />} />
          <Route path="skew-table" element={<ConvertsSkewMain />} />
        </Route>




        <Route path="/equity/monashee-deals" element={<AuthGuard><MonasheeDeals /></AuthGuard>}>
          <Route path="search" element={<MDDSelectedTicker ticker={'CGRX'}/>} />
          <Route path="mdd_deal_stats" element={<DealStats />} />
          <Route path="gap-analysis" element={<AllocationCaptureReturn />} />
          <Route path="follow-on-discount" element={<FOllowOnDiscount />} />
          <Route path="weekly-tracking" element={<WeeklyMain />} />
          <Route path="by-bank" element={<BankTable selectedFilters={{}} />} />
          <Route path="screener" element={<MDDScreener />} />
        </Route>



        <Route path="/portfolio-attribution" element={<Navigate to="/portfolio-attribution/summary_pnl" />} />
        <Route path="/portfolio-attribution/:tab" element={<AuthGuard><PNLTabMain /></AuthGuard>} />
        <Route path="/portfolio-attribution/details/:assetType" element={<AuthGuard><DeatiledRegionPnlAttribution /></AuthGuard>}/>
    


        <Route path="/equity/monashee-deals" element={<AuthGuard><MonasheeDeals /></AuthGuard>} />
        <Route path="/macro/prime" element={<AuthGuard><InvestmentMain /></AuthGuard>} />
        <Route path="/equity/technical/:ticker" element={<AuthGuard><TechnicalMain /></AuthGuard>} />
        <Route path="/opportunity/equity/:ticker" element={<AuthGuard><MarketOpportnuityMain /></AuthGuard>} />
        <Route path="/equity/tickerperformance/:ticker" element={<AuthGuard><CapitalMarkets /></AuthGuard>} />
        <Route path="/equity/portfolio-attribution/fund/:fund" element={<AuthGuard><FundWiseTable /></AuthGuard>} />

        <Route path="/equity/detailed_gap_analysis" element={<AuthGuard><DetailedGapData /></AuthGuard>} />



        <Route path="/highyield/dealperformance/:deal" element={<AuthGuard><HighYieldsMain /></AuthGuard>} />
        <Route path="/converts/dealperformance/:deal" element={<AuthGuard><ConvertsMain /></AuthGuard>} />


        <Route path="/deals/new_deal_form" element={<AuthGuard><EquityNewDealFormMain /></AuthGuard>} />



        <Route path="/macro/sector" element={<AuthGuard><MacroMain /></AuthGuard>} />
        <Route path="/macro/news-summary" element={<AuthGuard><News /></AuthGuard>} />



        <Route path="/uploads" element={<AuthGuard><MainUpload /></AuthGuard>} />
        <Route path="/lk_upload" element={<AuthGuard><LkFileUpload /></AuthGuard>} />
        {/* <Route path="/upload" element={<AuthGuard><UploadMarketIndices/></AuthGuard>} /> */}
        <Route path="/data_upload" element={<AuthGuard><FundamentalsTechnical/></AuthGuard>} />
        <Route path="/ai_upload" element={<AuthGuard><UploadAiInsights /></AuthGuard>} />


  


<Route
  path="/equity/ipo_dashboard"
  element={
    <AuthGuard>
      <IPODashboardMain />
    </AuthGuard>
  }
/>






        <Route path="/error" element={<ErrorPage />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/machine_learning/converts" element={<PageUnderDevelopment />} />
        <Route path="/converts/portfolio-attribution" element={<PageUnderDevelopment />} />

        <Route path="/machine_learning/high-yield" element={<PageUnderDevelopment />} />

        <Route path="/highyield/portfolio-attribution" element={<PageUnderDevelopment />} />





        <Route path="/opportunity/summary" element={<AuthGuard><LandingPageMain/></AuthGuard>} />
        <Route path="/deals/dashboard" element={<AuthGuard><IntelligenceDashboard/></AuthGuard>} />



        <Route path="/reportdata" element={<AuthGuard><DailyReportPost/></AuthGuard>} />
        <Route path="/data-analytics/writeups" element={<AuthGuard><WriteUpdashboardMain /></AuthGuard>} />

        <Route path="/heatmap" element={<AuthGuard><HeatMapMain /></AuthGuard>} />
        <Route path="/gen_ai_tool" element={<AuthGuard><PerplexityChatMain /></AuthGuard>} />

        <Route path="/gapreport" element={<AuthGuard><DealDetailedGapAnalysis/></AuthGuard>} />

        


        

        <Route path="/detailed-deals" element={<AuthGuard><DetailedDealsView /></AuthGuard>} />
        <Route path="/detailed-banks" element={<AuthGuard><DetailedLeadBankView /></AuthGuard>} />
        <Route path="/detailed-region" element={<AuthGuard><DetailedRegionView /></AuthGuard>} />
        <Route path="/version" element={<AuthGuard><VersionUploadForm /></AuthGuard>} />
      </Routes>
    </ErrorBoundary>
    
  );
  
};




export default AppRouters;
