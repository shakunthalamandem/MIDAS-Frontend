import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Card,
  CircularProgress,
  Container,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PredictionLayout from "./PredictionLayout";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import APACAIFewshotAnalysis from "../AIFewshotAnalysis/APACAIFewshotAnalysis";
import ShowAPACSentimentAnalysis from "./ShowAPACSentimentAnalysis";

type OptionsData = {
  region: string[];
  selected_bank: string[];
  sponsor: string[];
  sector: string[];
  target: string[];
  deal_status: string[];
};

type TickerOption = {
  id: string;
  ticker: string;
  pricing_date?: string | null;
};

type SentimentTickerOption = {
  id: string;
  ticker: string;
  pricing_date?: string | null;
};

interface TabPanelProps {
  children: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`ai-ml-tabpanel-${index}`}
      aria-labelledby={`ai-ml-tab-${index}`}
      sx={{ width: "100%" }}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </Box>
  );
};

const formatPricingDate = (date?: string | null) => {
  if (!date) return "TBA";
  return date;
};

const TabLabel = ({
  icon,
  primary,
  secondary,
}: {
  icon: React.ReactNode;
  primary: string;
  secondary: string;
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(90, 85, 247, 0.12)",
        color: "inherit",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ textAlign: "left" }}>
      <Typography sx={{ fontWeight: 700, fontSize: { xs: 13, sm: 14 }, lineHeight: 1.2 }}>
        {primary}
      </Typography>
      <Typography variant="caption" sx={{ color: "inherit", opacity: 0.85 }}>
        {secondary}
      </Typography>
    </Box>
  </Box>
);

const tabStyles = {
  minHeight: 60,
  minWidth: { xs: 240, sm: 280 },
  px: { xs: 1.5, sm: 2.5 },
  py: 1,
  mr: { xs: 0, sm: 1 },
  mb: { xs: 1, sm: 0 },
  borderRadius: 9999,
  alignItems: "stretch",
  justifyContent: "flex-start",
  textTransform: "none",
  backgroundColor: "#e9eef6",
  color: "#002060",
  border: "1px solid #002060",
  boxShadow: "0 2px 6px rgba(0, 32, 96, 0.12)",
  "&:hover": { backgroundColor: "#dce5f2" },
  "&.Mui-selected": {
    backgroundColor: "#002060",
    color: "#ffffff",
    boxShadow: "0 8px 18px rgba(0, 32, 96, 0.32)",
  },
};

const APACEquityAiMlPage: React.FC = () => {
  const [options, setOptions] = useState<OptionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [tickerOptions, setTickerOptions] = useState<TickerOption[]>([]);
  const [mlTicker, setMlTicker] = useState<TickerOption | null>(null);
  const [sentimentOptions, setSentimentOptions] = useState<SentimentTickerOption[]>([]);
  const [sentimentTicker, setSentimentTicker] = useState<SentimentTickerOption | null>(null);
  const [tickerLoading, setTickerLoading] = useState(false);
  const [tickerErr, setTickerErr] = useState<string | null>(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [sentimentErr, setSentimentErr] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState(0);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${apiUrl}/api/ml_input_parameters/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const picked: OptionsData = {
          region: data.region ?? [],
          selected_bank: data.selected_bank ?? [],
          sponsor: data.sponsor ?? [],
          sector: data.sector ?? [],
          target: data.target ?? [],
          deal_status: data.deal_status ?? [],
        };
        setOptions(picked);
      } catch (e: any) {
        setErr(e.message || "Failed to load options");
      } finally {
        setLoading(false);
      }
    })();
  }, [apiUrl]);

  useEffect(() => {
    const loadTickers = async () => {
      if (!apiUrl) {
        setTickerErr("API URL is missing");
        return;
      }
      setTickerLoading(true);
      setTickerErr(null);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${apiUrl}/api/unified_new_deal_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ type: "ticker_list" }),
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        if (!res.ok) {
          throw new Error(data?.error || data?.detail || "Failed to load tickers");
        }

        const items = Array.isArray(data?.tickers) ? data.tickers : [];
        const mapped = items.map((item: any, idx: number) => ({
          id: `${item.ticker}-${item.pricing_date ?? idx}`,
          ticker: item.ticker,
          pricing_date: item.pricing_date ?? null,
        }));
        setTickerOptions(mapped);
      } catch (e: any) {
        setTickerErr(e.message || "Unable to load ticker list");
      } finally {
        setTickerLoading(false);
      }
    };

    loadTickers();
  }, [apiUrl]);

  useEffect(() => {
    const loadSentimentTickers = async () => {
      if (!apiUrl) {
        setSentimentErr("API URL is missing");
        return;
      }
      setSentimentLoading(true);
      setSentimentErr(null);
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${apiUrl}/api/apac_sentiment_tickers/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        if (!res.ok) {
          throw new Error(data?.error || data?.detail || "Failed to load sentiment tickers");
        }

        const items = Array.isArray(data?.tickers)
          ? (data.tickers as { ticker: string; pricing_date?: string | null }[]).map((t, idx) => ({
              id: `${t.ticker}-${t.pricing_date ?? idx}`,
              ticker: t.ticker,
              pricing_date: t.pricing_date ?? null,
            }))
          : [];
        setSentimentOptions(items);
        setSentimentTicker((prev) => prev ?? (items[0] || null));
      } catch (e: any) {
        setSentimentErr(e.message || "Unable to load sentiment ticker list");
      } finally {
        setSentimentLoading(false);
      }
    };

    loadSentimentTickers();
  }, [apiUrl]);

  const selectedMlTickerPayload = useMemo(
    () =>
      mlTicker
        ? { ticker: mlTicker.ticker, pricing_date: mlTicker.pricing_date ?? null }
        : null,
    [mlTicker]
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }
  if (err || !options) {
    return (
      <Typography color="error" align="center">
        {err || "Options not available"}
      </Typography>
    );
  }

  return (
    <Container maxWidth={false} disableGutters>
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Box sx={{ width: { xs: "96%", sm: "90%", md: "80%" } }}>
          {/* <Card sx={{ borderRadius: 2, boxShadow: 4, p: { xs: 2, md: 3 } }}> */}
            <Stack spacing={2} sx={{ mt: { xs: 1.5, md: 2.5 } }}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Tabs
                  value={activeTab}
                  onChange={(_, val) => setActiveTab(val)}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="AI ML tab selector"
                  sx={{
                    borderBottom: 0,
                    ".MuiTabs-flexContainer": {
                      gap: { xs: 1, sm: 1.5 },
                      pb: 0.5,
                    },
                    ".MuiTabs-indicator": { display: "none" },
                    maxWidth: { xs: "100%", md: "72%" },
                  }}
                  TabIndicatorProps={{ style: { display: "none" } }}
                >
                  {/* <Tab
                    id="ai-ml-tab-0"
                    aria-controls="ai-ml-tabpanel-0"
                    label={
                      <TabLabel
                        icon={<DescriptionOutlinedIcon fontSize="small" />}
                        primary="ML Model"
                        secondary="(Based on 30+ factors)"
                      />
                    }
                    sx={tabStyles}
                  /> */}
                  <Tab
                    id="ai-ml-tab-1"
                    aria-controls="ai-ml-tabpanel-1"
                    label={
                      <TabLabel
                        icon={<DescriptionOutlinedIcon fontSize="small" />}
                        primary="AI Unsupervised"
                        secondary="(Past 10+ Deals)"
                      />
                    }
                    sx={tabStyles}
                  />
                  <Tab
                    id="ai-ml-tab-2"
                    aria-controls="ai-ml-tabpanel-2"
                    label={
                      <TabLabel
                        icon={<DescriptionOutlinedIcon fontSize="small" />}
                        primary="AI View "
                        secondary="(Outside Sentiment)"
                      />
                    }
                    sx={tabStyles}
                  />
                </Tabs>
              </Box>
{/* 
              <TabPanel value={activeTab} index={0}>
                <Card
                  sx={{
                    borderRadius: 2,
                    boxShadow: 2,
                    p: { xs: 2, md: 3 },
                    backgroundColor: "#f7f9fc",
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    gutterBottom
                    textAlign="center"
                    color="#002060"
                  >
                    Machine Learning Equity Deal Predictor - US IPO & Follow-ons
                  </Typography>


                  <Typography variant="body1" gutterBottom sx={{ mt: 1, mb: 2 }}>
                    Welcome to the ML-powered equity deal predictor for{" "}
                    <strong>US IPOs and Follow-ons (Marketed and Overnight)</strong>.
                    Input key parameters to forecast deal outcomes.
                  </Typography>

                  <Box sx={{ p: { xs: 1, md: 2 }, borderRadius: 2 }}>
                    <PredictionLayout options={options} prefillTicker={selectedMlTickerPayload} />
                  </Box>
                </Card>
              </TabPanel> */}

              <TabPanel value={activeTab} index={0}>
                <APACAIFewshotAnalysis />
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <ShowAPACSentimentAnalysis
                  focusTicker={sentimentTicker?.ticker ?? null}
                  tickerOptions={sentimentOptions}
                  selectedTicker={sentimentTicker}
                  onSelectTicker={setSentimentTicker}
                  loadingTickers={sentimentLoading}
                  tickerError={sentimentErr}
                />
              </TabPanel>
            </Stack>
          {/* </Card> */}
        </Box>
      </Box>
    </Container>
  );
};

export default APACEquityAiMlPage;
