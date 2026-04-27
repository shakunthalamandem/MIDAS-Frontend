import React, { useState, Suspense, useEffect } from "react";
import {
  Box,
  Tab,
  Tabs,
  Typography,
  CircularProgress,
  Container,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
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
  const [searchTicker, setSearchTicker] = useState("");
  const [tickerList, setTickerList] = useState<any[]>([]);
  const [loadingTickers, setLoadingTickers] = useState(false);
  const tickerValue = ticker || "";

  // Get deal data from route state
  const dealData = (location.state as any)?.dealData || {};
  const uniqueDealId = dealData.unique_deal_id || "";

  // Fetch ticker list
  useEffect(() => {
    const fetchTickerList = async () => {
      try {
        setLoadingTickers(true);
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/agent_ticker_list/`,
          {
            method: "GET",
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTickerList(Array.isArray(data) ? data : data.data || []);
        }
      } catch (error) {
        console.error("Error fetching ticker list:", error);
      } finally {
        setLoadingTickers(false);
      }
    };

    fetchTickerList();
  }, []);

  const handleSearchTicker = (value: string) => {
    if (value.trim()) {
      navigate(`/agents/ticker/${value.trim().toUpperCase()}`, {
        state: { dealData: {} },
      });
      setSearchTicker("");
    }
  };

  // Get ticker options for autocomplete
  const tickerOptions = Array.isArray(tickerList) ? tickerList : [];

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
          <TechnicalAgentTab ticker={ticker} dealType={dealData.deal_type} />
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
            backgroundColor: "#cacce2eb",
            backdropFilter: "blur(14px)",
            border: `1px solid ${theme.palette.divider}`,
            position: "sticky",
            top: { xs: 90, md: 95 },
            zIndex: theme.zIndex.appBar + 10,
            boxShadow: "0 16px 32px rgba(15, 23, 42, 0.12)",
          })}
        >
          {/* Back Button, Title, and Search Bar Row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
              gap: 2,
            }}
          >
            {/* Back Button - Left */}
            <Chip
              icon={<ArrowBackIcon />}
              label="Back"
              onClick={() => navigate('/agents/dashboard')}
              sx={{ cursor: "pointer", flexShrink: 0 }}
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
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {tickerValue ? `${tickerValue.toUpperCase()} - ${dealData.issuer_name || tickerValue.toUpperCase()}` : "Ticker Details"}
            </Typography>

            {/* Search Bar - Right */}
            <Box sx={{ flexShrink: 0, minWidth: 250, position: "relative" }}>
              <Autocomplete
                freeSolo
                options={tickerOptions}
                getOptionLabel={(option: any) =>
                  typeof option === "string" ? option : option.ticker || ""
                }
                inputValue={searchTicker}
                onInputChange={(event, value) => setSearchTicker(value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchTicker(searchTicker);
                  }
                }}
                onChange={(event, value) => {
                  if (value) {
                    const ticker = typeof value === "string" ? value : value.ticker;
                    handleSearchTicker(ticker);
                  }
                }}
                loading={loadingTickers}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search ticker"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "#666", mr: 1 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      backgroundColor: "#ffffff",
                      borderRadius: 1,
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#d0d0d0",
                        },
                        "&:hover fieldset": {
                          borderColor: "#1976d2",
                        },
                      },
                    }}
                  />
                )}
                renderOption={(props, option: any) => {
                  const formatDate = (dateString: string | null) => {
                    if (!dateString) return "N/A";
                    const date = new Date(dateString);
                    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
                  };

                  return (
                    <Box
                      component="li"
                      {...props}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.4,
                        py: 1.2,
                        px: 2,
                        borderBottom: "1px solid #e0e0f7",
                        "&:last-child": { borderBottom: "none" },
                        "&:hover": {
                          backgroundColor: "#f8f9ff",
                        },
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "0.95rem" }}>
                        {option.ticker} <span style={{ fontWeight: 500, color: "#0b4ca8" }}>({formatDate(option.pricing_date)})</span>
                      </Typography>
                      <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#373446" }}>
                        {option.issuer_name || "N/A"}
                      </Typography>
                    </Box>
                  );
                }}
                sx={{
                  width: "100%",
                  "& .MuiAutocomplete-paper": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    borderRadius: 1.5,
                  },
                }}
              />
            </Box>
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
