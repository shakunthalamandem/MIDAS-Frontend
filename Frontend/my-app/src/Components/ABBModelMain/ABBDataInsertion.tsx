import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

const ABBDataInsertion = ({ AbbDataCreation }: { AbbDataCreation: any }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [responseData, setResponseData] = useState<any>(null);

  // Prepare the payload to be sent to the API
  const preparePayload = () => {
    const { payload, apiResponse } = AbbDataCreation;
    
    // Create the new payload structure
    const newPayload = {
      ticker: payload.ticker,
      deal_id: `${payload.ticker.toUpperCase()}_${payload.launch_date.replace(/-/g, "")}`,
      launch_date: payload.launch_date,
      // Add other fields, setting them to null if not available or as needed
      liquidity_model_discount: payload.liquidity_model_discount || null,
      total_discount: payload.total_discount || null,
      final_discount: payload.final_discount || null,
      cleanup_d1_discount: payload.cleanup_d1_discount || null,
      seasonal_d1_discount: payload.seasonal_d1_discount || null,
      timing_d1_discount: payload.timing_d1_discount || null,
      primary_d1_discount: payload.primary_d1_discount || null,
      emerging_market_d1_discount: payload.emerging_market_d1_discount || null,
      cleanup_discount: payload.cleanup_discount || null,
      seasonal_discount: payload.seasonal_discount || null,
      timing_discount: payload.timing_discount || null,
      primary_discount: payload.primary_discount || null,
      emerging_market_discount: payload.emerging_market_discount || null,
      request_id: payload.request_id || null,
      share_price: payload.share_price || null,
      share_price_usd: payload.share_price_usd || null,
      market_cap: payload.market_cap || null,
      shares_outstanding: payload.shares_outstanding || null,
      currency: payload.currency || null,
      percent_free_float: payload.percent_free_float || null,
      vwap: payload.vwap || null,
      _3_m_adtv_shares: payload._3_m_adtv_shares || null,
      _3_m_adtv_local_value: payload._3_m_adtv_local_value || null,
      _52week_high: payload._52week_high || null,
      _52week_low: payload._52week_low || null,
      company_description: payload.company_description || null,
      beta_benchmark: payload.beta_benchmark || null,
      _3_m_volatility: payload._3_m_volatility || null,
      rsi_30d: payload.rsi_30d || null,
      rsi_14d: payload.rsi_14d || null,
      macd_9d: payload.macd_9d || null,
      _10_dma: payload._10_dma || null,
      percent_from_52week_high: payload.percent_from_52week_high || null,
      one_day_performance: payload.one_day_performance || null,
      fcf_yield_ltm: payload.fcf_yield_ltm || null,
      fcf_dividend_yield: payload.fcf_dividend_yield || null,
      enterprise_value: payload.enterprise_value || null,
      default_currency: payload.default_currency || null,
      _20day_volatility: payload._20day_volatility || null,
      _30day_volatility: payload._30day_volatility || null,
      _60ay_volatility: payload._60ay_volatility || null,
      free_float: payload.free_float || null,
      institutional_percentage: payload.institutional_percentage || null,
      benchmark: payload.benchmark || null,
      benchmark_name: payload.benchmark_name || null,
      date: payload.date || null,
      trade_date: payload.trade_date || null,
      clean_up: payload.clean_up || null,
      seasoned: payload.seasoned || null,
      timing: payload.timing || null,
      primary: payload.primary || null,
      emerging_mkt: payload.emerging_mkt || null,
      block_deal_shares: payload.block_deal_shares || null,
      block_deal_percentage_of_market_cap: payload.block_deal_percentage_of_market_cap || null,
      block_deal_value_in_local_currency: payload.block_deal_value_in_local_currency || null,
      block_deal_value_in_dollar: payload.block_deal_value_in_dollar || null,
    };
    
    return newPayload;
  };

  // Function to call the API
  const createABBModel = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const apiUrl = process.env.REACT_APP_API_URL; // Make sure you have this in your .env file
    const token = localStorage.getItem("access_token");

    // Prepare the payload from AbbDataCreation
    const payload = preparePayload();

    try {
      const res = await fetch(`${apiUrl}/api/emea_abb_model_create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create ABB model");
      }

      const data = await res.json();
      setResponseData(data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Trigger API call when component is mounted
  useEffect(() => {
    if (AbbDataCreation) {
      createABBModel();
    }
  }, [AbbDataCreation]);

  return (
    <Box sx={{ mt: 3, textAlign: 'center' }}>
      {loading && <CircularProgress />}

      {success && responseData && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" color="green">
            Success!
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Model created successfully. Here's the response:
          </Typography>
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </Box>
      )}

      {error && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="error">{`Error: ${error}`}</Alert>
        </Box>
      )}
    </Box>
  );
};

export default ABBDataInsertion;
