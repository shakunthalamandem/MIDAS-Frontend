import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined"
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined"
import AddOutlinedIcon from "@mui/icons-material/AddOutlined"
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Slider,
  Stack,
  TextField,
  Typography
} from "@mui/material"
import { useEffect, useMemo, useRef, useState } from "react"
import { BasicDealDetails } from "../types/DealInformation"
import NoDataNotice from "../../AIFewshotAnalysis/NoDataNotice"
import StarRateOutlinedIcon from "@mui/icons-material/StarRateOutlined"

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
  _originalCategory?: string
  _key?: string
  _isNew?: boolean
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

const formatRating = (value: number) => {
  const normalized = Math.round(value * 10) / 10
  return Number.isInteger(normalized) ? `${normalized}` : normalized.toFixed(1)
}

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
          alignItems: "center",
          mb: 3
        }}
      >
        <Box
          className="risk-meter-badge"
          sx={{
            position: "absolute",
            top: -22,
            left: `${percent}%`,
            transform: "translateX(-50%)",
            background: "#6b5bd2 !important",
            color: "#ffffff !important",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            px: 1,
            py: "2px",
            letterSpacing: 0.3,
            zIndex: 2,
            whiteSpace: "nowrap"
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
                  "linear-gradient(90deg, #22c55e 0%, #facc15 55%, #ef4444 100%) !important",
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
            className="risk-meter-bar"
            sx={{
              height: 12,
              width: "100%",
              borderRadius: 999,
              background:
                "linear-gradient(90deg, #22c55e 0%, #facc15 55%, #ef4444 100%) !important",
              backgroundImage:
                "linear-gradient(90deg, #22c55e 0%, #facc15 55%, #ef4444 100%) !important",
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
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<RedFlagAnalysis | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [draftItems, setDraftItems] = useState<RedFlagItem[]>([])
  const [saveLoading, setSaveLoading] = useState(false)
  const [pendingDeleteCategories, setPendingDeleteCategories] = useState<string[]>([])
  const [draftRatingScore, setDraftRatingScore] = useState<number | null>(null)
  const [writeupRatings, setWriteupRatings] = useState<Record<string, number>>({})

  const apiUrl = process.env.REACT_APP_API_URL
  const ticker = basicDealDetails.ticker

  useEffect(() => {
    if (!apiUrl || !ticker) return
    let isActive = true

    const fetchRedFlags = async () => {
      setLoading(true)
      setFetchError(null)
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
          setFetchError(fetchError?.message || "No data found.")
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

  useEffect(() => {
    if (!apiUrl || !ticker) return
    let isActive = true

    const fetchWriteupRatings = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/writeup_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
          },
          body: JSON.stringify({ ticker })
        })

        if (!response.ok) throw new Error("Failed to load writeup ratings")
        const payload = await response.json()
        if (!isActive) return

        const sectionRatings = payload?.writeup_ratings
        if (sectionRatings && typeof sectionRatings === "object") {
          const normalized: Record<string, number> = {}
          Object.entries(sectionRatings).forEach(([key, value]) => {
            const numeric = typeof value === "number" ? value : Number(value)
            if (!Number.isNaN(numeric)) normalized[key] = numeric
          })
          setWriteupRatings(normalized)
        } else {
          setWriteupRatings({})
        }
      } catch {
        if (isActive) {
          setWriteupRatings({})
        }
      }
    }

    fetchWriteupRatings()

    // Listen for ratings update event from Final Verdict
    const handleRatingsUpdate = () => {
      fetchWriteupRatings()
    }

    window.addEventListener('ratingsUpdated', handleRatingsUpdate)

    return () => {
      isActive = false
      window.removeEventListener('ratingsUpdated', handleRatingsUpdate)
    }
  }, [apiUrl, ticker])

  const refreshRedFlags = async () => {
    if (!apiUrl || !ticker) return
    setLoading(true)
    setFetchError(null)
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
      setFetchError(fetchError?.message || "No data found.")
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

  const writeupRedFlagScore = useMemo(() => {
    const rating = writeupRatings["red-flag"]
    return typeof rating === "number" ? rating : null
  }, [writeupRatings])

  const ratingSourceScore = writeupRedFlagScore ?? parsedRatingScore
  const baseRatingScore = ratingSourceScore ?? 0
  const ratingScore = draftRatingScore ?? baseRatingScore
  const showRatingHeadingValue =
    draftRatingScore !== null ? draftRatingScore : ratingSourceScore
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
    // If it's a newly added unsaved row, just drop it locally.
    if (item._isNew) {
      setDraftItems((prev) => prev.filter((_, idx) => idx !== index))
      return
    }
    const key = item._key ?? item._originalCategory ?? item.category ?? `idx-${index}`
    setPendingDeleteCategories((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
    )
  }

  const handleEditToggle = () => {
    if (!isEditing) {
      const snapshot = items.map((item, index) => ({
        ...item,
        _originalCategory: item.category,
        _key: `orig-${index}`
      }))
      originalItemsRef.current = snapshot.map((item) => ({ ...item }))
      setDraftItems(snapshot)
      setDraftRatingScore(baseRatingScore)
    } else {
      setPendingDeleteCategories([])
      setDraftRatingScore(null)
    }
    setIsEditing((prev) => !prev)
  }

  const handleSaveAll = async () => {
    if (!apiUrl || !ticker) return
    setSaveLoading(true)
    setSaveError(null)
    try {
      const originalItems = originalItemsRef.current
      const originalLookup = new Map(
        originalItems.map((item) => [(item._key ?? item._originalCategory ?? item.category) ?? "", item])
      )
      const updates: Array<{ category: string; changes: Record<string, unknown> }> =
        []
      const additions: RedFlagItem[] = []
      const ratingChanged =
        draftRatingScore !== null && draftRatingScore !== parsedRatingScore
      for (let index = 0; index < draftItems.length; index += 1) {
        const item = draftItems[index]
        if (!item.category) continue
        const originalKey =
          item._key ?? item._originalCategory ?? item.category ?? `idx-${index}`
        const isDelete = pendingDeleteCategories.includes(originalKey)
        const original = originalLookup.get(originalKey)
        const isNewItem = !original
        if (isNewItem) {
          if (!isDelete) {
            additions.push(item)
          }
          continue
        }
        const hasChanges =
          !original ||
          item.score !== original.score ||
          item.category !== original.category ||
          item.observation !== original.observation ||
          item.impact_risk !== original.impact_risk ||
          item.company_name !== original.company_name ||
          item.red_flag_analysis_rating !== original.red_flag_analysis_rating
        const targetCategory =
          original?._originalCategory ?? original?.category ?? item.category
        if (isDelete) {
          const response = await fetch(`${apiUrl}/api/red-flag-analysis/`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
            },
            body: JSON.stringify({
              ticker_name: ticker,
              category: targetCategory,
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
            // Use the original category as the identifier for the record, even if the label changed.
            updates.push({ category: targetCategory, changes: changesPayload })
          }
        }
      }
      if (additions.length) {
        const response = await fetch(`${apiUrl}/api/red-flag-analysis/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
          },
          body: JSON.stringify({
            ticker_name: ticker,
            action: "create",
            creates: additions.map((entry, addIndex) => ({
              category: entry.category ?? `new-${addIndex}`,
              changes: {
                category: entry.category ?? "",
                observation: entry.observation ?? "",
                impact_risk: entry.impact_risk ?? "",
                score: entry.score ?? 0,
                company_name: entry.company_name ?? "",
                red_flag_analysis_rating: entry.red_flag_analysis_rating
              }
            }))
          })
        })
        if (!response.ok) throw new Error("Failed to add red flag")
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
      setPendingDeleteCategories([])
      setIsEditing(false)
      setDraftRatingScore(null)
      await refreshRedFlags()
    } catch (fetchError: any) {
      setSaveError(fetchError?.message || "Unable to save changes")
    } finally {
      setSaveLoading(false)
    }
  }
  const handleAddItem = () => {
    // Start from whatever is currently shown in edit mode; if draft is empty fall back to loaded items.
    const base = (isEditing ? draftItems : items) ?? []
    const next = [
      {
        category: "",
        observation: "",
        impact_risk: "",
        score: 0,
        _isNew: true,
        _key: `new-${Date.now()}-${base.length}`
      },
      ...base
    ]
    setDraftItems(next)
    if (!isEditing) setIsEditing(true)
  }

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
    >
      <Stack spacing={2.5}>

        <Box sx={{ position: "relative", mb: 2 }}>
          {/* Rating - Left aligned */}
          {!isEditing && showRatingHeadingValue !== null && (
            <Box
              sx={{
                position: "absolute",
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
                Rating - {formatRating(showRatingHeadingValue)}/10
              </Typography>
            </Box>
          )}

          {/* Heading - Center aligned */}
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1.25 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#124180" }}>
              Red Flag Analysis
            </Typography>
            {isEditing && (
              <TextField
                size="small"
                type="number"
                inputProps={{ min: 0, max: 10, step: 0.1 }}
                value={ratingScore}
                onChange={(event) => setDraftRatingScore(Number(event.target.value))}
                sx={{
                  width: 70,
                  background: "#ffffff",
                  "& .MuiOutlinedInput-root": { borderRadius: 999 }
                }}
              />
            )}
          </Box>

          {/* Edit buttons - Right aligned */}
          <Box sx={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
            <Stack direction="row" spacing={1} alignItems="center">
            {/* <Typography
              variant="subtitle2"
              sx={{ color: "#1f2937", fontWeight: 700 }}
            >
              Risk Score: {(avgScore * 2).toFixed(2)}/10
            </Typography> */}
            {isEditing ? (
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddOutlinedIcon fontSize="small" />}
                onClick={handleAddItem}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderColor: "#1f3b73",
                  color: "#1f3b73"
                }}
              >
                Add
              </Button>
            ) : null}
            <IconButton
              size="small"
              onClick={handleEditToggle}
              sx={{ color: "#1f3b73" }}
            >
              {isEditing ? (
                <CloseOutlinedIcon fontSize="small" />
              ) : (
                <EditOutlinedIcon fontSize="small" />
              )}
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
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={26} />
          </Box>
        ) : fetchError ? (
          <NoDataNotice
            title="Red Flag Analysis is not available."
            subtitle=" We will update soon."
          />
        ) : (isEditing ? draftItems : items).length === 0 ? (
          <Typography variant="body2" sx={{ color: "#5c6c8a" }}>
            No red flag analysis available for this ticker.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {(isEditing ? draftItems : items).map((item, index) => {
              const rowKey = `red-flag-${index}`
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
                          {pendingDeleteCategories.includes(
                            item._key ??
                              item._originalCategory ??
                              item.category ??
                              `idx-${index}`
                          )
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
        {saveError ? (
          <Typography variant="body2" sx={{ color: "#b91c1c" }}>
            {saveError}
          </Typography>
        ) : null}

        {/* <Typography
          variant="caption"
          sx={{ color: "#5c6c8a", fontStyle: "italic" }}
        >
          Note: O = Observation, I = Impact. The red flag scores are indicative
          and based on the analysis of available information.
        </Typography> */}
      </Stack>
    </Box>
  )
}

export default IPOWriteUpMetaDataRedFlag
