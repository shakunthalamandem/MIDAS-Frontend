import React from "react";
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
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FindInPageOutlinedIcon from "@mui/icons-material/FindInPageOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import HubIcon from "@mui/icons-material/Hub";
import NewspaperOutlinedIcon from "@mui/icons-material/NewspaperOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import { formatDate } from "./NewDashboardLifeCycleUtils";
import PageUnderDevelopment from "../../Pages/PageUnderDevelopment";
import NewDashboardLifeCycleTickerSearch from "./NewDashboardLifeCycleTickerSearch";
import WriteUpIPODashbaord from "../IPOwriteUp/IPOWriteUpDashboard/WriteUpIPODashbaord";
import FOWriteUpDashboardMain from "../Main/FOWriteUpMain/FOWriteUpDashboardMain";
import NewDashboardLifeCycleOverview from "./NewDashboardLifeCycleOverview";
import NewDashboardLifeCycleOverviewFO from "./NewDashboardLifeCycleOverviewFO";
import StockTickerNews from "../Macro/StockTickerNews";
import DealHeaderCard from "./DealHeaderCard";
import DashboardAIFewShotAnalysis from "../AIFewshotAnalysis/DashboardAIFewShotAnalysis";
import AIMLDealDetails from "./AIMLDealDetails";
import DashboardSentimentAnalysis from "../AIML/DashboardSentimentAnalysis";
import NewDashboardLifeCyclePeerDeals from "./NewDashboardLifeCyclePeerDeals";
import UpcomingDealRecomendation from "./UpcomingDealRecomendation";
import RecentDealRecomendation from "./RecentDealRecomendation";
import S1QueryBot from "./S1QueryBot";
import DealRecomendation from "./DealRecomendation";

const NewDashboardLifeCycleDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const payload = (location.state as { payload?: any } | null)?.payload;
  const viewMode = (location.state as { viewMode?: "card" | "table" } | null)?.viewMode;
  const targetTabLabel = (location.state as { targetTabLabel?: string } | null)?.targetTabLabel;
  const [selectedOption, setSelectedOption] = React.useState<any | null>(null);
  const [tabValue, setTabValue] = React.useState(0);
  const appliedTabRef = React.useRef<string | null>(null);

  const tabItems = [
    { label: "Write up" },
    // { label: "Overview", icon: <DashboardOutlinedIcon fontSize="small" /> },
    // { label: "Red Flag Analysis" },

    { label: "Deal Recommendation" },

    {
      label: "Peer Deals Performance",
    },
    {
      label: "AI- Sentiment View",
     
    },
    { label: "AI Unsupervised"},

    { label: "ML Model" },
    { label: "S1 AI Query"},

    { label: "NEWS" },
  ];

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  const activePayload = selectedOption || payload;
  const isIpo = (activePayload.deal_type || "").toLowerCase().includes("ipo");
  const status = activePayload?.deal_status ?? "Announced";
  const isUpcoming = ["Announced", "Price Range"].includes(status);


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
            backgroundColor: "rgba(151, 187, 240, 0.12)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${theme.palette.divider}`,
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
                <NewDashboardLifeCycleTickerSearch
                  selectedTicker={activePayload.ticker}
                  onSelect={setSelectedOption}
                />
              </Box>
            }
          />

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
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
                // icon={item.icon}
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

        <Box sx={{ mb: 3 }}>
          {tabItems[tabValue]?.label === "Overview" ? (
            isIpo ? (
              <NewDashboardLifeCycleOverview
                ticker={activePayload.ticker}
                pricingDate={activePayload.pricing_date}
                dealType={activePayload.deal_type}
              />
            ) : (
              <NewDashboardLifeCycleOverviewFO
                ticker={activePayload.ticker}
                pricingDate={activePayload.pricing_date}
              />
            )
          ) : tabItems[tabValue]?.label === "Write up" ? (
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
              <DealRecomendation ticker={activePayload.ticker} />
            ) : (
              // <RecentDealRecomendation ticker={activePayload.ticker}
              // />
              <DealRecomendation ticker={activePayload.ticker} />
            )
          ) : tabItems[tabValue]?.label === "Peer Deals Performance" ? (
            <NewDashboardLifeCyclePeerDeals
              selectedDeal={activePayload}
            />
          ) : tabItems[tabValue]?.label === "NEWS" ? (
            <StockTickerNews ticker={activePayload.ticker} />
          ) : tabItems[tabValue]?.label === "ML Model" ? (
            <AIMLDealDetails ticker={activePayload.ticker} />
          ) : tabItems[tabValue]?.label === "AI Unsupervised" ? (
            <DashboardAIFewShotAnalysis
              prefillTicker={{
                ticker: activePayload.ticker,
                pricing_date: activePayload.pricing_date ?? null,
              }}
            />
          ) : tabItems[tabValue]?.label === "AI- Sentiment View" ? (
            <DashboardSentimentAnalysis focusTicker={activePayload.ticker ?? null} />
          ) : tabItems[tabValue]?.label === "S1 AI Query" ? (
            <S1QueryBot ticker={activePayload.ticker} />
          ) : (
            <PageUnderDevelopment />
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default NewDashboardLifeCycleDetails;

