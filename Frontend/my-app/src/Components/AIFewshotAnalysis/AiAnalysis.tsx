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
import NoDataNotice from "./NoDataNotice";

type AiAnalysisProps = {
  ticker: string | null;
  pricingDate?: string | null;
  uniqueDealId?: string | null;
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
  message?: string;
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

const stripMarkdown = (input?: unknown): string => {
  if (!input) return "";
  const safe =
    typeof input === "string"
      ? input
      : (() => {
          try {
            return String(input);
          } catch {
            return "";
          }
        })();

  return safe
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`+/g, "")
    .trim();
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
      volatility: stripMarkdown(
        obj["Expected Volatility"] || obj["expected volatility"] || "-"
      ),
      confidence: stripMarkdown(
        obj["Confidence Level"] ||
          obj["confidence level"] ||
          obj["confidence"] ||
          "-"
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

const parseScenarioParts = (text?: unknown): ScenarioParts => {
  const raw = typeof text === "string" ? text : "";
  if (!raw) return {};
  const cleaned = stripMarkdown(raw);

  const grab = (label: string) => {
    const regex = new RegExp(
      `-\\s*\\*\\*${label}[^*]*\\*\\*:\\s*([\\s\\S]*?)(?=\\n-\\s*\\*\\*|$)`,
      "i"
    );
    const match = raw.match(regex);
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
  <Typography variant="h5" sx={{ fontWeight: 900, color: "#002060", textAlign: "center" }}>
    {children}
  </Typography>
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
  if (!text) return <Typography sx={{ color: "grey.600" }} variant="body2">-</Typography>;

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
                  bgcolor: "#000000",
                  opacity: 1,
                  flex: "0 0 auto",
                }}
              />
            <Typography variant="body2" sx={{ color: "#000000ff", lineHeight: 1.9 }}>
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
        color: "#141414",
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
      color: "#002060",
      bgcolor: "#f7f9fcff",
    }}
  >
    <Typography variant="h6" sx={{ color: "#5D0163",fontWeight:600, textAlign: "center" }}>
      Executive Summary of   {companyName}

    </Typography>
    <Typography sx={{ mt: 2, color:'#141414' }} variant="body1" >
      {stripMarkdown(summary) || "-"}
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
  textBg?: string;
  textColor?: string;
}> = ({
  label,
  value,
  mode,
  chipBg = "#F3F4F6",
  chipColor = "#334155",
  accent = "#EEF2FF",
  textBg = "#F8FAFC",
  textColor = "#0F172A",
}) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      border: "1px solid",
            borderColor: "grey.200",
            background: "#FFFFFF",
            boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
            overflow: "hidden",
            height: "100%",
            minHeight: 120,
    }}
  >
    <Box sx={{ height: 6, bgcolor: accent }} />
    <CardContent
      sx={{
        p: 2.25,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
      }}
    >
      <Typography variant="h6" sx={{ color: "#002060", textAlign: "center" }}>
        {label}
      </Typography>

      {mode === "chip" ? (
        <Chip
          label={stripMarkdown(value) || "-"}
          size="small"
          sx={{
            height: 32,
            px: 1.75,
            bgcolor: chipBg,
            color: chipColor,
            borderRadius: 2,
            border: "1px solid rgba(0,0,0,0.04)",
            fontWeight: 800,
          }}
        />
      ) : (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 32,
            px: 1.75,
            borderRadius: 2,
            bgcolor: textBg,
            color: textColor,
            fontWeight: 700,
            minWidth: "fit-content",
          }}
        >
          {stripMarkdown(value) || "-"}
        </Box>
      )}
    </CardContent>
  </Card>
);

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
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
        background: t.bg,
        boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
        overflow: "hidden",
        height: "100%",
        minHeight: 210,
      }}
    >
      <Box sx={{ height: 6, bgcolor: t.accent }} />
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.25 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.1 }}>
            <IconBubble bg={t.iconBg} color={t.iconColor}>
              {t.icon}
            </IconBubble>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#002060", textAlign: "center" }}>
              {title}
            </Typography>
          </Box>
          <Box sx={{ mt: 1, width: "100%" }}>
            <TextBlock text={text} clamp={7} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const DetailBigCard: React.FC<{
  label: string;
  icon: React.ReactNode;
  accent: string;
  iconBg: string;
  iconColor: string;
  text?: string;
}> = ({ label, icon, accent, iconBg, iconColor, text }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      border: "1px solid",
      borderColor: "grey.200",
      background: "#f8fbff",
      boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
      overflow: "hidden",
      height: "100%",
      position: "relative",
    }}
  >
    <Box sx={{ position: "absolute", inset: 0, width: 6, bgcolor: accent }} />
    <CardContent sx={{ p: 2.75, pl: 3.25 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconBubble bg={iconBg} color={iconColor}>
            {icon}
          </IconBubble>
          <Typography sx={{ fontWeight: 900, color: "#002060", textAlign: "center" }}>
            {label}
          </Typography>
        </Box>

        <Box sx={{ width: "100%" }}>
          <TextBlock text={text} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

type StatusState = { kind: "message"; text: string } | { kind: "error"; text: string } | null;

const AiAnalysis: React.FC<AiAnalysisProps> = ({ ticker, pricingDate, uniqueDealId }) => {
  const API_URL = process.env.REACT_APP_API_URL;

  const [analysis, setAnalysis] = useState<AiAnalysisRecord | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ message = plain text UI, error = Alert UI
  const [status, setStatus] = useState<StatusState>(null);

  useEffect(() => {
    let cancelled = false;

    if (!ticker) {
      setAnalysis(null);
      setStatus(null);
      setLoading(false);
      return;
    }

    if (!API_URL) {
      setStatus({ kind: "error", text: "REACT_APP_API_URL is not set." });
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      setLoading(true);
      setStatus(null);
      setAnalysis(null);

      try {
        const payload: Record<string, unknown> = { ticker };
        if (uniqueDealId?.trim()) {
          payload.unique_deal_id = uniqueDealId.trim();
        } else {
          payload.pricing_date = pricingDate ?? null;
        }

        const res = await fetch(`${API_URL}/api/get_few_shot_review/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const raw = await res.text();
        if (!res.ok) {
          const friendly = "Data will update soon for this ticker.";
          if (res.status === 404) {
            if (!cancelled) setStatus({ kind: "message", text: friendly });
            return;
          }
          throw new Error(raw || `Request failed with status ${res.status}`);
        }

        let json: AiAnalysisApiResponse | string = {};
        try {
          json = raw ? JSON.parse(raw) : {};
        } catch {
          json = raw;
        }

        // ✅ handle both: "No data found" and {"message":"No data found"}
        const messageFromApi =
          typeof json === "object" && json !== null ? (json as AiAnalysisApiResponse).message : undefined;

        const noData =
          (typeof json === "string" && json.trim().toLowerCase() === "no data found") ||
          (typeof messageFromApi === "string" && messageFromApi.trim().toLowerCase() === "no data found");

        if (noData) {
          if (!cancelled) setStatus({ kind: "message", text: "Data will update soon for this ticker." });
          return;
        }

        const answer = (json as AiAnalysisApiResponse)?.answer;
        const first = Array.isArray(answer) && answer.length > 0 ? answer[0] : null;

        if (!cancelled) {
          if (first) setAnalysis(first);
          else setStatus({ kind: "message", text: "Data will update soon for this ticker." });
        }
      } catch (err) {
        console.error("Error fetching AI analysis", err);
        if (!cancelled) setStatus({ kind: "message", text: "Data will update soon for this ticker." });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAnalysis();
    return () => {
      cancelled = true;
    };
  }, [API_URL, ticker, pricingDate, uniqueDealId]);

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
      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", background: "#FFFFFF", boxShadow: "0 10px 26px rgba(0,0,0,0.05)", overflow: "hidden", height: "100%" }}>
        <Box sx={{ height: 6, bgcolor: "#EEF2FF" }} />
        <CardContent sx={{ p: 2.5 }}>
          <Typography sx={{ color: "grey.600", textAlign: "center" }}>
            Select a ticker above to view the AI analysis.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", background: "#FFFFFF", boxShadow: "0 10px 26px rgba(0,0,0,0.05)", overflow: "hidden", height: "100%" }}>
        <Box sx={{ height: 6, bgcolor: "#EEF2FF" }} />
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, justifyContent: "center" }}>
            <CircularProgress size={18} />
            <Typography sx={{ color: "grey.600" }}>Loading AI analysis...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // ✅ Plain message (no icon, no red box)
  if (status?.kind === "message") {
    return (
      <NoDataNotice subtitle={status.text} />
    );
  }

  // ✅ Real error only
  if (status?.kind === "error") {
    return (
      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", background: "#FFFFFF", boxShadow: "0 10px 26px rgba(0,0,0,0.05)", overflow: "hidden", height: "100%" }}>
        <Box sx={{ height: 6, bgcolor: "#FEE2E2" }} />
        <CardContent sx={{ p: 2.5 }}>
          <Alert severity="error" variant="outlined">
            {status.text}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <NoDataNotice
        title="AI analysis coming soon"
        subtitle="There is no data for this ticker yet. We will update soon."
      />
    );
  }

  const weekChip = outlook.week.toLowerCase().includes("bull")
    ? { bg: "#DCFCE7", color: "#047857", icon: <TrendingUpRoundedIcon sx={{ fontSize: 16 }} /> }
    : outlook.week.toLowerCase().includes("bear")
    ? { bg: "#FFE4E6", color: "#BE123C", icon: <TrendingDownRoundedIcon sx={{ fontSize: 16 }} /> }
    : { bg: "#E5E7EB", color: "#334155", icon: null as any };

  return (
    <Box>
      <Stack spacing={3}>
        <ExecutiveHero companyName={ticker} summary={analysis["Executive Summary"] as string | undefined} />

        <Box>
        <Typography variant="h6" sx={{ fontWeight:'600', color: "#5D0163", textAlign: "center" }}>
     Outlook Summary </Typography>
          <Box sx={{ mt: 1.25, display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" } }}>
            <OutlookCard
              label="1-Week Sentiment"
              value={outlook.week}
              mode="chip"
              chipBg={weekChip.bg}
              chipColor={weekChip.color}
              accent="#F1F5F9"
            />
            <OutlookCard
              label="1-Month Sentiment"
              value={outlook.month}
              mode="chip"
              chipBg="#E2E8F0"
              chipColor="#0F172A"
              accent="#F1F5F9"
            />
            <OutlookCard
              label="Expected Volatility"
              value={outlook.volatility}
              mode="text"
              accent="#F1F5F9"
              textBg="#E0F2FE"
              textColor="#075985"
            />
            <OutlookCard
              label="Confidence"
              value={outlook.confidence}
              mode="text"
              accent="#F1F5F9"
              textBg="#FEF9C3"
              textColor="#854D0E"
            />
          </Box>
        </Box>

        <Box>
                        <Typography variant="h6" sx={{ fontWeight:'600', color: "#5D0163", textAlign: "center" }}>
     Scenario Analysis </Typography>
          <Box sx={{ mt: 1.25, display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" } }}>
            <ScenarioCard tone="bearish" title="Bearish Scenario" text={scenarios.bearish} />
            <ScenarioCard tone="base" title="Base Case" text={scenarios.base} />
            <ScenarioCard tone="bullish" title="Bullish Scenario" text={scenarios.bullish} />
          </Box>
        </Box>

        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" } }}>
          <DetailBigCard
            label="1-Week Outlook"
            icon={<CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />}
            accent="#8B5CF6"
            iconBg="#EEF2FF"
            iconColor="#4F46E5"
            text={analysis["Expected 1-Week Sentiment"] as string | undefined}
          />
          <DetailBigCard
            label="1-Month Outlook"
            icon={<InsightsRoundedIcon sx={{ fontSize: 18 }} />}
            accent="#06B6D4"
            iconBg="#ECFEFF"
            iconColor="#0891B2"
            text={analysis["Expected 1-Month Sentiment"] as string | undefined}
          />
        </Box>

        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr" }}>
          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", background: "#f7f9fcff", boxShadow: "0 10px 26px rgba(0,0,0,0.05)", overflow: "hidden", height: "100%" }}>
            <Box sx={{ height: 6, bgcolor: "#F1F5F9" }} />
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight:'600', color: "#5D0163", textAlign: "center" }}>
Comparison with Similar IPOs
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <TextBlock text={analogical} />
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "grey.200", background: "#f7f9fcff", boxShadow: "0 10px 26px rgba(0,0,0,0.05)", overflow: "hidden", height: "100%" }}>
            <Box sx={{ height: 6, bgcolor: "#EDE9FE" }} />
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight:'600', color: "#5D0163", textAlign: "center" }}>
                Expectation vs Reality
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <TextBlock text={expectationText} />
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Box>
  );
};

export default AiAnalysis;
