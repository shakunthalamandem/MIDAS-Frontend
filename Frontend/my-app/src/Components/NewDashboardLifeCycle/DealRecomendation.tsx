import React, { useEffect, useMemo, useState } from "react";
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

  AM_strategy_recommendation: string;
}

interface DashboardProps {
  ticker?: string;
}

type LoadState = "idle" | "loading" | "success" | "error";
const apiUrl = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("access_token");

async function fetchDealRecommendation(ticker: string) {
  const res = await fetch(`${apiUrl}/api/deal_recommendation/`, {
    method: "POST",
    headers: { "Content-Type": "application/json",Authorization: token ? `Bearer ${token}` : "", },
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
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Deal Recommendation
            </h1>
            <p className="text-sm text-slate-500">
              {effectiveTicker ? `Ticker: ${effectiveTicker}` : "Select a ticker to view insights"}
            </p>
          </div>

          {state === "loading" && (
            <div className="text-sm text-slate-500">Loading…</div>
          )}
        </div>

        {/* Empty */}
        {!effectiveTicker && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
            Please provide a ticker to fetch the deal recommendation.
          </div>
        )}

        {/* Error */}
        {effectiveTicker && state === "error" && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <div className="font-semibold">Could not load data</div>
            <div className="text-sm opacity-90">{error}</div>
          </div>
        )}

        {/* Content */}
        {effectiveTicker && data && (
          <>
            {/* 1st card: top metrics in 3 columns */}
            <DealTopMetrics
              fairValue={data.fair_value_estimate}
              indicationOfInterest={data.indication_of_interest}
              afterMarketThreshold={data.after_market_threshold}
            />

            {/* 2nd card: split vertical (left valuation+momentum, right AI/ML) */}
            <DealSecondRow data={data} />

            {/* 3rd card: horizontal AM recommendation + qty */}
            <DealAMStrategy
              recommendation={data.AM_strategy_recommendation}
              potentialQty={data.potential_am_quantity}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DealRecomendation;
