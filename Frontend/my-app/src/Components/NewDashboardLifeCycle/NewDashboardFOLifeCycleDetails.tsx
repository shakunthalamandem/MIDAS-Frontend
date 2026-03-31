import React, { useMemo } from "react";
import {
  Box,
  Chip,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { formatDate } from "./NewDashboardLifeCycleUtils";
import PageUnderDevelopment from "../../Pages/PageUnderDevelopment";
import NewDashboardLifeCycleTickerSearch from "./NewDashboardLifeCycleTickerSearch";
import WriteUpIPODashbaord from "../IPOwriteUp/IPOWriteUpDashboard/WriteUpIPODashbaord";
import FOWriteUpDashboardMain from "../Main/FOWriteUpMain/FOWriteUpDashboardMain";
import DealHeaderCard from "./DealHeaderCard";
import AIMLDealDetails from "./AIMLDealDetails";
import DashboardSentimentAnalysis from "../AIML/DashboardSentimentAnalysis";
import NewDashboardLifeCyclePeerDeals from "./NewDashboardLifeCyclePeerDeals";
import TechnicalMain from "../Main/InvestmentStrategy/TechnicalIndicators/TechnicalMain";
// import TradingDynamics from "./TradingDynamics"; // Commented out — replaced by Trading Signals
import TradingSignalsMain from "../TradingSignals/TradingSignalsMain";

import NewDashboardLifeCycleNews from "./NewDashboardLifeCycleNews";
import NewDashboardLifeCycleMeetingNotes from "./NewDashboardLifeCycleMeetingNotes";
import DealRecommendationHome from "./DealRecommendation/DealRecommendationHome";
import CombinedSelectedTicker from "../Main/MonasheeGraphs/CombinedSelectedTicker";
import FebFOWriteUpDashboardMain from "../WriteUpDashboardMain/FebFOWriteUpDashboardMain";
import FOWriteupTickerSearchData from "../WriteUpDashboardMain/FoWriteUpMetaData/FOWriteupTickerSearchData";
import DealBot from "./DealBot";

const REGION_DISABLED_AGENT_TABS = new Set(["Factors Based Agent","Technical Analysis"]);

const REGION_DISABLED_VALUES = new Set(["EMEA", "APAC"]);

const NewDashboardFOLifeCycleDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const payload = (location.state as { payload?: any } | null)?.payload;
  const viewMode = (location.state as { viewMode?: "card" | "table" } | null)?.viewMode;
  const targetTabLabel = (location.state as { targetTabLabel?: string } | null)?.targetTabLabel;
  const [selectedOption, setSelectedOption] = React.useState<any | null>(null);
  const [tabValue, setTabValue] = React.useState(0);
  const [showDealBot, setShowDealBot] = React.useState(false);
  const appliedTabRef = React.useRef<string | null>(null);
  const lastSelectedTickerRef = React.useRef<string | null>(null);

  const activePayload = selectedOption || payload;
  const writeupEnabled =
    (activePayload?.flag_for_writeup || "").toUpperCase() === "Y" ||
    (activePayload?.writeup_available || "").toUpperCase() === "YES";
  const normalizedRegion = (activePayload?.region || "").toUpperCase();
  const disableUnavailableAgentTabs =
    REGION_DISABLED_VALUES.has(normalizedRegion);
  const status = activePayload?.deal_status ?? "Announced";
  const isUpcoming = ["Announced", "Price Range"].includes(status);

  const tabItems = useMemo(
    () => [
      { label: "Trading Dynamics" },
      { label: "Write Up New", requiresWriteup: true },
      // { label: "Write Up Old", requiresWriteup: true },
      // { label: "Red Flag Analysis" },
      // { label: "Deal Recommendation" },
      { label: "Peer Deals Performance", requiresWriteup: true },
      { label: "Sentiment Agent" },
      { label: "Previous FO deals" },
      { label: "Factors Based Agent" },
     
      { label: "Technical Analysis" },
      { label: "NEWS" },
      { label: "Meeting Notes" },
    ],
    [isUpcoming]
  );

  React.useEffect(() => {
    const currentTab = tabItems[tabValue];
    if (!currentTab) return;

    const firstNonWriteupIndex = tabItems.findIndex(
      (item) => !item.requiresWriteup
    );

    // CASE 1: Writeup NOT available
    if (!writeupEnabled) {
      if (currentTab.requiresWriteup && firstNonWriteupIndex !== -1) {
        setTabValue(firstNonWriteupIndex);
      }
    }

    // When writeup is available, do not auto-switch tabs.
  }, [writeupEnabled, tabItems, tabValue]);

  React.useEffect(() => {
    if (!targetTabLabel) return;
    if (appliedTabRef.current === targetTabLabel) return;
    if (targetTabLabel === "Deal Bot") {
      appliedTabRef.current = targetTabLabel;
      setShowDealBot(true);
      return;
    }
    const nextIndex = tabItems.findIndex((item) => item.label === targetTabLabel);
    if (nextIndex >= 0) {
      appliedTabRef.current = targetTabLabel;
      setShowDealBot(false);
      setTabValue(nextIndex);
    }
  }, [targetTabLabel, tabItems]);

  React.useEffect(() => {
    const nextTicker = activePayload?.ticker ?? null;
    if (!nextTicker) return;
    if (lastSelectedTickerRef.current === nextTicker) return;

    lastSelectedTickerRef.current = nextTicker;

    const writeUpNewIndex = tabItems.findIndex(
      (item) => item.label === "Write Up"
    );
    const firstNonWriteupIndex = tabItems.findIndex(
      (item) => !item.requiresWriteup
    );

    if (writeupEnabled && writeUpNewIndex !== -1) {
      setShowDealBot(false);
      setTabValue(writeUpNewIndex);
      return;
    }

    if (!writeupEnabled && firstNonWriteupIndex !== -1) {
      setShowDealBot(false);
      setTabValue(firstNonWriteupIndex);
    }
  }, [activePayload?.ticker, tabItems, writeupEnabled]);

  if (!payload) {
    return (
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            No details available
          </Typography>
          <Typography variant="body2" color="#000000" sx={{ mt: 1 }}>
            Please go back and select a deal card.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Chip
              icon={<ArrowBackIcon />}
              label="Back"
              onClick={() => navigate(-1)}
              sx={{ cursor: "pointer" }}
            />
          </Box>
        </Paper>
      </Container>
    );
  }

  const isIpo = (activePayload.deal_type || "").toLowerCase().includes("ipo");
  const dealBotDetails = {
    deal_id: activePayload.deal_id,
    unique_deal_id: activePayload.unique_deal_id,
    ticker: activePayload.ticker,
    pricing_date: activePayload.pricing_date,
    deal_type: activePayload.deal_type,
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 1, mb: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 0,
          background: "transparent",
          boxShadow: "none",
        }}
      >
        <Paper
          elevation={0}
          sx={(theme) => ({
            mb: 3,
            p: 2,
            borderRadius: 3,
            backgroundColor: "rgba(245, 248, 255, 0.92)",
            backdropFilter: "blur(14px)",
            border: `1px solid ${theme.palette.divider}`,
            position: "sticky",
            top: { xs: 90, md: 95 },
            zIndex: theme.zIndex.appBar + 10,
            boxShadow: "0 16px 32px rgba(15, 23, 42, 0.12)",
          })}
        >
          <DealHeaderCard
            activePayload={activePayload}
            formatDate={formatDate}
            onDealBotClick={() => {
              if (!showDealBot) {
                setShowDealBot(true);
              }
            }}
            isDealBotActive={showDealBot}
            onBack={() =>
              navigate("/deals/new_dashboard", {
                state: {
                  viewMode: viewMode === "table" ? "table" : "card",
                  dashboardState: (location.state as any)?.dashboardState,
                },
              })
            }
            SearchComponent={
              <Box sx={{ width: { xs: "100%", md: 320 } }}>
                <FOWriteupTickerSearchData
                  selectedTicker={activePayload.ticker}
                  onSelect={setSelectedOption}
                />
              </Box>
            }
          />

          <Tabs
            value={tabValue}
            onChange={(_: React.SyntheticEvent, newValue: number) => {
              setShowDealBot(false);
              setTabValue(newValue);
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 1,
              backgroundColor: "transparent",
              borderRadius: 0,
              p: 0,
              boxShadow: "none",
              border: "none",
              "& .MuiTabs-indicator": {
                display: "none",
              },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                color: "#0f0f0fff",
                fontSize: "0.725rem",
                minHeight: 40,
                px: 2,
                borderRadius: 999,
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                boxShadow: "none",
                transition: "background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease",
              },
              "& .Mui-selected": {
                color: showDealBot ? "#0f0f0fff" : "#ffff",
                backgroundColor: showDealBot ? "#ffffff" : "#262268ff",
                borderColor: showDealBot ? "#e2e8f0" : "#c7d2fe",
                boxShadow: "none",
              },
            }}
          >
            {tabItems.map((item) => {
              const isRegionDisabled =
                disableUnavailableAgentTabs &&
                REGION_DISABLED_AGENT_TABS.has(item.label);
              const isDisabled =
                (item.requiresWriteup && !writeupEnabled) || isRegionDisabled;
              return (
                <Tab
                  key={item.label}
                  iconPosition="start"
                  label={item.label}
                  disabled={isDisabled}
                  sx={{
                    borderRadius: 999,
                    mr: 1,
                    "&.Mui-selected": {
                      color: showDealBot ? "#0f0f0fff" : "#ffff",
                      backgroundColor: showDealBot ? "#ffffff" : "#262268ff",
                    },
                    "&.Mui-disabled": {
                      color: "#a0a0a0",
                      backgroundColor: "#e0e0e0",
                      borderColor: "#d0d0d0",
                      cursor: "not-allowed",
                      pointerEvents: "auto",
                    },
                  }}
                />
              );
            })}
          </Tabs>
        </Paper>

        <Box sx={{ mb: 3, mt: { xs: 2, md: 3 } }}>
          <Box sx={{ display: showDealBot ? "block" : "none" }}>
            <DealBot basicDealDetails={dealBotDetails} />
          </Box>

          <Box sx={{ display: showDealBot ? "none" : "block" }}>
            {tabItems[tabValue]?.label === "Trading Dynamics" ? (
              <TradingSignalsMain
                ticker={activePayload.ticker}
                trade_date={activePayload.pricing_date}
                isUpcoming={isUpcoming}
                dealStatus={status}
                issuerName={activePayload.issuer_name || activePayload.company_name || ""}
                expectedDate={activePayload.pricing_date || ""}
                region={activePayload.region}
              />
            ) : tabItems[tabValue]?.label === "Write Up Old" ? (
              isIpo ? (
                <WriteUpIPODashbaord ticker={activePayload.ticker} />
              ) : (
                <FOWriteUpDashboardMain
                  ticker={activePayload.ticker}
                  deal_id={activePayload.deal_id}
                />
              )
            ) : tabItems[tabValue]?.label === "Deal Recommendation" ? (
              isUpcoming ? (
                <DealRecommendationHome ticker={activePayload.ticker} />
              ) : (
                <DealRecommendationHome ticker={activePayload.ticker} />
              )
            ) : tabItems[tabValue]?.label === "Peer Deals Performance" ? (
              <NewDashboardLifeCyclePeerDeals
                selectedDeal={activePayload}
              />
            ) : tabItems[tabValue]?.label === "Write Up" ? (
              <FebFOWriteUpDashboardMain
                basicDealDetails={{
                  deal_id: activePayload.deal_id,
                  unique_deal_id: activePayload.unique_deal_id,
                  ticker: activePayload.ticker,
                  pricing_date: activePayload.pricing_date,
                  region: activePayload.region,
                  deal_type: "FO",
                  company_name: activePayload.company_name,
                  issuer_name: activePayload.issuer_name,
                  exchange: activePayload.exchange,
                  writeup_ratings: activePayload.writeup_ratings,
                }}
              />
            ) : tabItems[tabValue]?.label === "NEWS" ? (
              <NewDashboardLifeCycleNews ticker={activePayload.ticker} />
            ) : tabItems[tabValue]?.label === "ML Model" ? (
              <AIMLDealDetails ticker={activePayload.ticker} />
            ) : tabItems[tabValue]?.label === "Previous FO deals" ? (
              <CombinedSelectedTicker ticker={activePayload.ticker?.split(" ")[0]} />
            ) : tabItems[tabValue]?.label === "Sentiment Agent" ? (
              <DashboardSentimentAnalysis focusTicker={activePayload.ticker ?? null} />
            ) : tabItems[tabValue]?.label === "Technical Analysis" ? (
              <TechnicalMain
                initialTicker={activePayload.ticker ?? null}
                initialRegion={activePayload.region ?? null}
              />
            ) : tabItems[tabValue]?.label === "Meeting Notes" ? (
              <NewDashboardLifeCycleMeetingNotes
                ticker={activePayload.ticker}
                pricingDate={activePayload.pricing_date}
                dealType={activePayload.deal_type}
              />
            ) : (
              <PageUnderDevelopment />
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewDashboardFOLifeCycleDetails;

