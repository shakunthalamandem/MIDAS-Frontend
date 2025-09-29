import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  CircularProgress,
} from "@mui/material";

interface DealData {
  ticker: string;
  three_months_adtv_shares: number | null;
  beta_sp500: number | null;
  three_month_volatility: number | null;
  rsi_14d: number | null;
  rsi_30d: number | null;
  macd_9d: number | null;
  dma_50: number | null;
  dma_100: number | null;
  market_cap: number | null;
  fifty_two_week_high: number | null;
  price_change_week: number | null;
  fcf_yield_ltm: number | null;
  dividend_yield_ltm: number | null;
  shares_outstanding: number | null;
  free_float_percentage: number | null;
  short_interest_shares: number | null;
  current_price: number | null;
  date: string;
  percentage_below_52_week_high: number | null;
  short_interest: number | null;
  short_interest_percentage_of_deal: number | null;
}

interface Payload {
  ticker: string;
  pricing_date: string;
}

const FSDealUnifiedMain: React.FC = () => {
  const [ticker, setTicker] = useState("AIRO-US");
  const [pricingDate, setPricingDate] = useState("2025-09-10");
  const [data, setData] = useState<DealData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
      const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

  const fetchData = async () => {
    const body: Payload = {
      ticker,
      pricing_date: pricingDate,
    };

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/fs_new_deal_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const json = await response.json();
      setData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 4, maxWidth: 600, margin: "2rem auto" }}>
      <Typography variant="h6" gutterBottom color="#002060" align="center">
        Fetch Deal Data
      </Typography>

      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Ticker"
            fullWidth
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Pricing Date"
            type="date"
            fullWidth
            value={pricingDate}
            onChange={(e) => setPricingDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <Button
        variant="contained"
        color="primary"
        onClick={fetchData}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Fetch Data"}
      </Button>

      {error && (
        <Typography color="error" sx={{ marginTop: 2 }}>
          {error}
        </Typography>
      )}

      {data && (
        <Paper elevation={2} sx={{ padding: 2, marginTop: 3 }}>
          <Typography variant="h6">{data.ticker}</Typography>
          <Typography>Current Price: {data.current_price}</Typography>
          <Typography>Market Cap: {data.market_cap}</Typography>
          <Typography>52 Week High: {data.fifty_two_week_high}</Typography>
          <Typography>
            Percentage Below 52 Week High:{" "}
            {data.percentage_below_52_week_high?.toFixed(2)}%
          </Typography>
          <Typography>Short Interest Shares: {data.short_interest_shares}</Typography>
          <Typography>Price Change This Week: {data.price_change_week}</Typography>
          <Typography>RSI (14d): {data.rsi_14d}</Typography>
          <Typography>DMA 50: {data.dma_50}</Typography>
          <Typography>DMA 100: {data.dma_100}</Typography>
        </Paper>
      )}
    </Paper>
  );
};

export default FSDealUnifiedMain;
