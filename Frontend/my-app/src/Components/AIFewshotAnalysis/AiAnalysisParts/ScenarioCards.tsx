import React from "react";
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

type ScenarioCardsProps = {
  base?: string;
  bullish?: string;
  bearish?: string;
};

const ScenarioCards: React.FC<ScenarioCardsProps> = ({ base, bullish, bearish }) => {
  const cards = [
      { title: "Bearish Scenario", body: bearish, tone: "bearish" as const, icon: <AlertTriangle className="h-4 w-4 text-rose-600" /> },

    { title: "Base Case", body: base, tone: "base" as const, icon: <Activity className="h-4 w-4 text-slate-500" /> },
    { title: "Bullish Scenario", body: bullish, tone: "bullish" as const, icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" /> },
  ];

  const toneStyle = (tone: "base" | "bullish" | "bearish") => {
    if (tone === "bullish") return "bg-emerald-50 border-emerald-100";
    if (tone === "bearish") return "bg-rose-50 border-rose-100";
    return "bg-slate-50 border-slate-100";
  };

  return (
    <section className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black">Scenario Analysis</p>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(({ title, body, tone, icon }) => (
          <div key={title} className={`rounded-2xl border shadow-sm p-5 ${toneStyle(tone)}`}>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">{icon}</div>
              <p className="font-semibold text-purple-900"><ReactMarkdown>{title}</ReactMarkdown></p>
            </div>
            <div className="mt-3 text-sm leading-relaxed text-slate-700">
              <p className="whitespace-pre-line leading-relaxed text-slate-700">
              <ReactMarkdown>{body}</ReactMarkdown>
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ScenarioCards;
