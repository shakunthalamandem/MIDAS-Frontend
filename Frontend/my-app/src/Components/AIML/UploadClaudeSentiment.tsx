import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Autocomplete,
  Stack,
} from "@mui/material";

type Deal = {
  ticker: string;
  unique_deal_id: string;
  deal_type: string;
  fo_type?: string;
  region?: string;
  issuer_name?: string;
  listing_status: "pre-listing" | "post-listing";
};

type TickerOption = Deal & {
  id: string;
  label: string;
};

const apiUrl = process.env.REACT_APP_API_URL;

const fetchFoTickers = async (): Promise<Deal[]> => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${apiUrl}/api/get_claude_sentiment_tickerlist/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch FO tickers");

  const payload = data?.data ?? [];
  const rows = Array.isArray(payload) ? payload : [];

  return rows
    .filter((item: any) => item && typeof item === "object")
    .map((item: any) => ({
      ticker: String(item.ticker ?? "").trim(),
      unique_deal_id: item.unique_deal_id ?? item.ticker ?? "",
      deal_type: item.deal_type ?? "FO",
      fo_type: item.fo_type ?? undefined,
      region: item.region ?? undefined,
      issuer_name: item.issuer_name ?? undefined,
      listing_status: ((item.from_upcoming_deals && !item.pricing_date) ? "pre-listing" as const : "post-listing" as const),
    }) as Deal)
    .filter((item: Deal) => item.ticker);
};

const fetchUpcomingIpoTickers = async (): Promise<Deal[]> => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${apiUrl}/api/unified_upcoming_recent/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({ operation: "Upcoming Deals", deal_type: "IPO" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch upcoming IPO tickers");
  const payload = data?.data ?? data?.Data ?? [];
  const rows = Array.isArray(payload) ? payload : Object.values(payload);
  const listingStatus: "pre-listing" | "post-listing" = "pre-listing";
  return rows
    .filter((item: any) => item && typeof item === "object")
    .map((item: any) => ({
      ticker: String(item.ticker ?? "").trim(),
      unique_deal_id:
        item.unique_deal_id ?? item.deal_id ?? item.id ?? item.ticker ?? "",
      deal_type: item.deal_type ?? "",
      fo_type: item.fo_type ?? undefined,
      region: item.region ?? undefined,
      issuer_name: item.issuer_name ?? undefined,
      listing_status: listingStatus,
    }))
    .filter((item: Deal) => item.ticker);
};

const fetchUpcomingFoTickers = async (): Promise<Deal[]> => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${apiUrl}/api/unified_upcoming_recent/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({ operation: "Upcoming Deals", deal_type: "FO" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch upcoming FO tickers");
  const payload = Array.isArray(data) ? data : (data?.data ?? data?.Data ?? []);
  const rows = Array.isArray(payload) ? payload : Object.values(payload);
  const listingStatus: "pre-listing" | "post-listing" = "pre-listing";
  return rows
    .filter((item: any) => item && typeof item === "object")
    .map((item: any) => ({
      ticker: String(item.ticker ?? "").trim(),
      unique_deal_id:
        item.unique_deal_id ?? item.deal_id ?? item.id ?? item.ticker ?? "",
      deal_type: item.deal_type ?? "",
      fo_type: item.fo_type ?? undefined,
      region: item.region ?? undefined,
      issuer_name: item.issuer_name ?? undefined,
      listing_status: listingStatus,
    }))
    .filter((item: Deal) => item.ticker);
};

const uploadSentiment = async (
  ticker: string,
  uniqueDealId: string,
  sentiment: string,
  socialMediaSentiment: string,
  oneWeekSentiment: string,
  oneMonthSentiment: string,
  sentimentSummary: string
) => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${apiUrl}/api/upload_claude_sentiment/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({
      ticker,
      unique_deal_id: uniqueDealId,
      sentiment,
      socialmedia_retail_sentiment: socialMediaSentiment,
      one_week_sentiment: oneWeekSentiment,
      one_month_sentiment: oneMonthSentiment,
      sentiment_summary: sentimentSummary,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to upload sentiment");
  return data;
};

const UploadClaudeSentiment: React.FC = () => {
  const [tickers, setTickers] = useState<TickerOption[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<TickerOption | null>(null);
  const [sentiment, setSentiment] = useState("");
  const [socialMediaSentiment, setSocialMediaSentiment] = useState("");
  const [oneWeekSentiment, setOneWeekSentiment] = useState("");
  const [oneMonthSentiment, setOneMonthSentiment] = useState("");
  const [sentimentSummary, setSentimentSummary] = useState("");
  const [loadingTickers, setLoadingTickers] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tickerSearchValue, setTickerSearchValue] = useState("");
  const bootstrapped = useRef(false);

  const filteredSentimentTickers = useMemo(() => {
    const needle = tickerSearchValue.trim().toUpperCase();

    if (!needle) return tickers;

    return tickers.filter((item) => {
      const label = `${item.ticker} (${item.deal_type}) - ${item.unique_deal_id}${item.region ? ` - ${item.region}` : ""
        }`.toUpperCase();

      return label.includes(needle);
    });
  }, [tickers, tickerSearchValue]);
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const loadTickers = async () => {
      setLoadingTickers(true);
      setError(null);
      try {
        const [ipoTickers, foTickers] = await Promise.all([
          fetchIpoTickers(),
          fetchFoTickers(),
        ]);
        const combined: TickerOption[] = [
          ...ipoTickers.map((deal, idx) => ({
            ...deal,
            id: `ipo-${idx}-${deal.ticker}-${deal.unique_deal_id}`,
            label: `${deal.ticker} (${deal.deal_type})${deal.region ? ` - ${deal.region}` : ""}`,
          })),
          ...foTickers.map((deal, idx) => ({
            ...deal,
            id: `fo-${idx}-${deal.ticker}-${deal.unique_deal_id}`,
            label: `${deal.ticker} (${deal.deal_type})${deal.region ? ` - ${deal.region}` : ""}`,
          })),
        ];
        setTickers(combined);
      } catch (err: any) {
        setError(err.message || "Failed to load tickers");
      } finally {
        setLoadingTickers(false);
      }
    };

    loadTickers();
  }, []);

  const handleUpload = async () => {
    if (!selectedTicker) {
      setError("Please select a ticker");
      return;
    }

    const trimmedSentiment = sentiment.trim();
    const trimmedSocialMediaSentiment = socialMediaSentiment.trim();
    const trimmedOneWeekSentiment = oneWeekSentiment.trim();
    const trimmedOneMonthSentiment = oneMonthSentiment.trim();
    const trimmedSentimentSummary = sentimentSummary.trim();

    if (!trimmedSentiment && !trimmedSocialMediaSentiment && !trimmedOneWeekSentiment && !trimmedOneMonthSentiment && !trimmedSentimentSummary) {
      setError("Please enter at least one sentiment field");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      await uploadSentiment(
        selectedTicker.ticker,
        selectedTicker.unique_deal_id,
        trimmedSentiment,
        trimmedSocialMediaSentiment,
        trimmedOneWeekSentiment,
        trimmedOneMonthSentiment,
        trimmedSentimentSummary
      );

      setSuccess(`Successfully uploaded sentiment for ${selectedTicker.ticker}`);
      setSentiment("");
      setSocialMediaSentiment("");
      setOneWeekSentiment("");
      setOneMonthSentiment("");
      setSentimentSummary("");
      setSelectedTicker(null);
      setTickerSearchValue("");
    } catch (err: any) {
      setError(err.message || "Failed to upload sentiment");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600} color="#002060" gutterBottom>
          Upload Claude Sentiment Analysis
        </Typography>
        <Typography variant="body2" color="#000000">
          Select a ticker and paste the sentiment analysis outputs from Claude
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            {/* Ticker Selection with Search */}
            <Autocomplete
              options={filteredSentimentTickers}
              loading={loadingTickers}
              value={selectedTicker}
              inputValue={tickerSearchValue}
              onChange={(_, value) => {
                setSelectedTicker(value);
              }}
              onInputChange={(_, value, reason) => {
                if (reason === "input") {
                  setTickerSearchValue(value);
                }
                if (reason === "clear") {
                  setTickerSearchValue("");
                  setSelectedTicker(null);
                }
              }}
              filterOptions={(options) => options}
              isOptionEqualToValue={(option, value) =>
                option.unique_deal_id === value.unique_deal_id &&
                option.deal_type === value.deal_type
              }
              getOptionLabel={(option) =>
                `${option.ticker} (${option.deal_type}) - ${option.unique_deal_id}${option.region ? ` - ${option.region}` : ""
                }`
              }
              noOptionsText={
                tickerSearchValue.trim()
                  ? "No matching tickers"
                  : "Type a ticker to search"
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select ticker"
                  placeholder="Search ticker"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingTickers ? <CircularProgress size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            {/* Sentiment Field */}
            <TextField
              label="Sentiment Analysis"
              placeholder="Paste sentiment analysis output from Claude..."
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value)}
              multiline
              rows={8}
              fullWidth
              variant="outlined"
              disabled={uploading}
            />

            {/* Social Media Sentiment Field */}
            <TextField
              label="Social Media & Retail Sentiment"
              placeholder="Paste social media sentiment output from Claude..."
              value={socialMediaSentiment}
              onChange={(e) => setSocialMediaSentiment(e.target.value)}
              multiline
              rows={8}
              fullWidth
              variant="outlined"
              disabled={uploading}
            />

            {/* One Week Sentiment Field */}
            <TextField
              label="One Week Sentiment"
              placeholder="Enter one week sentiment analysis..."
              value={oneWeekSentiment}
              onChange={(e) => setOneWeekSentiment(e.target.value)}
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              disabled={uploading}
            />

            {/* One Month Sentiment Field */}
            <TextField
              label="One Month Sentiment"
              placeholder="Enter one month sentiment analysis..."
              value={oneMonthSentiment}
              onChange={(e) => setOneMonthSentiment(e.target.value)}
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              disabled={uploading}
            />

            {/* Sentiment Summary Field */}
            <TextField
              label="Sentiment Summary"
              placeholder="Enter sentiment summary..."
              value={sentimentSummary}
              onChange={(e) => setSentimentSummary(e.target.value)}
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              disabled={uploading}
            />

            {/* Upload Button */}
            <Button
              variant="contained"
              size="large"
              onClick={handleUpload}
              disabled={uploading || loadingTickers || !selectedTicker}
              sx={{
                backgroundColor: "#002060",
                textTransform: "none",
                fontSize: "15px",
                fontWeight: 600,
                py: 1.5,
                "&:hover": {
                  backgroundColor: "#001a47",
                },
                "&:disabled": {
                  backgroundColor: "#cccccc",
                },
              }}
            >
              {uploading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: "#ffffff" }} />
                  Uploading...
                </>
              ) : (
                "Upload Sentiment"
              )}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default UploadClaudeSentiment;
