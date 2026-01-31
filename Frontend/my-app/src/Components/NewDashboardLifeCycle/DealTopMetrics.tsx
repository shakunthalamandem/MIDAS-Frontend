import React from "react";

function MetricBox({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-semibold text-slate-900">
        {value ?? "-"}
      </div>
    </div>
  );
}

export default function DealTopMetrics({
  fairValue,
  indicationOfInterest,
  afterMarketThreshold,
}: {
  fairValue: string;
  indicationOfInterest: string;
  afterMarketThreshold: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 text-sm font-semibold text-slate-900">
        Key Deal Metrics
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricBox label="Fair Value Estimate" value={fairValue} />
        <MetricBox label="Indication of Interest" value={indicationOfInterest} />
        <MetricBox label="After Market Threshold" value={afterMarketThreshold} />
      </div>
    </div>
  );
}
