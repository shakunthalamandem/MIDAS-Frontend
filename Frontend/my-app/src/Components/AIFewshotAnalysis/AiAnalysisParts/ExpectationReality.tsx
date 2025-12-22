import React from "react";
import { Activity } from "lucide-react";
import ReactMarkdown from "react-markdown";

type ExpectationRealityProps = {
  text?: string;
};

const ExpectationReality: React.FC<ExpectationRealityProps> = ({ text }) => {
  return (
    <section className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-sm">
          <Activity className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <p className="text-m font-semibold uppercase tracking-wide text-black">Expectation vs Reality</p>
          <div className="space-y-2 text-sm text-slate-700">
            <p className="whitespace-pre-line text-slate-700">
            <ReactMarkdown>{text}</ReactMarkdown>
              
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpectationReality;
