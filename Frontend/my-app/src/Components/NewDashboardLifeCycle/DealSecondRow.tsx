import React from "react";
import type { DealRecommendationResponse } from "./DealRecomendation";

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function Pill({
  text,
  tone = "neutral",
}: {
  text: string;
  tone?: "positive" | "neutral" | "warning" | "info";
}) {
  const cls =
    tone === "positive"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : tone === "warning"
      ? "bg-amber-50 text-amber-800 border-amber-100"
      : tone === "info"
      ? "bg-sky-50 text-sky-700 border-sky-100"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        cls
      )}
    >
      {text}
    </span>
  );
}

function toneFromPrediction(pred: string): "positive" | "neutral" | "warning" {
  const p = (pred || "").toLowerCase();
  if (p.includes("positive") || p.includes("bull") || p.includes("up"))
    return "positive";
  if (p.includes("low") || p.includes("negative") || p.includes("bear"))
    return "warning";
  return "neutral";
}

function formatPct(n?: number | null) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  return `${n.toFixed(1)}%`;
}

function formatNum(n?: number | null, d = 2) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  return n.toFixed(d);
}

/** Small “prediction card” that visually resembles your screenshot tiles */
function PredictionTile({
  title,
  pred,
  confidence,
}: {
  title: string;
  pred: string;
  confidence: number;
}) {
  const tone = toneFromPrediction(pred);
  const barPct = Math.max(0, Math.min(100, confidence || 0));

  const barTone =
    tone === "positive"
      ? "bg-emerald-500"
      : tone === "warning"
      ? "bg-amber-500"
      : "bg-slate-400";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold text-slate-800">{title}</div>
      <div className="mt-2">
        <Pill text={(pred || "NEUTRAL").toUpperCase()} tone={tone} />
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-2 rounded-full", barTone)}
          style={{ width: `${barPct}%` }}
        />
      </div>

      <div className="mt-2 text-xs text-slate-600">
        Prob. <span className="font-semibold text-slate-800">{formatPct(confidence)}</span>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-slate-900">{title}</div>
      {children}
    </div>
  );
}

function ValuationBlock({ valuation }: { valuation: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2 text-sm font-semibold text-slate-900">Valuation</div>
      <div className="whitespace-pre-line text-sm leading-6 text-slate-700">
        {valuation || "-"}
      </div>
    </div>
  );
}

function DealMomentum({
  data,
}: {
  data: DealRecommendationResponse;
}) {
  return (
    <SectionCard title="Deal Momentum (Avg Price)">
      <div className="text-xs text-slate-500 mb-3">
        Comparison of last 5 vs last 10 deals across 1D / 1W / 1M windows
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 font-semibold">Window</th>
              <th className="px-3 py-2 font-semibold">Last 5 Deals</th>
              <th className="px-3 py-2 font-semibold">Last 10 Deals</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            <tr className="border-t border-slate-200">
              <td className="px-3 py-2 font-medium text-slate-800">1st Day</td>
              <td className="px-3 py-2 text-slate-700">
                {formatNum(data.last_5_t1d_avg_price)}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {formatNum(data.last_10_t1d_avg_price)}
              </td>
            </tr>
            <tr className="border-t border-slate-200">
              <td className="px-3 py-2 font-medium text-slate-800">1st Week</td>
              <td className="px-3 py-2 text-slate-700">
                {formatNum(data.last_5_t1w_avg_price)}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {formatNum(data.last_10_t1w_avg_price)}
              </td>
            </tr>
            <tr className="border-t border-slate-200">
              <td className="px-3 py-2 font-medium text-slate-800">1st Month</td>
              <td className="px-3 py-2 text-slate-700">
                {formatNum(data.last_5_t1m_avg_price)}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {formatNum(data.last_10_t1m_avg_price)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function OutlookSummaryRow({
  data,
}: {
  data: DealRecommendationResponse;
}) {
  // Mapping to your screenshot-style “Outlook Summary”
  const weekTone = toneFromPrediction(data.fs_1w_sentiment);
  const monthTone = toneFromPrediction(data.fs_1m_sentiment);

  const volTone: "info" | "neutral" | "warning" =
    (data.fs_expected_volatility || "").toLowerCase().includes("high")
      ? "info"
      : "neutral";

  const confTone: "warning" | "neutral" | "positive" =
    (data.fs_confidence_level || "").toLowerCase().includes("high")
      ? "positive"
      : (data.fs_confidence_level || "").toLowerCase().includes("medium")
      ? "warning"
      : "neutral";

  return (
    <SectionCard title="Outlook Summary">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium text-slate-700">1-Week Sentiment</div>
          <div className="mt-3">
            <Pill text={data.fs_1w_sentiment || "-"} tone={weekTone} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium text-slate-700">1-Month Sentiment</div>
          <div className="mt-3">
            <Pill text={data.fs_1m_sentiment || "-"} tone={monthTone} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium text-slate-700">Expected Volatility</div>
          <div className="mt-3">
            <Pill text={data.fs_expected_volatility || "-"} tone={volTone} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium text-slate-700">Confidence</div>
          <div className="mt-3">
            <Pill text={data.fs_confidence_level || "-"} tone={confTone} />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function HumanSentiment({
  oneWeek,
  oneMonth,
}: {
  oneWeek: string;
  oneMonth: string;
}) {
  return (
    <SectionCard title="Market Sentiment">
      <div className="flex flex-wrap gap-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">One Week</div>
          <div className="mt-2">
            <Pill text={oneWeek || "-"} tone={toneFromPrediction(oneWeek)} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">One Month</div>
          <div className="mt-2">
            <Pill text={oneMonth || "-"} tone={toneFromPrediction(oneMonth)} />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function OverallAISummary({
  t1d,
  t1w,
  t1m,
}: {
  t1d: string;
  t1w: string;
  t1m: string;
}) {
  return (
    <SectionCard title="Overall AI Summary">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">T+1 Day</div>
          <div className="mt-2 text-sm font-semibold text-slate-900">
            {t1d || "-"}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">T+1 Week</div>
          <div className="mt-2 text-sm font-semibold text-slate-900">
            {t1w || "-"}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium text-slate-500">T+1 Month</div>
          <div className="mt-2 text-sm font-semibold text-slate-900">
            {t1m || "-"}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

export default function DealSecondRow({ data }: { data: DealRecommendationResponse }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* LEFT: Valuation + Deal momentum */}
        <div className="space-y-4">
          <ValuationBlock valuation={data.valuation} />
          <DealMomentum data={data} />
        </div>

        {/* RIGHT: AI/ML tiles + outlook + sentiments + overall */}
        <div className="space-y-4">
          <SectionCard title="AI/ML Predictions">
            {/* As per your screenshot: 4 tiles there, but here only 3 */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <PredictionTile
                title="T+1 Day"
                pred={data.t1d_pred}
                confidence={data.t1d_confidence}
              />
              <PredictionTile
                title="T+1 Week"
                pred={data.t1w_pred}
                confidence={data.t1w_confidence}
              />
              <PredictionTile
                title="T+1 Month"
                pred={data.t1m_pred}
                confidence={data.t1m_confidence}
              />
            </div>
          </SectionCard>

          {/* “AI models” block: fs_... fields (your second attached image style) */}
          <OutlookSummaryRow data={data} />

          {/* Below this: one_week_sentiment, one_month_sentiment */}
          <HumanSentiment
            oneWeek={data.one_week_sentiment}
            oneMonth={data.one_month_sentiment}
          />

          {/* Overall AI summary */}
          <OverallAISummary
            t1d={data.t1d_overall_prediction}
            t1w={data.t1w_overall_prediction}
            t1m={data.t1m_overall_prediction}
          />
        </div>
      </div>
    </div>
  );
}
