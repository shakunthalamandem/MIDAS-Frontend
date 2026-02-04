import React, { useEffect, useMemo, useState } from "react"
import { BasicDealDetails } from "../types/DealInformation"
import {
  Box,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import SaveIcon from "@mui/icons-material/Save"
import CancelIcon from "@mui/icons-material/Cancel"
import CircleIcon from "@mui/icons-material/Circle"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"
import DeleteIcon from "@mui/icons-material/Delete"
import { motion } from "framer-motion"
import NoDataNotice from "../../AIFewshotAnalysis/NoDataNotice"
import StarRateOutlinedIcon from "@mui/icons-material/StarRateOutlined"

/* -------------------- TYPES -------------------- */

interface IPOWriteUpMetaDataKeyMetricsProps {
  basicDealDetails: BasicDealDetails
}

interface KeyMetricItem {
  category?: string
  color?: string | null
}

type KeyMetricsResponse = Record<string, KeyMetricItem>

/* -------------------- CONFIG -------------------- */

const criteriaList = [
  { label: "Regulatory Environment", key: "regulatory_environment" },
  { label: "Customer Mix", key: "customer_mix" },
  { label: "Supplier Mix", key: "supplier_mix" },
  { label: "Market Analysis", key: "market_analysis" },
  { label: "TAM/SAM & Penetration", key: "tam_sam_penetration" },
  { label: "Near-Term Catalysts", key: "growth_catalysts" },
  { label: "Secular Tailwinds/Headwinds", key: "secular_trends" },
  { label: "Revenue Growth Profile", key: "revenue_growth_profile" },
  { label: "Margin Profile", key: "margin_profile" },
  { label: "Leverage Profile", key: "leverage_profile" },
  { label: "Management Team", key: "management_team" },
  { label: "Sponsor Track Record", key: "sponsor_track_record" },
  { label: "ESG Focus", key: "esg_focus" },
  { label: "M&A Opportunities", key: "ma_opportunities" }
]

const getColorHex = (color?: string | null) => {
  switch (color?.toLowerCase()) {
    case "green":
      return "#2e7d32"
    case "yellow":
      return "#f9a825"
    case "red":
      return "#d32f2f"
    default:
      return "#9e9e9e"
  }
}

const lightColorMap: Record<string, string> = {
  red: "#ffd7d7",
  yellow: "#fff4c2",
  green: "#dff5e1"
}

const parseRatingValue = (value?: number | string | null) => {
  if (value === undefined || value === null) return null
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }
  const trimmed = String(value).trim()
  if (!trimmed) return null
  const match = trimmed.match(/^-?\d+(\.\d+)?/)
  if (match) {
    const parsed = Number(match[0])
    return Number.isFinite(parsed) ? parsed : null
  }
  const fallback = Number(trimmed)
  return Number.isFinite(fallback) ? fallback : null
}

const formatRating = (value: number) => {
  const normalized = Math.round(value * 10) / 10
  return Number.isInteger(normalized) ? `${normalized}` : normalized.toFixed(1)
}

/* -------------------- COMPONENT -------------------- */

const IPOWriteUpMetaDataKeyMetrics: React.FC<
  IPOWriteUpMetaDataKeyMetricsProps
> = ({ basicDealDetails }) => {
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [sectionScores, setSectionScores] = useState<Record<string, number> | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [metrics, setMetrics] = useState<KeyMetricsResponse>({})
  const [editedMetrics, setEditedMetrics] = useState<KeyMetricsResponse>({})

  const apiUrl = process.env.REACT_APP_API_URL
  const token = localStorage.getItem("access_token")

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    }),
    [token]
  )

  const ratingValue = parseRatingValue(
    sectionScores?.["key-metrics"] ??
      basicDealDetails.writeup_ratings?.["key-metrics"]
  )
  const ratingText = ratingValue !== null ? formatRating(ratingValue) : null

  /* -------------------- FETCH -------------------- */

  useEffect(() => {
    let active = true

    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${apiUrl}/api/ipo-revenue-growth/`, {
          method: "POST",
          headers,
          body: JSON.stringify({ ticker: basicDealDetails.ticker })
        })

        if (!res.ok) throw new Error("Failed to load key metrics")

        const data = await res.json()
        if (active) setMetrics(data || {})
      } catch (err: any) {
        if (active) setFetchError(err.message || "No data found.")
      } finally {
        if (active) setLoading(false)
      }
    }

    if (basicDealDetails.ticker) fetchMetrics()
    return () => {
      active = false
    }
  }, [apiUrl, basicDealDetails.ticker, headers])

  useEffect(() => {
    let active = true
    const fetchScores = async () => {
      if (!basicDealDetails.ticker) return

      try {
        const res = await fetch(`${apiUrl}/api/writeup_data/`, {
          method: "POST",
          headers,
          body: JSON.stringify({ ticker: basicDealDetails.ticker })
        })

        if (!res.ok) return

        const data = await res.json()
        if (!active) return

        const incoming =
          data?.writeup_ratings ??
          data?.section_scores ??
          data?.final_verdict_section_scores ??
          {}

        setSectionScores(typeof incoming === "object" ? incoming : null)
      } catch {
        // ignore
      }
    }

    fetchScores()

    // Listen for ratings update event from Final Verdict
    const handleRatingsUpdate = () => {
      fetchScores()
    }

    window.addEventListener('ratingsUpdated', handleRatingsUpdate)

    return () => {
      active = false
      window.removeEventListener('ratingsUpdated', handleRatingsUpdate)
    }
  }, [apiUrl, basicDealDetails.ticker, headers])

  /* -------------------- DERIVED ROW LOGIC -------------------- */

  const filledCriteria = criteriaList.filter(
    (c) => metrics[c.key]?.category?.trim()
  )

  const rowsToRender = editMode ? criteriaList : filledCriteria

  /* -------------------- HANDLERS -------------------- */

  const handleColorChange = (key: string, color: string) => {
    setEditedMetrics((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        color,
        category: prev[key]?.category ?? metrics[key]?.category ?? ""
      }
    }))
  }

  const handleDelete = (key: string) => {
    // Mark for deletion by setting to undefined
    setEditedMetrics((prev) => {
      const updated = { ...prev }
      updated[key] = { category: "", color: null }
      return updated
    })

    // Immediately remove from metrics for UI update
    setMetrics((prev) => {
      const updated = { ...prev }
      delete updated[key]
      return updated
    })
  }

  const handleSave = async () => {
    try {
      const payload = {
        ticker_name: basicDealDetails.ticker,
        revenue_growth: { ...metrics, ...editedMetrics }
      }

      const res = await fetch(`${apiUrl}/api/ipo-revenue-growth/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Save failed")

      setMetrics(payload.revenue_growth)
      setEditedMetrics({})
      setEditMode(false)
    } catch (err: any) {
      setSaveError(err.message || "Save failed")
    }
  }

  const handleCancel = () => {
    setEditedMetrics({})
    setEditMode(false)
  }

  /* -------------------- RENDER -------------------- */

  if (loading)
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={28} />
      </Box>
    )

  if (fetchError)
    return (
      <NoDataNotice
        title="No data found"
        subtitle="There is no data for this ticker. We will update soon."
      />
    )

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Box
        sx={{
          // background: "#553939ff",
          background: "linear-gradient(#f0f5ff)",
          borderRadius: 2,
          boxShadow: "0 12px 24px rgba(0,0,0,0.05)",
          p: 2
        }}
      >
        {/* ---------- HEADER ---------- */}
        <Box sx={{ position: "relative", mb: 2 }}>
          {/* Rating - Left aligned */}
          {ratingText && (
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
                Rating - {ratingText}/10
              </Typography>
            </Box>
          )}

          {/* Heading - Center aligned */}
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" fontWeight={700} color="#124180">
        Key Metrics - Top 5 Performance            </Typography>
            <Tooltip
              arrow
              placement="right"
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography fontWeight={700} mb={1} fontSize="0.875rem">
                    Status Color Guide
                  </Typography>
                  {[
                    ["Red", "Negative"],
                    ["Yellow", "Neutral"],
                    ["Green", "Positive"]
                  ].map(([c, label]) => (
                    <Box key={c} display="flex" gap={1} alignItems="center" mb={0.5}>
                      <FiberManualRecordIcon
                        sx={{ fontSize: 14, color: getColorHex(c) }}
                      />
                      <Typography variant="body2" fontSize="0.8rem">{label}</Typography>
                    </Box>
                  ))}
                </Box>
              }
            >
              <IconButton
                size="small"
                sx={{
                  color: "#6b7280",
                  "&:hover": {
                    color: "#124180",
                    backgroundColor: "#f3f4f6"
                  }
                }}
              >
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Edit buttons - Right aligned */}
          <Box sx={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }} display="flex" gap={1}>
            {editMode ? (
              <>
                <IconButton
                  onClick={handleSave}
                  sx={{
                    color: "#16a34a",
                    backgroundColor: "#f0fdf4",
                    "&:hover": {
                      backgroundColor: "#dcfce7",
                      transform: "scale(1.05)"
                    },
                    transition: "all 0.2s ease"
                  }}
                >
                  <SaveIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={handleCancel}
                  sx={{
                    color: "#dc2626",
                    backgroundColor: "#fef2f2",
                    "&:hover": {
                      backgroundColor: "#fee2e2",
                      transform: "scale(1.05)"
                    },
                    transition: "all 0.2s ease"
                  }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <IconButton
                onClick={() => setEditMode(true)}
                sx={{
                  color: "#124180",
                  backgroundColor: "#f0f5ff",
                  "&:hover": {
                    backgroundColor: "#e0e7ff",
                    transform: "scale(1.05)"
                  },
                  transition: "all 0.2s ease"
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* ---------- TABLE ---------- */}
        <Table sx={{ border: "1px solid #e0e6f5", borderRadius: 2, overflow: "hidden" }}>
          <TableHead>
            <TableRow sx={{ background: "linear-gradient(135deg, #1d2b5a, #2a3f6f)" }}>
              <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>
                Criteria
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", width: "120px" }}
              >
                Status
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>
                Notes
              </TableCell>
              {editMode && (
                <TableCell
                  align="center"
                  sx={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", width: "100px" }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {rowsToRender.map((item, idx) => {
              const original = metrics[item.key] || {}
              const edited = editedMetrics[item.key] || {}
              const value = editMode
                ? edited.category ?? original.category ?? ""
                : original.category ?? ""
              const color = editMode
                ? edited.color ?? original.color
                : original.color

              return (
                <TableRow
                  key={item.key}
                  sx={{
                    "&:nth-of-type(odd)": { background: "#f9fafb" },
                    "&:hover": { background: "#f0f4f8" },
                    transition: "background 0.2s ease"
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, color: "#1f2937" }}>{item.label}</TableCell>

                  <TableCell align="center">
                    {editMode ? (
                      <Box display="flex" justifyContent="center" gap={0.5}>
                        {["red", "yellow", "green"].map((c) => (
                          <IconButton
                            key={c}
                            size="small"
                            onClick={() => handleColorChange(item.key, c)}
                            sx={{
                              backgroundColor: color === c ? getColorHex(c) : lightColorMap[c],
                              border: color === c ? `2px solid ${getColorHex(c)}` : "2px solid transparent",
                              width: 32,
                              height: 32,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                transform: "scale(1.1)",
                                border: `2px solid ${getColorHex(c)}`
                              }
                            }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <CircleIcon
                        fontSize="medium"
                        sx={{ color: getColorHex(color) }}
                      />
                    )}
                  </TableCell>

                  <TableCell>
                    {editMode ? (
                      <TextField
                        fullWidth
                        size="small"
                        value={value}
                        onChange={(e) =>
                          setEditedMetrics((prev) => ({
                            ...prev,
                            [item.key]: {
                              ...prev[item.key],
                              category: e.target.value,
                              color
                            }
                          }))
                        }
                        placeholder="Enter notes..."
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            background: "#ffffff",
                            "&:hover fieldset": {
                              borderColor: "#124180"
                            }
                          }
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ color: "#374151" }}>
                        {value || "--"}
                      </Typography>
                    )}
                  </TableCell>

                  {editMode && (
                    <TableCell align="center">
                      <Tooltip title="Delete row" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(item.key)}
                          sx={{
                            color: "#dc2626",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: "#fee2e2",
                              color: "#b91c1c",
                              transform: "scale(1.1)"
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {saveError && (
          <Box
            mt={2}
            p={1.5}
            sx={{
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: 1
            }}
          >
            <Typography color="error" variant="body2" fontWeight={600}>
              {saveError}
            </Typography>
          </Box>
        )}
      </Box>
    </motion.div>
  )
}

export default IPOWriteUpMetaDataKeyMetrics
