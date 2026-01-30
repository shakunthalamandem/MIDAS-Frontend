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

  const imageUrl = metadata?.valuation_image_url
  const summaryImageUrl = metadata?.differentiated_summary_image_url

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
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={3}>
              <Typography sx={{ color: "#203c8a", fontWeight: 700 }}>
                Pricing Date
              </Typography>
              {editMode ? (
                <TextField
                  size="small"
                  fullWidth
                  value={formState.pricing_date ?? ""}
                  onChange={(e) => handleChange("pricing_date", e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <Typography sx={{ color: "#1a1a1a", mt: 0.5 }}>
                  {metadata?.pricing_date || "--"}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography sx={{ color: "#203c8a", fontWeight: 700 }}>
                Price Range
              </Typography>
              {editMode ? (
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
              ) : (
                <Typography sx={{ color: "#1a1a1a", mt: 0.5 }}>
                  {priceRange}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography sx={{ color: "#203c8a", fontWeight: 700 }}>
                Filed Date
              </Typography>
              {editMode ? (
                <TextField
                  size="small"
                  fullWidth
                  value={formState.filed_date ?? ""}
                  onChange={(e) => handleChange("filed_date", e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <Typography sx={{ color: "#1a1a1a", mt: 0.5 }}>
                  {metadata?.filed_date || "--"}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography sx={{ color: "#203c8a", fontWeight: 700 }}>
                Trade Date
              </Typography>
              {editMode ? (
                <TextField
                  size="small"
                  fullWidth
                  value={formState.trade_date ?? ""}
                  onChange={(e) => handleChange("trade_date", e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <Typography sx={{ color: "#1a1a1a", mt: 0.5 }}>
                  {metadata?.trade_date || "--"}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography sx={{ color: "#203c8a", fontWeight: 700 }}>
                Term Date
              </Typography>
              {editMode ? (
                <TextField
                  size="small"
                  fullWidth
                  value={formState.term_date ?? ""}
                  onChange={(e) => handleChange("term_date", e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <Typography sx={{ color: "#1a1a1a", mt: 0.5 }}>
                  {metadata?.term_date || "--"}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography sx={{ color: "#203c8a", fontWeight: 700 }}>
                Attached Images
              </Typography>
              <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                {imageUrl ? (
                  <Box
                    component="img"
                    src={imageUrl}
                    alt="Valuation"
                    sx={{
                      width: 110,
                      height: 70,
                      borderRadius: 1,
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  <Typography sx={{ color: "#1a1a1a" }}>--</Typography>
                )}
                {summaryImageUrl ? (
                  <Box
                    component="img"
                    src={summaryImageUrl}
                    alt="Summary"
                    sx={{
                      width: 110,
                      height: 70,
                      borderRadius: 1,
                      objectFit: "cover"
                    }}
                  />
                ) : null}
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    </IPOWriteUpMetaDataSectionCard>
  )
}

export default IPOWriteUpMetaDataDealInfo
