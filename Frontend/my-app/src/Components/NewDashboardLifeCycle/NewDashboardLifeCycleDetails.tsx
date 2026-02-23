import React, { useMemo } from "react";
import {
  Box,
  Chip,
  Container,
  Grid,
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
import DealPricesChart from "../AIMLResults/DealPricesChart";
import TrendlyneQVTWidget from "../Main/InvestmentStrategy/Tradingview/TrendlyneQVTWidget";
import TrendlyneWidget from "../Main/InvestmentStrategy/Tradingview/TrendlyneWidget";
import TrendlyneTechnicalWidget from "../Main/InvestmentStrategy/Tradingview/TrendlyneTechnicalWidget";
import TrendlyneChecklistWidget from "../Main/InvestmentStrategy/Tradingview/TrendlyneChecklistWidget";
import TradingViewWidget from "../Main/InvestmentStrategy/Tradingview/TradingViewWidget";

const NewDashboardLifeCycleDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const payload = (location.state as { payload?: any } | null)?.payload;
  const viewMode = (location.state as { viewMode?: "card" | "table" } | null)?.viewMode;
  const targetTabLabel = (location.state as { targetTabLabel?: string } | null)?.targetTabLabel;
  const [selectedOption, setSelectedOption] = React.useState<any | null>(null);
  const [tabValue, setTabValue] = React.useState(0);
  const appliedTabRef = React.useRef<string | null>(null);

  const activePayload = selectedOption || payload;
  const status = activePayload?.deal_status ?? "Announced";
  const isUpcoming = ["Announced", "Price Range"].includes(status);

  const tabItems = useMemo(
    () => [
      ...(!isUpcoming ? [{ label: "Trading Signals" }] : []),
      { label: "Write Up New" },
      { label: "Write Up Old" },
      // { label: "Red Flag Analysis" },
      { label: "Deal Recommendation" },
      { label: "Peer Deals Performance" },
      { label: "AI - Sentiment View" },
      { label: "AI Unsupervised" },
      { label: "ML Model" },
      { label: "S1 AI Query" },
      { label: "NEWS" },
      { label: "Meeting Notes" },
    ],
    [isUpcoming]
  );

  React.useEffect(() => {
    if (!targetTabLabel) return;
    if (appliedTabRef.current === targetTabLabel) return;
    const nextIndex = tabItems.findIndex((item) => item.label === targetTabLabel);
    if (nextIndex >= 0) {
      appliedTabRef.current = targetTabLabel;
      setTabValue(nextIndex);
    }
  }, [targetTabLabel, tabItems]);

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
            onBack={() =>
              navigate("/deals/new_dashboard", {
                state: { viewMode: viewMode === "table" ? "table" : "card" },
              })
            }
            SearchComponent={
              <Box sx={{ width: { xs: "100%", md: 320 } }}>
                <NewDashbaordIPOTickerList
                  selectedTicker={activePayload.ticker}
                  onSelect={setSelectedOption}
                />
              </Box>
            }
          />

          <Tabs
            value={tabValue}
            onChange={(_: React.SyntheticEvent, newValue: number) => {
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
                color: "#ffff",
                backgroundColor: "#262268ff",
                borderColor: "#c7d2fe",
                boxShadow: "none",
              },
            }}
          >
            {tabItems.map((item) => (
                <Tab
                  key={item.label}
                  iconPosition="start"
                  label={item.label}
                  sx={{
                    borderRadius: 999,
                    mr: 1,
                    "&.Mui-selected": {
                      color: "#ffff",
                      backgroundColor: "#262268ff",
                    },
                  }}
                />
            ))}
          </Tabs>
        </Paper>

        <Box sx={{ mb: 3, mt: { xs: 2, md: 3 } }}>
          {tabItems[tabValue]?.label === "Trading Signals" ? (
            (() => {
              const widgetTicker = (activePayload.ticker || "").replace(/\s*US\b/i, "").trim() || activePayload.ticker;
              return (
                <Box>
                  <AIMLDealDetails ticker={activePayload.ticker} />
                  <Box sx={{ mt: 3 }}>
                    <TradingViewWidget ticker={activePayload.ticker} />
                  </Box>
                  <Box sx={{ mt: 4 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TrendlyneQVTWidget companyCode={widgetTicker} companyName={widgetTicker} className="flex-1 overflow-x-auto bg-white border border-blue-200 shadow-md rounded-xl p-6 h-[580px]" />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TrendlyneWidget companyCode={widgetTicker} companyName={widgetTicker} className="flex-1 overflow-x-auto bg-white border border-blue-200 shadow-md rounded-xl p-6 h-[580px]" />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TrendlyneTechnicalWidget companyCode={widgetTicker} className="flex-1 overflow-x-auto bg-white border border-blue-200 shadow-md rounded-xl p-6 h-[580px]" />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TrendlyneChecklistWidget companyCode={widgetTicker} companyName={widgetTicker} className="flex-1 overflow-x-auto bg-white border border-blue-200 shadow-md rounded-xl p-6 h-[580px]" />
                      </Grid>
                    </Grid>
                  </Box>
                  <Box sx={{ mt: 3 }}>
                    <DealPricesChart
                      ticker={activePayload.ticker}
                      trade_date={activePayload.pricing_date}
                    />
                  </Box>
                </Box>
              );
            })()
          ) : tabItems[tabValue]?.label === "Write Up New" ? (
            isIpo ? (
          <FebWriteUpDashboardMain
            basicDealDetails={{
              deal_id: activePayload.deal_id,
              unique_deal_id: activePayload.unique_deal_id,
              ticker: activePayload.ticker,
              pricing_date: activePayload.pricing_date,
              region: activePayload.region,
              deal_type: activePayload.deal_type,
              issuer_name: activePayload.issuer_name,
              exchange: activePayload.exchange,
            }}
          />

              
            ) : (
              <NewDashboardLifeCycleOverviewFO
                ticker={activePayload.ticker}
                pricingDate={activePayload.pricing_date}
              />
            )
          ) : tabItems[tabValue]?.label === "Write Up Old" ? (
            isIpo ? (
              <WriteUpIPODashbaord ticker={activePayload.ticker} />
            ) : (
              <FOWriteUpDashboardMain
                ticker={activePayload.ticker}
                deal_id={activePayload.deal_id}
              />
            )


          )  : tabItems[tabValue]?.label === "Deal Recommendation" ? (
            isUpcoming ? (
              // <UpcomingDealRecomendation ticker={activePayload.ticker}
              // />
              <DealRecommendationHome ticker={activePayload.ticker} />
            ) : (
              // <RecentDealRecomendation ticker={activePayload.ticker}
              // />
              <DealRecommendationHome ticker={activePayload.ticker} />
            )
          ) : tabItems[tabValue]?.label === "Peer Deals Performance" ? (
            <NewDashboardLifeCyclePeerDeals
              selectedDeal={activePayload}
            />
            
          ) : tabItems[tabValue]?.label === "NEWS" ? (
            <NewDashboardLifeCycleNews ticker={activePayload.ticker} />
          ) : tabItems[tabValue]?.label === "ML Model" ? (
            <AIMLDealDetails ticker={activePayload.ticker} />
          ) : tabItems[tabValue]?.label === "AI Unsupervised" ? (
            <DashboardAIFewShotAnalysis
                basicDealDetails={{
                  unique_deal_id: activePayload.unique_deal_id,
                }}
              prefillTicker={{
                ticker: activePayload.ticker,
                pricing_date: activePayload.pricing_date ?? null,
              }}
            />
          ) : tabItems[tabValue]?.label === "AI - Sentiment View" ? (
            <DashboardSentimentAnalysis
              focusTicker={activePayload.ticker ?? null}
              region={activePayload.region ?? null}
            />
          ) : tabItems[tabValue]?.label === "S1 AI Query" ? (
            <S1QueryBot ticker={activePayload.ticker} />
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
      </Paper>
    </Container>
  );
};

export default NewDashboardLifeCycleDetails;

