import React, { useState, Suspense } from "react";
import {
  Box,
  Tab,
  Tabs,
  Typography,
  CircularProgress,
  Container,
  Paper,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import TabErrorBoundary from "../NewDashboardLifeCycle/TabErrorBoundary";
import TechnicalAgentTab from "./AgentTabs/TechnicalAgentTab";
import AunatAgentTab from "./AgentTabs/AunatAgentTab";

// Import existing components where available
const DashboardSentimentAnalysis = React.lazy(() => import("../AIML/DashboardSentimentAnalysis"));
const AIMLDealDetails = React.lazy(() => import("../NewDashboardLifeCycle/AIMLDealDetails"));
const DashboardAIFewShotAnalysis = React.lazy(() => import("../AIFewshotAnalysis/DashboardAIFewShotAnalysis"));
const GatorSignalAnalysis = React.lazy(() => import("../NewDashboardLifeCycle/GatorSignalAnalysis"));

const TabFallback = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
    <CircularProgress size={32} />
  </Box>
);

const AgentTickerOverview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { ticker } = useParams<{ ticker: string }>();
  const [activeTab, setActiveTab] = useState(0);
  const tickerValue = ticker || "";

  // Get deal data from route state
  const dealData = (location.state as any)?.dealData || {};
  const uniqueDealId = dealData.unique_deal_id || "";

  const tabs = [
    {
      label: "Sentiment Agent",
      component: (
        <TabErrorBoundary tabLabel="Sentiment Agent" ticker={tickerValue}>
          <DashboardSentimentAnalysis
            focusTicker={ticker ?? null}
            pricingDate={null}
            region={"US"}
          />
        </TabErrorBoundary>
      ),
    },
    {
      label: "Deal(IPO) Agent",
      component: (
        <TabErrorBoundary tabLabel="Deal(IPO) Agent" ticker={tickerValue}>
          <DashboardAIFewShotAnalysis
            basicDealDetails={{
              unique_deal_id: uniqueDealId,
            }}
            prefillTicker={{
              ticker: ticker || "",
              pricing_date: dealData.pricing_date || null,
            }}
          />
        </TabErrorBoundary>
      ),
    },
    {
      label: "Factors Based Agent",
      component: (
        <TabErrorBoundary tabLabel="Factors Based Agent" ticker={tickerValue}>
          <AIMLDealDetails ticker={tickerValue} />
        </TabErrorBoundary>
      ),
    },
    {
      label: "Gator Signal",
      component: (
        <TabErrorBoundary tabLabel="Gator Signal" ticker={tickerValue}>
          <GatorSignalAnalysis ticker={tickerValue} />
        </TabErrorBoundary>
      ),
    },
    {
      label: "Technical Agent",
      component: (
        <TabErrorBoundary tabLabel="Technical Agent" ticker={tickerValue}>
          <TechnicalAgentTab ticker={ticker} />
        </TabErrorBoundary>
      ),
    },
    {
      label: "Quant Agent",
      component: (
        <TabErrorBoundary tabLabel="Quant Agent" ticker={tickerValue}>
          <AunatAgentTab ticker={ticker} />
        </TabErrorBoundary>
      ),
    },
  ];

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
        {/* Header Card */}
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
          {/* Back Button and Title Row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            {/* Back Button - Left */}
            <Chip
              icon={<ArrowBackIcon />}
              // label="Back"
              onClick={() => navigate('/agents/dashboard')}
              sx={{ cursor: "pointer" }}
              variant="outlined"
            />

            {/* Title - Center */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#262268",
                textAlign: "center",
                flex: 1,
                mb:2,
              }}
            >
              {tickerValue ? `${tickerValue.toUpperCase()} - ${dealData.issuer_name || tickerValue.toUpperCase()}` : "Ticker Details"}
            </Typography>

            {/* Spacer - Right (for balance) */}
            <Box sx={{ width: "auto" }} />
          </Box>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_: React.SyntheticEvent, newValue: number) => setActiveTab(newValue)}
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
                fontSize: "0.85rem",
                minHeight: 36,
                px: 1.8,
                borderRadius: 999,
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                boxShadow: "none",
                transition: "background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease",
                mr: 1,
              },
              "& .Mui-selected": {
                color: "#ffffff !important",
                backgroundColor: "#262268ff",
                borderColor: "#c7d2fe",
                boxShadow: "none",
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Box sx={{ mb: 3, mt: { xs: 2, md: 3 } }}>
          <Suspense fallback={<TabFallback />}>
            {tabs[activeTab]?.component}
          </Suspense>
        </Box>
      </Paper>
    </Container>
  );
};

export default AgentTickerOverview;
