import React from "react";
import { Building2 } from "lucide-react";

type FundamentalProfileProps = {
  text?: string;
};

const FundamentalProfile: React.FC<FundamentalProfileProps> = ({ text }) => {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 h-full">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-sm">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fundamental Profile</p>
          <div className="text-sm leading-relaxed text-slate-700">
            <p className="whitespace-pre-line text-slate-700">
              {text || "No fundamental profile available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundamentalProfile;
