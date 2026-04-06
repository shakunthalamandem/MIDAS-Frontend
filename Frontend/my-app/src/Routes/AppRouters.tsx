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
import StockTickerNews from "../Components/Macro/StockTickerNews";
import ConvertsMain from "../Components/Converts/ConvertsMain";
import ConvertsDealStatsMain from "../Components/Converts/Tabs/ConvertsDealStatsMain";
import ConvertsSkewMain from "../Components/Converts/Tabs/ConvertsSkewMain";



import MainUpload from "../Components/Uploads/MainUpload";
import FundamentalsTechnical from "../Components/Uploads/FundamentalsTechnical";


import LandingPageMain from "../Components/Main/DashBoards/LandingPageMain";
import DailyReportPost from "../Components/Main/WriteUpsRecords/DailyReportPost";
import ReportWriteUpMain from "../Components/Main/WriteUpsRecords/ReportWriteUpMain";
import PageUnderDevelopment from "../Pages/PageUnderDevelopment";
import CombinedSelectedTicker from "../Components/Main/MonasheeGraphs/CombinedSelectedTicker";
import MarketOpportnuityMain from "../Components/Main/HomePage/Dashboard/MarketOpportnuityMain";
import WeeklyMain from "../Components/Main/MonasheeDeals/MDDSettings/WeeklyMain";
import DeatiledRegionPnlAttribution from "../Components/PNLAttribution/DeatiledRegionPnlAttribution";
import EquityNewDealFormMain from "../Components/EquityNewDealFormMain/EquityNewDealFormMain";
import LkFileUpload from "../Components/Uploads/LkFileUpload";
import DetailedDealsView from "../Components/Main/MonasheeGraphs/ScreenerTable/DetailedDealsView";
import DetailedLeadBankView from "../Components/Main/MonasheeGraphs/ScreenerTable/DetailedLeadBankView";
import PNLTabMain from "../Components/PNLAttribution/PNLTabMain";
import DetailedRegionView from "../Components/Main/MonasheeGraphs/ScreenerTable/DetailedRegionView";
import UploadAiInsights from "../Components/Main/DashBoards/InsightsAi/UploadsInsights/UploadAiInsights";
import VersionUploadForm from "../Components/Uploads/DailyMonasheeUploads/VersionUploadForm";
import Agents from "../Components/Agents/Agents";
import AgentOutputView from "../Components/Agents/AgentOutputView";
import DealDetailedGapAnalysis from "../Components/Main/DealDetailedGapAnalysis";
import PerplexityChatMain from "../Components/GhcAi/PerplexityChatMain";
import HeatMapMain from "../Components/GhcAi/AIPages/HeatMap/HeatMapMain";
import EquityDealsIPOFO from "../Components/Main/DashBoards/EquityDealsIPOFO";
import ExportUnifiedDealData from "../Components/Main/UnifiedDealsDataMain/ExportUnifiedDealData";
import UnifiedDealDataUpload from "../Components/Main/UnifiedDealsDataMain/DesignUiPath/UnifiedDealDataUpload";
import TickerDashboard from "../Components/DealTracking/TickerDashboard";
import UploadsWriteUpMain from "../Components/Main/WriteUpsRecords/UploadsWriteUpMain";
import NewDealsCycleMain from "../Components/Main/NewDealsLifeCycle/NewDealsCycleMain";
import TickerTrackingWrapper from "../Components/DealTracking/TickerTrackingWrapper";
import FOWriteUpMain from "../Components/Main/FOWriteUpMain/FOWriteUpMain";
import FOFinancialForecastUpload from "../Components/Main/FOWriteUpMain/FOWriteUpUploads/FOFinancialForecastUpload";
import DealsTabsLayout from "../Components/Main/UnifiedDealsDataMain/DesignUiPath/DealsTabsLayout";
import EquityAiMlPage from "../Components/AIML/EquityAiMlPage";
import NewDashboardLifeCycleDetails from "../Components/NewDashboardLifeCycle/NewDashboardLifeCycleDetails";

import WriteUpIPODashbaord from "../Components/IPOwriteUp/IPOWriteUpDashboard/WriteUpIPODashbaord";
import UploadFactSetTickers from "../Components/Uploads/DailyMonasheeUploads/UploadFactSetTickers";
import FSDealUnifiedMain from "../Components/Main/UnifiedDealsDataMain/DesignUiPath/FactsetDataDetails/FSDealUnifiedMain";
import DeleteUnifiedDealData from "../Components/Main/UnifiedDealsDataMain/DeleteUnifiedDealData";
import DailyNoteDeleteTickersData from "../Components/Uploads/DailyNoteDeleteTickersData";
import IPOUploadsPage from "../Components/IPOwriteUp/IPOUploadsPage";
import ExcelUploads from "../Components/UpcomingPipelineDeals/ExcelUploads";
import ABBModelMain from "../Components/ABBModelMain/ABBModelMain";
import AIMLResultsHome from "../Components/AIMLResults/AIMLResultsHome";
import MattermostChat from "../Components/Discussion/MattermostChat";
import MDRMainTableS3Data from "../Components/MDRMainS3Data/MDRMainTableS3Data";
import SentimentAnalysisTabs from "../Components/AIML/SentimentAnalysisTabs";
import FewShotAnalysisUpload from "../Components/AIFewshotAnalysis/FewShotAnalysisUpload";
import AIFewshotAnalysis from "../Components/AIFewshotAnalysis/AIFewshotAnalysis";
import ShowUSSentimentAnalysis from "../Components/AIML/ShowUSSentimentAnalysis";
import NotesUI from "../Components/mattermostupload/NotesUI";
import APACEquityAiMlPage from "../Components/AIML/APACEquityAIMLPage";
import DealMeetingNotesMain from "../Components/Main/DealMeetingNotes/DealMeetingNotesMain";
import NewDashboardLifeCycleMain from "../Components/NewDashboardLifeCycle/NewDashboardLifeCycleMain";
import FuturePipelineDealsMain from "../Components/UpcomingPipelineDeals/FuturePipelineDealsMain";
import TickerChange from "../Components/TickerChange/TickerChange";
import NewDashboardFOLifeCycleDetails from "../Components/NewDashboardLifeCycle/NewDashboardFOLifeCycleDetails";
import SignalBoardMain from "../Components/SignalBoard/SignalBoardMain";
import PNLAttributionSectionMain from "../Components/NewPNLAttributionRiskReport/PNLAttributionSectionMain";
import NewPortfolioRiskUpload from "../Components/Uploads/NewPortfolioRiskUpload";
import RiskDashboard from "../Components/NewPNLAttributionRiskReport/PNLAttributionData/RiskDashboard";
import TickerDetail from "../Components/NewPNLAttributionRiskReport/PNLAttributionData/TickerDetail";
import RiskTriggers from "../Components/NewPNLAttributionRiskReport/PNLAttributionData/RiskTriggers";
import PortfolioReportDocumentMain from "../Components/NewPNLAttributionRiskReport/RiskReportNew/PortfolioReportDocumentMain";
import RiskAIDocumentUpload from "../Components/NewPNLAttributionRiskReport/RiskReportNew/RiskAIDocumentUpload";
import DocumentUploadTabs from "../Components/NewPNLAttributionRiskReport/RiskReportNew/DocumentUploadTabs";
import AIPortfolioReview from "../Components/NewPNLAttributionRiskReport/RiskReportNew/AIPortfolioReview";
import JayRitterIPOAnalysis from "../Components/JayRitter/JayRitterIPOAnalysis";
import SentimentSummary from "../Components/AIML/SentimentSummary";
import UnsupervisedDealSummary from "../Components/AIML/UnsupervisedDealSummary";
import PortfolioSummaryTabs from "../Components/IPODashboardLLM/PortfolioSummaryTabs";
import UploadClaudeSentiment from "../Components/AIML/UploadClaudeSentiment";
import S3DataTransfer from "../Components/S3DataTransfer/S3DataTransfer";
import DataDump from "../Components/DataDump/DataDump";


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

        <Route path="/equity/ai_ml_models" element={<AuthGuard><EquityAiMlPage /></AuthGuard>} />
        <Route path='/equity/apac_ai_ml_models' element={<AuthGuard><APACEquityAiMlPage /></AuthGuard>} />
        <Route path="/equity/ai_ml_results" element={<AuthGuard><AIMLResultsHome /></AuthGuard>} />




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
          <Route path="search" element={<HighYieldsMain />} />
          <Route path="deal-stats" element={<DealStatsMain />} />
          <Route path="skew-table" element={<HYSkewTableMain />} />
        </Route>


        <Route path="/opportunity/converts" element={<AuthGuard><ConvertsMain /></AuthGuard>} >
          <Route path="search" element={<ConvertsMain />} />
          <Route path="deal-stats" element={<ConvertsDealStatsMain />} />
          <Route path="skew-table" element={<ConvertsSkewMain />} />
        </Route>




        <Route path="/equity/monashee-deals" element={<AuthGuard><MonasheeDeals /></AuthGuard>}>
          <Route path="search" element={<MDDSelectedTicker ticker={'CGRX'} />} />
          <Route path="mdd_deal_stats" element={<DealStats />} />
          <Route path="gap-analysis" element={<AllocationCaptureReturn />} />
          <Route path="follow-on-discount" element={<FOllowOnDiscount />} />
          <Route path="weekly-tracking" element={<WeeklyMain />} />
          <Route path="by-bank" element={<BankTable selectedFilters={{}} />} />
          <Route path="screener" element={<MDDScreener />} />
        </Route>



        <Route path="/portfolio-attribution" element={<Navigate to="/portfolio-attribution/summary_pnl" />} />
        <Route path="/portfolio-attribution/:tab" element={<AuthGuard><PNLTabMain /></AuthGuard>} />
        <Route path="/portfolio-attribution/details/:assetType" element={<AuthGuard><DeatiledRegionPnlAttribution /></AuthGuard>} />

        <Route path="/macro/prime" element={<AuthGuard><InvestmentMain /></AuthGuard>} />
        <Route path="/equity/technical/:ticker" element={<AuthGuard><TechnicalMain /></AuthGuard>} />
        <Route path="/opportunity/equity/:ticker" element={<AuthGuard><MarketOpportnuityMain /></AuthGuard>} />
        <Route path="/equity/tickerperformance/:ticker" element={<AuthGuard><CapitalMarkets /></AuthGuard>} />
        <Route path="/equity/portfolio-attribution/fund/:fund" element={<AuthGuard><FundWiseTable /></AuthGuard>} />

        <Route path="/equity/detailed_gap_analysis" element={<AuthGuard><DetailedGapData /></AuthGuard>} />



        <Route path="/highyield/dealperformance/:deal" element={<AuthGuard><HighYieldsMain /></AuthGuard>} />
        <Route path="/converts/dealperformance/:deal" element={<AuthGuard><ConvertsMain /></AuthGuard>} />


        <Route path="/deals/new_deal_form" element={<AuthGuard><EquityNewDealFormMain /></AuthGuard>} />
        <Route path="/deals/deal_Tracking" element={<AuthGuard><TickerDashboard /></AuthGuard>} />


        <Route path="/macro/sector" element={<AuthGuard><MacroMain /></AuthGuard>} />
        <Route path="/macro/news-summary" element={<AuthGuard><StockTickerNews /></AuthGuard>} />



        <Route path="/uploads" element={<AuthGuard><MainUpload /></AuthGuard>} />
        <Route path="/ipouploads" element={<AuthGuard><IPOUploadsPage /></AuthGuard>} />
        <Route path="/lk_upload" element={<AuthGuard><LkFileUpload /></AuthGuard>} />
        {/* <Route path="/upload" element={<AuthGuard><UploadMarketIndices/></AuthGuard>} /> */}
        <Route path="/fs_upload" element={<AuthGuard><UploadFactSetTickers /></AuthGuard>} />
        <Route path="/data_upload" element={<AuthGuard><FundamentalsTechnical /></AuthGuard>} />
        <Route path="/upcoming" element={<AuthGuard><ExcelUploads /></AuthGuard>} />
        <Route path="/ai_upload" element={<AuthGuard><UploadAiInsights /></AuthGuard>} />
        <Route
          element={
            <AuthGuard>
              <DealsTabsLayout />
            </AuthGuard>
          }
        >
          <Route path="/new_deal_data_upload" element={<Navigate to="/download_deals_data" replace />} />
          <Route path="/download_deals_data" element={<ExportUnifiedDealData />} />
          <Route path="/delete_new_deal_data" element={<DeleteUnifiedDealData />} />
          <Route path="/deal_data_upload" element={<UnifiedDealDataUpload />} />
        </Route>
        <Route path="/equity/ipo_dashboard" element={<AuthGuard><WriteUpIPODashbaord /></AuthGuard>} />

        <Route path="/equity/ipo_dashboard/:ticker" element={<AuthGuard><WriteUpIPODashbaord /></AuthGuard>} />




        <Route path="/error" element={<ErrorPage />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/machine_learning/converts" element={<PageUnderDevelopment />} />
        <Route path="/converts/portfolio-attribution" element={<PageUnderDevelopment />} />

        <Route path="/machine_learning/high-yield" element={<PageUnderDevelopment />} />

        <Route path="/highyield/portfolio-attribution" element={<PageUnderDevelopment />} />





        <Route path="/opportunity/summary" element={<AuthGuard><LandingPageMain /></AuthGuard>} />
        <Route path="/opportunity/pastdeals" element={<AuthGuard><EquityDealsIPOFO /></AuthGuard>} />
        <Route path="/opportunity/monashee_daily_report" element={<AuthGuard><MDRMainTableS3Data /></AuthGuard>} />

        <Route path="/deals/dashboard" element={<AuthGuard><NewDealsCycleMain /></AuthGuard>} />
        <Route path="/deals/dashboard/Tracking" element={<AuthGuard><TickerTrackingWrapper /></AuthGuard>} />
        <Route path="/deals/new_dashboard/details" element={<AuthGuard><NewDashboardLifeCycleDetails /></AuthGuard>} />
        <Route path="/deals/new_dashboard/fo_details" element={<AuthGuard><NewDashboardFOLifeCycleDetails /></AuthGuard>} />




        <Route path="/reportdata" element={<AuthGuard><DailyReportPost /></AuthGuard>} />
        <Route path="/data-analytics/writeups" element={<AuthGuard><ReportWriteUpMain /></AuthGuard>} />

        <Route path="/gen_ai_tool" element={<AuthGuard><PerplexityChatMain /></AuthGuard>} />

        <Route path="/gapreport" element={<AuthGuard><DealDetailedGapAnalysis /></AuthGuard>} />
        <Route path="/genai_data_set" element={<AuthGuard><HeatMapMain /></AuthGuard>} />








        <Route path="/detailed-deals" element={<AuthGuard><DetailedDealsView /></AuthGuard>} />
        <Route path="/detailed-banks" element={<AuthGuard><DetailedLeadBankView /></AuthGuard>} />
        <Route path="/detailed-region" element={<AuthGuard><DetailedRegionView /></AuthGuard>} />
        <Route path="/version" element={<AuthGuard><VersionUploadForm /></AuthGuard>} />






        <Route path="/pdf_upload" element={<AuthGuard><UploadsWriteUpMain /></AuthGuard>} />

        {/* FO Write Up Routes */}

        <Route path="/equity/fo_dashboard" element={<AuthGuard><FOWriteUpMain /></AuthGuard>} />
        <Route path="/equity/fo_dashboard/:ticker" element={<AuthGuard><FOWriteUpMain /></AuthGuard>} />
        <Route path="/fo_financial_forecasts_upload" element={<AuthGuard><FOFinancialForecastUpload /></AuthGuard>} />



        <Route path="/fs_new_deal_data" element={<AuthGuard><FSDealUnifiedMain /></AuthGuard>} />

        <Route path="/daily_note" element={<AuthGuard><DailyNoteDeleteTickersData /></AuthGuard>} />

        <Route path="/equity/abb_model" element={<AuthGuard><ABBModelMain /></AuthGuard>} />
        {/* <Route path="/equity/abb_model" element={<AuthGuard><ABBDiscountDataMainFunction /></AuthGuard>} /> */}

        {/* <Route path="/chat" element={<MattermostChat />} /> */}
        <Route path="/chat" element={<AuthGuard><MattermostChat /></AuthGuard>} />
        <Route path="/notesui" element={<AuthGuard><NotesUI /></AuthGuard>} />

        <Route path="/sentiment_analysis" element={<AuthGuard><SentimentAnalysisTabs /></AuthGuard>} />
        <Route path="/fewshot_analysis_upload" element={<AuthGuard><FewShotAnalysisUpload /></AuthGuard>} />
        <Route path="/ai_fewshot_analysis" element={<AuthGuard><AIFewshotAnalysis /></AuthGuard>} />
        <Route path="/ai_sentiment_summary" element={<AuthGuard><SentimentSummary /></AuthGuard>} />
        <Route path="/ai_sentiment_view" element={<AuthGuard><ShowUSSentimentAnalysis /></AuthGuard>} />
        <Route path="/ai_unsupervised_summary" element={<AuthGuard><UnsupervisedDealSummary /></AuthGuard>} />
        <Route path="/portfolio_summary" element={<AuthGuard><PortfolioSummaryTabs /></AuthGuard>} />
        <Route path="/upload_claude_sentiment" element={<AuthGuard><UploadClaudeSentiment /></AuthGuard>} />




        <Route path="/deal_meeting_notes" element={<AuthGuard><DealMeetingNotesMain /></AuthGuard>} />


        <Route path="/deals/new_dashboard" element={<AuthGuard><NewDashboardLifeCycleMain /></AuthGuard>} />
        <Route path='page_under_development' element={<AuthGuard><PageUnderDevelopment /></AuthGuard>} />


        <Route path='/deals/future_pipeline' element={<AuthGuard><FuturePipelineDealsMain /></AuthGuard>} />
        <Route path="/ticker-change" element={<AuthGuard><TickerChange /></AuthGuard>} />






        <Route path='/risk_report_pnl_report' element={<AuthGuard><RiskDashboard /></AuthGuard>} />
        <Route path='/risk_report_pnl_report/ticker-detail' element={<AuthGuard><TickerDetail /></AuthGuard>} />
        <Route path='/risk_triggers' element={<AuthGuard><RiskTriggers /></AuthGuard>} />
        <Route path='/risk_upload' element={<AuthGuard><NewPortfolioRiskUpload /></AuthGuard>} />


        <Route path='/risk_document_upload' element={<AuthGuard><RiskAIDocumentUpload /></AuthGuard>} />
        <Route path='/portfolio_document_upload' element={<AuthGuard><DocumentUploadTabs /></AuthGuard>} />

        <Route path='/ai_portfolio_review' element={<AuthGuard><AIPortfolioReview mode="portfolioReview" reviewTab="portfolio" /></AuthGuard>} />
        <Route path='/ai_risk_review' element={<AuthGuard><AIPortfolioReview mode="portfolioReview" reviewTab="risk" /></AuthGuard>} />
        <Route path='/last_30_days_ai_ranking' element={<AuthGuard><AIPortfolioReview mode="stockRanking" /></AuthGuard>} />
        <Route path='/gator_ipo_analysis' element={<AuthGuard><JayRitterIPOAnalysis /></AuthGuard>} />

        {/* <Route path="/agents" element={<AuthGuard><Agents /></AuthGuard>} /> */}
        <Route path="/agents/dashboard" element={<AuthGuard><Agents /></AuthGuard>} />
        <Route path="/agents/:agentId/output" element={<AuthGuard><AgentOutputView /></AuthGuard>} />
        <Route path="/agents/:agentId/output/:outputId" element={<AuthGuard><AgentOutputView /></AuthGuard>} />
        <Route path="/signals/board" element={<AuthGuard><SignalBoardMain /></AuthGuard>} />
        <Route path="/s3" element={<AuthGuard><S3DataTransfer /></AuthGuard>} />
        <Route path="/data_dump" element={<AuthGuard><DataDump /></AuthGuard>} />











      </Routes>
    </ErrorBoundary>

  );

};




export default AppRouters;
