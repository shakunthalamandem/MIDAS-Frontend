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
    return () => {
      active = false
    }
  }, [apiUrl, basicDealDetails.ticker, headers])

  /* -------------------- DERIVED ROW LOGIC -------------------- */

  const filledCriteria = criteriaList.filter(
    (c) => metrics[c.key]?.category?.trim()
  )

  const emptyCriteria = criteriaList.filter(
    (c) => !metrics[c.key]?.category?.trim()
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
    setEditedMetrics((prev) => ({
      ...prev,
      [key]: {
        category: "",
        color: null
      }
    }))
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
        <Box display="flex" flexWrap="wrap" alignItems="center" gap={2} mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={700} color="#124180">
              Key Metrics - Top 5 Performance
            </Typography>
            {ratingText && (
              <Box
                sx={{
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
            <Tooltip
              arrow
              title={
                <Box>
                  <Typography fontWeight={700} mb={1}>
                    Color Key
                  </Typography>
                  {[
                    ["Red", "Negative"],
                    ["Yellow", "Neutral"],
                    ["Green", "Positive"]
                  ].map(([c, label]) => (
                    <Box key={c} display="flex" gap={1} alignItems="center">
                      <FiberManualRecordIcon
                        sx={{ fontSize: 12, color: getColorHex(c) }}
                      />
                      <Typography variant="body2">{label}</Typography>
                    </Box>
                  ))}
                </Box>
              }
            >
              <IconButton size="small">
                <InfoOutlinedIcon sx={{ color: "#7e7e7e" }} />
              </IconButton>
            </Tooltip>
          </Box>

          <Box marginLeft="auto">
            {editMode ? (
              <>
                <IconButton onClick={handleSave} color="primary">
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={handleCancel} color="secondary">
                  <CancelIcon />
                </IconButton>
              </>
            ) : (
              <IconButton onClick={() => setEditMode(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* ---------- TABLE ---------- */}
        <Table sx={{ border: "1px solid #e0e6f5" }}>
          <TableHead>
            <TableRow sx={{ background: "#1d2b5a" }}>
              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                Criteria
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: "#fff", fontWeight: 700 }}
              >
                Color
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                Notes
              </TableCell>
              {editMode && (
                <TableCell
                  align="center"
                  sx={{ color: "#fff", fontWeight: 700 }}
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
                <TableRow key={item.key}>
                  <TableCell >{item.label}</TableCell>

                  <TableCell align="center">
                    {editMode ? (
                      <Box display="flex" justifyContent="center" gap={1}>
                        {["red", "yellow", "green"].map((c) => (
                          <IconButton
                            key={c}
                            size="small"
                            onClick={() => handleColorChange(item.key, c)}
                            sx={{
                              backgroundColor:
                                color === c
                                  ? getColorHex(c)
                                  : lightColorMap[c],
                              border: "1px solid #c7cfe4",
                              width: 26,
                              height: 26
                            }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <CircleIcon
                        fontSize="small"
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
                      />
                    ) : (
                      <Typography variant="body2">{value}</Typography>
                    )}
                  </TableCell>

                  {editMode && (
                    <TableCell align="center">
                      <Tooltip title="Delete this metric data">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(item.key)}
                          sx={{
                            color: "#d32f2f",
                            "&:hover": { backgroundColor: "#ffebee" }
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

        {/* ---------- EMPTY FIELDS HINT ---------- */}
        {!editMode && emptyCriteria.length > 0 && (
          <Box
            mt={2}
            p={1.5}
            className="pdf-hidden"
            sx={{
              border: "1px dashed #c7cfe4",
              background: "#fafafa",
              borderRadius: 1
            }}
          >
            <Typography fontWeight={600} variant="body2">
              Empty fields:
            </Typography>
            <Typography variant="body2">
              {emptyCriteria.map((c) => c.label).join(", ")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Click edit to fill these metrics.
            </Typography>
          </Box>
        )}
        {saveError ? (
          <Typography color="error" sx={{ mt: 2 }}>
            {saveError}
          </Typography>
        ) : null}
      </Box>
    </motion.div>
  )
}

export default IPOWriteUpMetaDataKeyMetrics
