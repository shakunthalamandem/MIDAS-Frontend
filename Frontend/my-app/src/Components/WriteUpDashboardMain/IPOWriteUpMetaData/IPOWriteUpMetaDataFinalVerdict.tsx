import {
  Box,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography
} from "@mui/material"
import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataFinalVerdictProps {
  basicDealDetails: BasicDealDetails
  metadata?: Record<string, any>
}

const IPOWriteUpMetaDataFinalVerdict: React.FC<
  IPOWriteUpMetaDataFinalVerdictProps
> = ({ basicDealDetails, metadata }) => {
  const sectionDefaults = [
    { id: "deal-info", label: "Deal Info" },
    { id: "deal-indication", label: "Deal Indication" },
    { id: "market-strategy", label: "Market Strategy" },
    { id: "business-overview", label: "Business Overview" },
    { id: "key-metrics", label: "Key Metrics" },
    { id: "financial-highlights", label: "Financial Highlights" },
    { id: "comps", label: "Comps & Peer Trends" },
    { id: "valuation-analysis", label: "Valuation Analysis" },
    { id: "red-flag", label: "Red Flag" }
  ]

  const scoreMap =
    metadata?.section_scores ?? metadata?.final_verdict_section_scores ?? {}

  const sections = sectionDefaults.map((section) => ({
    ...section,
    score:
      scoreMap?.[section.id] ??
      scoreMap?.[section.label] ??
      metadata?.[`${section.id}_score`] ??
      null
  }))

  const overallScore =
    metadata?.overall_score ?? metadata?.overall_rating ?? metadata?.verdict_score

  const overallPercent =
    typeof overallScore === "number"
      ? Math.max(0, Math.min(100, Math.round(overallScore)))
      : null

  return (
    <IPOWriteUpMetaDataSectionCard
      title="Final Verdict"
      basicDealDetails={basicDealDetails}
      showSummary={false}
      showNotes={false}
      accentColor="#4b5bff"
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            {sections.map((section) => (
              <Stack key={section.id} spacing={0.75}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {section.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "#1d2b5a" }}
                  >
                    {typeof section.score === "number"
                      ? `${section.score}/10`
                      : "--"}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={
                    typeof section.score === "number"
                      ? Math.min(100, Math.max(0, section.score * 10))
                      : 0
                  }
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: "#e6e9f2",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      backgroundColor: "#18a957"
                    }
                  }}
                />
              </Stack>
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Typography variant="body2" sx={{ color: "#1f2a44" }}>
              {metadata?.final_verdict_summary ??
                metadata?.final_verdict ??
                "Provide a concise verdict summary with valuation view, risks, and entry stance."}
            </Typography>

            <Stack alignItems="center" spacing={1.5}>
              <Box sx={{ position: "relative", display: "inline-flex" }}>
                <CircularProgress
                  variant="determinate"
                  value={overallPercent ?? 0}
                  size={140}
                  thickness={4}
                  sx={{
                    color: "#4b5bff",
                    backgroundColor: "#e7e9ff",
                    borderRadius: "50%"
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column"
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {overallPercent !== null ? `${overallPercent}/100` : "--"}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="subtitle2" sx={{ color: "#4b5bff" }}>
                Overall Rating
                {overallPercent !== null ? ` (${overallPercent}%)` : ""}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {metadata?.verdict_rating && (
                <Chip
                  label={`Verdict: ${metadata.verdict_rating}`}
                  size="small"
                  color={
                    metadata.verdict_rating === "Negative"
                      ? "error"
                      : metadata.verdict_rating === "Neutral"
                      ? "warning"
                      : "success"
                  }
                />
              )}
              {metadata?.investment_stance && (
                <Chip
                  label={`Stance: ${metadata.investment_stance}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {metadata?.risk_reward_summary && (
                <Chip
                  label="Risk-Reward Included"
                  size="small"
                  variant="outlined"
                />
              )}
            </Stack>

            {metadata?.final_verdict_note && (
              <Typography variant="caption" sx={{ color: "#6a7897" }}>
                {metadata.final_verdict_note}
              </Typography>
            )}
          </Stack>
        </Grid>
      </Grid>
    </IPOWriteUpMetaDataSectionCard>
  )
}

export default IPOWriteUpMetaDataFinalVerdict
