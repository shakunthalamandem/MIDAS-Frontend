import React from "react";
import { Minus, TrendingUp } from "lucide-react";

type OutlookSummaryRowProps = {
  week: string;
  month: string;
  volatility: string;
  confidence: string;
};

const sentimentTone = (value?: string) => {
  const text = (value || "").toLowerCase();
  if (text.includes("bull")) return { label: value || "Bullish", className: "bg-emerald-100 text-emerald-800" };
  if (text.includes("bear")) return { label: value || "Bearish", className: "bg-rose-100 text-rose-800" };
  if (text.includes("neutral") || text.includes("cautious")) return { label: value || "Neutral", className: "bg-slate-200 text-slate-700" };
  return { label: value || "-", className: "bg-slate-100 text-slate-700" };
};

const OutlookSummaryRow: React.FC<OutlookSummaryRowProps> = ({ week, month, volatility, confidence }) => {
  const cards = [
    { label: "1-week sentiment", value: week, isSentiment: true, icon: <TrendingUp className="h-4 w-4" /> },
    { label: "1-month sentiment", value: month, isSentiment: true },
    { label: "Expected volatility", value: volatility, isSentiment: false },
    { label: "Confidence", value: confidence, isSentiment: false },
  ];

  return (
    <section className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#002060]">Outlook Summary</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, isSentiment, icon }) => {
          const tone = sentimentTone(value);
          const isVol = label.toLowerCase().includes("volatility");
          return (
            <div key={label} className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5 flex flex-col gap-3">
              <p className="text-[14px] font-semibold uppercase tracking-wide text-[#002060]">{label}</p>
              {isSentiment ? (
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${tone.className}`}>
                    {icon}
                    {tone.label}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`text-base font-semibold ${isVol ? "text-amber-600" : "text-[#002060]"}`}>
                    {value || "-"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default OutlookSummaryRow;
