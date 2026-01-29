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
import FebWriteUpDashboardMain from "../WriteUpDashboardMain/FebIPOWriteUpDashboardMain";
import FebIPOWriteUpDashboardMain from "../WriteUpDashboardMain/FebIPOWriteUpDashboardMain";
import FebFOWriteUpDashboardMain from "../WriteUpDashboardMain/FebFOWriteUpDashboardMain";

const NewDashboardLifeCycleDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const payload = (location.state as { payload?: any } | null)?.payload;
  const [selectedOption, setSelectedOption] = React.useState<any | null>(null);
  const [tabValue, setTabValue] = React.useState(0);

  const tabItems = [
    { label: "Overview", icon: <DashboardOutlinedIcon fontSize="small" /> },
    { label: "S1 AI Query", icon: <FindInPageOutlinedIcon fontSize="small" /> },
    { label: "Write up", icon: <ArticleOutlinedIcon fontSize="small" /> },
    {
      label: "Peer Deals Performance",
      icon: <InsightsOutlinedIcon fontSize="small" />,
    },
    {
      label: "AI- Sentiment View",
      icon: <SentimentSatisfiedAltOutlinedIcon fontSize="small" />,
    },
    { label: "AI Unsupervised", icon: <HubIcon fontSize="small" /> },

    { label: "ML Model", icon: <PsychologyOutlinedIcon fontSize="small" /> },

    { label: "NEWS", icon: <NewspaperOutlinedIcon fontSize="small" /> },
  ];

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!payload) {
    return (
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            No details available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          background: "linear-gradient(180deg, #ffffff 0%, #f5f8ff 100%)",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
        }}
      >
        <DealHeaderCard
          activePayload={activePayload}
          formatDate={formatDate}
          onBack={() => navigate("/deals/new_dashboard")}
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
            mb: 3,
            backgroundColor: "#ffffff",
            borderRadius: 999,
            p: 0.5,
            boxShadow: "0 6px 16px rgba(15, 23, 42, 0.08)",
            border: "1px solid #e2e8f0",
            "& .MuiTabs-indicator": {
              display: "none",
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              color: "#64748b",
              minHeight: 44,
              px: 2,
              borderRadius: 999,
            },
            "& .Mui-selected": {
              color: "#ffffff",
              backgroundColor: "#2f6fed",
              boxShadow: "0 6px 12px rgba(47, 111, 237, 0.28)",
            },
          }}
        >
          {tabItems.map((item) => (
            <Tab
              key={item.label}
              icon={item.icon}
              iconPosition="start"
              label={item.label}
              sx={{
                borderRadius: 999,
                backgroundColor: "#f1f5ff",
                mr: 1,
                "&.Mui-selected": {
                  backgroundColor: "#e0e7ff",
                },
              }}
            />
          ))}
        </Tabs>

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

                      ) : tabItems[tabValue]?.label === "S1 AI Query" ? (
            isIpo ? (
              <FebIPOWriteUpDashboardMain ticker={activePayload.ticker} />
            ) : (
              <FebFOWriteUpDashboardMain
                ticker={activePayload.ticker}
                pricingDate={activePayload.pricing_date}
              />
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
          ) : (
            <PageUnderDevelopment />
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default NewDashboardLifeCycleDetails;

