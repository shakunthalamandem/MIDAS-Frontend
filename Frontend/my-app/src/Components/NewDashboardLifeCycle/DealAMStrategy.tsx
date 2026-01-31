import React from "react";

export default function DealAMStrategy({
  recommendation,
  potentialQty,
}: {
  recommendation: string;
  potentialQty: number | null;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-slate-900">
        After Market (AM) Strategy
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        {/* 80% */}
        <div className="md:col-span-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-medium text-slate-500 mb-2">
            AM Strategy Recommendation
          </div>
          <div className="whitespace-pre-line text-sm leading-6 text-slate-800">
            {recommendation || "-"}
          </div>
        </div>

        {/* 20% */}
        <div className="md:col-span-1 rounded-2xl border border-slate-200 bg-white p-4 flex flex-col justify-between">
          <div className="text-xs font-medium text-slate-500">
            Potential AM Quantity
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {potentialQty ?? "-"}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            (as provided by API)
          </div>
        </div>
      </div>
    </div>
  );
}
