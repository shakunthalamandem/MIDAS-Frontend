import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import TimelineIcon from "@mui/icons-material/Timeline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
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

const bulletize = (text?: string): string[] => {
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

  const lines = bulletize(text);
  return {
    base: lines[0],
    bullish: lines[1],
    bearish: lines[2],
  };
};

const SectionCard: React.FC<{ title?: string; subheader?: string; children: React.ReactNode }> = ({
  title,
  subheader,
  children,
}) => (
  <Card
    elevation={6}
    sx={{
      borderRadius: 3,
      boxShadow: "0 14px 36px rgba(0,0,0,0.08)",
      border: "1px solid #e5e7eb",
      background: "#ffffff",
    }}
  >
    {(title || subheader) && (
      <CardHeader
        title={
          title ? (
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1f2937" }}>
              {title}
            </Typography>
          ) : undefined
        }
        subheader={
          subheader ? (
            <Typography variant="body2" sx={{ color: "#6b7280" }}>
              {subheader}
            </Typography>
          ) : undefined
        }
      />
    )}
    <CardContent sx={{ pt: title || subheader ? 0 : 2 }}>{children}</CardContent>
  </Card>
);

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

  if (!ticker) {
    return (
      <SectionCard>
        <Typography color="text.secondary">Select a ticker above to view the AI few-shot review.</Typography>
      </SectionCard>
    );
  }

  if (loading) {
    return (
      <SectionCard>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={18} />
          <Typography color="text.secondary">Loading AI analysis...</Typography>
        </Box>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#b42318" }}>
          <AlertTriangle className="h-5 w-5" />
          <Typography>{error}</Typography>
        </Box>
      </SectionCard>
    );
  }

  if (!analysis) {
    return (
      <SectionCard>
        <Typography color="text.secondary">AI analysis will be available soon.</Typography>
      </SectionCard>
    );
  }

  return (
    <Stack spacing={2}>
      <SectionCard
        title={`${ticker} Sentiment Analysis`}
        subheader="Auto-generated few-shot review based on latest deal data."
      >
        <ExecutiveSummaryCard companyName={ticker} summary={analysis["Executive Summary"] as string | undefined} />
      </SectionCard>

      <SectionCard title="Outlook Summary">
        <OutlookSummaryRow
          week={outlook.week}
          month={outlook.month}
          volatility={outlook.volatility}
          confidence={outlook.confidence}
        />
      </SectionCard>

      <SectionCard title="Scenario Analysis">
        <ScenarioCards base={scenarios.base} bullish={scenarios.bullish} bearish={scenarios.bearish} />
      </SectionCard>

      {/* <SectionCard title="Profile & Risks">
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          <FundamentalProfile text={analysis["Fundamental Profile of the New IPO"] as string | undefined} />
          <RiskAssessment text={analysis["Early Risk Materialization Assessment"] as string | undefined} />
        </Box>
      </SectionCard> */}

      <SectionCard title="Sentiment Details">
        <OutlookDetailCards
          weekDetail={analysis["Expected 1-Week Sentiment"] as string | undefined}
          monthDetail={analysis["Expected 1-Month Sentiment"] as string | undefined}
        />
      </SectionCard>

      <SectionCard title="Analogical Assessment">
        <AnalogicalAssessment text={analysis["Case-Based Analogical Assessment"] as string | undefined} />
      </SectionCard>

      <SectionCard title="Expectation vs Reality">
        <ExpectationReality text={expectationText} />
      </SectionCard>
    </Stack>
  );
};

export default AiAnalysis;
