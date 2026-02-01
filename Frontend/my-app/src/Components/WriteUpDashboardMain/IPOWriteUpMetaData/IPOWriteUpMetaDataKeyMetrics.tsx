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
import { motion } from "framer-motion"

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

/* -------------------- COMPONENT -------------------- */

const IPOWriteUpMetaDataKeyMetrics: React.FC<
  IPOWriteUpMetaDataKeyMetricsProps
> = ({ basicDealDetails }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    if (basicDealDetails.ticker) fetchMetrics()
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
      setError(err.message)
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

  if (error) return <Typography color="error">{error}</Typography>

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
        <Box
          display="grid"
          gridTemplateColumns="1fr auto 1fr"
          alignItems="center"
          mb={2}
        >
          <Box />
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={700} color="#124180">
           Top 5 performance of Key Metrics
            </Typography>

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

          <Box textAlign="right">
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
      </Box>
    </motion.div>
  )
}

export default IPOWriteUpMetaDataKeyMetrics
