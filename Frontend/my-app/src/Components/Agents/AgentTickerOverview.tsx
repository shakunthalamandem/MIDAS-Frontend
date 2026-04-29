import React, { useState, Suspense, useEffect, useMemo } from "react";
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
const GatorPostIpoTickerTab = React.lazy(() => import("./AgentTabs/GatorPostIpoTickerTab"));

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

  // Hydrate deal data from ticker list when route state is empty (e.g., direct URL hit / refresh)
  const hydratedDeal = useMemo(() => {
    if (dealData && (dealData.trade_date || dealData.pricing_date)) return dealData;
    const t = (ticker || "").toUpperCase();
    const match = (tickerList || []).find(
      (x: any) => (x?.ticker || "").toUpperCase() === t,
    );
    return match ? { ...match, ...dealData } : dealData;
  }, [dealData, tickerList, ticker]);

  // Determine if the deal is already trading. Prefer first-trade-date; fall back to pricing_date.
  const isTrading = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tdRaw = hydratedDeal?.trade_date || null;
    const pdRaw = hydratedDeal?.pricing_date || null;
    const ref = tdRaw || pdRaw;
    if (!ref) return false;
    const refDate = new Date(ref);
    if (isNaN(refDate.getTime())) return false;
    refDate.setHours(0, 0, 0, 0);
    return refDate <= today;
  }, [hydratedDeal]);

  // Reset to Sentiment Agent tab when ticker changes
  useEffect(() => {
    setActiveTab(0);
  }, [ticker]);

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
      accent: "#7c3aed",
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
      accent: "#d97706",
      component: (
        <TabErrorBoundary tabLabel="Deal(IPO) Agent" ticker={tickerValue}>
          <DashboardAIFewShotAnalysis
            basicDealDetails={{
              unique_deal_id: uniqueDealId,
            }}
            prefillTicker={{
              ticker: ticker || "",
            }}
          />
        </TabErrorBoundary>
      ),
    },
    {
      label: "Factors Based Agent",
      accent: "#0891b2",
      component: (
        <TabErrorBoundary tabLabel="Factors Based Agent" ticker={tickerValue}>
          <AIMLDealDetails ticker={tickerValue} />
        </TabErrorBoundary>
      ),
    },
    isTrading
      ? {
          label: "Gator Post-IPO",
          accent: "#0f766e",
          component: (
            <TabErrorBoundary tabLabel="Gator Post-IPO" ticker={tickerValue}>
              <GatorPostIpoTickerTab ticker={tickerValue} />
            </TabErrorBoundary>
          ),
        }
      : {
          label: "Gator Signal",
          accent: "#0f766e",
          component: (
            <TabErrorBoundary tabLabel="Gator Signal" ticker={tickerValue}>
              <GatorSignalAnalysis ticker={tickerValue} />
            </TabErrorBoundary>
          ),
        },
    {
      label: "Technical Agent",
      accent: "#dc2626",
      component: (
        <TabErrorBoundary tabLabel="Technical Agent" ticker={tickerValue}>
          <TechnicalAgentTab ticker={ticker} dealType={hydratedDeal.deal_type} />
        </TabErrorBoundary>
      ),
    },
    {
      label: "Quant Agent",
      accent: "#4f46e5",
      component: (
        <TabErrorBoundary tabLabel="Quant Agent" ticker={tickerValue}>
          <AunatAgentTab ticker={ticker} />
        </TabErrorBoundary>
      ),
    },
  ];

  const activeAccent = tabs[activeTab]?.accent || "#4f46e5";

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
            borderRadius: 3.5,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(238,242,255,0.86) 100%)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(199, 210, 254, 0.7)",
            position: "sticky",
            top: { xs: 90, md: 95 },
            zIndex: theme.zIndex.appBar + 10,
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.7) inset, 0 12px 32px rgba(79, 70, 229, 0.10)",
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
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: "#262268",
                  textAlign: "center",
                  letterSpacing: "-0.01em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {tickerValue ? `${tickerValue.toUpperCase()} — ${hydratedDeal.issuer_name || tickerValue.toUpperCase()}` : "Ticker Details"}
              </Typography>
              {tickerValue && (
                <Chip
                  size="small"
                  label={isTrading ? "TRADING · Post-IPO" : "PRE-IPO · Upcoming"}
                  sx={{
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    height: 22,
                    bgcolor: isTrading ? "#ecfdf5" : "#eef2ff",
                    color: isTrading ? "#065f46" : "#3730a3",
                    border: `1px solid ${isTrading ? "#a7f3d0" : "#c7d2fe"}`,
                  }}
                />
              )}
            </Box>

            {/* Search Bar - Right */}
            <Box sx={{ flexShrink: 0, minWidth: 280, position: "relative" }}>
              <Autocomplete
                freeSolo
                options={[...tickerOptions].sort((a: any, b: any) => {
                  if (!a.pricing_date && !b.pricing_date) return 0;
                  if (!a.pricing_date) return 1;
                  if (!b.pricing_date) return -1;
                  return new Date(b.pricing_date).getTime() - new Date(a.pricing_date).getTime();
                })}
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
                    placeholder="Search ticker, issuer..."
                    size="small"
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: "#818cf8", fontSize: 20 }} />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      },
                    }}
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        fontSize: "0.9rem",
                        borderRadius: 3,
                        bgcolor: "#eef2ff",
                        boxShadow: "0 0 0 3px rgba(79,70,229,0.1), 0 2px 8px rgba(79,70,229,0.08)",
                        "& fieldset": {
                          borderColor: "#818cf8",
                          borderWidth: "1.5px",
                        },
                        "&:hover": { bgcolor: "#e0e7ff" },
                        "&:hover fieldset": { borderColor: "#4f46e5" },
                        "&.Mui-focused fieldset": {
                          borderColor: "#4f46e5",
                          borderWidth: "2px",
                        },
                        "&.Mui-focused": {
                          bgcolor: "#fff",
                          boxShadow: "0 0 0 4px rgba(79,70,229,0.18), 0 4px 16px rgba(79,70,229,0.15)",
                        },
                      },
                    }}
                  />
                )}
                renderOption={(props, option: any) => {
                  const formatDate = (dateString: string | null) => {
                    if (!dateString) return null;
                    const date = new Date(dateString);
                    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
                  };
                  const formattedDate = formatDate(option.pricing_date);

                  return (
                    <Box
                      component="li"
                      {...props}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 0.3,
                        py: 0.9,
                        px: 2,
                        borderBottom: "1px solid #f0f0fa",
                        "&:last-child": { borderBottom: "none" },
                        cursor: "pointer",
                        transition: "background 0.15s ease, transform 0.1s ease",
                        "&:hover": {
                          backgroundColor: "#eef2ff",
                          transform: "translateX(3px)",
                        },
                        "&:active": { backgroundColor: "#e0e7ff" },
                      }}
                    >
                      {/* Row 1: ticker badge + date chip */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                        <Box
                          sx={{
                            bgcolor: "#4f46e5",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            letterSpacing: "0.04em",
                            flexShrink: 0,
                            minWidth: 64,
                            textAlign: "center",
                          }}
                        >
                          {option.ticker}
                        </Box>
                        {formattedDate && (
                          <Box
                            sx={{
                              bgcolor: "#ede9fe",
                              color: "#5b21b6",
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              px: 1,
                              py: 0.2,
                              borderRadius: 1,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formattedDate}
                          </Box>
                        )}
                      </Box>
                      {/* Row 2: full issuer name */}
                      <Typography
                        sx={{ fontSize: "0.78rem", fontWeight: 500, color: "#475569", pl: 0.25 }}
                      >
                        {option.issuer_name || "—"}
                      </Typography>
                    </Box>
                  );
                }}
                sx={{
                  width: "100%",
                  "& .MuiAutocomplete-paper": {
                    borderRadius: 2.5,
                    border: "1px solid #c7d2fe",
                    boxShadow: "0 12px 32px rgba(79,70,229,0.15)",
                    mt: 0.5,
                  },
                  "& .MuiAutocomplete-listbox": {
                    py: 0.5,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Tabs — animated accent pills */}
          <Tabs
            value={activeTab}
            onChange={(_: React.SyntheticEvent, newValue: number) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 0.5,
              backgroundColor: "transparent",
              p: 0,
              minHeight: 40,
              "& .MuiTabs-flexContainer": {
                gap: 1,
              },
              "& .MuiTabs-indicator": {
                display: "none",
              },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                color: "#1e293b",
                fontSize: "0.84rem",
                minHeight: 36,
                px: 2,
                py: 0.5,
                borderRadius: 999,
                border: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                transition:
                  "background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease",
                "&:hover": {
                  borderColor: "rgba(79, 70, 229, 0.4)",
                  color: "#312e81",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.10)",
                },
              },
              "& .Mui-selected": {
                color: "#ffffff !important",
                backgroundColor: `${activeAccent} !important`,
                borderColor: `${activeAccent} !important`,
                boxShadow: `0 6px 18px ${activeAccent}33, 0 1px 0 rgba(255,255,255,0.4) inset`,
                transform: "translateY(-1px)",
              },
              "& .MuiTabScrollButton-root": {
                color: "#4f46e5",
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} disableRipple />
            ))}
          </Tabs>
        </Paper>

        {/* Tab Content — animated accent shell + smooth fade-in on switch */}
        <Box
          key={activeTab}
          sx={{
            mb: 3,
            mt: { xs: 2, md: 3 },
            position: "relative",
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #e8ebff",
            background: "linear-gradient(180deg, #ffffff 0%, #fafbff 100%)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.7) inset, 0 6px 22px rgba(15, 23, 42, 0.05)",
            "&:before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${activeAccent} 0%, ${activeAccent}80 60%, transparent 100%)`,
            },
            animation: "tabFadeIn 0.32s ease-out",
            "@keyframes tabFadeIn": {
              from: { opacity: 0, transform: "translateY(6px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
            p: { xs: 1.5, md: 2.5 },
          }}
        >
          <Suspense fallback={<TabFallback />}>
            {tabs[activeTab]?.component}
          </Suspense>
        </Box>
      </Paper>
    </Container>
  );
};

export default AgentTickerOverview;
