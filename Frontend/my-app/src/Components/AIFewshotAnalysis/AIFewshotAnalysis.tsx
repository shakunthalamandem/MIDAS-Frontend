import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import AiAnalysis from "./AiAnalysis";

type ApiState = "idle" | "loading" | "success" | "error";

type TickerItem = {
  id?: string;
  ticker: string;
  pricing_date?: string | null;
  deal_colour_present?: string;
  deal_captain?: string;
  deal_type?: string;
  allocation_as_percentage_of_deal_size?: number;
};

const formatPricingDate = (dateStr?: string | null) => {
  if (!dateStr) return "N/A";
  return dateStr;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};


const AIFewshotAnalysis: React.FC = () => {
  const API_URL = process.env.REACT_APP_API_URL;

  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [status, setStatus] = useState<ApiState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTicker, setSelectedTicker] = useState<TickerItem | null>(null);

  const loadTickers = async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      if (!API_URL) {
        throw new Error("REACT_APP_API_URL is not set.");
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
      };

      const res = await fetch(`${API_URL}/api/unified_new_deal_data/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ type: "ticker_list" }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      
      if (!res.ok) {
        throw new Error(data?.error || data?.detail || "Failed to load tickers");
      }

      const items = Array.isArray(data?.tickers) ? (data.tickers as TickerItem[]) : [];
      setTickers(items);
      setSelectedTicker((prev) => {
        if (!prev) return prev;
        return (
          items.find(
            (t) => t.ticker === prev.ticker && (t.pricing_date ?? "") === (prev.pricing_date ?? "")
          ) || null
        );
      });
      setStatus("success");
    } catch (error: any) {
      console.error("Error fetching tickers:", error);
      setStatus("error");
      setErrorMessage(error?.message || "Could not load tickers. Please retry.");
    }
  };

  useEffect(() => {
    if (!API_URL) {
      setErrorMessage("REACT_APP_API_URL is not set.");
      setStatus("error");
      return;
    }
    loadTickers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL]);

  const isLoading = status === "loading";
  const hasError = status === "error";

  const options = useMemo(
    () =>
      tickers.map((item, idx) => ({
        id: `${item.ticker}-${item.pricing_date ?? idx}`,
        ...item,
      })),
    [tickers]
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        mt: 5,
        background:
          "radial-gradient(circle at 10% 20%, rgba(230,240,255,0.65), transparent 35%), radial-gradient(circle at 90% 10%, rgba(255,230,240,0.6), transparent 30%), linear-gradient(180deg, #f7f9fc 0%, #ffffff 45%, #f7f9fc 100%)",
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, sm: 3, lg: 4 } }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid rgba(161, 177, 255, 0.35)",
            boxShadow: "0 20px 55px rgba(43,71,255,0.12)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(245,248,255,0.95))",
          }}
        >
          <CardHeader
            title={
              <Box sx={{ position: "relative", width: "100%" }}>
  {/* <Typography
  variant="h6"
  sx={{
    fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
    fontWeight: 800,
  }}
>
  Few-shot AI Analysis
</Typography> */}

</Box>

            }
            sx={{ pb: 0 }}
          />

          <CardContent sx={{ pt: 1, pb: 3 }}>
  {hasError && (
    <Alert severity="error" sx={{ mb: 2 }}>
      {errorMessage}
    </Alert>
  )}

  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
    <Autocomplete
      options={options}
      loading={isLoading}
      value={selectedTicker}
      onChange={(_, value) => setSelectedTicker(value)}
      getOptionLabel={(option) =>
        option.pricing_date ? `${option.ticker} - ${formatPricingDate(option.pricing_date)}` : option.ticker
      }
      isOptionEqualToValue={(opt, val) =>
        opt.ticker === val.ticker && (opt.pricing_date ?? "") === (val.pricing_date ?? "")
      }
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography sx={{ fontWeight: 900, color: "#b71c1c" }}>{option.ticker}</Typography>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>
              {formatPricingDate(option.pricing_date)}
            </Typography>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search ticker"
          placeholder={isLoading ? "Loading tickers..." : "Type to search..."}
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
              background: "rgba(255,255,255,0.9)",
              transition: "all 180ms ease",
              "&:hover": { boxShadow: "0 8px 24px rgba(59,130,246,0.16)" },
            },
          }}
        />
      )}
      sx={{
        mt: 0,
        width: { xs: "100%", sm: 340 }, // short width on desktop
        maxWidth: "100%",
      }}
    />
  </Box>
</CardContent>

        </Card>

        <Box sx={{ mt: 3 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              boxShadow: "0 26px 60px rgba(57,99,255,0.18)",
              background: "linear-gradient(145deg, rgba(255,255,255,0.94), rgba(240,245,255,0.92))",
              border: "1px solid rgba(130, 143, 255, 0.35)",
            }}
          >
            {/* <CardHeader
              title={
                <Typography variant="h6" sx={{ fontWeight: 900, color: "#1f2937" }}>
                  AI Sentiment Review
                </Typography>
              }
              subheader={
                <Typography variant="body2" color="text.secondary">
                  Select a ticker above to load its sentiment analysis.
                </Typography>
              }
            /> */}
            <CardContent>
              <AiAnalysis ticker={selectedTicker?.ticker ?? null} />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default AIFewshotAnalysis;
