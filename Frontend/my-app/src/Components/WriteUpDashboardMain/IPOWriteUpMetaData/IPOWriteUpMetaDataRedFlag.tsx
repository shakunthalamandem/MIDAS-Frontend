import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined"
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined"
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Slider,
  Stack,
  TextField,
  Typography
} from "@mui/material"
import { useEffect, useMemo, useRef, useState } from "react"
import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataRedFlagProps {
  basicDealDetails: BasicDealDetails
}

type RedFlagItem = {
  score?: number
  category?: string
  impact_risk?: string
  observation?: string
  company_name?: string
  red_flag_analysis_rating?: string | number | null
}

type RedFlagAnalysis = {
  data?: RedFlagItem[]
  rating?: string
  avg_score?: number
  red_flag_analysis_rating?: string
}

type RedFlagResponse = {
  ticker_name?: string
  red_flag_analysis?: RedFlagAnalysis
}

const RISK_SCORE_MAX = 5

const riskBandColors = [
  "#dbe9ff",
  "#d8fbfb",
  "#ffe0c7",
  "#fff2c2",
  "#dbe9ff"
]

const toPercent = (score?: number) => {
  const numericScore = typeof score === "number" ? score : Number(score)
  const safeScore = Number.isFinite(numericScore) ? numericScore : 0
  const clamped = Math.max(0, Math.min(RISK_SCORE_MAX, safeScore))
  return (clamped / RISK_SCORE_MAX) * 100
}

const RiskMeter: React.FC<{
  score?: number
  editable?: boolean
  onChange?: (value: number) => void
}> = ({ score, editable = false, onChange }) => {
  const percent = toPercent(score)
  return (
    <Box sx={{ width: "100%", minWidth: 180 }}>
      <Box
        sx={{
          position: "relative",
          height: 16,
          display: "flex",
          alignItems: "center"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -22,
            left: `${percent}%`,
            transform: "translateX(-50%)",
            background: "#6b5bd2",
            color: "#ffffff",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            px: 1,
            py: "2px",
            letterSpacing: 0.3
          }}
        >
          RISK
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              bottom: -6,
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid #6b5bd2"
            }}
          />
        </Box>
        {editable ? (
          <Slider
            size="small"
            min={0}
            max={RISK_SCORE_MAX}
            step={0.1}
            value={Number(score ?? 0)}
            onChange={(_, value) =>
              onChange ? onChange(Number(value)) : undefined
            }
            sx={{
              height: 12,
              px: 0,
              "& .MuiSlider-rail": {
                opacity: 1,
                height: 12,
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, #22c55e 0%, #facc15 55%, #ef4444 100%)",
                boxShadow: "inset 0 0 0 1px rgba(16, 24, 40, 0.08)"
              },
              "& .MuiSlider-track": { display: "none" },
              "& .MuiSlider-thumb": {
                width: 14,
                height: 14,
                background: "#1f3b73",
                boxShadow: "0 0 0 2px #ffffff"
              }
            }}
          />
        ) : (
          <Box
            sx={{
              height: 12,
              width: "100%",
              borderRadius: 999,
              background:
                "linear-gradient(90deg, #22c55e 0%, #facc15 55%, #ef4444 100%)",
              boxShadow: "inset 0 0 0 1px rgba(16, 24, 40, 0.08)"
            }}
          />
        )}
      </Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ mt: 0.5 }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: "#1f2937" }}>
          LOW
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "#1f2937" }}>
          MEDIUM
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, color: "#1f2937" }}>
          HIGH
        </Typography>
      </Stack>
    </Box>
  )
}

const IPOWriteUpMetaDataRedFlag: React.FC<IPOWriteUpMetaDataRedFlagProps> = ({
  basicDealDetails
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<RedFlagAnalysis | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [draftItems, setDraftItems] = useState<RedFlagItem[]>([])
  const [saveLoading, setSaveLoading] = useState(false)
  const [pendingDeleteIndices, setPendingDeleteIndices] = useState<number[]>([])
  const [draftRatingScore, setDraftRatingScore] = useState<number | null>(null)

  const apiUrl = process.env.REACT_APP_API_URL
  const ticker = basicDealDetails.ticker

  useEffect(() => {
    if (!apiUrl || !ticker) return
    let isActive = true

    const fetchRedFlags = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${apiUrl}/api/red-flag-analysis/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
          },
          body: JSON.stringify({ ticker_name: ticker })
        })

        if (!response.ok) throw new Error("Failed to load red flag analysis")
        const payload = (await response.json()) as RedFlagResponse
        if (isActive) setAnalysis(payload?.red_flag_analysis ?? null)
      } catch (fetchError: any) {
        if (isActive) {
          setError(fetchError?.message || "Unable to load red flag analysis")
        }
      } finally {
        if (isActive) setLoading(false)
      }
    }

    fetchRedFlags()
    return () => {
      isActive = false
    }
  }, [apiUrl, ticker])

  const refreshRedFlags = async () => {
    if (!apiUrl || !ticker) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiUrl}/api/red-flag-analysis/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
        },
        body: JSON.stringify({ ticker_name: ticker })
      })

      if (!response.ok) throw new Error("Failed to load red flag analysis")
      const payload = (await response.json()) as RedFlagResponse
      setAnalysis(payload?.red_flag_analysis ?? null)
    } catch (fetchError: any) {
      setError(fetchError?.message || "Unable to load red flag analysis")
    } finally {
      setLoading(false)
    }
  }

  const items = useMemo(() => analysis?.data ?? [], [analysis?.data])
  const originalItemsRef = useRef<RedFlagItem[]>([])
  const computeAvgScore = (data: RedFlagItem[]) => {
    const scores = data
      .map((item) => (typeof item.score === "number" ? item.score : NaN))
      .filter((score) => Number.isFinite(score)) as number[]
    if (!scores.length) return 0
    return scores.reduce((sum, score) => sum + score, 0) / scores.length
  }

  const avgScore = useMemo(() => computeAvgScore(items), [items])

  const parsedRatingScore = useMemo(() => {
    const raw = analysis?.red_flag_analysis_rating
    if (typeof raw === "number") return raw
    if (typeof raw === "string") {
      const match = raw.match(/(\d+(\.\d+)?)/)
      return match ? Number(match[1]) : null
    }
    return null
  }, [analysis?.red_flag_analysis_rating])

  const ratingScore = draftRatingScore ?? parsedRatingScore ?? 0
  const ratingLabel = useMemo(() => {
    if (ratingScore >= 0 && ratingScore < 4) return "High Risk"
    if (ratingScore >= 4 && ratingScore < 7) return "Moderate Risk"
    if (ratingScore >= 7 && ratingScore <= 10) return "Low Risk"
    return "High Risk"
  }, [ratingScore])

  const badgeRating = `${ratingLabel} - ${ratingScore}/10`

  const updateLocalItems = (updatedItems: RedFlagItem[]) => {
    const nextAvg = computeAvgScore(updatedItems)
    setAnalysis((prev) => ({
      ...prev,
      data: updatedItems,
      avg_score: nextAvg,
      rating: ratingLabel
    }))
  }

  const handleDelete = async (item: RedFlagItem, index: number) => {
    setPendingDeleteIndices((prev) =>
      prev.includes(index) ? prev.filter((id) => id !== index) : [...prev, index]
    )
  }

  const handleEditToggle = () => {
    if (!isEditing) {
      const snapshot = items.map((item) => ({ ...item }))
      originalItemsRef.current = snapshot.map((item) => ({ ...item }))
      setDraftItems(snapshot)
      setDraftRatingScore(parsedRatingScore ?? 0)
    } else {
      setPendingDeleteIndices([])
      setDraftRatingScore(null)
    }
    setIsEditing((prev) => !prev)
  }

  const handleSaveAll = async () => {
    if (!apiUrl || !ticker) return
    setSaveLoading(true)
    setError(null)
    try {
      const originalItems = originalItemsRef.current
      const updates: Array<{ category: string; changes: Record<string, unknown> }> =
        []
      const ratingChanged =
        draftRatingScore !== null && draftRatingScore !== parsedRatingScore
      for (let index = 0; index < draftItems.length; index += 1) {
        const item = draftItems[index]
        if (!item.category) continue
        const isDelete = pendingDeleteIndices.includes(index)
        const original = originalItems[index]
        const hasChanges =
          !original ||
          item.score !== original.score ||
          item.category !== original.category ||
          item.observation !== original.observation ||
          item.impact_risk !== original.impact_risk ||
          item.company_name !== original.company_name ||
          item.red_flag_analysis_rating !== original.red_flag_analysis_rating
        if (isDelete) {
          const response = await fetch(`${apiUrl}/api/red-flag-analysis/`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
            },
            body: JSON.stringify({
              ticker_name: ticker,
              category: item.category,
              action: "delete"
            })
          })
          if (!response.ok) throw new Error("Failed to delete red flag category")
        } else if (hasChanges) {
          const changesPayload: Record<string, unknown> = {}
          if (item.score !== original?.score) changesPayload.score = item.score
          if (item.category !== original?.category)
            changesPayload.category = item.category
          if (item.impact_risk !== original?.impact_risk)
            changesPayload.impact_risk = item.impact_risk
          if (item.observation !== original?.observation)
            changesPayload.observation = item.observation
          if (item.company_name !== original?.company_name)
            changesPayload.company_name = item.company_name ?? ""
          if (item.red_flag_analysis_rating !== original?.red_flag_analysis_rating) {
            changesPayload.red_flag_analysis_rating = item.red_flag_analysis_rating
          }
          if (Object.keys(changesPayload).length) {
            updates.push({ category: item.category, changes: changesPayload })
          }
        }
      }
      if (updates.length) {
        const response = await fetch(`${apiUrl}/api/red-flag-analysis/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
          },
          body: JSON.stringify({
            ticker_name: ticker,
            action: "update",
            updates
          })
        })
        if (!response.ok) throw new Error("Failed to save red flag analysis")
      }
      if (ratingChanged) {
        const response = await fetch(`${apiUrl}/api/red-flag-analysis/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
          },
          body: JSON.stringify({
            ticker_name: ticker,
            root_changes: {
              red_flag_analysis_rating: `${ratingLabel} - ${ratingScore}/10`
            }
          })
        })
        if (!response.ok) throw new Error("Failed to save rating")
      }
      setPendingDeleteIndices([])
      setIsEditing(false)
      setDraftRatingScore(null)
      await refreshRedFlags()
    } catch (fetchError: any) {
      setError(fetchError?.message || "Unable to save changes")
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <IPOWriteUpMetaDataSectionCard
      title="Red Flag Analysis"
      basicDealDetails={basicDealDetails}
      showSummary={false}
      showNotes={false}
      accentColor="#ef4444"
    >
      <Stack spacing={2.5}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap"
          }}
        >
          {isEditing ? (
            <TextField
              size="small"
              type="number"
              inputProps={{ min: 0, max: 10, step: 0.1 }}
              value={ratingScore}
              onChange={(event) =>
                setDraftRatingScore(Number(event.target.value))
              }
              sx={{
                width: 70,
                background: "#ffffff",
                "& .MuiOutlinedInput-root": { borderRadius: 999 }
              }}
            />
          ) : (
            <Chip
              label={`Rating - ${badgeRating}`}
              size="small"
              variant="outlined"
              sx={{
                borderRadius: 999,
                borderColor: "#b6d4ff",
                color: "#1f3b73",
                fontWeight: 700
              }}
            />
          )}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="subtitle2"
              sx={{ color: "#1f2937", fontWeight: 700 }}
            >
              Avg Score: {(avgScore * 2).toFixed(2)}/10 
            </Typography>
            <IconButton
              size="small"
              onClick={handleEditToggle}
              sx={{ color: "#1f3b73" }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            {isEditing ? (
              <Button
                size="small"
                variant="contained"
                startIcon={<SaveOutlinedIcon fontSize="small" />}
                onClick={handleSaveAll}
                disabled={saveLoading}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  background: "#1f3b73"
                }}
              >
                {saveLoading ? "Saving..." : "Save"}
              </Button>
            ) : null}
          </Stack>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={26} />
          </Box>
        ) : error ? (
          <Typography variant="body2" sx={{ color: "#b91c1c" }}>
            {error}
          </Typography>
        ) : items.length === 0 ? (
          <Typography variant="body2" sx={{ color: "#5c6c8a" }}>
            No red flag analysis available for this ticker.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {(isEditing ? draftItems : items).map((item, index) => {
              const rowKey = `${item.category ?? "risk"}-${index}`
              const color = riskBandColors[index % riskBandColors.length]
              const displayScore = item.score
              return (
                <Box
                  key={rowKey}
                  sx={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: 2,
                    flexWrap: { xs: "wrap", md: "nowrap" }
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      borderRadius: 2,
                      background: color,
                      p: 2,
                      position: "relative",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        right: -18,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 0,
                        height: 0,
                        borderTop: "18px solid transparent",
                        borderBottom: "18px solid transparent",
                        borderLeft: `18px solid ${color}`,
                        display: { xs: "none", md: "block" }
                      }
                    }}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <FlagOutlinedIcon sx={{ color: "#ef4444" }} />
                      {isEditing ? (
                        <TextField
                          size="small"
                          value={item.category ?? ""}
                          onChange={(event) =>
                            setDraftItems((prev) =>
                              prev.map((entry, idx) =>
                                idx === index
                                  ? { ...entry, category: event.target.value }
                                  : entry
                              )
                            )
                          }
                          placeholder="Category"
                          sx={{
                            maxWidth: 260,
                            background: "#ffffff",
                            borderRadius: 1
                          }}
                        />
                      ) : (
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700, color: "#1d2b5a" }}
                        >
                          {item.category ?? "Risk"}
                        </Typography>
                      )}
                    </Stack>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ color: "#1f2937" }}>
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          Observation:
                        </Box>{" "}
                        {isEditing ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={item.observation ?? ""}
                            onChange={(event) =>
                              setDraftItems((prev) =>
                                prev.map((entry, idx) =>
                                  idx === index
                                    ? { ...entry, observation: event.target.value }
                                    : entry
                                )
                              )
                            }
                            placeholder="Observation"
                            sx={{
                              mt: 0.5,
                              background: "#ffffff",
                              borderRadius: 1
                            }}
                          />
                        ) : (
                          item.observation ?? "--"
                        )}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#1f2937" }}>
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          Impact:
                        </Box>{" "}
                        {isEditing ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={item.impact_risk ?? ""}
                            onChange={(event) =>
                              setDraftItems((prev) =>
                                prev.map((entry, idx) =>
                                  idx === index
                                    ? { ...entry, impact_risk: event.target.value }
                                    : entry
                                )
                              )
                            }
                            placeholder="Impact"
                            sx={{
                              mt: 0.5,
                              background: "#ffffff",
                              borderRadius: 1
                            }}
                          />
                        ) : (
                          item.impact_risk ?? "--"
                        )}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box
                    sx={{
                      width: { xs: "100%", md: 240 },
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      px: { xs: 1, md: 0 }
                    }}
                  >
                    <RiskMeter
                      score={displayScore}
                      editable={isEditing}
                      onChange={(value) =>
                        setDraftItems((prev) =>
                          prev.map((entry, idx) =>
                            idx === index ? { ...entry, score: value } : entry
                          )
                        )
                      }
                    />
                    <Stack
                      direction={{ xs: "row", md: "column" }}
                      spacing={1}
                      alignItems="center"
                    >
                      {isEditing ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<DeleteOutlineIcon fontSize="small" />}
                          onClick={() => handleDelete(item, index)}
                          sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            borderColor: "#ef4444",
                            color: "#ef4444"
                          }}
                        >
                          {pendingDeleteIndices.includes(index)
                            ? "Pending"
                            : "Delete"}
                        </Button>
                      ) : null}
                    </Stack>
                  </Box>
                </Box>
              )
            })}
          </Stack>
        )}

        {/* <Typography
          variant="caption"
          sx={{ color: "#5c6c8a", fontStyle: "italic" }}
        >
          Note: O = Observation, I = Impact. The red flag scores are indicative
          and based on the analysis of available information.
        </Typography> */}
      </Stack>
    </IPOWriteUpMetaDataSectionCard>
  )
}

export default IPOWriteUpMetaDataRedFlag
