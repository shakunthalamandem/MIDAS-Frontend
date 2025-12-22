import React from "react";
import { CalendarDays, Notebook } from "lucide-react";

type OutlookDetailCardsProps = {
  weekDetail?: string;
  monthDetail?: string;
};

const OutlookDetailCards: React.FC<OutlookDetailCardsProps> = ({ weekDetail, monthDetail }) => {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-0 flex overflow-hidden">
        <div className="w-1.5 bg-purple-500" aria-hidden="true" />
        <div className="p-6 flex items-start gap-3 flex-1">
          <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shadow-sm">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide textblack">1-Week Outlook</p>
            <div className="mt-2 text-sm leading-relaxed text-slate-700">
              <p className="whitespace-pre-line leading-relaxed text-slate-700">
                {weekDetail || "No 1-week outlook available."}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-0 flex overflow-hidden">
        <div className="w-1.5 bg-cyan-500" aria-hidden="true" />
        <div className="p-6 flex items-start gap-3 flex-1">
          <div className="h-10 w-10 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center shadow-sm">
            <Notebook className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-black">1-Month Outlook</p>
            <div className="mt-2 text-sm leading-relaxed text-slate-700">
              <p className="whitespace-pre-line leading-relaxed text-slate-700">
                {monthDetail || "No 1-month outlook available."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OutlookDetailCards;
