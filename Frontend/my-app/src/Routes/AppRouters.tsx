import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import ErrorBoundary from "../Pages/ErrorBoundary";
import AuthGuard from "./AuthGuard";

/* ── Eagerly loaded (lightweight / auth pages needed immediately) ── */
import CapitalMarketsStatic from "../Components/HomepageStatic/CapitalMarketsStatic";
import Login from "../Components/Main/HomePage/Authentication/Login";
import SignUp from "../Components/Main/HomePage/Authentication/SignUp";
import ErrorPage from "../Pages/ErrorPage";
import EmailVerification from "../Components/Main/HomePage/Authentication/EmailVerification";
import ResetPassword from "../Components/Main/HomePage/Authentication/ResetPassword";
import SummaryPopup from "../Components/Main/HomePage/Authentication/SummaryPopup";
import PageUnderDevelopment from "../Pages/PageUnderDevelopment";
import MDTechnicalAnalysis from "../Components/Main/MonasheeDeals/MDTechnicalAnalysis";
import ShowQuantAnalysis from "../Components/AIML/ShowQuantAnalysis";
import ShowQuantAnalysisDetails from "../Components/AIML/ShowQuantAnalysisDetails";

/* ── Route-level lazy loading (each page loads only when navigated to) ── */
const CapitalMarkets = React.lazy(() => import("../Components/Main/HomePage/Dashboard/CapitalMarkets"));
const MonasheeDeals = React.lazy(() => import("../Components/Main/HomePage/Dashboard/MonasheeDeals"));
const InvestmentMain = React.lazy(() => import("../Components/Main/InvestmentStrategy/InvestmentMain"));
const TechnicalMain = React.lazy(() => import("../Components/Main/InvestmentStrategy/TechnicalIndicators/TechnicalMain"));
const DetailedGapData = React.lazy(() => import("../Components/Main/MonasheeDeals/MDDSettings/DetailedGapData"));
const Logs = React.lazy(() => import("../Components/Main/HomePage/Authentication/Logs"));
const DealStats = React.lazy(() => import("../Components/Main/MonasheeDeals/MddGraphs/DealStats"));
const FOllowOnDiscount = React.lazy(() => import("../Components/Main/MonasheeDeals/MddGraphs/FOllowOnDiscount"));
const MDDScreener = React.lazy(() => import("../Components/Main/MonasheeDeals/MddGraphs/MDDScreener"));
const AllocationCaptureReturn = React.lazy(() => import("../Components/Main/MonasheeDeals/MddGraphs/AllocationCaptureReturn"));
const BankTable = React.lazy(() => import("../Components/Main/MonasheeDeals/MDDSettings/BankTable"));
const FundWiseTable = React.lazy(() => import("../Components/Main/PortfolioAttribution/FundwiseTable"));
const HighYieldsMain = React.lazy(() => import("../Components/HighYields/HighYieldsMain"));
const DealStatsMain = React.lazy(() => import("../Components/HighYields/Tabs/DealStatsMain"));
const HYSkewTableMain = React.lazy(() => import("../Components/HighYields/Tabs/HYSkewTableMain"));
const MDDSelectedTicker = React.lazy(() => import("../Components/Main/MonasheeDeals/MddGraphs/MDDSelectedTicker"));
const MarketFilters = React.lazy(() => import("../Components/Main/MonasheeCapitalMarkets/MarketFilters"));
const ScreenerMain = React.lazy(() => import("../Components/Main/MonasheeGraphs/ScreenerTable/ScreenerMain"));
const SkewTableMain = React.lazy(() => import("../Components/Main/MonasheeGraphs/SkewTableMain"));
const MacroMain = React.lazy(() => import("../Components/Macro/MacroMain"));
const StockTickerNews = React.lazy(() => import("../Components/Macro/StockTickerNews"));
const ConvertsMain = React.lazy(() => import("../Components/Converts/ConvertsMain"));
const ConvertsDealStatsMain = React.lazy(() => import("../Components/Converts/Tabs/ConvertsDealStatsMain"));
const ConvertsSkewMain = React.lazy(() => import("../Components/Converts/Tabs/ConvertsSkewMain"));
const MainUpload = React.lazy(() => import("../Components/Uploads/MainUpload"));
const FundamentalsTechnical = React.lazy(() => import("../Components/Uploads/FundamentalsTechnical"));
const LandingPageMain = React.lazy(() => import("../Components/Main/DashBoards/LandingPageMain"));
const OperationsDashboard = React.lazy(() => import("../Components/Main/DashBoards/OperationsDashboard"));
const DailyReportPost = React.lazy(() => import("../Components/Main/WriteUpsRecords/DailyReportPost"));
const ReportWriteUpMain = React.lazy(() => import("../Components/Main/WriteUpsRecords/ReportWriteUpMain"));
const CombinedSelectedTicker = React.lazy(() => import("../Components/Main/MonasheeGraphs/CombinedSelectedTicker"));
const MarketOpportnuityMain = React.lazy(() => import("../Components/Main/HomePage/Dashboard/MarketOpportnuityMain"));
const WeeklyMain = React.lazy(() => import("../Components/Main/MonasheeDeals/MDDSettings/WeeklyMain"));
const DeatiledRegionPnlAttribution = React.lazy(() => import("../Components/PNLAttribution/DeatiledRegionPnlAttribution"));
const EquityNewDealFormMain = React.lazy(() => import("../Components/EquityNewDealFormMain/EquityNewDealFormMain"));
const LkFileUpload = React.lazy(() => import("../Components/Uploads/LkFileUpload"));
const DetailedDealsView = React.lazy(() => import("../Components/Main/MonasheeGraphs/ScreenerTable/DetailedDealsView"));
const DetailedLeadBankView = React.lazy(() => import("../Components/Main/MonasheeGraphs/ScreenerTable/DetailedLeadBankView"));
const PNLTabMain = React.lazy(() => import("../Components/PNLAttribution/PNLTabMain"));
const DetailedRegionView = React.lazy(() => import("../Components/Main/MonasheeGraphs/ScreenerTable/DetailedRegionView"));
const UploadAiInsights = React.lazy(() => import("../Components/Main/DashBoards/InsightsAi/UploadsInsights/UploadAiInsights"));
const VersionUploadForm = React.lazy(() => import("../Components/Uploads/DailyMonasheeUploads/VersionUploadForm"));
const Agents = React.lazy(() => import("../Components/Agents/Agents"));
const AgentOutputView = React.lazy(() => import("../Components/Agents/AgentOutputView"));
const AgentTasksMain = React.lazy(() => import("../Components/Agents/AgentTasksMain"));
const BetaTransferMain = React.lazy(() => import("../Components/BetaTransfer/BetaTransferMain"));
const DealDetailedGapAnalysis = React.lazy(() => import("../Components/Main/DealDetailedGapAnalysis"));
const PerplexityChatMain = React.lazy(() => import("../Components/GhcAi/PerplexityChatMain"));
const HeatMapMain = React.lazy(() => import("../Components/GhcAi/AIPages/HeatMap/HeatMapMain"));
const EquityDealsIPOFO = React.lazy(() => import("../Components/Main/DashBoards/EquityDealsIPOFO"));
const ExportUnifiedDealData = React.lazy(() => import("../Components/Main/UnifiedDealsDataMain/ExportUnifiedDealData"));
const UnifiedDealDataUpload = React.lazy(() => import("../Components/Main/UnifiedDealsDataMain/DesignUiPath/UnifiedDealDataUpload"));
const TickerDashboard = React.lazy(() => import("../Components/DealTracking/TickerDashboard"));
const UploadsWriteUpMain = React.lazy(() => import("../Components/Main/WriteUpsRecords/UploadsWriteUpMain"));
const NewDealsCycleMain = React.lazy(() => import("../Components/Main/NewDealsLifeCycle/NewDealsCycleMain"));
const TickerTrackingWrapper = React.lazy(() => import("../Components/DealTracking/TickerTrackingWrapper"));
const FOWriteUpMain = React.lazy(() => import("../Components/Main/FOWriteUpMain/FOWriteUpMain"));
const FOFinancialForecastUpload = React.lazy(() => import("../Components/Main/FOWriteUpMain/FOWriteUpUploads/FOFinancialForecastUpload"));
const DealsTabsLayout = React.lazy(() => import("../Components/Main/UnifiedDealsDataMain/DesignUiPath/DealsTabsLayout"));
const EquityAiMlPage = React.lazy(() => import("../Components/AIML/EquityAiMlPage"));
const NewDashboardLifeCycleDetails = React.lazy(() => import("../Components/NewDashboardLifeCycle/NewDashboardLifeCycleDetails"));
const WriteUpIPODashbaord = React.lazy(() => import("../Components/IPOwriteUp/IPOWriteUpDashboard/WriteUpIPODashbaord"));
const UploadFactSetTickers = React.lazy(() => import("../Components/Uploads/DailyMonasheeUploads/UploadFactSetTickers"));
const FSDealUnifiedMain = React.lazy(() => import("../Components/Main/UnifiedDealsDataMain/DesignUiPath/FactsetDataDetails/FSDealUnifiedMain"));
const DeleteUnifiedDealData = React.lazy(() => import("../Components/Main/UnifiedDealsDataMain/DeleteUnifiedDealData"));
const DailyNoteDeleteTickersData = React.lazy(() => import("../Components/Uploads/DailyNoteDeleteTickersData"));
const IPOUploadsPage = React.lazy(() => import("../Components/IPOwriteUp/IPOUploadsPage"));
const ExcelUploads = React.lazy(() => import("../Components/UpcomingPipelineDeals/ExcelUploads"));
const ABBModelMain = React.lazy(() => import("../Components/ABBModelMain/ABBModelMain"));
const AIMLResultsHome = React.lazy(() => import("../Components/AIMLResults/AIMLResultsHome"));
const MattermostChat = React.lazy(() => import("../Components/Discussion/MattermostChat"));
const MDRMainTableS3Data = React.lazy(() => import("../Components/MDRMainS3Data/MDRMainTableS3Data"));
const SentimentAnalysisTabs = React.lazy(() => import("../Components/AIML/SentimentAnalysisTabs"));
const FewShotAnalysisUpload = React.lazy(() => import("../Components/AIFewshotAnalysis/FewShotAnalysisUpload"));
const AIFewshotAnalysis = React.lazy(() => import("../Components/AIFewshotAnalysis/AIFewshotAnalysis"));
const ShowUSSentimentAnalysis = React.lazy(() => import("../Components/AIML/ShowUSSentimentAnalysis"));
const NotesUI = React.lazy(() => import("../Components/mattermostupload/NotesUI"));
const APACEquityAiMlPage = React.lazy(() => import("../Components/AIML/APACEquityAIMLPage"));
const DealMeetingNotesMain = React.lazy(() => import("../Components/Main/DealMeetingNotes/DealMeetingNotesMain"));
const NewDashboardLifeCycleMain = React.lazy(() => import("../Components/NewDashboardLifeCycle/NewDashboardLifeCycleMain"));
const FuturePipelineDealsMain = React.lazy(() => import("../Components/UpcomingPipelineDeals/FuturePipelineDealsMain"));
const TickerChange = React.lazy(() => import("../Components/TickerChange/TickerChange"));
const NewDashboardFOLifeCycleDetails = React.lazy(() => import("../Components/NewDashboardLifeCycle/NewDashboardFOLifeCycleDetails"));
const SignalBoardMain = React.lazy(() => import("../Components/SignalBoard/SignalBoardMain"));
const PNLAttributionSectionMain = React.lazy(() => import("../Components/NewPNLAttributionRiskReport/PNLAttributionSectionMain"));
const NewPortfolioRiskUpload = React.lazy(() => import("../Components/Uploads/NewPortfolioRiskUpload"));
const RiskDashboard = React.lazy(() => import("../Components/NewPNLAttributionRiskReport/PNLAttributionData/RiskDashboard"));
const TickerDetail = React.lazy(() => import("../Components/NewPNLAttributionRiskReport/PNLAttributionData/TickerDetail"));
const RiskTriggers = React.lazy(() => import("../Components/NewPNLAttributionRiskReport/PNLAttributionData/RiskTriggers"));
const PortfolioReportDocumentMain = React.lazy(() => import("../Components/NewPNLAttributionRiskReport/RiskReportNew/PortfolioReportDocumentMain"));
const RiskAIDocumentUpload = React.lazy(() => import("../Components/NewPNLAttributionRiskReport/RiskReportNew/RiskAIDocumentUpload"));
const DocumentUploadTabs = React.lazy(() => import("../Components/NewPNLAttributionRiskReport/RiskReportNew/DocumentUploadTabs"));
const AIPortfolioReview = React.lazy(() => import("../Components/NewPNLAttributionRiskReport/RiskReportNew/AIPortfolioReview"));
const JayRitterIPOAnalysis = React.lazy(() => import("../Components/JayRitter/JayRitterIPOAnalysis"));
const SentimentSummary = React.lazy(() => import("../Components/AIML/SentimentSummary"));
const UnsupervisedDealSummary = React.lazy(() => import("../Components/AIML/UnsupervisedDealSummary"));
const PortfolioSummaryTabs = React.lazy(() => import("../Components/IPODashboardLLM/PortfolioSummaryTabs"));
const UploadClaudeSentiment = React.lazy(() => import("../Components/AIML/UploadClaudeSentiment"));
const SummarySignalBoard = React.lazy(() => import("../Components/SummarySignalBoard/SummarySignalBoard"));
const S3DataTransfer = React.lazy(() => import("../Components/S3DataTransfer/S3DataTransfer"));
const DataDump = React.lazy(() => import("../Components/DataDump/DataDump"));
const JRitterAgentMain = React.lazy(() => import("../Components/JRitterAgent/JRitterAgentMain"));
const JUploadPage = React.lazy(() => import("../Components/JRitterAgent/JUploadPage"));
const DatabaseExplorer = React.lazy(() => import("../Components/DatabaseExplorer/DatabaseExplorer"));
const CIOPortfolioReviewWizard = React.lazy(() => import("../Components/CIOPortfolioReview/CIOPortfolioReviewWizard"));
const DealsDataDashboard = React.lazy(() => import("../Components/DealsData/DealsDataDashboard"));

const RouteFallback = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
    <CircularProgress size={40} />
  </Box>
);


const AppRouters: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
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





        <Route path="/operations_dashboard" element={<AuthGuard><OperationsDashboard /></AuthGuard>} />
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
        <Route path="/summary_signal_board" element={<AuthGuard><SummarySignalBoard /></AuthGuard>} />
        <Route path="/quant_agent" element={<AuthGuard><ShowQuantAnalysis /></AuthGuard>} />
        <Route path="/quant-analysis/:ticker" element={<AuthGuard><ShowQuantAnalysisDetails  /></AuthGuard>} />

       





        <Route path="/deal_meeting_notes" element={<AuthGuard><DealMeetingNotesMain /></AuthGuard>} />


        <Route path="/deals/new_dashboard" element={<AuthGuard><NewDashboardLifeCycleMain /></AuthGuard>} />
        <Route path='page_under_development' element={<AuthGuard><PageUnderDevelopment /></AuthGuard>} />


        <Route path='/deals/future_pipeline' element={<AuthGuard><FuturePipelineDealsMain /></AuthGuard>} />
        <Route path="/deals_data" element={<AuthGuard><DealsDataDashboard /></AuthGuard>} />
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
        <Route path="/agents_tasks" element={<AuthGuard><AgentTasksMain /></AuthGuard>} />
        <Route path="/beta_transfer" element={<AuthGuard><BetaTransferMain /></AuthGuard>} />
        <Route path="/agents/:agentId/output" element={<AuthGuard><AgentOutputView /></AuthGuard>} />
        <Route path="/agents/:agentId/output/:outputId" element={<AuthGuard><AgentOutputView /></AuthGuard>} />
        <Route path="/signals/board" element={<AuthGuard><SignalBoardMain /></AuthGuard>} />
        <Route path="/s3" element={<AuthGuard><S3DataTransfer /></AuthGuard>} />
        <Route path="/data_dump" element={<AuthGuard><DataDump /></AuthGuard>} />
        <Route path="/jritter_agent" element={<AuthGuard><JRitterAgentMain /></AuthGuard>} />
        <Route path="/j_upload" element={<AuthGuard><JUploadPage /></AuthGuard>} />
        <Route path="/database_explorer" element={<AuthGuard><DatabaseExplorer /></AuthGuard>} />
        <Route path="/cio_portfolio_review" element={<AuthGuard><CIOPortfolioReviewWizard /></AuthGuard>} />

       <Route path="/md_technical_analysis" element={<AuthGuard><MDTechnicalAnalysis /></AuthGuard>} />









      </Routes>
      </Suspense>
    </ErrorBoundary>

  );

};




export default AppRouters;
