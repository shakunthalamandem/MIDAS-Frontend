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
import PredictionLayout from "./PredictionLayout";
import AIFewshotAnalysis from "../AIFewshotAnalysis/AIFewshotAnalysis";
import ShowSentimentAnalysis from "./ShowSentimentAnalysis";

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

const TabLabel = ({ primary, secondary }: { primary: string; secondary: string }) => (
  <Box sx={{ textAlign: "left" }}>
    <Typography sx={{ fontWeight: 700, fontSize: { xs: 13, sm: 14 } }}>
      {primary}
    </Typography>
    <Typography variant="caption" sx={{ color: "text.secondary" }}>
      {secondary}
    </Typography>
  </Box>
);

const EquityAiMlPage: React.FC = () => {
  const [options, setOptions] = useState<OptionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [tickerOptions, setTickerOptions] = useState<TickerOption[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<TickerOption | null>(null);
  const [tickerLoading, setTickerLoading] = useState(false);
  const [tickerErr, setTickerErr] = useState<string | null>(null);

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

  const selectedTickerPayload = useMemo(
    () =>
      selectedTicker
        ? { ticker: selectedTicker.ticker, pricing_date: selectedTicker.pricing_date ?? null }
        : null,
    [selectedTicker]
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
          {/* <Box
            sx={{
              fontWeight: 500,
              color: "#FFFFFF",
              fontSize: { xs: "1rem", sm: "1.15rem" },
              backgroundColor: "#002060",
              textAlign: "center",
              py: 1.25,
              borderRadius: 2,
              mt: 1.5,
              mb: 2,
            }}
          >
            Welcome to the Prediction and AI Dashboard. Use the global ticker search once and jump across
            ML, Few-shot, and Sentiment views without re-entering details.
          </Box> */}

          <Card sx={{ borderRadius: 2, boxShadow: 4, p: { xs: 2, md: 3 } }}>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="#002060">
                    AI Prediction Workbench
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    One search powers all three tabs below.
                  </Typography>
                </Box>
                <Box sx={{ minWidth: { xs: "100%", md: 360 }, width: { xs: "100%", md: 380 } }}>
                  <Autocomplete
                    options={tickerOptions}
                    loading={tickerLoading}
                    value={selectedTicker}
                    onChange={(_, value) => setSelectedTicker(value)}
                    getOptionLabel={(option) =>
                      option.pricing_date
                        ? `${option.ticker} - ${formatPricingDate(option.pricing_date)}`
                        : option.ticker
                    }
                    isOptionEqualToValue={(opt, val) =>
                      opt.ticker === val.ticker &&
                      (opt.pricing_date ?? "") === (val.pricing_date ?? "")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Global ticker search"
                        placeholder={tickerLoading ? "Loading tickers..." : "Type a ticker"}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {tickerLoading ? <CircularProgress color="inherit" size={16} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                  {tickerErr && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      {tickerErr}
                    </Alert>
                  )}
                </Box>
              </Stack>

              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="AI ML tab selector"
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  ".MuiTab-root": { textTransform: "none" },
                }}
              >
                <Tab
                  id="ai-ml-tab-0"
                  aria-controls="ai-ml-tabpanel-0"
                  label={
                    <TabLabel
                      primary="Machine Learning Equity Deal Predictor"
                      secondary="ML Model (based on 30+ factors)"
                    />
                  }
                />
                <Tab
                  id="ai-ml-tab-1"
                  aria-controls="ai-ml-tabpanel-1"
                  label={
                    <TabLabel
                      primary="Few-shot AI Analysis"
                      secondary="AI Unsupervised (Past 10+ Deals)"
                    />
                  }
                />
                <Tab
                  id="ai-ml-tab-2"
                  aria-controls="ai-ml-tabpanel-2"
                  label={
                    <TabLabel
                      primary="Sentiment Analysis (PDF)"
                      secondary="AI View (Outside Sentiment)"
                    />
                  }
                />
              </Tabs>

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
                    <PredictionLayout options={options} prefillTicker={selectedTickerPayload} />
                  </Box>
                </Card>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <AIFewshotAnalysis prefillTicker={selectedTickerPayload} />
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <ShowSentimentAnalysis focusTicker={selectedTickerPayload?.ticker ?? null} />
              </TabPanel>
            </Stack>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default EquityAiMlPage;
