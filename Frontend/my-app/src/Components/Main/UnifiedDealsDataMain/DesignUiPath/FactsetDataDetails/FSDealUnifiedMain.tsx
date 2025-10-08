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
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import FSNewDealFormUpdate from "./FSNewDealFormUpdate";
import FSCompetitorSearch from "./FSCompetitorSearch";

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

  // Reset all fields
  const resetFields = () => {
    setTicker("");
    setPricingDate("2025-09-29");
    setData(null);
    setError(null);
  };

  const formatValue = (value: number | null, isPercentage = false) =>
    value !== null ? (isPercentage ? value.toFixed(2) + "%" : value.toFixed(2)) : "-";

  const renderCardItem = (label: string, value: number | string | null, isPercentage = false) => (
    <Grid item xs={12} sm={4} md={2} key={label}>
      <Card
        component={motion.div}
        whileHover={{ scale: 1.05 }}
        sx={{
          margin: 1,
          background: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
          color: "#002060",
        }}
        elevation={4}
      >
        <CardContent sx={{ py: 1 }}>
          <Typography variant="caption" color="#555">
            {label}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {typeof value === "number" ? formatValue(value, isPercentage) : value || "-"}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      <Card
        sx={{
          padding: 3,
          bgcolor: "#f9f9f9",
          borderRadius: 3,
          boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
        }}
        elevation={6}
      >
        <Typography variant="h6" gutterBottom color="#002060" align="center">
          Factset Deals Data Details
        </Typography>

        {/* Ticker Search Component */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
          <Box sx={{ flex: 1 }}>
            <FSCompetitorSearch onSelect={(selectedTicker) => setTicker(selectedTicker)} />
          </Box>

          <TextField
            size="small"
            label="Ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Enter ticker manually"
           
          />

          <TextField
            size="small"
            label="Pricing Date"
            type="date"
            value={pricingDate}
            onChange={(e) => setPricingDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={fetchData}
            disabled={loading}
            sx={{
              bgcolor: "#00796b",
              "&:hover": { bgcolor: "#004d40" },
              height: "40px",
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Fetch Data"}
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => setOpenForm(true)}
            disabled={!data}
            sx={{ height: "40px" }}
          >
            Upload to New Deal Form
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={resetFields}
            sx={{ height: "40px" }}
          >
            Reset
          </Button>
        </Stack>

        {error && (
          <Typography color="error" sx={{ marginBottom: 2 }}>
            {error}
          </Typography>
        )}

        {/* Data Cards */}
        {data && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={1}>
              {renderCardItem("Ticker", data.ticker)}
              {renderCardItem("Current Price ($)", data.current_price)}
              {renderCardItem("Market Cap ($M)", data.market_cap)}
              {renderCardItem("52W High ($)", data.fifty_two_week_high)}
              {renderCardItem("% Below 52W High", data.percentage_below_52_week_high, true)}
              {renderCardItem("% Change 7D", data.price_change_week)}
              {renderCardItem("LTM FCF Yield", data.fcf_yield_ltm, true)}
              {renderCardItem("LTM Dividend Yield", data.dividend_yield_ltm, true)}
              {renderCardItem("Shares Outstanding", data.shares_outstanding)}
              {renderCardItem("% Free Float", data.free_float_percentage, true)}
              {renderCardItem("Short Interest", data.short_interest)}
              {renderCardItem("Short Interest % Deal", data.short_interest_percentage_of_deal, true)}
              {renderCardItem("Short Interest Shares", data.short_interest_shares)}
              {renderCardItem("3M ADTV ($M)", data.three_months_adtv_value)}
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
