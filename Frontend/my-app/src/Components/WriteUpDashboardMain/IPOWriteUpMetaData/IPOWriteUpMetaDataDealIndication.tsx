import { Box, CircularProgress, Stack, Typography } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
// import { BasicDealDetails } from "../types/DealInformation"
import { BasicDealDetails, WriteupRatings } from "../types/DealInformation";
import ExecutiveSummaryCard from "./AiUnsupervised/ExecutiveSummaryCard"
import OutlookSummaryRow from "./AiUnsupervised/OutlookSummaryRow"
import ScenarioCards from "./AiUnsupervised/ScenarioCards"
import NoDataNotice from "../../AIFewshotAnalysis/NoDataNotice"
import StarRateOutlinedIcon from '@mui/icons-material/StarRateOutlined';

type AiAnalysisRecord = {
  [key: string]: unknown
  "Executive Summary"?: string
  "Scenario Analysis"?: string
  "Final Sentiment & Volatility Outlook"?: string | Record<string, string>
  "Expected 1-Week Sentiment"?: string
  "Expected 1-Month Sentiment"?: string
}

type AiAnalysisApiResponse = {
  answer?: AiAnalysisRecord[]
  message?: string
  writeup_ratings?: WriteupRatings
  writeup_overall_rating?: number
}

type FinalOutlook = {
  week: string
  month: string
  volatility: string
  confidence: string
}

type ScenarioParts = {
  base?: string
  bullish?: string
  bearish?: string
}
interface WriteUpData {
  ticker_name: string;
  exchange: string;
  company_name: string;
  pricing_date: string;
  deal_size: number;
  industry: string;
  shares_offered: number;
  nosh: number;
  established_year: number;
  lower_bound: number;
  upper_bound: number;
  filed_date: string;
  term_date: string;
  trade_date: string;
  bookrunners: string[];
  writeup_ratings?: WriteupRatings;
}

const DEFAULT_OUTLOOK: FinalOutlook = {
  week: "-",
  month: "-",
  volatility: "-",
  confidence: "-"
}

const stripMarkdown = (input?: unknown): string => {
  if (!input) return ""
  const safe =
    typeof input === "string"
      ? input
      : (() => {
          try {
            return String(input)
          } catch {
            return ""
          }
        })()

  return safe
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/^\s*(?:\d+\.|[-*+])\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`+/g, "")
    .trim()
}

const parseFinalOutlook = (record?: AiAnalysisRecord): FinalOutlook => {
  if (!record) return DEFAULT_OUTLOOK
  const outlookField = record["Final Sentiment & Volatility Outlook"]

  if (outlookField && typeof outlookField === "object") {
    const obj = outlookField as Record<string, string>
    return {
      week: stripMarkdown(
        obj["1-Week Sentiment"] ||
          obj["1-week sentiment"] ||
          record["Expected 1-Week Sentiment"] ||
          "-"
      ),
      month: stripMarkdown(
        obj["1-Month Sentiment"] ||
          obj["1-month sentiment"] ||
          record["Expected 1-Month Sentiment"] ||
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
      )
    }
  }

  const fromFinal = (outlookField as string) || ""
  const pick = (label: string, fallback?: string) => {
    const regex = new RegExp(`${label}\\s*:\\s*([^\\n]+)`, "i")
    const match = fromFinal.match(regex)
    return stripMarkdown((match && match[1]?.trim()) || fallback || "-")
  }

  return {
    week: pick("1-week sentiment", record["Expected 1-Week Sentiment"]),
    month: pick("1-month sentiment", record["Expected 1-Month Sentiment"]),
    volatility: pick("expected volatility"),
    confidence: pick("confidence level", pick("confidence"))
  }
}

const parseScenarioParts = (text?: unknown): ScenarioParts => {
  const raw = typeof text === "string" ? text : ""
  if (!raw) return {}

  const labels = [
    { key: "base", regex: /Base Case[^:]*:/i },
    { key: "bullish", regex: /Bullish[^:]*:/i },
    { key: "bearish", regex: /Bearish[^:]*:/i }
  ]

  const matches = labels
    .map((label) => {
      const match = raw.match(label.regex)
      return match && match.index !== undefined
        ? { key: label.key, index: match.index, length: match[0].length }
        : null
    })
    .filter(Boolean) as Array<{
      key: "base" | "bullish" | "bearish"
      index: number
      length: number
    }>

  if (matches.length === 0) {
    const cleaned = stripMarkdown(raw)
    const lines = cleaned
      .split("\n")
      .map((line) => line.replace(/^(?:-|\u2022)\s*/, "").trim())
      .filter(Boolean)
    return { base: lines[0], bullish: lines[1], bearish: lines[2] }
  }

  const sorted = matches.sort((a, b) => a.index - b.index)
  const parts: ScenarioParts = {}

  sorted.forEach((match, idx) => {
    const start = match.index + match.length
    const end = idx + 1 < sorted.length ? sorted[idx + 1].index : raw.length
    const value = stripMarkdown(raw.slice(start, end).trim())
    if (match.key === "base") parts.base = value
    if (match.key === "bullish") parts.bullish = value
    if (match.key === "bearish") parts.bearish = value
  })

  return parts
}

interface IPOWriteUpMetaDataDealIndicationProps {
  basicDealDetails: BasicDealDetails
  writeUpData?: WriteUpData | null
  onDataLoaded?: (data: WriteUpData) => void
}
const IPOWriteUpMetaDataDealIndication: React.FC<
  IPOWriteUpMetaDataDealIndicationProps
> = ({ basicDealDetails, writeUpData, onDataLoaded }) => {
  const API_URL = process.env.REACT_APP_API_URL
  const [analysis, setAnalysis] = useState<AiAnalysisRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (writeUpData) {
      onDataLoaded?.(writeUpData)
    }
  }, [onDataLoaded, writeUpData])

  useEffect(() => {
    let cancelled = false

    const fetchAnalysis = async () => {
      if (!API_URL) {
        setError("REACT_APP_API_URL is not set.")
        return
      }

      setLoading(true)
      setError(null)
      setAnalysis(null)

      try {
        const res = await fetch(`${API_URL}/api/get_few_shot_review/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticker: basicDealDetails.ticker,
            unique_deal_id: basicDealDetails.unique_deal_id ?? null
          })
        })


        const raw = await res.text()
        if (!res.ok) {
          throw new Error(raw || `Request failed with status ${res.status}`)
        }

        let json: AiAnalysisApiResponse | string = {}
        try {
          json = raw ? JSON.parse(raw) : {}
        } catch {
          json = raw
        }

        const answer = (json as AiAnalysisApiResponse)?.answer
        const first = Array.isArray(answer) && answer.length > 0 ? answer[0] : null

        if (!cancelled) {
          if (first) setAnalysis(first)
          else setError("No data found.")
        }
      } catch (err) {
        console.error("Error fetching deal indication", err)
        if (!cancelled) setError("No data found.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAnalysis()
    return () => {
      cancelled = true
    }
  }, [API_URL, basicDealDetails])

  const outlook = useMemo(() => parseFinalOutlook(analysis || undefined), [analysis])
  const scenarios = useMemo(
    () => parseScenarioParts((analysis?.["Scenario Analysis"] as string) || ""),
    [analysis]
  )
  const executiveSummary = useMemo(
    () => stripMarkdown(analysis?.["Executive Summary"] as string),
    [analysis]
  )  
  
const parseDealInfoRating = (value?: number | string | null) => {
  if (value === undefined || value === null) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^-?\d+(\.\d+)?/);
  if (match) {
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const fallback = Number(trimmed);
  return Number.isFinite(fallback) ? fallback : null;
};

  const formatRatingValue = (value: number) => {
  const normalized = Math.round(value * 10) / 10;
  return Number.isInteger(normalized) ? `${normalized}` : normalized.toFixed(1);
};
  const ratingValue = parseDealInfoRating(
    writeUpData?.writeup_ratings?.["ai_indication"] ??
      basicDealDetails.writeup_ratings?.["ai_indication"]
  );

  const ratingText = ratingValue !== null ? formatRatingValue(ratingValue) : null;


  return (
    <>
          <Box sx={{ position: "relative", mb: 2 }}>
                      {ratingText && (
          <Box
            sx={{
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              borderRadius: 999,
              border: "1px solid rgba(52, 144, 220, 0.4)",
              background: "linear-gradient(135deg, #e9f2ff, #ffffff)",
              px: 1.5,
              py: 0.4,
              boxShadow: "0 4px 10px rgba(15, 81, 166, 0.08)"
            }}
          >
            <StarRateOutlinedIcon fontSize="small" sx={{ color: "#0d4dec" }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#0d4dec" }}>
              Rating - {ratingText}/10
            </Typography>
          </Box>
        )}
 
   
    <Stack spacing={3}>
      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <CircularProgress size={18} />
          <Typography variant="body2">Loading deal indication...</Typography>
        </Box>
      ) : error ? (
                <Box 
                    className="pdf-hidden"

                sx={{ display: "flex", alignItems: "center", gap: 1.5 }} >

        <NoDataNotice
          title="No data found"
          subtitle="There is no data for this ticker. We will update soon."
        />
          </Box>

      ) : (
        <>
          <ExecutiveSummaryCard
            companyName={basicDealDetails.ticker}
            summary={executiveSummary}
          />
          <OutlookSummaryRow
            week={outlook.week}
            month={outlook.month}
            volatility={outlook.volatility}
            confidence={outlook.confidence}
          />
          <Box className="pdf-hidden">
            <ScenarioCards
              base={scenarios.base}
              bullish={scenarios.bullish}
              bearish={scenarios.bearish}
            />
          </Box>
        </>
      )}
    </Stack>
    </Box>
     </>
  )
}

export default IPOWriteUpMetaDataDealIndication
