import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Grid, TextField, Button, Stack, Box, CircularProgress } from "@mui/material";
import { AIMLPredictions } from "./AIMLPredictions";
import { ValuationCard } from "./ValuationCard";
import { AIModelCard } from "./AIModelCard";
import { MarketSentimentCard } from "./MarketSentimentCard";
import { PastDealsCard } from "./PastDealsCard";
import { IOICard } from "./IOICard";
import { AMOutputCard } from "./AMOutputCard";
import DashboardStateCard from "../DashboardStateCard";

export type DealType = "IPO" | "M&A" | "BLOCK" | string;

export type FewShotReview = {
  answer?: Array<Record<string, any>>;
};

export type DealRecommendationResponse = {
  valuation_summary: string;
  potential_am_quantity: number;
  writeup_overall_rating: string;

  t1d_pred: string;
  t1d_confidence: number;

  t1w_pred: string;
  t1w_confidence: number;

  t1m_pred: string;
  t1m_confidence: number;

  one_week_sentiment: string;
  one_month_sentiment: string;
  sentiment_summary: string;

  few_shot_review: FewShotReview;

  deal_type: DealType;

  peers_count: number;
  peers_ticker_list: string[];
  peers_t1d_avg_price: number;
  peers_t1w_avg_price: number;
  peers_t1m_avg_price: number;

  ioi_dollar_value: number;

  deal_size: number;

  t1d_overall_rating: string;
  t1w_overall_rating: string;
  t1m_overall_rating: string;

  AM_strategy_recommendation: string;
};

interface DashboardProps {
  ticker?: string;
  onSaveValuation?: (
    valuationSummary: string,
    next: DealRecommendationResponse,
  ) => Promise<void> | void;
}

const DealRecommendationHome: React.FC<DashboardProps> = ({
  ticker,
  onSaveValuation,
}) => {
  const [data, setData] = useState<DealRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  // editable valuation state
  const [valuationSummary, setValuationSummary] = useState("");
  const [savingValuation, setSavingValuation] = useState(false);

  // IOI save state
  const [savingIOI, setSavingIOI] = useState(false);

  const [savingAM, setSavingAM] = useState(false);

  useEffect(() => {
    let alive = true;

    async function run() {
      if (!apiUrl) {
        setErrorMsg("Missing REACT_APP_API_URL");
        return;
      }
      if (!ticker) {
        setErrorMsg("Missing ticker");
        return;
      }

      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetch(`${apiUrl}/api/deal_recommendation_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ ticker }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Request failed (${res.status})`);
        }

        const json = (await res.json()) as DealRecommendationResponse;
        if (!alive) return;

        setData(json);
        setValuationSummary(json.valuation_summary ?? "");
      } catch (e: any) {
        if (!alive) return;
        setErrorMsg(e?.message ?? "Unknown error");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [apiUrl, token, ticker]);

  const handleSaveValuation = useCallback(
    async (nextValuation: string) => {
      if (!data) return;
      setSavingValuation(true);
      setErrorMsg(null);
      const previousValue = data;
      const updatedData = { ...data, valuation_summary: nextValuation };
      setData(updatedData);
      setValuationSummary(nextValuation);

      try {
        if (onSaveValuation) {
          await onSaveValuation(nextValuation, updatedData);
          return;
        }

        if (!apiUrl) {
          throw new Error("Missing REACT_APP_API_URL");
        }
        if (!ticker) {
          throw new Error("Missing ticker");
        }

        const res = await fetch(`${apiUrl}/api/deal_recommendation_data/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            ticker,
            valuation_summary: nextValuation,
          }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Request failed (${res.status})`);
        }
      } catch (err: any) {
        setErrorMsg(err?.message ?? "Unable to save valuation summary");
        setData(previousValue);
        setValuationSummary(previousValue.valuation_summary ?? "");
        throw err;
      } finally {
        setSavingValuation(false);
      }
    },
    [apiUrl, data, onSaveValuation, ticker, token],
  );

  const handleSaveAM = useCallback(
    async (payload: {
      t1d_overall_rating: string;
      t1w_overall_rating: string;
      t1m_overall_rating: string;
      AM_strategy_recommendation: string;
      potential_am_quantity: number;
    }) => {
      if (!data) return;

      setSavingAM(true);
      setErrorMsg(null);

      const previous = data;

      const updatedData = {
        ...data,
        ...payload,
      };

      // Optimistic update
      setData(updatedData);

      try {
        if (!apiUrl) throw new Error("Missing API URL");
        if (!ticker) throw new Error("Missing ticker");

        const res = await fetch(`${apiUrl}/api/deal_recommendation_data/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            ticker,
            ...payload,
          }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || "AM update failed");
        }
      } catch (err: any) {
        // rollback
        setData(previous);
        setErrorMsg(err?.message ?? "Unable to save AM output");
        throw err;
      } finally {
        setSavingAM(false);
      }
    },
    [apiUrl, data, ticker, token],
  );

  const handleSaveIOI = useCallback(
    async (ioi_dollar_value: number) => {
      if (!data) return;
      setSavingIOI(true);
      setErrorMsg(null);
      const previousValue = data;
      const updatedData = { ...data, ioi_dollar_value };
      setData(updatedData);

      try {
        if (onSaveValuation) {
          await onSaveValuation(data.valuation_summary, updatedData);
          return;
        }

        if (!apiUrl) {
          throw new Error("Missing REACT_APP_API_URL");
        }
        if (!ticker) {
          throw new Error("Missing ticker");
        }

        const res = await fetch(`${apiUrl}/api/deal_recommendation_data/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            ticker,
            ioi_dollar_value,
          }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Request failed (${res.status})`);
        }
      } catch (err: any) {
        setErrorMsg(err?.message ?? "Unable to save IOI value");
        setData(previousValue);
        throw err;
      } finally {
        setSavingIOI(false);
      }
    },
    [apiUrl, data, onSaveValuation, ticker, token],
  );

  const cards = useMemo(() => {
    if (!data) return null;

    return (
      <Grid container spacing={2}>
        {/* 1) Valuation (editable) */}
        <Grid item xs={12}>
          <ValuationCard
            value={valuationSummary}
            saving={savingValuation}
            onSave={handleSaveValuation}
          />
        </Grid>

        {/* 2) ML Models */}
        <Grid item xs={12}>
          <AIMLPredictions data={data} />
        </Grid>

        {/* 3) AI model (few_shot_review) */}
        <Grid item xs={12}>
          <AIModelCard fewShot={data.few_shot_review} />
        </Grid>

        {/* 4) Market sentiment */}
        <Grid item xs={12}>
          <MarketSentimentCard
            one_week_sentiment={data.one_week_sentiment}
            one_month_sentiment={data.one_month_sentiment}
            sentiment_summary={data.sentiment_summary}
          />
        </Grid>

        {/* 5) Past deals (peers) */}
        <Grid item xs={12}>
          <PastDealsCard
            peers_count={data.peers_count}
            peers_ticker_list={data.peers_ticker_list}
            peers_t1d_avg_price={data.peers_t1d_avg_price}
            peers_t1w_avg_price={data.peers_t1w_avg_price}
            peers_t1m_avg_price={data.peers_t1m_avg_price}
          />
        </Grid>

        {/* 6) IOI */}
        <Grid item xs={12}>
          <IOICard
            ioi_dollar_value={data.ioi_dollar_value}
            deal_size={data.deal_size}
            onSave={handleSaveIOI}
            saving={savingIOI}
          />
        </Grid>

        {/* 7) AM output */}
        <Grid item xs={12}>
          <AMOutputCard
            t1d_overall_rating={data.t1d_overall_rating}
            t1w_overall_rating={data.t1w_overall_rating}
            t1m_overall_rating={data.t1m_overall_rating}
            AM_strategy_recommendation={data.AM_strategy_recommendation}
            potential_am_quantity={data.potential_am_quantity}
            deal_type={data.deal_type}
            saving={savingAM}
            onSave={handleSaveAM}
          />
        </Grid>
      </Grid>
    );
  }, [
    data,
    handleSaveValuation,
    savingValuation,
    valuationSummary,
    handleSaveIOI,
    savingIOI,
    handleSaveAM,
    savingAM,
  ]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 320 }}>
        <CircularProgress size={36} />
      </Box>
    );
  }

  if (errorMsg) {
    return (
      <DashboardStateCard
        variant="error"
        title="Deal Recommendation unavailable"
        message={errorMsg}
        context={ticker ? [{ label: "Ticker", value: ticker }] : undefined}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!data) {
    return (
      <DashboardStateCard
        variant="empty"
        title="No deal recommendation data"
        message="There is no recommendation data available for this deal yet. Data will appear once the analysis is completed."
        context={ticker ? [{ label: "Ticker", value: ticker }] : undefined}
      />
    );
  }

  return <>{cards}</>;
};

export default DealRecommendationHome;
