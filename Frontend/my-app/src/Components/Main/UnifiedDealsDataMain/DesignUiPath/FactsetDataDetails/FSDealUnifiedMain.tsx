import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Box,
  Container,
} from "@mui/material";
import { motion } from "framer-motion";
import FSNewDealFormUpdate from "./FSNewDealFormUpdate"; // Modal form
import FSCompetitorSearch from "./FSCompetitorSearch"; // Search ticker/company

interface DealData {
  ticker: string;
  current_price: number | null;
  fifty_two_week_high: number | null;
  fcf_yield_ltm: number | null;
  shares_outstanding: number | null;
  short_interest_shares: number | null;
  macd_9d: number | null;
  rsi_30d: number | null;
  dma_50: number | null;
  market_cap: number | null;
  dma_100: number | null;
  free_float_percentage: number | null;
  price_change_week: number | null;
  dividend_yield_ltm: number | null;
  three_months_adtv_shares: number | null;
  three_months_adtv_value: number | null;
  beta_sp500: number | null;
  three_month_volatility: number | null;
  rsi_14d: number | null;
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
  const [ticker, setTicker] = useState("");
  const [pricingDate, setPricingDate] = useState("2025-09-29");
  const [data, setData] = useState<DealData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  // Fetch Deal Data
  const fetchData = async () => {
    if (!ticker) {
      setError("Please select or enter a ticker first.");
      return;
    }

    setLoading(true);
    setError(null);
    const body: Payload = { ticker, pricing_date: pricingDate };

    try {
      const response = await fetch(`${apiUrl}/api/fs_new_deal_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const json = await response.json();
      setData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // PATCH to New Deal Form
  const patchNewDealForm = async (updatedData: DealData) => {
    try {
      const response = await fetch(`${apiUrl}/api/new_deal_form/${ticker}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      setData(updatedData);
    } catch (err: any) {
      console.error("Failed to update new deal form:", err.message);
    }
  };

  const formatValue = (value: number | null, isPercentage = false) =>
    value !== null ? (isPercentage ? value.toFixed(2) + "%" : value.toFixed(2)) : "-";

  const renderCardItem = (label: string, value: number | string | null, isPercentage = false) => (
    <Grid item xs={12} sm={6} md={2} key={label}>
      <Card
        component={motion.div}
        whileHover={{ scale: 1.03 }}
        sx={{ backgroundColor: "#f0f4ff", margin: 1 }}
        elevation={4}
      >
        <CardContent>
          <Typography variant="subtitle2" color="#555">
            {label}
          </Typography>
          <Typography variant="h6" color="#002060">
            {typeof value === "number" ? formatValue(value, isPercentage) : value || "-"}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Card sx={{ padding: 3, bgcolor: "#f9f9f9" }} elevation={6}>
        <Typography variant="h6" gutterBottom color="#002060" align="center">
          Factset Deals Data Details
        </Typography>

        {/* === Ticker Search Component === */}
        <Box sx={{ marginBottom: 3 }}>
          <FSCompetitorSearch onSelect={(selectedTicker) => setTicker(selectedTicker)} />
        </Box>

        <Grid container spacing={2} sx={{ marginBottom: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Ticker"
              fullWidth
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Enter ticker manually or select from above"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Pricing Date"
              type="date"
              fullWidth
              value={pricingDate}
              onChange={(e) => setPricingDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4} display="flex" gap={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchData}
              disabled={loading}
              sx={{ bgcolor: "#002060" }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Fetch Data"}
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setOpenForm(true)}
              disabled={!data}
            >
              Upload to New Deal Form
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Typography color="error" sx={{ marginTop: 2 }}>
            {error}
          </Typography>
        )}

        {data && (
          <Box sx={{ marginTop: 3 }}>
            <Grid container spacing={2}>
              {renderCardItem("Ticker", data.ticker)}
              {renderCardItem("Current Price ($)", data.current_price)}
              {renderCardItem("Market Cap ($ in Millions)", data.market_cap)}
              {renderCardItem("52 Week High ($)", data.fifty_two_week_high)}
              {renderCardItem("% Below 52W High", data.percentage_below_52_week_high, true)}
              {renderCardItem("% Change Last 7 Days", data.price_change_week)}
              {renderCardItem("LTM FCF Yield", data.fcf_yield_ltm, true)}
              {renderCardItem("LTM Dividend Yield", data.dividend_yield_ltm, true)}
              {renderCardItem("Shares Outstanding", data.shares_outstanding)}
              {renderCardItem("% of Free Float", data.free_float_percentage, true)}
              {renderCardItem("Short Interest", data.short_interest)}
              {renderCardItem("Short Interest % of Deal", data.short_interest_percentage_of_deal, true)}
              {renderCardItem("Short Interest Shares", data.short_interest_shares)}
              {renderCardItem("3-Month ADTV ($ in M)", data.three_months_adtv_value)}
              {renderCardItem("3M ADTV Shares", data.three_months_adtv_shares)}
              {renderCardItem("Beta S&P500", data.beta_sp500)}
              {renderCardItem("3M Volatility", data.three_month_volatility)}
              {renderCardItem("RSI 14D", data.rsi_14d)}
              {renderCardItem("RSI 30D", data.rsi_30d)}
              {renderCardItem("DMI 14D", data.macd_9d)}
              {renderCardItem("MACD 9D", data.macd_9d)}
              {renderCardItem("DMA 50", data.dma_50)}
              {renderCardItem("DMA 100", data.dma_100)}
              {renderCardItem("Date", data.date)}
            </Grid>
          </Box>
        )}

        {/* New Deal Form Modal */}
        {data && (
          <FSNewDealFormUpdate
            open={openForm}
            onClose={() => setOpenForm(false)}
            data={data}
            onSubmit={patchNewDealForm}
          />
        )}
      </Card>
    </Container>
  );
};

export default FSDealUnifiedMain;
