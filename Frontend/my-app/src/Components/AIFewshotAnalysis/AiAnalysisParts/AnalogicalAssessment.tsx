import React from "react";
import { MessageSquare } from "lucide-react";

type AnalogicalAssessmentProps = {
  text?: string;
  bullets?: string[];
};

const textToBullets = (text?: string): string[] => {
  if (!text) return [];
  const bulletRegex = /^(?:-|\u2022)\s*/;
  return text
    .split("\n")
    .map((line) => line.replace(bulletRegex, "").trim())
    .filter(Boolean);
};

const AnalogicalAssessment: React.FC<AnalogicalAssessmentProps> = ({ text, bullets }) => {
  const items = bullets && bullets.length ? bullets : textToBullets(text);
  const toHtml = (value: string) => value.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  return (
    <section className="rounded-2xl bg-white border border-slate-100 shadow-sm p-6 space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-sm">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <p className="text-l font-semibold uppercase tracking-wide text-black">Case-Based Analogical Assessment</p>
          <div className="space-y-5 text-sm text-slate-700">
            {items.length ? (
              <ul className="space-y-2 list-disc list-inside">
                {items.map((item) => (
                  <li key={item} className="leading-relaxed">
                    <span
                      className="whitespace-pre-line"
                      dangerouslySetInnerHTML={{ __html: toHtml(item) }}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-600">No analogical assessment available.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalogicalAssessment;
