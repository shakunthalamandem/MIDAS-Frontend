import React, { useEffect, useMemo, useState } from "react"
import {
  Box,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  LinearProgress,
  Slider,
  Stack,
  TextField,
  Typography
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import SaveIcon from "@mui/icons-material/Save"
import CancelIcon from "@mui/icons-material/Cancel"
import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"
import NoDataNotice from "../../AIFewshotAnalysis/NoDataNotice"

interface IPOWriteUpMetaDataFinalVerdictProps {
  basicDealDetails: BasicDealDetails
  metadata?: Record<string, any>
}

const IPOWriteUpMetaDataFinalVerdict: React.FC<
  IPOWriteUpMetaDataFinalVerdictProps
> = ({ basicDealDetails, metadata }) => {
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [finalVerdictText, setFinalVerdictText] = useState("")
  const [overallRating, setOverallRating] = useState("")
  const [draftFinalVerdictText, setDraftFinalVerdictText] = useState("")
  const [draftOverallRating, setDraftOverallRating] = useState("")
  const [sectionScores, setSectionScores] = useState<Record<string, number>>({})
  const [draftSectionScores, setDraftSectionScores] = useState<
    Record<string, number>
  >({})

  const apiUrl = process.env.REACT_APP_API_URL
  const token = localStorage.getItem("access_token")

  const getAuthHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    }),
    [token]
  )

  useEffect(() => {
    let isActive = true
    const fetchFinalVerdict = async () => {
      if (!apiUrl || !basicDealDetails.ticker) return

      try {
        if (isActive) setLoading(true)
        const res = await fetch(`${apiUrl}/api/writeup_data/`, {
          method: "POST",
          headers: getAuthHeaders,
          body: JSON.stringify({ ticker: basicDealDetails.ticker })
        })

        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.message || "Failed to fetch final verdict")
        }

        const data = await res.json()
        if (!isActive) return

        const verdict =
          data?.writeup_finalverdict_summary ??
          data?.final_verdict ??
          metadata?.writeup_finalverdict_summary ??
          metadata?.final_verdict ??
          ""
        const rating =
          data?.writeup_overall_rating ??
          data?.overall_rating ??
          metadata?.writeup_overall_rating ??
          metadata?.overall_rating ??
          ""
        setFinalVerdictText(verdict)
        setOverallRating(rating)
        setDraftFinalVerdictText(verdict)
        setDraftOverallRating(rating)

        const incomingScores =
          data?.writeup_ratings ??
          data?.section_scores ??
          data?.final_verdict_section_scores ??
          {}
        if (incomingScores && typeof incomingScores === "object") {
          setSectionScores(incomingScores)
        }
        setFetchError(null)
      } catch (err: any) {
        if (isActive) setFetchError(err.message || "No data found.")
      } finally {
        if (isActive) setLoading(false)
      }
    }

    fetchFinalVerdict()

    return () => {
      isActive = false
    }
  }, [apiUrl, basicDealDetails.ticker, getAuthHeaders, metadata])

  useEffect(() => {
    if (!metadata) return
    if (!finalVerdictText && metadata.final_verdict) {
      setFinalVerdictText(metadata.final_verdict)
      setDraftFinalVerdictText(metadata.final_verdict)
    }
    if (!overallRating && metadata.overall_rating) {
      setOverallRating(metadata.overall_rating)
      setDraftOverallRating(metadata.overall_rating)
    }
  }, [metadata, finalVerdictText, overallRating])

  const sectionDefaults = [
    { id: "deal-info", label: "Deal Info" },
    // { id: "deal-indication", label: "Deal Indication" },
    // { id: "market-strategy", label: "Market Strategy" },
    { id: "business-overview", label: "Business Overview" },
    { id: "key-metrics", label: "Key Metrics" },
    { id: "financial-highlights", label: "Financial Highlights" },
    { id: "comps", label: "Comps & Peer Trends" },
    { id: "valuation-analysis", label: "Valuation Analysis" },
    { id: "red-flag", label: "Red Flag" }
  ]

  const scoreMap =
    Object.keys(sectionScores).length > 0
      ? sectionScores
      : metadata?.writeup_ratings ??
        metadata?.section_scores ??
        metadata?.final_verdict_section_scores ??
        {}

  const sections = sectionDefaults.map((section) => ({
    ...section,
    score:
      scoreMap?.[section.id] ??
      scoreMap?.[section.label] ??
      metadata?.[`${section.id}_score`] ??
      null
  }))

  const computedOverall = useMemo(() => {
    const values = sectionDefaults
      .map((section) => draftSectionScores?.[section.id])
      .filter((val) => typeof val === "number") as number[]
    if (values.length === 0) return null
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    return Math.max(0, Math.min(100, Math.round(avg * 10)))
  }, [draftSectionScores, sectionDefaults])

  const getScoreColor = (score: number | null | undefined) => {
    if (typeof score !== "number") return "#e6e9f2"
    if (score <= 3) return "#dc2626"
    if (score <= 7) return "#f59e0b"
    return "#18a957"
  }

  const parseOverallPercent = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return null
    if (typeof value === "number") {
      return Math.max(0, Math.min(100, Math.round(value)))
    }
    const match = String(value).match(/[\d.]+/)
    if (!match) return null
    const parsed = Number(match[0])
    if (Number.isNaN(parsed)) return null
    return Math.max(0, Math.min(100, Math.round(parsed)))
  }

  const overallScore =
    parseOverallPercent(overallRating) ??
    parseOverallPercent(metadata?.writeup_overall_rating) ??
    parseOverallPercent(metadata?.overall_score) ??
    parseOverallPercent(metadata?.overall_rating) ??
    parseOverallPercent(metadata?.verdict_score)

  const overallPercent =
    editMode && computedOverall !== null
      ? computedOverall
      : typeof overallScore === "number"
      ? overallScore
      : null

  const handleEditMode = () => {
    const initialScores: Record<string, number> = {}
    for (const section of sections) {
      initialScores[section.id] =
        typeof section.score === "number" ? section.score : 0
    }
    setDraftSectionScores(initialScores)
    setDraftFinalVerdictText(finalVerdictText)
    setDraftOverallRating(overallRating)
    setEditMode(true)
  }

  const handleSave = async () => {
    try {
      if (!apiUrl) throw new Error("API URL not defined")
      const computed = computedOverall ?? parseOverallPercent(draftOverallRating)
      const payloadOverall = computed !== null ? String(computed) : null
      const payload = {
        ticker_name: basicDealDetails.ticker,
        writeup_finalverdict_summary: draftFinalVerdictText || null,
        writeup_overall_rating: payloadOverall,
        writeup_ratings: draftSectionScores
      }

      const res = await fetch(`${apiUrl}/api/writeup_data/`, {
        method: "PATCH",
        headers: getAuthHeaders,
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || "Failed to save final verdict")
      }

      setFinalVerdictText(draftFinalVerdictText)
      setOverallRating(payloadOverall || "")
      setSectionScores(draftSectionScores)
      setEditMode(false)
      setSaveError(null)
    } catch (err: any) {
      setSaveError(err.message || "Save failed")
    }
  }

  const handleCancel = () => {
    setDraftFinalVerdictText(finalVerdictText)
    setDraftOverallRating(overallRating)
    setDraftSectionScores({})
    setEditMode(false)
    setSaveError(null)
  }

  if (!loading && fetchError) {
    return (
      <NoDataNotice
        title="No data found"
        subtitle="There is no data for this ticker. We will update soon."
      />
    )
  }

  return (
    <IPOWriteUpMetaDataSectionCard
      title="Final Verdict"
      basicDealDetails={basicDealDetails}
      showSummary={false}
      showNotes={false}
      // accentColor="#4b5bff"
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Stack spacing={2}>
              {sections.map((section) => {
                const displayScore =
                  editMode && typeof draftSectionScores?.[section.id] === "number"
                    ? draftSectionScores[section.id]
                    : section.score
                const progressValue =
                  typeof displayScore === "number"
                    ? Math.min(100, Math.max(0, displayScore * 10))
                    : 0

                return (
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
                        {typeof displayScore === "number"
                          ? `${displayScore}/10`
                          : "--"}
                      </Typography>
                    </Stack>
                    {editMode ? (
                      <Slider
                        value={
                          typeof displayScore === "number" ? displayScore : 0
                        }
                        min={0}
                        max={10}
                        step={0.5}
                        onChange={(_, value) => {
                          const numeric = Array.isArray(value) ? value[0] : value
                          setDraftSectionScores((prev) => ({
                            ...prev,
                            [section.id]: Number(numeric)
                          }))
                        }}
                        sx={{
                          color: getScoreColor(displayScore),
                          "& .MuiSlider-rail": { opacity: 0.35 }
                        }}
                      />
                    ) : (
                      <LinearProgress
                        variant="determinate"
                        value={progressValue}
                        sx={{
                          height: 8,
                          borderRadius: 999,
                          backgroundColor: "#e6e9f2",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 999,
                            backgroundColor: getScoreColor(displayScore)
                          }
                        }}
                      />
                    )}
                  </Stack>
                )
              })}
            </Stack>
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Box display="flex" justifyContent="flex-end">
              {editMode ? (
                <>
                  <IconButton color="primary" onClick={handleSave}>
                    <SaveIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={handleCancel}>
                    <CancelIcon />
                  </IconButton>
                </>
              ) : (
                <IconButton onClick={handleEditMode}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {editMode ? (
              <TextField
                fullWidth
                multiline
                minRows={5}
                placeholder="Enter final verdict summary"
                value={draftFinalVerdictText}
                onChange={(event) => setDraftFinalVerdictText(event.target.value)}
                sx={{
                  background: "#ffffff",
                  borderRadius: 1.5,
                  "& .MuiOutlinedInput-root": { borderRadius: 1.5 }
                }}
              />
            ) : (
              <Typography variant="body2" sx={{ color: "#1f2a44" }}>
                {finalVerdictText ||
                  metadata?.final_verdict_summary ||
                  metadata?.final_verdict ||
                  "Provide a concise verdict summary with valuation view, risks, and entry stance."}
              </Typography>
            )}

            <Stack alignItems="center" spacing={1.5}>
              <Box sx={{ position: "relative", display: "inline-flex" }}>
                <CircularProgress
                  variant="determinate"
                  value={overallPercent ?? 0}
                  size={140}
                  thickness={4}
                  sx={{
                    color: getScoreColor(
                      typeof overallPercent === "number" ? overallPercent / 10 : null
                    ),
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
              {editMode ? (
                <Typography variant="subtitle2" sx={{ color: "#4b5bff" }}>
                  Overall Rating
                  {overallPercent !== null ? ` (${overallPercent}%)` : ""}
                </Typography>
              ) : (
              <Typography variant="subtitle2" sx={{ color: "#4b5bff" }}>
                Overall Rating
                {overallPercent !== null ? ` (${overallPercent}%)` : ""}
              </Typography>
              )}
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

            {loading ? (
              <Typography variant="caption" sx={{ color: "#6a7897" }}>
                Loading latest verdict...
              </Typography>
            ) : null}

            {saveError ? (
              <Typography variant="caption" sx={{ color: "#b91c1c" }}>
                {saveError}
              </Typography>
            ) : null}

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
