import React from "react";
import { Sparkles } from "lucide-react";

type ExecutiveSummaryCardProps = {
  companyName: string;
  summary?: string;
};

const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({ companyName, summary }) => {
  return (
    <div className="rounded-3xl bg-[#eef2ff] text-[#002060] shadow-lg border border-[#dbe4ff] p-8 sm:p-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#002060] font-semibold">Executive Summary</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight">{companyName}</h2>
          <div className="mt-4 text-lg text-[#002060] leading-relaxed">
            <p className="whitespace-pre-line text-[#002060]">
              {summary || "AI-generated outlook will appear here once available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummaryCard;
