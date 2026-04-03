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
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { formatDate } from "./NewDashboardLifeCycleUtils";
import PageUnderDevelopment from "../../Pages/PageUnderDevelopment";
import NewDashboardLifeCycleTickerSearch from "./NewDashboardLifeCycleTickerSearch";
import WriteUpIPODashbaord from "../IPOwriteUp/IPOWriteUpDashboard/WriteUpIPODashbaord";
import FOWriteUpDashboardMain from "../Main/FOWriteUpMain/FOWriteUpDashboardMain";
import NewDashboardLifeCycleOverviewFO from "./NewDashboardLifeCycleOverviewFO";
import DealHeaderCard from "./DealHeaderCard";
import DashboardAIFewShotAnalysis from "../AIFewshotAnalysis/DashboardAIFewShotAnalysis";
import AIMLDealDetails from "./AIMLDealDetails";
import DashboardSentimentAnalysis from "../AIML/DashboardSentimentAnalysis";
import NewDashboardLifeCyclePeerDeals from "./NewDashboardLifeCyclePeerDeals";
import FebWriteUpDashboardMain from "../WriteUpDashboardMain/FebWriteUpDashboardMain";
import S1QueryBot from "./S1QueryBot";
import NewDashboardLifeCycleNews from "./NewDashboardLifeCycleNews";
import NewDashboardLifeCycleMeetingNotes from "./NewDashboardLifeCycleMeetingNotes";
import DealRecommendationHome from "./DealRecommendation/DealRecommendationHome";
import NewDashbaordIPOTickerList from "./NewDashbaordIPOTickerList";
import DealBot from "./DealBot";
// import TradingDynamics from "./TradingDynamics"; // Commented out — replaced by Trading Signals
import TradingSignalsMain from "../TradingSignals/TradingSignalsMain";
import TabErrorBoundary from "./TabErrorBoundary";
import DashboardStateCard from "./DashboardStateCard";

const REGION_DISABLED_AGENT_TABS = new Set([
  " Deal(IPO) Agent",
  "Factors Based Agent",
]);

const REGION_DISABLED_VALUES = new Set(["EMEA", "APAC"]);

const NewDashboardLifeCycleDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const payload = (location.state as { payload?: any } | null)?.payload;
  const viewMode = (location.state as { viewMode?: "card" | "table" } | null)?.viewMode;
  const targetTabLabel = (location.state as { targetTabLabel?: string } | null)?.targetTabLabel;
  const [selectedOption, setSelectedOption] = React.useState<any | null>(null);
  const [tabValue, setTabValue] = React.useState(0);
  const [showDealBot, setShowDealBot] = React.useState(false);
  const appliedTabRef = React.useRef<string | null>(null);

  // Read query parameters for auto-fill
  React.useEffect(() => {
    const ticker = searchParams.get("ticker");
    const pricingDate = searchParams.get("pricing_date");
    const issuerName = searchParams.get("issuer_name");
    const flagForWriteup = searchParams.get("flag_for_writeup");

    if (ticker && pricingDate) {
      // Store the search criteria in selectedOption to trigger search
      // The NewDashbaordIPOTickerList component will handle the search
      setSelectedOption({
        ticker: ticker,
        pricing_date: pricingDate,
        issuer_name: issuerName,
        flag_for_writeup: flagForWriteup,
      });
    }
  }, [searchParams]);

  const activePayload = useMemo(() => {
    if (!payload && !selectedOption) return null;
    return {
      ...(payload ?? {}),
      ...(selectedOption ?? {}),
    };
  }, [payload, selectedOption]);
  const writeupEnabled =
  (activePayload?.flag_for_writeup || "").toUpperCase() === "Y" ||
  (activePayload?.writeup_available || "").toUpperCase() === "YES" ;
  const normalizedRegion = (activePayload?.region || "").toUpperCase();
  const disableUnavailableAgentTabs =
    REGION_DISABLED_VALUES.has(normalizedRegion);
  const status = activePayload?.deal_status ?? "Announced";
  const isUpcoming = ["Announced", "Price Range"].includes(status);

  const tabItems = useMemo(
    () => [
      { label: "Trading Dynamics" },
      { label: "Write Up", requiresWriteup: true },
      // { label: "Write Up Old", requiresWriteup: true },
      // { label: "Red Flag Analysis" },
      // { label: "Deal Recommendation" },
      { label: "Peer Deals Performance" },
      { label: "Sentiment Agent" },
      { label: " Deal(IPO) Agent" },
      { label: "Factors Based Agent" },

      { label: "S1 AI Query" },
      { label: "NEWS" },
      { label: "Meeting Notes" },

    ],
    [isUpcoming]
  );

  React.useEffect(() => {
    const currentTab = tabItems[tabValue];
    if (!currentTab) return;

    const dealRecommendationIndex = tabItems.findIndex(
      (item) => item.label === "Deal Recommendation"
    );

    if (!writeupEnabled && currentTab.requiresWriteup && dealRecommendationIndex !== -1) {
      setTabValue(dealRecommendationIndex);
    }
  }, [tabItems, tabValue, writeupEnabled]);

  React.useEffect(() => {
    if (!targetTabLabel) return;
    if (appliedTabRef.current === targetTabLabel) return;
    if (targetTabLabel === "Deal Bot") {
      appliedTabRef.current = targetTabLabel;
      setShowDealBot(true);
      return;
    }
    const nextIndex = tabItems.findIndex((item) => item.label === targetTabLabel);
    const isWriteupTab = tabItems[nextIndex]?.requiresWriteup;
    if (nextIndex >= 0 && !(isWriteupTab && !writeupEnabled)) {
      appliedTabRef.current = targetTabLabel;
      setShowDealBot(false);
      setTabValue(nextIndex);
    }
  }, [targetTabLabel, tabItems, writeupEnabled]);

  // Only show "no details" if there's no activePayload AND no search is in progress (no selectedOption from query params)
  if (!activePayload && !selectedOption && !payload) {
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
            backgroundColor: "rgba(206, 225, 233, 0.92)",
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
              <Box sx={{ width: { xs: "100%", md: 215 } }}>
                <NewDashbaordIPOTickerList
                  selectedDeal={{
                    ticker: activePayload?.ticker ?? null,
                    pricing_date: activePayload?.pricing_date ?? null,
                  }}
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
                fontSize: "0.7rem",
                minHeight: 36,
                px: 1.8,
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
            <TabErrorBoundary tabLabel="Ask My Analyst" ticker={activePayload.ticker}>
              <DealBot
                basicDealDetails={dealBotDetails}
              />
            </TabErrorBoundary>
          </Box>

          <Box sx={{ display: showDealBot ? "none" : "block" }}>
            {(() => {
              const currentLabel = tabItems[tabValue]?.label;
              const ticker = activePayload.ticker;
              const region = activePayload.region;
              const sector = activePayload.sector;

              // Build context chips for state cards
              const dealContext = [
                { label: "Ticker", value: ticker },
                { label: "Region", value: region },
                { label: "Sector", value: sector },
              ];

              // Validate ticker for tabs that require it
              const tickerRequiredTabs = [
                "Trading Dynamics",
                "Write Up",
                "Peer Deals Performance",
                "Sentiment Agent",
                " Deal(IPO) Agent",
                "Factors Based Agent",
                "S1 AI Query",
                "NEWS",
                "Meeting Notes",
                "Deal Recommendation",
              ];

              if (
                tickerRequiredTabs.includes(currentLabel ?? "") &&
                !ticker
              ) {
                return (
                  <DashboardStateCard
                    variant="missing-field"
                    title="Ticker information is missing"
                    message={`The "${currentLabel}" section requires a valid ticker symbol. Please select a deal with a ticker or use the search to find one.`}
                    context={dealContext}
                  />
                );
              }

              // Render each tab wrapped in error boundary
              if (currentLabel === "Trading Dynamics") {
                return (
                  <TabErrorBoundary tabLabel="Trading Dynamics" ticker={ticker}>
                    <TradingSignalsMain
                      ticker={ticker}
                      trade_date={activePayload.trade_date}
                      isUpcoming={isUpcoming}
                      dealStatus={status}
                      issuerName={activePayload.issuer_name || activePayload.company_name || ""}
                      expectedDate={activePayload.pricing_date || ""}
                      region={region}
                    />
                  </TabErrorBoundary>
                );
              }

              if (currentLabel === "Write Up") {
                return (
                  <TabErrorBoundary tabLabel="Write Up" ticker={ticker}>
                    {isIpo ? (
                      <FebWriteUpDashboardMain
                        basicDealDetails={{
                          deal_id: activePayload.deal_id,
                          unique_deal_id: activePayload.unique_deal_id,
                          ticker: ticker,
                          pricing_date: activePayload.pricing_date,
                          region: region,
                          deal_type: activePayload.deal_type,
                          issuer_name: activePayload.issuer_name,
                          exchange: activePayload.exchange,
                        }}
                      />
                    ) : (
                      <NewDashboardLifeCycleOverviewFO
                        ticker={ticker}
                        pricingDate={activePayload.pricing_date}
                      />
                    )}
                  </TabErrorBoundary>
                );
              }

              if (currentLabel === "Write Up Old") {
                return (
                  <TabErrorBoundary tabLabel="Write Up Old" ticker={ticker}>
                    {isIpo ? (
                      <WriteUpIPODashbaord ticker={ticker} />
                    ) : (
                      <FOWriteUpDashboardMain
                        ticker={ticker}
                        deal_id={activePayload.deal_id}
                      />
                    )}
                  </TabErrorBoundary>
                );
              }

              if (currentLabel === "Deal Recommendation") {
                return (
                  <TabErrorBoundary tabLabel="Deal Recommendation" ticker={ticker}>
                    <DealRecommendationHome ticker={ticker} />
                  </TabErrorBoundary>
                );
              }

              if (currentLabel === "Peer Deals Performance") {
                return (
                  <TabErrorBoundary tabLabel="Peer Deals Performance" ticker={ticker}>
                    <NewDashboardLifeCyclePeerDeals selectedDeal={activePayload} />
                  </TabErrorBoundary>
                );
              }

              if (currentLabel === "NEWS") {
                return (
                  <TabErrorBoundary tabLabel="NEWS" ticker={ticker}>
                    <NewDashboardLifeCycleNews ticker={ticker} />
                  </TabErrorBoundary>
                );
              }

              if (currentLabel === "Factors Based Agent") {
                return (
                  <TabErrorBoundary tabLabel="Factors Based Agent" ticker={ticker}>
                    <AIMLDealDetails ticker={ticker} />
                  </TabErrorBoundary>
                );
              }

              if (currentLabel === " Deal(IPO) Agent") {
                return (
                  <TabErrorBoundary tabLabel="Deal(IPO) Agent" ticker={ticker}>
                    <DashboardAIFewShotAnalysis
                      basicDealDetails={{
                        unique_deal_id: activePayload.unique_deal_id,
                      }}
                      prefillTicker={{
                        ticker: ticker,
                        pricing_date: activePayload.pricing_date ?? null,
                      }}
                    />
                  </TabErrorBoundary>
                );
              }

              if (currentLabel === "Sentiment Agent") {
                return (
                  <TabErrorBoundary tabLabel="Sentiment Agent" ticker={ticker}>
                    <DashboardSentimentAnalysis
                      focusTicker={ticker ?? null}
                      pricingDate={activePayload?.pricing_date ?? null}
                      region={region ?? null}
                    />
                  </TabErrorBoundary>
                );
              }

              if (currentLabel === "S1 AI Query") {
                return (
                  <TabErrorBoundary tabLabel="S1 AI Query" ticker={ticker}>
                    <S1QueryBot ticker={ticker} />
                  </TabErrorBoundary>
                );
              }

              if (currentLabel === "Meeting Notes") {
                return (
                  <TabErrorBoundary tabLabel="Meeting Notes" ticker={ticker}>
                    <NewDashboardLifeCycleMeetingNotes
                      ticker={ticker}
                      pricingDate={activePayload.pricing_date}
                      dealType={activePayload.deal_type}
                    />
                  </TabErrorBoundary>
                );
              }

              return <PageUnderDevelopment />;
            })()}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewDashboardLifeCycleDetails;

