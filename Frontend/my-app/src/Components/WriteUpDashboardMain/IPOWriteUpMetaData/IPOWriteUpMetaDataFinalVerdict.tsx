import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Box,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Slider,
  Stack,
  Typography,
  Snackbar,
  Alert
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import SaveIcon from "@mui/icons-material/Save"
import CancelIcon from "@mui/icons-material/Cancel"
import { BasicDealDetails } from "../types/DealInformation"
import NoDataNotice from "../../AIFewshotAnalysis/NoDataNotice"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import {
  clampHtmlToWordLimit,
  countWordsFromHtml,
  getWordLimitStats
} from "../utils/wordLimit"

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"]
  ]
}

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
  "link"
]

const INVESTMENT_SUMMARY_WORD_LIMIT = 200

interface IPOWriteUpMetaDataFinalVerdictProps {
  basicDealDetails: BasicDealDetails
  metadata?: Record<string, any>
}

const IPOWriteUpMetaDataFinalVerdict: React.FC<IPOWriteUpMetaDataFinalVerdictProps> = ({
  basicDealDetails,
  metadata
}) => {
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [editMode, setEditMode] = useState(false)

  const [finalVerdictText, setFinalVerdictText] = useState("")
  const [overallRating, setOverallRating] = useState("")
  const [sectionScores, setSectionScores] = useState<Record<string, number>>({})

  const [draftFinalVerdictText, setDraftFinalVerdictText] = useState("")
  const [draftSectionScores, setDraftSectionScores] = useState<Record<string, number>>({})
  const [wordLimitToastOpen, setWordLimitToastOpen] = useState(false)

  const apiUrl = process.env.REACT_APP_API_URL
  const token = localStorage.getItem("access_token")

  const getAuthHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    }),
    [token]
  )

  const sectionDefaults = useMemo(
    () => [
      // { id: "deal-info", label: "Deal Info" },
      // {id: "ai-indication", label: "Proprietary Model Indication"},
      { id: "business-overview", label: "Company Overview" },
      { id: "key-metrics", label: "Key Metrics" },
      { id: "financial-highlights", label: "Financial Highlights" },
      { id: "comps", label: "Comps & Peer Trends" },
      { id: "valuation-analysis", label: "Valuation " },
      { id: "red-flag", label: "Risk Assessment" }
    ],
    []
  )

  const parseOverallPercent = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return null
    if (typeof value === "number") return Math.max(0, Math.min(100, Math.round(value)))
    const match = String(value).match(/[\d.]+/)
    if (!match) return null
    const parsed = Number(match[0])
    if (Number.isNaN(parsed)) return null
    return Math.max(0, Math.min(100, Math.round(parsed)))
  }

  const getScoreColor = (score: number | null | undefined) => {
    if (typeof score !== "number") return "#e6e9f2"
    if (score <= 3) return "#dc2626"
    if (score <= 7) return "#f59e0b"
    return "#18a957"
  }

  // 1) Fetch writeup_data for showing final verdict + ratings
  const fetchWriteupData = useCallback(async () => {
    if (!apiUrl || !basicDealDetails.ticker) return

    try {
      setLoading(true)
      const res = await fetch(`${apiUrl}/api/writeup_data/`, {
        method: "POST",
        headers: getAuthHeaders,
        body: JSON.stringify({ ticker: basicDealDetails.ticker })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "Failed to fetch final verdict")
      }

      const data = await res.json()

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
      setDraftFinalVerdictText(verdict)

      setOverallRating(rating)

      const incomingScores =
        data?.writeup_ratings ??
        data?.section_scores ??
        data?.final_verdict_section_scores ??
        {}

      setSectionScores(
        incomingScores && typeof incomingScores === "object" ? incomingScores : {}
      )

      setFetchError(null)
    } catch (err: any) {
      setFetchError(err?.message || "No data found.")
    } finally {
      setLoading(false)
    }
  }, [apiUrl, basicDealDetails.ticker, getAuthHeaders, metadata])

  useEffect(() => {
    fetchWriteupData()
  }, [fetchWriteupData])

  // fallback from metadata (only if API didn't give anything)
  useEffect(() => {
    if (!metadata) return
    if (!finalVerdictText && metadata.final_verdict) {
      setFinalVerdictText(metadata.final_verdict)
      setDraftFinalVerdictText(metadata.final_verdict)
    }
    if (!overallRating && metadata.overall_rating) {
      setOverallRating(metadata.overall_rating)
    }
  }, [metadata, finalVerdictText, overallRating])

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

  // IMPORTANT: overallPercent should NOT change in edit mode (no frontend calc)
  const overallScore =
    parseOverallPercent(overallRating) ??
    parseOverallPercent(metadata?.writeup_overall_rating) ??
    parseOverallPercent(metadata?.overall_score) ??
    parseOverallPercent(metadata?.overall_rating) ??
    parseOverallPercent(metadata?.verdict_score)

  const overallPercent = typeof overallScore === "number" ? overallScore : null

  const handleEditMode = () => {
    const initialScores: Record<string, number> = {}
    for (const section of sections) {
      initialScores[section.id] = typeof section.score === "number" ? section.score : 0
    }
    setDraftSectionScores(initialScores)
    setDraftFinalVerdictText(finalVerdictText)
    setEditMode(true)
    setSaveError(null)
  }

  // 2) Save => hit api/writeup_rating_cal with ticker_name + writeup_ratings (+ verdict text)
  // 3) If success, set overallRating from response (if present), then refetch writeup_data
  // 4) Removed PATCH to writeup_data
  const handleSave = async () => {
    try {
      if (!apiUrl) throw new Error("API URL not defined")
      if (!basicDealDetails.ticker) throw new Error("Ticker not defined")

      setSaving(true)
      setSaveError(null)

      const payload = {
        ticker_name: basicDealDetails.ticker,
        writeup_ratings: draftSectionScores,
        writeup_finalverdict_summary: draftFinalVerdictText || null
      }

      const res = await fetch(`${apiUrl}/api/writeup_rating_cal/`, {
        method: "POST",
        headers: getAuthHeaders,
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "Failed to save ratings/verdict")
      }

      const data = await res.json().catch(() => ({}))

      // If api returns writeup_overall_rating, reflect it (still not changing during edit)
      if (data?.writeup_overall_rating !== undefined && data?.writeup_overall_rating !== null) {
        setOverallRating(String(data.writeup_overall_rating))
      }

      setEditMode(false)

      // Refresh full panel from writeup_data
      await fetchWriteupData()

      // Dispatch custom event to notify other components to refresh their ratings
      window.dispatchEvent(new CustomEvent('ratingsUpdated', {
        detail: {
          ticker: basicDealDetails.ticker,
          ratings: draftSectionScores
        }
      }))
    } catch (err: any) {
      setSaveError(err?.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setDraftFinalVerdictText(finalVerdictText)
    setDraftSectionScores({})
    setEditMode(false)
    setSaveError(null)
  }

  const handleDraftFinalVerdictChange = (value: string) => {
    const clampedValue = clampHtmlToWordLimit(value, INVESTMENT_SUMMARY_WORD_LIMIT)
    if (clampedValue !== value) {
      setWordLimitToastOpen(true)
    }

    setDraftFinalVerdictText(clampedValue)
  }

  if (!loading && fetchError) {
    return (
      <NoDataNotice
        title="Final Verdict is not available. No data found"
        subtitle=" We will update soon."
      />
    )
  }

  const finalVerdictWordStats = getWordLimitStats(
    countWordsFromHtml(editMode ? draftFinalVerdictText : finalVerdictText),
    INVESTMENT_SUMMARY_WORD_LIMIT
  )

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid #e5e7ef",
        // background: "#f7f9ff",
        background: "#ffffff",
        p: { xs: 2.5, md: 3 },
        boxShadow: "0 12px 24px rgba(32, 70, 150, 0.08)"
      }}
    >      <Box sx={{ background: "#c7d8f1", borderRadius: 2, py: 1.5, px: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#124180", textAlign: "center" }}>
          Investment Summary
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            {sections.map((section) => {
              const displayScore =
                editMode && typeof draftSectionScores?.[section.id] === "number"
                  ? draftSectionScores[section.id]
                  : section.score

              // non-edit progress shows saved score ONLY
              const progressValue =
                typeof section.score === "number"
                  ? Math.min(100, Math.max(0, section.score * 10))
                  : 0

              return (
                <Stack key={section.id} spacing={0.75}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {section.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: "#1d2b5a" }}>
                      {typeof displayScore === "number" ? `${displayScore}/10` : "--"}
                    </Typography>
                  </Stack>

                  {editMode ? (
                    <Slider
                      value={typeof displayScore === "number" ? displayScore : 0}
                      min={0}
                      max={10}
                      step={1}
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
                    <Box
                      className="pdf-progress-bar-container"
                      sx={{
                        width: "100%",
                        height: "8px",
                        borderRadius: "999px",
                        backgroundColor: "#e6e9f2",
                        overflow: "hidden",
                        position: "relative",
                        display: "block !important",
                        visibility: "visible !important"
                      }}
                    >
                      <Box
                        className="pdf-progress-bar-fill"
                        sx={{
                          width: `${progressValue}%`,
                          height: "100%",
                          borderRadius: "999px",
                          backgroundColor: getScoreColor(section.score),
                          position: "absolute",
                          top: 0,
                          left: 0,
                          display: "block !important",
                          visibility: "visible !important",
                          transition: "width 0.3s ease"
                        }}
                      />
                    </Box>
                  )}
                </Stack>
              )
            })}
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ width: "100%" }}>
            <Box flex={1}>
              {editMode ? (
                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0.75 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: finalVerdictWordStats.isAtLimit ? "#b91c1c" : "#4b5563"
                    }}
                  >
                    Words left: {finalVerdictWordStats.remaining}/{finalVerdictWordStats.limit}
                  </Typography>
                </Box>
              ) : null}
              {editMode ? (
                <Box
                  sx={{
                    background: "#ffffff",
                    borderRadius: 1.5,
                    px: 0.5,
                    py: 0.5
                  }}
                >
                  <ReactQuill
                    theme="snow"
                    value={draftFinalVerdictText}
                    onChange={handleDraftFinalVerdictChange}
                    modules={quillModules}
                    formats={quillFormats}
                  />
                </Box>
              ) : finalVerdictText ? (
                <Box
                  sx={{
                    color: "#000000",
                    lineHeight: 1.7,
                    minHeight: 120
                  }}
                  dangerouslySetInnerHTML={{ __html: finalVerdictText }}
                />
              ) : (
                <Typography variant="body2" sx={{ color: "#6b7280", fontStyle: "italic" }}>
                  Provide a concise verdict summary with valuation view, risks, and entry stance.
                </Typography>
              )}
            </Box>

            <Stack spacing={1} alignItems="flex-end">
              {editMode ? (
                <>
                  <IconButton size="small" color="primary" onClick={handleSave} disabled={saving}>
                    <SaveIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <IconButton size="small" onClick={handleEditMode}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          </Stack>

          <Stack alignItems="center" spacing={1.5} sx={{ mt: 2 }}>
            {/* <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress
                variant="determinate"
                value={overallPercent ?? 0}
                size={140}
                thickness={4}
                sx={{
                  color: getScoreColor(typeof overallPercent === "number" ? overallPercent / 10 : null),
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
            </Box> */}

            {/* <Typography variant="subtitle2" sx={{ color: "#4b5bff" }}>
              Overall Rating{overallPercent !== null ? ` (${overallPercent}%)` : ""}
            </Typography> */}

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
                <Chip label="Risk-Reward Included" size="small" variant="outlined" />
              )}
            </Stack>

            {loading ? (
              <Typography variant="caption" sx={{ color: "#6a7897" }}>
                Loading latest verdict...
              </Typography>
            ) : null}

            {saving ? (
              <Typography variant="caption" sx={{ color: "#6a7897" }}>
                Saving ratings...
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
            <Snackbar
              open={wordLimitToastOpen}
              autoHideDuration={1800}
              onClose={() => setWordLimitToastOpen(false)}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <Alert
                severity="warning"
                variant="filled"
                onClose={() => setWordLimitToastOpen(false)}
                sx={{ fontSize: 12, py: 0 }}
              >
                You have reached your word limit.
              </Alert>
            </Snackbar>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default IPOWriteUpMetaDataFinalVerdict
