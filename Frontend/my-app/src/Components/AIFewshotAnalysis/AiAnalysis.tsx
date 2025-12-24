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
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import ShowChartRoundedIcon from "@mui/icons-material/ShowChartRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

type AiAnalysisProps = {
  ticker: string | null;
  pricingDate?: string | null;
};

type AiAnalysisRecord = {
  [key: string]: unknown;
  "Executive Summary"?: string;
  "Case-Based Analogical Assessment"?: string;
  "Expected 1-Week Sentiment"?: string;
  "Expected 1-Month Sentiment"?: string;
  "Scenario Analysis"?: string;
  "Early Risk Materialization Assessment"?: string;
  "Expectation vs Reality — Predictive Version"?: string;
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

const APP_FONT = '"Roboto","Helvetica","Arial",sans-serif';

const DEFAULT_OUTLOOK: FinalOutlook = {
  week: "-",
  month: "-",
  volatility: "-",
  confidence: "-",
};

const stripMarkdown = (input?: string): string => {
  if (!input) return "";
  return (
    input
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/_([^_]+)_/g, "$1")
      .replace(/`+/g, "")
      .trim()
  );
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
      week: stripMarkdown(
        obj["1-Week Sentiment"] ||
          obj["1-week sentiment"] ||
          (record["Expected 1-Week Sentiment"] as string) ||
          "-"
      ),
      month: stripMarkdown(
        obj["1-Month Sentiment"] ||
          obj["1-month sentiment"] ||
          (record["Expected 1-Month Sentiment"] as string) ||
          "-"
      ),
      volatility: stripMarkdown(obj["Expected Volatility"] || obj["expected volatility"] || "-"),
      confidence: stripMarkdown(
        obj["Confidence Level"] || obj["confidence level"] || obj["confidence"] || "-"
      ),
    };
  }

  const fromFinal = (outlookField as string) || "";
  const pick = (label: string, fallback?: string) => {
    const regex = new RegExp(`${label}\\s*:\\s*([^\\n]+)`, "i");
    const match = fromFinal.match(regex);
    return stripMarkdown((match && match[1]?.trim()) || fallback || "-");
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
  const cleaned = stripMarkdown(text);

  const grab = (label: string) => {
    const regex = new RegExp(
      `-\\s*\\*\\*${label}[^*]*\\*\\*:\\s*([\\s\\S]*?)(?=\\n-\\s*\\*\\*|$)`,
      "i"
    );
    const match = text.match(regex);
    return match ? stripMarkdown(match[1].trim()) : undefined;
  };

  const base = grab("Base Case");
  const bullish = grab("Bullish");
  const bearish = grab("Bearish");

  if (base || bullish || bearish) return { base, bullish, bearish };

  const lines = bulletize(cleaned);
  return {
    base: lines[0],
    bullish: lines[1],
    bearish: lines[2],
  };
};

/* ---------------- UI atoms ---------------- */

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography
    variant="overline"
    sx={{
      fontFamily: APP_FONT,
      letterSpacing: 2.4,
      fontWeight: 900,
      color: "grey.700",
      px: 0.5,
    }}
  >
    {children}
  </Typography>
);

const SoftCard: React.FC<{
  children: React.ReactNode;
  accent?: string;
  bgTint?: string;
  minHeight?: number;
}> = ({ children, accent = "#EEF2FF", bgTint = "#FFFFFF", minHeight }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      border: "1px solid",
      borderColor: "grey.200",
      background: bgTint,
      boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
      overflow: "hidden",
      height: "100%",
      minHeight,
    }}
  >
    <Box sx={{ height: 6, bgcolor: accent }} />
    <CardContent sx={{ p: 2.5 }}>{children}</CardContent>
  </Card>
);

const IconBubble: React.FC<{ bg: string; color: string; children: React.ReactNode }> = ({
  bg,
  color,
  children,
}) => (
  <Box
    sx={{
      width: 34,
      height: 34,
      borderRadius: 2,
      display: "grid",
      placeItems: "center",
      bgcolor: bg,
      color,
      border: "1px solid rgba(0,0,0,0.04)",
      flex: "0 0 auto",
    }}
  >
    {children}
  </Box>
);

const TextBlock: React.FC<{ text?: string; clamp?: number }> = ({ text, clamp }) => {
  if (!text) {
    return (
      <Typography sx={{ fontFamily: APP_FONT, color: "grey.600" }} variant="body2">
        —
      </Typography>
    );
  }

  const cleaned = stripMarkdown(text);
  const lines = bulletize(cleaned);

  if (lines.length >= 2) {
    return (
      <Stack spacing={1}>
        {lines.map((l, idx) => (
          <Box key={idx} sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                mt: "9px",
                borderRadius: "999px",
                bgcolor: "grey.700",
                opacity: 0.55,
                flex: "0 0 auto",
              }}
            />
            <Typography
              variant="body2"
              sx={{ fontFamily: APP_FONT, color: "grey.700", lineHeight: 1.9 }}
            >
              {l}
            </Typography>
          </Box>
        ))}
      </Stack>
    );
  }

  return (
    <Typography
      variant="body2"
      sx={{
        fontFamily: APP_FONT,
        color: "grey.700",
        lineHeight: 1.95,
        whiteSpace: "pre-wrap",
        ...(clamp
          ? {
              display: "-webkit-box",
              WebkitLineClamp: clamp,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }
          : {}),
      }}
    >
      {cleaned}
    </Typography>
  );
};

const ExecutiveHero: React.FC<{ companyName: string; summary?: string }> = ({ companyName, summary }) => (
  <Box
    sx={{
      borderRadius: 5,
      p: { xs: 2.5, md: 4 },
      color: "common.white",
      boxShadow: "0 18px 50px rgba(2,6,23,0.25)",
      background:
        "linear-gradient(135deg, rgba(2,6,23,1) 0%, rgba(10,23,55,1) 45%, rgba(15,23,42,1) 100%)",
      border: "1px solid rgba(255,255,255,0.08)",
      fontFamily: APP_FONT,
    }}
  >
    <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.8, fontWeight: 900 }}>
      Executive Summary
    </Typography>
    <Typography
      variant="h4"
      sx={{ mt: 1, fontWeight: 900, lineHeight: 1.12, letterSpacing: -0.6 }}
    >
      {companyName}
    </Typography>
    <Typography sx={{ mt: 2, color: "rgba(255,255,255,0.86)", lineHeight: 1.85 }} variant="body1">
      {stripMarkdown(summary) || "—"}
    </Typography>
  </Box>
);

const OutlookCard: React.FC<{
  label: string;
  value: string;
  mode: "chip" | "text";
  chipBg?: string;
  chipColor?: string;
  accent?: string;
}> = ({ label, value, mode, chipBg = "#F3F4F6", chipColor = "#334155", accent = "#EEF2FF" }) => {
  return (
    <SoftCard accent={accent} minHeight={92}>
      <Typography
        variant="overline"
        sx={{
          fontFamily: APP_FONT,
          letterSpacing: 1.8,
          fontWeight: 900,
          color: "grey.700",
        }}
      >
        {label}
      </Typography>

      <Box sx={{ mt: 1 }}>
        {mode === "chip" ? (
          <Chip
            label={stripMarkdown(value) || "-"}
            size="small"
            sx={{
              fontFamily: APP_FONT,
              fontWeight: 800,
              bgcolor: chipBg,
              color: chipColor,
              borderRadius: 2,
              border: "1px solid rgba(0,0,0,0.04)",
              px: 0.75,
            }}
          />
        ) : (
          <Typography
            variant="subtitle1"
            sx={{ fontFamily: APP_FONT, fontWeight: 500, color: "grey.900" }}
          >
            {stripMarkdown(value) || "-"}
          </Typography>
        )}
      </Box>
    </SoftCard>
  );
};

const ScenarioCard: React.FC<{
  tone: "bearish" | "base" | "bullish";
  title: string;
  text?: string;
}> = ({ tone, title, text }) => {
  const map = {
    bearish: {
      accent: "#FDE2E7",
      bg: "#FFF5F7",
      iconBg: "#FFE4E8",
      iconColor: "#E11D48",
      icon: <ErrorOutlineRoundedIcon sx={{ fontSize: 18 }} />,
    },
    base: {
      accent: "#EDE9FE",
      bg: "#F8FAFF",
      iconBg: "#EEF2FF",
      iconColor: "#4F46E5",
      icon: <ShowChartRoundedIcon sx={{ fontSize: 18 }} />,
    },
    bullish: {
      accent: "#D1FAE5",
      bg: "#F0FFF6",
      iconBg: "#DCFCE7",
      iconColor: "#059669",
      icon: <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />,
    },
  } as const;

  const t = map[tone];

  return (
    <SoftCard accent={t.accent} bgTint={t.bg} minHeight={210}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
        <IconBubble bg={t.iconBg} color={t.iconColor}>
          {t.icon}
        </IconBubble>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontFamily: APP_FONT, fontWeight: 800, color: "grey.900" }}
          >
            {title}
          </Typography>

          <Box sx={{ mt: 1 }}>
            <TextBlock text={text} clamp={7} />
          </Box>
        </Box>
      </Box>
    </SoftCard>
  );
};

const DetailBigCard: React.FC<{
  label: string;
  icon: React.ReactNode;
  accent: string;
  iconBg: string;
  iconColor: string;
  text?: string;
}> = ({ label, icon, accent, iconBg, iconColor, text }) => {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
        overflow: "hidden",
        height: "100%",
        position: "relative",
      }}
    >
      <Box sx={{ position: "absolute", inset: 0, width: 6, bgcolor: accent }} />
      <CardContent sx={{ p: 2.75, pl: 3.25 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
          <IconBubble bg={iconBg} color={iconColor}>
            {icon}
          </IconBubble>

          <Box>
            <Typography
              variant="overline"
              sx={{
                fontFamily: APP_FONT,
                letterSpacing: 1.8,
                fontWeight: 900,
                color: "grey.700",
              }}
            >
              {label}
            </Typography>

            <Box sx={{ mt: 1 }}>
              <TextBlock text={text} />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const AiAnalysis: React.FC<AiAnalysisProps> = ({ ticker, pricingDate }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const [analysis, setAnalysis] = useState<AiAnalysisRecord | null>(null);
  const [loading, setLoading] = useState(false);
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
          body: JSON.stringify({
            ticker,
            pricing_date: pricingDate ?? null,
          }),
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
  }, [API_URL, ticker, pricingDate]);

  const outlook = useMemo(() => parseFinalOutlook(analysis || undefined), [analysis]);
  const scenarios = useMemo(
    () => parseScenarioParts((analysis?.["Scenario Analysis"] as string) || ""),
    [analysis]
  );
  const analogical = useMemo(
    () => stripMarkdown(analysis?.["Case-Based Analogical Assessment"] as string),
    [analysis]
  );
  const expectationText = useMemo(
    () =>
      stripMarkdown(
        (analysis?.["Expectation vs Reality — Predictive Version"] as string) ??
          (analysis?.["Expectation vs Reality ƒ? Predictive Version"] as string)
      ),
    [analysis]
  );

  if (!ticker) {
    return (
      <SoftCard>
        <Typography sx={{ fontFamily: APP_FONT, color: "grey.600" }}>
          Select a ticker above to view the AI analysis.
        </Typography>
      </SoftCard>
    );
  }

  if (loading) {
    return (
      <SoftCard>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <CircularProgress size={18} />
          <Typography sx={{ fontFamily: APP_FONT, color: "grey.600" }}>Loading AI analysis…</Typography>
        </Box>
      </SoftCard>
    );
  }

  if (error) {
    return (
      <SoftCard accent="#FEE2E2" bgTint="#FFF5F5">
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      </SoftCard>
    );
  }

  if (!analysis) {
    return (
      <SoftCard>
        <Typography sx={{ fontFamily: APP_FONT, color: "grey.600" }}>AI analysis will be available soon.</Typography>
      </SoftCard>
    );
  }

  const weekChip = outlook.week.toLowerCase().includes("bull")
    ? { bg: "#DCFCE7", color: "#047857", icon: <TrendingUpRoundedIcon sx={{ fontSize: 16 }} /> }
    : outlook.week.toLowerCase().includes("bear")
    ? { bg: "#FFE4E6", color: "#BE123C", icon: <TrendingDownRoundedIcon sx={{ fontSize: 16 }} /> }
    : { bg: "#E5E7EB", color: "#334155", icon: null as any };

  return (
    <Box sx={{ fontFamily: APP_FONT }}>
      <Stack spacing={3}>
        <ExecutiveHero companyName={ticker} summary={analysis["Executive Summary"] as string | undefined} />

        <Box>
          <SectionLabel>OUTLOOK SUMMARY</SectionLabel>
          <Box
            sx={{
              mt: 1.25,
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
            }}
          >
            <OutlookCard
              label="1-WEEK SENTIMENT"
              value={outlook.week}
              mode="chip"
              chipBg={weekChip.bg}
              chipColor={weekChip.color}
              accent="#F1F5F9"
            />
            <OutlookCard
              label="1-MONTH SENTIMENT"
              value={outlook.month}
              mode="chip"
              chipBg="#E2E8F0"
              chipColor="#0F172A"
              accent="#F1F5F9"
            />
            <OutlookCard label="EXPECTED VOLATILITY" value={outlook.volatility} mode="text" accent="#F1F5F9" />
            <OutlookCard label="CONFIDENCE" value={outlook.confidence} mode="text" accent="#F1F5F9" />
          </Box>
        </Box>

        <Box>
          <SectionLabel>SCENARIO ANALYSIS</SectionLabel>
          <Box
            sx={{
              mt: 1.25,
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" },
            }}
          >
            <ScenarioCard tone="bearish" title="Bearish Scenario" text={scenarios.bearish} />
            <ScenarioCard tone="base" title="Base Case" text={scenarios.base} />
            <ScenarioCard tone="bullish" title="Bullish Scenario" text={scenarios.bullish} />
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          }}
        >
          <DetailBigCard
            label="1-WEEK OUTLOOK"
            icon={<CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />}
            accent="#8B5CF6"
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
            text={analysis["Expected 1-Week Sentiment"] as string | undefined}
          />
          <DetailBigCard
            label="1-MONTH OUTLOOK"
            icon={<InsightsRoundedIcon sx={{ fontSize: 18 }} />}
            accent="#06B6D4"
            iconBg="#ECFEFF"
            iconColor="#0891B2"
            text={analysis["Expected 1-Month Sentiment"] as string | undefined}
          />
        </Box>

        {/* ✅ CHANGED ONLY THIS PART: put them in separate rows */}
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr" }}>
          <SoftCard accent="#F1F5F9">
            <Typography
              variant="overline"
              sx={{ fontFamily: APP_FONT, letterSpacing: 1.8, fontWeight: 900, color: "grey.700" }}
            >
              ANALOGICAL ASSESSMENT
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <TextBlock text={analogical} />
          </SoftCard>

          <SoftCard accent="#EDE9FE">
            <Typography
              variant="overline"
              sx={{ fontFamily: APP_FONT, letterSpacing: 1.8, fontWeight: 900, color: "grey.700" }}
            >
              EXPECTATION VS REALITY
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <TextBlock text={expectationText} />
          </SoftCard>
        </Box>
      </Stack>
    </Box>
  );
};

export default AiAnalysis;
