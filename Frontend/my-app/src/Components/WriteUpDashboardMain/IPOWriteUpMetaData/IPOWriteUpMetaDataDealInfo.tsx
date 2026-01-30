import { useEffect, useMemo, useState } from "react"
import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  TextField,
  Typography
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import SaveIcon from "@mui/icons-material/Save"
import CancelIcon from "@mui/icons-material/Cancel"
import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataDealInfoProps {
  basicDealDetails: BasicDealDetails
}

type DealMetadata = {
  term_date?: string | null
  filed_date?: string | null
  trade_date?: string | null
  pricing_date?: string | null
  lower_bound?: number | string | null
  upper_bound?: number | string | null
  valuation_image_url?: string | null
  differentiated_summary_image_url?: string | null
  [key: string]: unknown
}

type DealWriteupResponse = {
  ticker?: string
  metadata?: DealMetadata
}

const IPOWriteUpMetaDataDealInfo: React.FC<IPOWriteUpMetaDataDealInfoProps> = ({
  basicDealDetails
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<DealMetadata | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [formState, setFormState] = useState<DealMetadata>({})
  const [saving, setSaving] = useState(false)

  const apiUrl = process.env.REACT_APP_API_URL
  const ticker = basicDealDetails.ticker

  useEffect(() => {
    if (!apiUrl || !ticker) return
    let isActive = true

    const fetchDealWriteup = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${apiUrl}/api/get_deal_writeup/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
          },
          body: JSON.stringify({ ticker })
        })

        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          throw new Error(err?.error || err?.message || "Failed to load deal info")
        }
        const payload: DealWriteupResponse = await response.json()
        if (isActive) {
          setMetadata(payload?.metadata ?? {})
          setFormState(payload?.metadata ?? {})
        }
      } catch (fetchError: any) {
        if (isActive) setError(fetchError?.message || "Unable to load deal info")
      } finally {
        if (isActive) setLoading(false)
      }
    }

    fetchDealWriteup()
    return () => {
      isActive = false
    }
  }, [apiUrl, ticker])

  const priceRange = useMemo(() => {
    const lower = metadata?.lower_bound
    const upper = metadata?.upper_bound
    if (lower == null && upper == null) return "--"
    if (lower != null && upper != null) return `$${lower} - $${upper}`
    return lower != null ? `$${lower}` : `$${upper}`
  }, [metadata?.lower_bound, metadata?.upper_bound])

  const handleEditToggle = () => {
    setFormState(metadata ?? {})
    setEditMode(true)
  }

  const handleCancel = () => {
    if (saving) return
    setFormState(metadata ?? {})
    setEditMode(false)
  }

  const handleChange = (key: keyof DealMetadata, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!apiUrl || !ticker || !metadata) return
    setSaving(true)
    setError(null)
    try {
      const updatedMetadata: DealMetadata = {
        ...metadata,
        term_date: formState.term_date ?? null,
        filed_date: formState.filed_date ?? null,
        trade_date: formState.trade_date ?? null,
        pricing_date: formState.pricing_date ?? null,
        lower_bound: formState.lower_bound ?? null,
        upper_bound: formState.upper_bound ?? null
      }

      const response = await fetch(`${apiUrl}/api/update_deal_writeup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
        },
        body: JSON.stringify({
          ticker,
          metadata: updatedMetadata
        })
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.error || err?.message || "Failed to update deal info")
      }

      setMetadata(updatedMetadata)
      setFormState(updatedMetadata)
      setEditMode(false)
    } catch (saveError: any) {
      setError(saveError?.message || "Unable to update deal info")
    } finally {
      setSaving(false)
    }
  }

  return (
    <IPOWriteUpMetaDataSectionCard
      title="Deal Info"
      basicDealDetails={basicDealDetails}
    >
      <Box
        sx={{
          background: "#f2f6ff",
          borderRadius: 3,
          p: { xs: 2, md: 3 },
          border: "1px solid #e1e7f5",
          position: "relative"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            display: "flex",
            gap: 1
          }}
        >
          {editMode ? (
            <>
              <IconButton onClick={handleSave} disabled={saving} size="small">
                <SaveIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={handleCancel} disabled={saving} size="small">
                <CancelIcon fontSize="small" />
              </IconButton>
            </>
          ) : (
            <IconButton onClick={handleEditToggle} size="small">
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {loading && <CircularProgress size={22} />}
        {error && (
          <Typography color="error" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}

        {!loading && (
          <>
            <Box
              sx={{
                position: "relative",
                py: 2.5,
                mb: 3,
                borderRadius: 2,
                background: "#f6f8ff"
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  left: { xs: 16, md: 28 },
                  right: { xs: 16, md: 28 },
                  top: 28,
                  height: 2,
                  background: "#d9e3ff"
                }}
              />
              <Grid container spacing={2} sx={{ position: "relative", px: 1 }}>
                {[
                  { label: "Filed", value: metadata?.filed_date },
                  { label: "Term", value: metadata?.term_date },
                  { label: "Pricing", value: metadata?.pricing_date },
                  { label: "Trade", value: metadata?.trade_date }
                ].map((item) => (
                  <Grid item xs={6} md={3} key={item.label}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 0.5,
                        pt: 1
                      }}
                    >
                      <Typography
                        sx={{ color: "#5064c4", fontWeight: 600, fontSize: 13 }}
                      >
                        {item.label}
                      </Typography>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: "#ffffff",
                          border: "2px solid #4b63d2",
                          boxShadow: "0 4px 10px rgba(75, 99, 210, 0.2)"
                        }}
                      />
                      <Typography sx={{ color: "#1a1a1a", fontWeight: 600 }}>
                        {item.value || "--"}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {editMode && (
              <Grid container spacing={2.5} sx={{ mb: 2 }}>
                <Grid item xs={12} md={3}>
                  <Typography sx={{ color: "#203c8a", fontWeight: 700 }}>
                    Pricing Date
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    value={formState.pricing_date ?? ""}
                    onChange={(e) => handleChange("pricing_date", e.target.value)}
                    placeholder="YYYY-MM-DD"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography sx={{ color: "#203c8a", fontWeight: 700 }}>
                    Filed Date
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    value={formState.filed_date ?? ""}
                    onChange={(e) => handleChange("filed_date", e.target.value)}
                    placeholder="YYYY-MM-DD"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography sx={{ color: "#203c8a", fontWeight: 700 }}>
                    Trade Date
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    value={formState.trade_date ?? ""}
                    onChange={(e) => handleChange("trade_date", e.target.value)}
                    placeholder="YYYY-MM-DD"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography sx={{ color: "#203c8a", fontWeight: 700 }}>
                    Term Date
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    value={formState.term_date ?? ""}
                    onChange={(e) => handleChange("term_date", e.target.value)}
                    placeholder="YYYY-MM-DD"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography sx={{ color: "#203c8a", fontWeight: 700 }}>
                    Price Range
                  </Typography>
                  <Box display="flex" gap={1} mt={0.5}>
                    <TextField
                      size="small"
                      value={formState.lower_bound ?? ""}
                      onChange={(e) => handleChange("lower_bound", e.target.value)}
                      placeholder="Lower"
                      fullWidth
                    />
                    <TextField
                      size="small"
                      value={formState.upper_bound ?? ""}
                      onChange={(e) => handleChange("upper_bound", e.target.value)}
                      placeholder="Upper"
                      fullWidth
                    />
                  </Box>
                </Grid>
              </Grid>
            )}

            <Grid container spacing={2}>
              {[
                { label: "Deal Size ($ Million)", value: metadata?.deal_size },
                { label: "Sector", value: metadata?.sector },
                { label: "Shares Offered", value: metadata?.shares_offered },
                {
                  label: "No of Shares Outstanding",
                  value: metadata?.nosh
                },
                { label: "Established", value: metadata?.established_year },
                { label: "Bookrunners", value: metadata?.bookrunners },
                { label: "Price Range", value: priceRange }
              ].map((item) => {
                const displayValue =
                  item.value == null || item.value === ""
                    ? "--"
                    : String(item.value)
                return (
                <Grid item xs={12} sm={6} md={4} key={item.label}>
                  <Box
                    sx={{
                      background: "#eef3ff",
                      borderRadius: 2,
                      border: "1px solid #d9e3ff",
                      p: 2,
                      minHeight: 84,
                      boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)"
                    }}
                  >
                    <Typography
                      sx={{ color: "#203c8a", fontWeight: 700, fontSize: 13 }}
                    >
                      {item.label}
                    </Typography>
                    <Typography sx={{ color: "#1a1a1a", mt: 0.5 }}>
                      {displayValue}
                    </Typography>
                  </Box>
                </Grid>
                )
              })}
            </Grid>
          </>
        )}
      </Box>
    </IPOWriteUpMetaDataSectionCard>
  )
}

export default IPOWriteUpMetaDataDealInfo
