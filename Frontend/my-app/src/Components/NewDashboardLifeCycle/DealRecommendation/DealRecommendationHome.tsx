import React, { useEffect, useMemo, useState } from "react";
import { Grid, TextField, Button, Stack } from "@mui/material";
import { SectionCard } from "./SectionCard";
import { AIMLPredictions } from "./AIMLPredictions";
import { ValuationCard } from "./ValuationCard";
import { AIModelCard } from "./AIModelCard";
import { MarketSentimentCard } from "./MarketSentimentCard";
import { PastDealsCard } from "./PastDealsCard";
import { IOICard } from "./IOICard";
import { AMOutputCard } from "./AMOutputCard";

export type DealType = "IPO" | "M&A" | "BLOCK" | string;

export type FewShotReview = {
  answer?: Array<Record<string, any>>;
};

export type DealRecommendationResponse = {
  valuation_summary: string;
  potential_am_quantity: string;
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

  ioi_dollar_value: string;

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
    next: DealRecommendationResponse
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

  const cards = useMemo(() => {
    if (!data) return null;

    return (
      <Grid container spacing={2}>
        {/* 1) Valuation (editable) */}
        <Grid item xs={12}>
          <ValuationCard
            value={valuationSummary}
            onChange={setValuationSummary}
            saving={savingValuation}
            onSave={async () => {
              setSavingValuation(true);
              try {
                const next = { ...data, valuation_summary: valuationSummary };
                setData(next); // optimistic

                await onSaveValuation?.(valuationSummary, next);
              } finally {
                setSavingValuation(false);
              }
            }}
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
          <IOICard ioi_dollar_value={data.ioi_dollar_value} />
        </Grid>

        {/* 7) AM output */}
        <Grid item xs={12}>
          <AMOutputCard
            t1d_overall_rating={data.t1d_overall_rating}
            t1w_overall_rating={data.t1w_overall_rating}
            t1m_overall_rating={data.t1m_overall_rating}
            AM_strategy_recommendation={data.AM_strategy_recommendation}
            potential_am_quantity={data.potential_am_quantity}
          />
        </Grid>
      </Grid>
    );
  }, [data, onSaveValuation, savingValuation, valuationSummary]);

  if (loading) return <div>Loading...</div>;
  if (errorMsg) return <div style={{ color: "crimson" }}>Error: {errorMsg}</div>;
  if (!data) return <div>No data</div>;

  return <>{cards}</>;
};

export default DealRecommendationHome;
