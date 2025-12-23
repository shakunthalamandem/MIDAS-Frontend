import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import BalanceIcon from "@mui/icons-material/Balance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

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
      week:
        obj["1-Week Sentiment"] ||
        obj["1-week sentiment"] ||
        (record["Expected 1-Week Sentiment"] as string) ||
        "-",
      month:
        obj["1-Month Sentiment"] ||
        obj["1-month sentiment"] ||
        (record["Expected 1-Month Sentiment"] as string) ||
        "-",
      volatility: obj["Expected Volatility"] || obj["expected volatility"] || "-",
      confidence:
        obj["Confidence Level"] || obj["confidence level"] || obj["confidence"] || "-",
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
    const regex = new RegExp(
      `-\\s*\\*\\*${label}[^*]*\\*\\*:\\s*([\\s\\S]*?)(?=\\n-\\s*\\*\\*|$)`,
      "i"
    );
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

const CleanCard: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        boxShadow: "0 14px 36px rgba(0,0,0,0.06)",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "grey.900" }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" sx={{ mt: 0.5, color: "grey.600" }}>
            {subtitle}
          </Typography>
        ) : null}
        <Box sx={{ mt: 2 }}>{children}</Box>
      </CardContent>
    </Card>
  );
};

const ExecutiveHero: React.FC<{
  companyName: string;
  summary?: string;
}> = ({ companyName, summary }) => {
  return (
    <Box
      sx={{
        borderRadius: 5,
        p: { xs: 2.5, md: 4 },
        color: "common.white",
        boxShadow: "0 18px 50px rgba(2,6,23,0.25)",
        background:
          "linear-gradient(135deg, rgba(2,6,23,1) 0%, rgba(10,23,55,1) 45%, rgba(15,23,42,1) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Typography
        variant="overline"
        sx={{ letterSpacing: 2, opacity: 0.75, fontWeight: 700 }}
      >
        Executive Summary
      </Typography>

      <Typography
        variant="h4"
        sx={{
          mt: 1,
          fontWeight: 900,
          lineHeight: 1.15,
          letterSpacing: -0.5,
        }}
      >
        {companyName}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          mt: 2,
          color: "rgba(255,255,255,0.86)",
          lineHeight: 1.75,
          maxWidth: 980,
        }}
      >
        {summary || "—"}
      </Typography>
    </Box>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string;
  tone?: "success" | "warning" | "info" | "default";
}> = ({ label, value, tone = "default" }) => {
  const toneStyles =
    tone === "success"
      ? { chipBg: "rgba(34,197,94,0.14)", chipColor: "rgb(22,163,74)" }
      : tone === "warning"
      ? { chipBg: "rgba(245,158,11,0.16)", chipColor: "rgb(217,119,6)" }
      : tone === "info"
      ? { chipBg: "rgba(59,130,246,0.14)", chipColor: "rgb(37,99,235)" }
      : { chipBg: "rgba(107,114,128,0.12)", chipColor: "rgb(55,65,81)" };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        bgcolor: "background.paper",
        boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Typography
          variant="overline"
          sx={{ color: "grey.600", fontWeight: 800, letterSpacing: 1.2 }}
        >
          {label}
        </Typography>

        <Box sx={{ mt: 1 }}>
          {value && value.length <= 22 ? (
            <Chip
              label={value}
              sx={{
                fontWeight: 800,
                px: 0.5,
                bgcolor: toneStyles.chipBg,
                color: toneStyles.chipColor,
              }}
            />
          ) : (
            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "grey.900" }}>
              {value || "-"}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const ScenarioGrid: React.FC<ScenarioParts> = ({ base, bullish, bearish }) => {
  type Tone = "base" | "bullish" | "bearish";

  const ScenarioItem = ({
    tone,
    title,
    text,
  }: {
    tone: Tone;
    title: string;
    text?: string;
  }) => {
    const toneMap: Record<
      Tone,
      { accent: string; chipBg: string; chipColor: string; icon: React.ReactNode }
    > = {
      base: {
        accent: "linear-gradient(90deg, #6366F1 0%, #A78BFA 100%)",
        chipBg: "rgba(99,102,241,0.14)",
        chipColor: "#4338CA",
        icon: <BalanceIcon sx={{ fontSize: 18 }} />,
      },
      bullish: {
        accent: "linear-gradient(90deg, #22C55E 0%, #86EFAC 100%)",
        chipBg: "rgba(34,197,94,0.14)",
        chipColor: "#15803D",
        icon: <TrendingUpIcon sx={{ fontSize: 18 }} />,
      },
      bearish: {
        accent: "linear-gradient(90deg, #F97316 0%, #FDBA74 100%)",
        chipBg: "rgba(249,115,22,0.16)",
        chipColor: "#C2410C",
        icon: <TrendingDownIcon sx={{ fontSize: 18 }} />,
      },
    };

    const t = toneMap[tone];

    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "grey.200",
          bgcolor: "background.paper",
          boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
          overflow: "hidden",
          height: "100%",
          transition: "transform 180ms ease, box-shadow 180ms ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 18px 38px rgba(0,0,0,0.10)",
          },
        }}
      >
        <Box sx={{ height: 6, background: t.accent }} />
        <CardContent sx={{ p: 2.25 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: t.chipBg,
                  color: t.chipColor,
                }}
              >
                {t.icon}
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "grey.900" }}>
                  {title}
                </Typography>
                <Typography variant="caption" sx={{ color: "grey.600" }}>
                  Scenario view
                </Typography>
              </Box>
            </Box>

            <Chip
              label={tone.toUpperCase()}
              size="small"
              sx={{
                fontWeight: 900,
                bgcolor: t.chipBg,
                color: t.chipColor,
                borderRadius: 2,
              }}
            />
          </Box>

          <Typography
            variant="body2"
            sx={{
              mt: 1.5,
              color: "grey.700",
              lineHeight: 1.75,
              display: "-webkit-box",
              WebkitLineClamp: 7,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {text || "—"}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
      }}
    >
      <ScenarioItem tone="base" title="Base Case" text={base} />
      <ScenarioItem tone="bullish" title="Bullish" text={bullish} />
      <ScenarioItem tone="bearish" title="Bearish" text={bearish} />
    </Box>
  );
};

const TextBlock: React.FC<{ text?: string }> = ({ text }) => {
  const lines = useMemo(() => bulletize(text), [text]);
  if (!text) return <Typography color="text.secondary">—</Typography>;

  if (lines.length >= 2) {
    return (
      <Stack spacing={1}>
        {lines.map((l, idx) => (
          <Box key={idx} sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                mt: "8px",
                borderRadius: "999px",
                bgcolor: "grey.900",
                flex: "0 0 auto",
              }}
            />
            <Typography variant="body2" sx={{ color: "grey.700", lineHeight: 1.75 }}>
              {l}
            </Typography>
          </Box>
        ))}
      </Stack>
    );
  }

  return (
    <Typography variant="body2" sx={{ color: "grey.700", lineHeight: 1.85 }}>
      {text}
    </Typography>
  );
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
          if (first) setAnalysis(first);
          else setError("No analysis available yet.");
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
  const scenarios = useMemo(
    () => parseScenarioParts(analysis?.["Scenario Analysis"] as string),
    [analysis]
  );
  const expectationText = useMemo(
    () =>
      (analysis?.["Expectation vs Reality - Predictive Version"] as string) ??
      (analysis?.["Expectation vs Reality ƒ? Predictive Version"] as string),
    [analysis]
  );

  const toneForWeek = useMemo(() => {
    const v = (outlook.week || "").toLowerCase();
    if (v.includes("bull")) return "success";
    if (v.includes("bear")) return "warning";
    if (v.includes("neutral")) return "info";
    return "default";
  }, [outlook.week]);

  const toneForVol = useMemo(() => {
    const v = (outlook.volatility || "").toLowerCase();
    if (v.includes("high")) return "warning";
    if (v.includes("low")) return "success";
    return "default";
  }, [outlook.volatility]);

  const toneForConf = useMemo(() => {
    const v = (outlook.confidence || "").toLowerCase();
    if (v.includes("high")) return "success";
    if (v.includes("low")) return "warning";
    return "default";
  }, [outlook.confidence]);

  if (!ticker) {
    return (
      <CleanCard title="AI Few-shot Review">
        <Typography color="text.secondary">Select a ticker above to view the AI analysis.</Typography>
      </CleanCard>
    );
  }

  if (loading) {
    return (
      <CleanCard title="AI Few-shot Review">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <CircularProgress size={18} />
          <Typography color="text.secondary">Loading AI analysis…</Typography>
        </Box>
      </CleanCard>
    );
  }

  if (error) {
    return (
      <CleanCard title="AI Few-shot Review">
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      </CleanCard>
    );
  }

  if (!analysis) {
    return (
      <CleanCard title="AI Few-shot Review">
        <Typography color="text.secondary">AI analysis will be available soon.</Typography>
      </CleanCard>
    );
  }

  return (
    <Stack spacing={2.25}>
      <ExecutiveHero companyName={ticker} summary={analysis["Executive Summary"] as string | undefined} />

      <Box>
        <Typography
          variant="overline"
          sx={{ color: "grey.700", fontWeight: 900, letterSpacing: 2, pl: 0.5 }}
        >
          Outlook Summary
        </Typography>

        <Box
          sx={{
            mt: 1.25,
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          }}
        >
          <StatCard label="1-WEEK SENTIMENT" value={outlook.week} tone={toneForWeek as any} />
          <StatCard label="1-MONTH SENTIMENT" value={outlook.month} tone="info" />
          <StatCard label="EXPECTED VOLATILITY" value={outlook.volatility} tone={toneForVol as any} />
          <StatCard label="CONFIDENCE" value={outlook.confidence} tone={toneForConf as any} />
        </Box>
      </Box>

      <CleanCard title="Scenario Analysis">
        <ScenarioGrid base={scenarios.base} bullish={scenarios.bullish} bearish={scenarios.bearish} />
      </CleanCard>

      <CleanCard title="Sentiment Details" subtitle="Expanded rationale for near-term and 1-month outlook.">
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "grey.900" }}>
              1-Week Detail
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <TextBlock text={analysis["Expected 1-Week Sentiment"] as string | undefined} />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "grey.900" }}>
              1-Month Detail
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <TextBlock text={analysis["Expected 1-Month Sentiment"] as string | undefined} />
          </Box>
        </Box>
      </CleanCard>

      <CleanCard title="Analogical Assessment">
        <TextBlock text={analysis["Case-Based Analogical Assessment"] as string | undefined} />
      </CleanCard>

      <CleanCard title="Expectation vs Reality">
        <TextBlock text={expectationText} />
      </CleanCard>
    </Stack>
  );
};

export default AiAnalysis;
