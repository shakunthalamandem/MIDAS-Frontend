// ✅ UPDATED FILE 2: src/Components/NewDashboardLifeCycle/DealAMStrategyContainer.tsx
import React, { useEffect, useMemo, useState } from "react";
import DealAMStrategyView, {
  DealState,
  SummaryKey,
  SummaryOption,
  SummaryState,
} from "./DealAMStrategyView";

type Props = {
  recommendation: string;
  potentialQty: number | null;
  ticker: string;
  overallSummary: { t1d: string; t1w: string; t1m: string };
};

function mapToSummaryOption(value?: string): SummaryOption {
  const normalized = (value || "").toLowerCase();
  if (normalized.includes("positive") || normalized.includes("bull") || normalized.includes("up")) return "Positive";
  if (
    normalized.includes("negative") ||
    normalized.includes("bear") ||
    normalized.includes("down") ||
    normalized.includes("low")
  )
    return "Negative";
  return "Neutral";
}

function buildSummaryState(values: Partial<Record<SummaryKey, string>>): SummaryState {
  return {
    t1d: mapToSummaryOption(values.t1d),
    t1w: mapToSummaryOption(values.t1w),
    t1m: mapToSummaryOption(values.t1m),
  };
}

function toIntOrNull(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

/**
 * ✅ Single mapping function: backend → UI
 * If your backend keys differ, edit here only.
 */
function normalizeDealFromApi(data: any, fallback: DealState): DealState {
  const rec =
    data?.am_strategy_recommendation ??
    data?.amStrategyRecommendation ??
    data?.recommendation ??
    data?.AM_strategy_recommendation ?? // sometimes backend uses this
    fallback.am_strategy_recommendation ??
    "";

  const qtyRaw =
    data?.potential_am_quantity ??
    data?.potentialAmQuantity ??
    data?.potentialQty ??
    data?.potential_AM_quantity ??
    data?.potential_am_qty ??
    fallback.potential_am_quantity ??
    null;

  const overall = buildSummaryState({
    t1d:
      data?.t1d_overall_pred ??
      data?.t1dOverallPred ??
      data?.overallSummary?.t1d ??
      data?.t1d ??
      fallback.overall.t1d,
    t1w:
      data?.t1w_overall_pred ??
      data?.t1wOverallPred ??
      data?.overallSummary?.t1w ??
      data?.t1w ??
      fallback.overall.t1w,
    t1m:
      data?.t1m_overall_pred ??
      data?.t1mOverallPred ??
      data?.overallSummary?.t1m ??
      data?.t1m ??
      fallback.overall.t1m,
  });

  return {
    am_strategy_recommendation: String(rec ?? ""),
    potential_am_quantity: toIntOrNull(qtyRaw),
    overall,
  };
}

export default function DealAMStrategyContainer({ recommendation, potentialQty, ticker, overallSummary }: Props) {
  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const stateFromProps = useMemo<DealState>(
    () => ({
      am_strategy_recommendation: recommendation || "",
      potential_am_quantity: potentialQty ?? null,
      overall: buildSummaryState(overallSummary),
    }),
    [recommendation, potentialQty, overallSummary.t1d, overallSummary.t1w, overallSummary.t1m]
  );

  const [current, setCurrent] = useState<DealState>(stateFromProps);
  const [draft, setDraft] = useState<DealState>(stateFromProps);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Sync from props only when NOT editing (prevents overwriting backend-refreshed state)
  useEffect(() => {
    if (isEditing) return;
    setCurrent(stateFromProps);
    setDraft(stateFromProps);
  }, [stateFromProps, isEditing]);

  const openEdit = () => {
    setError(null);
    setDraft(current);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setError(null);
    setDraft(current);
    setIsEditing(false);
  };

  const fetchDeal = async (): Promise<DealState> => {
    if (!API_URL) throw new Error("REACT_APP_API_URL is not set.");

    const res = await fetch(`${API_URL}/api/get_deal_recommendation/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ticker }),
    });

    const raw = await res.text();
    if (!res.ok) throw new Error(raw || "Failed to refresh deal details");

    let data: any = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      // If backend returns plain text accidentally, throw readable error
      throw new Error(raw || "Invalid JSON response from refresh endpoint");
    }

    const normalized = normalizeDealFromApi(data, stateFromProps);

    setCurrent(normalized);
    setDraft(normalized);

    return normalized;
  };

  const handleSave = async () => {
    if (!API_URL) {
      setError("REACT_APP_API_URL is not set.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        ticker,
        potential_am_quantity: draft.potential_am_quantity,
        am_strategy_recommendation: draft.am_strategy_recommendation.trim(),
        t1d_overall_pred: draft.overall.t1d,
        t1w_overall_pred: draft.overall.t1w,
        t1m_overall_pred: draft.overall.t1m,
      };

      const response = await fetch(`${API_URL}/api/update_deal_recommendation/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      if (!response.ok) throw new Error(raw || "Failed to save AM strategy");

      await fetchDeal();
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.message || "Failed to save AM strategy");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DealAMStrategyView
      ticker={ticker}
      isEditing={isEditing}
      isSaving={isSaving}
      error={error}
      current={current}
      draft={draft}
      onOpenEdit={openEdit}
      onCancelEdit={cancelEdit}
      onSave={handleSave}
      onDraftChange={(next: DealState) => setDraft(next)}
    />
  );
}
