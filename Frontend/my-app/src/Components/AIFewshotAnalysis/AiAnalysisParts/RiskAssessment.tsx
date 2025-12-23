import React from "react";
import { AlertTriangle } from "lucide-react";

type RiskAssessmentProps = {
  text?: string;
};

const RiskAssessment: React.FC<RiskAssessmentProps> = ({ text }) => {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 h-full">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-sm">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Risk Assessment</p>
          <div className="text-sm leading-relaxed text-slate-700">
            <p className="whitespace-pre-line text-slate-700">
              {text || "No risk assessment available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAssessment;
