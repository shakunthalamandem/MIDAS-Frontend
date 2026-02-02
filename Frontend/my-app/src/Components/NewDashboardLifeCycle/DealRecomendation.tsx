import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Card, CardContent, CircularProgress, Stack, Typography } from "@mui/material";
import DealTopMetrics from "./DealTopMetrics";
import DealSecondRow from "./DealSecondRow";
import DealAMStrategy from "./DealAMStrategy";

export interface DealRecommendationResponse {
  fair_value_estimate: string;
  indication_of_interest: string;
  after_market_threshold: string;

  valuation: string;

  potential_am_quantity: number | null;

  t1d_pred: string;
  t1d_confidence: number;
  t1w_pred: string;
  t1w_confidence: number;
  t1m_pred: string;
  t1m_confidence: number;

  fs_1w_sentiment: string;
  fs_1m_sentiment: string;
  fs_expected_volatility: string;
  fs_confidence_level: string;
  executive_summary: string;

  one_week_sentiment: string;
  one_month_sentiment: string;

  last_5_t1d_avg_price: number;
  last_10_t1d_avg_price: number;
  last_5_t1w_avg_price: number;
  last_10_t1w_avg_price: number;
  last_5_t1m_avg_price: number;
  last_10_t1m_avg_price: number;

  t1d_overall_prediction: string;
  t1w_overall_prediction: string;
  t1m_overall_prediction: string;

  writeup_overall_rating: number;  // out of 100
  ai_ml_overall_rating: number;    // out of 100


  AM_strategy_recommendation: string;
}

interface DashboardProps {
  ticker?: string;
}

type LoadState = "idle" | "loading" | "success" | "error";

const apiUrl = process.env.REACT_APP_API_URL;

async function fetchDealRecommendation(ticker: string): Promise<DealRecommendationResponse> {
  const token = localStorage.getItem("access_token");

  const res = await fetch(`${apiUrl}/api/get_deal_recommendation/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({ ticker }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }

  return (await res.json()) as DealRecommendationResponse;
}

const DealRecomendation: React.FC<DashboardProps> = ({ ticker }) => {
  const [data, setData] = useState<DealRecommendationResponse | null>(null);
  const [state, setState] = useState<LoadState>("idle");
  const [error, setError] = useState<string>("");

  const effectiveTicker = useMemo(() => (ticker || "").trim(), [ticker]);

  useEffect(() => {
    if (!effectiveTicker) {
      setData(null);
      setState("idle");
      setError("");
      return;
    }

    let cancelled = false;
    setState("loading");
    setError("");

    fetchDealRecommendation(effectiveTicker)
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setState("success");
      })
      .catch((e: any) => {
        if (cancelled) return;
        setState("error");
        setError(e?.message || "Failed to load deal recommendation");
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveTicker]);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ maxWidth: 1280, mx: "auto", px: 2, py: 2 ,background:"#d6e0ef"}}>
        <Stack spacing={2}>
          {/* Header */}

          {!effectiveTicker && (
            <Alert severity="info" variant="outlined">
              Please provide a ticker to fetch the deal recommendation.
            </Alert>
          )}

          {/* Error */}
          {effectiveTicker && state === "error" && (
            <Alert severity="error" variant="outlined">
              <Typography fontWeight={700}>Could not load data</Typography>
              <Typography variant="body2">{error}</Typography>
            </Alert>
          )}

          {/* Content */}
          {effectiveTicker && data && (
            <>
              <DealTopMetrics
                fairValue={data.fair_value_estimate}
                indicationOfInterest={data.indication_of_interest}
                afterMarketThreshold={data.after_market_threshold}
              />

              <DealSecondRow data={data} />

              <DealAMStrategy
                recommendation={data.AM_strategy_recommendation}
                potentialQty={data.potential_am_quantity}
                ticker={effectiveTicker}
                overallSummary={{
                  t1d: data.t1d_overall_prediction,
                  t1w: data.t1w_overall_prediction,
                  t1m: data.t1m_overall_prediction,
                }}
              />
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default DealRecomendation;
