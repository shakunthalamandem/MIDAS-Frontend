import React, { useEffect, useMemo, useState } from "react";
import ExecutiveSummaryCard from "./AiAnalysisParts/ExecutiveSummaryCard";
import OutlookSummaryRow from "./AiAnalysisParts/OutlookSummaryRow";
import ScenarioCards from "./AiAnalysisParts/ScenarioCards";
import OutlookDetailCards from "./AiAnalysisParts/OutlookDetailCards";
import AnalogicalAssessment from "./AiAnalysisParts/AnalogicalAssessment";
import ExpectationReality from "./AiAnalysisParts/ExpectationReality";
// import FundamentalProfile from "./AiAnalysisParts/FundamentalProfile";
// import RiskAssessment from "./AiAnalysisParts/RiskAssessment";
import { AlertTriangle } from "lucide-react";

type AiAnalysisProps = {
  ticker: string | null;
};

type AiAnalysisRecord = {
  [key: string]: unknown;
  "Executive Summary"?: string;
  "Case-Based Analogical Assessment"?: string;
  "Expected 1-Week Sentiment"?: string;
  "Expected 1-Month Sentiment"?: string;
  "Scenario Analysis"?: string;
  "Early Risk Materialization Assessment"?: string;
  "Expectation vs Reality - Predictive Version"?: string;
  "Expectation vs Reality ƒ? Predictive Version"?: string;
  "Final Sentiment & Volatility Outlook"?: string | Record<string, string>;
};

type AiAnalysisApiResponse = {
  answer?: AiAnalysisRecord[];
};

type FinalOutlook = {
  week: string;
  month: string;
  volatility: string;
  confidence: string;
};

type ScenarioParts = {
  base?: string;
  bullish?: string;
  bearish?: string;
};

const DEFAULT_OUTLOOK: FinalOutlook = {
  week: "-",
  month: "-",
  volatility: "-",
  confidence: "-",
};

const textToBullets = (text?: string): string[] => {
  if (!text) return [];
  const bulletRegex = /^(?:-|\u2022)\s*/;
  return text
    .split("\n")
    .map((line) => line.replace(bulletRegex, "").trim())
    .filter(Boolean);
};

const parseFinalOutlook = (record?: AiAnalysisRecord): FinalOutlook => {
  if (!record) return DEFAULT_OUTLOOK;
  const outlookField = record["Final Sentiment & Volatility Outlook"];

  if (outlookField && typeof outlookField === "object") {
    const obj = outlookField as Record<string, string>;
    return {
      week: obj["1-Week Sentiment"] || obj["1-week sentiment"] || (record["Expected 1-Week Sentiment"] as string) || "-",
      month:
        obj["1-Month Sentiment"] || obj["1-month sentiment"] || (record["Expected 1-Month Sentiment"] as string) || "-",
      volatility: obj["Expected Volatility"] || obj["expected volatility"] || "-",
      confidence: obj["Confidence Level"] || obj["confidence level"] || obj["confidence"] || "-",
    };
  }

  const fromFinal = (outlookField as string) || "";
  const pick = (label: string, fallback?: string) => {
    const regex = new RegExp(`${label}\\s*:\\s*([^\\n]+)`, "i");
    const match = fromFinal.match(regex);
    return (match && match[1]?.trim()) || fallback || "-";
  };
  return {
    week: pick("1-week sentiment", record["Expected 1-Week Sentiment"] as string),
    month: pick("1-month sentiment", record["Expected 1-Month Sentiment"] as string),
    volatility: pick("expected volatility"),
    confidence: pick("confidence level", pick("confidence")),
  };
};

const parseScenarioParts = (text?: string): ScenarioParts => {
  if (!text) return {};
  const grab = (label: string) => {
    const regex = new RegExp(`-\\s*\\*\\*${label}[^*]*\\*\\*:\\s*([\\s\\S]*?)(?=\\n-\\s*\\*\\*|$)`, "i");
    const match = text.match(regex);
    return match ? match[1].trim() : undefined;
  };

  const base = grab("Base Case");
  const bullish = grab("Bullish");
  const bearish = grab("Bearish");

  if (base || bullish || bearish) return { base, bullish, bearish };

  const lines = textToBullets(text);
  return {
    base: lines[0],
    bullish: lines[1],
    bearish: lines[2],
  };
};

const AiAnalysis: React.FC<AiAnalysisProps> = ({ ticker }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [analysis, setAnalysis] = useState<AiAnalysisRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!ticker) {
      setAnalysis(null);
      setError(null);
      setLoading(false);
      return;
    }

    if (!API_URL) {
      setError("REACT_APP_API_URL is not set.");
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      setAnalysis(null);
      try {
        const res = await fetch(`${API_URL}/api/get_few_shot_review/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker }),
        });
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const json = (await res.json()) as AiAnalysisApiResponse;
        const first = Array.isArray(json?.answer) && json.answer.length > 0 ? json.answer[0] : null;
        if (!cancelled) {
          if (first) {
            setAnalysis(first);
          } else {
            setError("No analysis available yet.");
          }
        }
      } catch (err) {
        console.error("Error fetching AI analysis", err);
        if (!cancelled) setError("Unable to load AI analysis. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAnalysis();
    return () => {
      cancelled = true;
    };
  }, [API_URL, ticker]);

  const outlook = useMemo(() => parseFinalOutlook(analysis || undefined), [analysis]);
  const scenarios = useMemo(() => parseScenarioParts(analysis?.["Scenario Analysis"] as string), [analysis]);
  const expectationText = useMemo(
    () =>
      (analysis?.["Expectation vs Reality - Predictive Version"] as string) ??
      (analysis?.["Expectation vs Reality ƒ? Predictive Version"] as string),
    [analysis]
  );
  const fundamentalProfile = analysis?.["Fundamental Profile of the New IPO"] as string | undefined;
  const riskAssessment = analysis?.["Early Risk Materialization Assessment"] as string | undefined;

  if (!ticker) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 text-slate-700">
        Select a ticker above to view the AI few-shot review.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 text-slate-700">
        Loading AI analysis...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        <div className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 text-slate-700">
        AI analysis will be available soon.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <ExecutiveSummaryCard companyName={ticker} summary={analysis["Executive Summary"] as string | undefined} />

      <OutlookSummaryRow
        week={outlook.week}
        month={outlook.month}
        volatility={outlook.volatility}
        confidence={outlook.confidence}
      />

      <ScenarioCards base={scenarios.base} bullish={scenarios.bullish} bearish={scenarios.bearish} />

      {/* <div className="grid gap-4 md:grid-cols-2">
        <FundamentalProfile text={fundamentalProfile} />
        <RiskAssessment text={riskAssessment} />
      </div> */}

      <OutlookDetailCards
        weekDetail={analysis["Expected 1-Week Sentiment"] as string | undefined}
        monthDetail={analysis["Expected 1-Month Sentiment"] as string | undefined}
      />

      <AnalogicalAssessment text={analysis["Case-Based Analogical Assessment"] as string | undefined} />

      <ExpectationReality text={expectationText} />
    </div>
  );
};

export default AiAnalysis;
