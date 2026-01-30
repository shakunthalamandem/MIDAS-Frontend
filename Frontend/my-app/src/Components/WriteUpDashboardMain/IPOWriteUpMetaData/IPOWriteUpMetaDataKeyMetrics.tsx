import React, { useEffect, useMemo, useState } from "react"
import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"
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

interface IPOWriteUpMetaDataKeyMetricsProps {
  basicDealDetails: BasicDealDetails
}

interface KeyMetricItem {
  category?: string
  color?: string | null
}

type KeyMetricsResponse = Record<string, KeyMetricItem>

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

const getColorHex = (color: string | null | undefined) => {
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

  const getAuthHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    }),
    [token]
  )

  useEffect(() => {
    let isActive = true
    const fetchKeyMetrics = async () => {
      if (!apiUrl) {
        if (isActive) {
          setError("API URL not defined")
          setLoading(false)
        }
        return
      }

      try {
        if (isActive) setLoading(true)
        const response = await fetch(`${apiUrl}/api/ipo-revenue-growth/`, {
          method: "POST",
          headers: getAuthHeaders,
          body: JSON.stringify({ ticker: basicDealDetails.ticker })
        })

        if (!response.ok) {
          const errData = await response.json()
          throw new Error(errData.message || "Failed to fetch key metrics")
        }

        const data: KeyMetricsResponse = await response.json()
        if (isActive) {
          setMetrics(data || {})
          setError(null)
        }
      } catch (err: any) {
        if (isActive) setError(err.message || "Unknown error occurred")
      } finally {
        if (isActive) setLoading(false)
      }
    }

    if (basicDealDetails.ticker) {
      fetchKeyMetrics()
    }

    return () => {
      isActive = false
    }
  }, [apiUrl, basicDealDetails.ticker, getAuthHeaders])

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
      if (!apiUrl) throw new Error("API URL not defined")
      const payload = {
        ticker_name: basicDealDetails.ticker,
        revenue_growth: {
          ...metrics,
          ...editedMetrics
        }
      }

      const response = await fetch(`${apiUrl}/api/ipo-revenue-growth/`, {
        method: "PATCH",
        headers: getAuthHeaders,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || "Failed to save key metrics")
      }

      setMetrics(payload.revenue_growth)
      setEditedMetrics({})
      setEditMode(false)
      setError(null)
    } catch (err: any) {
      setError(err.message || "Save failed")
    }
  }

  const handleCancel = () => {
    setEditedMetrics({})
    setEditMode(false)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={28} />
        </Box>
      )
    }

    if (error) {
      return (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )
    }

    return (
      <Table
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid #e0e6f5",
          background: "#ffffff"
        }}
      >
        <TableHead>
          <TableRow sx={{ background: "#1d2b5a" }}>
            <TableCell sx={{ color: "#ffffff", fontWeight: 700, width: 240 }}>
              Criteria
            </TableCell>
            <TableCell
              sx={{
                color: "#ffffff",
                fontWeight: 700,
                width: 120,
                textAlign: "center"
              }}
            >
              Color
            </TableCell>
            <TableCell sx={{ color: "#ffffff", fontWeight: 700 }}>
              Notes
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {criteriaList.map((item, index) => {
            const original = metrics[item.key] || {}
            const edited = editedMetrics[item.key] || {}
            const value = editMode
              ? edited.category ?? original.category ?? ""
              : original.category ?? "--"
            const color = editMode
              ? edited.color ?? original.color ?? undefined
              : original.color ?? undefined

            return (
              <TableRow
                key={item.key}
                sx={{
                  background: index % 2 === 0 ? "#f7f9ff" : "#ffffff",
                  verticalAlign: "top"
                }}
              >
                <TableCell sx={{ fontWeight: 600, color: "#23325b" }}>
                  {item.label}
                </TableCell>
                <TableCell align="center">
                  {editMode ? (
                    <Box display="flex" justifyContent="center" gap={1}>
                      {["red", "yellow", "green"].map((c) => {
                        const isSelected = color === c
                        return (
                          <IconButton
                            key={c}
                            onClick={() => handleColorChange(item.key, c)}
                            size="small"
                            sx={{
                              backgroundColor: isSelected
                                ? getColorHex(c)
                                : lightColorMap[c],
                              border: isSelected
                                ? "2px solid #101d45"
                                : "1px solid #c7cfe4",
                              borderRadius: "50%",
                              width: 28,
                              height: 28
                            }}
                          />
                        )
                      })}
                    </Box>
                  ) : (
                    <Tooltip title={color ? color.toUpperCase() : "Not set"}>
                      <CircleIcon
                        fontSize="small"
                        sx={{ color: getColorHex(color) }}
                      />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter note"
                      value={value}
                      onChange={(event) =>
                        setEditedMetrics((prev) => ({
                          ...prev,
                          [item.key]: {
                            ...prev[item.key],
                            category: event.target.value,
                            color: color
                          }
                        }))
                      }
                      sx={{
                        background: "#ffffff",
                        borderRadius: 1,
                        "& .MuiOutlinedInput-root": { borderRadius: 1 }
                      }}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: "#2b3a67", whiteSpace: "pre-wrap" }}
                    >
                      {value}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    )
  }

  return (

      <Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1d2b5a" }} align="center">
           Key Metrics

          </Typography>
          <Box>
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
              <IconButton onClick={() => setEditMode(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
        {renderContent()}
      </Box>
  )
}

export default IPOWriteUpMetaDataKeyMetrics
