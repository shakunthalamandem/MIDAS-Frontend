import React, { useEffect, useMemo, useState } from "react"
import {
  Box,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography
} from "@mui/material"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined"

interface WriteUpData {
  ticker_name: string
  exchange: string
  company_name: string
  pricing_date: string
  deal_size: number
  industry: string
  shares_offered: number
  nosh: number
  established_year: number
  lower_bound: number
  upper_bound: number
  filed_date: string
  term_date: string
  trade_date: string
  bookrunners: string[]
}

interface DealInfoCardDataProps {
  writeUpData: WriteUpData
}

const DealInfoCardData: React.FC<DealInfoCardDataProps> = ({ writeUpData }) => {
  const [localData, setLocalData] = useState<WriteUpData>(writeUpData)
  const [isEditing, setIsEditing] = useState(false)
  const [draftValues, setDraftValues] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.REACT_APP_API_URL
  const token = localStorage.getItem("access_token")

  useEffect(() => {
    setLocalData(writeUpData)
  }, [writeUpData])

  const timelineFields = [
    { label: "Filed Date", key: "filed_date" },
    { label: "Pricing Range Date", key: "term_date" },
    { label: "Pricing Date", key: "pricing_date" },
    { label: "First Trade Date", key: "trade_date" }
  ] as const

  const detailFields = [
    { label: "Deal Size ($ Million)", key: "deal_size", type: "number" },
    { label: "Sector", key: "industry", type: "text" },
    { label: "Shares Offered", key: "shares_offered", type: "number" },
    { label: "No of Shares Outstanding", key: "nosh", type: "text" },
    { label: "Established", key: "established_year", type: "number" },
    { label: "Bookrunners", key: "bookrunners", type: "text" }
  ] as const

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "--"
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  const normalizeDateForInput = (value: string) => {
    if (!value) return ""
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10)
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
    return ""
  }

  const formatNumber = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "") return "--"
    if (typeof value === "number") return value.toLocaleString()
    const parsed = Number(value)
    return Number.isNaN(parsed) ? value : parsed.toLocaleString()
  }

  const toNumberOrNull = (value: string) => {
    const cleaned = value.replace(/,/g, "").trim()
    if (cleaned === "") return null
    const parsed = Number(cleaned)
    return Number.isNaN(parsed) ? null : parsed
  }
const handleSaveAll = async () => {
  try {
    setIsSaving(true)
    setError(null)

    const payload: Record<string, unknown> = {
      ticker_name: localData.ticker_name,

      company_name: draftValues.company_name?.trim() || null,
      industry: draftValues.industry?.trim() || null,

      filed_date: draftValues.filed_date || null,
      term_date: draftValues.term_date || null,
      pricing_date: draftValues.pricing_date || null,
      trade_date: draftValues.trade_date || null,

      lower_bound: toNumberOrNull(draftValues.lower_bound ?? ""),
      upper_bound: toNumberOrNull(draftValues.upper_bound ?? ""),

      deal_size: toNumberOrNull(draftValues.deal_size ?? ""),
      shares_offered: toNumberOrNull(draftValues.shares_offered ?? ""),
      nosh: toNumberOrNull(draftValues.nosh ?? ""),
      established_year: toNumberOrNull(draftValues.established_year ?? ""),

      bookrunners: draftValues.bookrunners
        ? draftValues.bookrunners
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean)
        : []
    }

    await patchWriteUpData(payload)

    // Optional: refresh from backend (recommended)
    const refreshed = await refreshWriteUpData()
    if (refreshed) {
      setLocalData(refreshed)
    } else {
      // fallback: optimistic update
      setLocalData((prev) => ({ ...prev, ...payload }))
    }

    setIsEditing(false)
    setDraftValues({})
  } catch (err) {
    console.error(err)
    setError("Failed to save changes. Please try again.")
  } finally {
    setIsSaving(false)
  }
}

  const openEdit = () => {
    setError(null)
    setIsEditing(true)
    setDraftValues({
      company_name: localData.company_name ?? "",
      industry: localData.industry ?? "",
      filed_date: normalizeDateForInput(localData.filed_date ?? ""),
      term_date: normalizeDateForInput(localData.term_date ?? ""),
      pricing_date: normalizeDateForInput(localData.pricing_date ?? ""),
      trade_date: normalizeDateForInput(localData.trade_date ?? ""),
      lower_bound:
        localData.lower_bound !== null && localData.lower_bound !== undefined
          ? String(localData.lower_bound)
          : "",
      upper_bound:
        localData.upper_bound !== null && localData.upper_bound !== undefined
          ? String(localData.upper_bound)
          : "",
      deal_size:
        localData.deal_size !== null && localData.deal_size !== undefined
          ? String(localData.deal_size)
          : "",
      shares_offered:
        localData.shares_offered !== null &&
        localData.shares_offered !== undefined
          ? String(localData.shares_offered)
          : "",
      nosh:
        localData.nosh !== null && localData.nosh !== undefined
          ? String(localData.nosh)
          : "",
      established_year:
        localData.established_year !== null &&
        localData.established_year !== undefined
          ? String(localData.established_year)
          : "",
      bookrunners: (localData.bookrunners ?? []).join(", ")
    })
  }

  const handleCancel = () => {
    setDraftValues({})
    setIsEditing(false)
  }

  const patchWriteUpData = async (payload: Record<string, unknown>) => {
    if (!apiUrl) throw new Error("API URL not defined")
    const response = await fetch(`${apiUrl}/api/writeup_data/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify(payload)
    })
    if (!response.ok) throw new Error("Failed to save updates")
    return response.json().catch(() => null)
  }

  const refreshWriteUpData = async () => {
    if (!apiUrl) return null
    const response = await fetch(`${apiUrl}/api/writeup_data/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify({ ticker: localData.ticker_name })
    })
    if (!response.ok) throw new Error("Failed to refresh data")
    return response.json()
  }



  const priceRange = useMemo(() => {
    const lower = localData.lower_bound
    const upper = localData.upper_bound
    const lowerText = lower !== null && lower !== undefined ? `$${lower}` : "--"
    const upperText = upper !== null && upper !== undefined ? `$${upper}` : "--"
    return `${lowerText} - ${upperText}`
  }, [localData.lower_bound, localData.upper_bound])

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid #e5e7ef",
        background: "#ffffff",
        boxShadow: "0 12px 28px rgba(32, 70, 150, 0.12)",
        p: { xs: 2.5, md: 3 }
      }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            gap={2}
            flexWrap="wrap"
          >
            {isEditing ? (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  size="small"
                  placeholder="Company name"
                  value={draftValues.company_name ?? ""}
                  onChange={(event) =>
                    setDraftValues((prev) => ({
                      ...prev,
                      company_name: event.target.value
                    }))
                  }
                  sx={{ minWidth: 260, background: "#ffffff" }}
                />
              </Stack>
            ) : (
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#121f44" }}
              >
                {localData.company_name} - {localData.ticker_name}
              </Typography>
            )}
            {isEditing ? (
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  sx={{ color: "#1f3b73" }}
                >
                  <SaveOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleCancel}
                  disabled={isSaving}
                  sx={{ color: "#6b7280" }}
                >
                  <CloseOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
            ) : (
              <IconButton
                size="small"
                onClick={openEdit}
                sx={{ color: "#1f3b73" }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
            {isEditing ? (
              <TextField
                size="small"
                value={draftValues.industry ?? ""}
                onChange={(event) =>
                  setDraftValues((prev) => ({
                    ...prev,
                    industry: event.target.value
                  }))
                }
                sx={{ minWidth: 220, background: "#ffffff" }}
              />
            ) : (
              <Typography
                variant="subtitle1"
                sx={{ color: "#5c3df5", fontWeight: 600 }}
              >
                {localData.industry || "--"}
              </Typography>
            )}
          </Stack>
        </Box>

        <Box sx={{ position: "relative", px: 0 }}>
          <Box
            sx={{
              position: "absolute",
              left: "12.5%",
              right: "12.5%",
              top: 30,
              height: 2,
              background: "#1f3b73",
              opacity: 0.8
            }}
          />
          <Grid container spacing={{ xs: 2, md: 0 }}>
            {timelineFields.map((item) => {
              const fieldKey = item.key
              const value = localData[fieldKey]
              return (
                <Grid item xs={12} sm={3} key={fieldKey}>
                  <Stack spacing={0.75} alignItems="center">
                    <Typography
                      variant="subtitle2"
                      sx={{fontsize:"1rem", fontWeight: 600, color: "#1d2b5a" }}
                    >
                      {item.label}
                    </Typography>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: "#1f3b73"
                      }}
                    />
                    {isEditing ? (
                      <TextField
                        type="date"
                        size="small"
                        value={draftValues[fieldKey] ?? ""}
                        onChange={(event) =>
                          setDraftValues((prev) => ({
                            ...prev,
                            [fieldKey]: event.target.value
                          }))
                        }
                        sx={{ width: 160, background: "#ffffff" }}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ fontsize:"1rem",color: "#66137a", fontWeight: 600 }}
                      >
                        {formatDate(value)}
                      </Typography>
                    )}
                  </Stack>
                </Grid>
              )
            })}
          </Grid>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            {/* <Box
              sx={{
                borderRadius: 2,
                border: "1px solid #e5e7ef",
                p: 2,
                background: "#f8f9ff",
                boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)"
              }}
            > */}
              <Typography
                variant="caption"
                sx={{ fontSize:"1rem",fontWeight: 600, color: "#124180" }}
              >
                Price Range
              </Typography>
              {isEditing ? (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Lower"
                    value={draftValues.lower_bound ?? ""}
                    onChange={(event) =>
                      setDraftValues((prev) => ({
                        ...prev,
                        lower_bound: event.target.value
                      }))
                    }
                    sx={{ width: 120, background: "#ffffff" }}
                  />
                  <TextField
                    size="small"
                    placeholder="Upper"
                    value={draftValues.upper_bound ?? ""}
                    onChange={(event) =>
                      setDraftValues((prev) => ({
                        ...prev,
                        upper_bound: event.target.value
                      }))
                    }
                    sx={{ width: 120, background: "#ffffff" }}
                  />
                </Stack>
              ) : (
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "#333333", mt: 1 }}
                >
                  {priceRange}
                </Typography>
              )}
            {/* </Box> */}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {/* <Box
              sx={{
                borderRadius: 2,
                border: "1px solid #e5e7ef",
                p: 2,
                background: "#f8f9ff",
                boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)"
              }}
            > */}
              <Typography
                variant="caption"
                sx={{ fontSize:"1rem",fontWeight: 600, color: "#124180" }}
              >
                Pricing Date
              </Typography>
              {isEditing ? (
                <TextField
                  type="date"
                  size="small"
                  value={draftValues.pricing_date ?? ""}
                  onChange={(event) =>
                    setDraftValues((prev) => ({
                      ...prev,
                      pricing_date: event.target.value
                    }))
                  }
                  sx={{ mt: 1, width: 160, background: "#ffffff" }}
                />
              ) : (
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "#333333 ", mt: 1 }}
                >
                  {formatDate(localData.pricing_date)}
                </Typography>
              )}
            {/* </Box> */}
          </Grid>

          {detailFields.map((field) => {
            const fieldKey = field.key
            const rawValue = localData[fieldKey]
            const displayValue =
              fieldKey === "bookrunners"
                ? (rawValue as string[] | undefined)?.join(", ") || "--"
                : field.type === "number"
                  ? formatNumber(rawValue as number | string | null)
                  : typeof rawValue === "number"
                    ? formatNumber(rawValue)
                    : rawValue || "--"
            return (
              <Grid item xs={12} sm={6} md={3} key={fieldKey}>
                {/* <Box
                  sx={{
                    borderRadius: 2,
                    border: "1px solid #e5e7ef",
                    p: 2,
                    background: "#f8f9ff",
                    boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)"
                  }}
                > */}
               <Typography
                variant="caption"
                sx={{ fontSize:"1rem",fontWeight: 600, color: "#124180" }}
              >
                    {field.label}
                  </Typography>

                  {isEditing ? (
                    <TextField
                      size="small"
                      value={draftValues[fieldKey] ?? ""}
                      onChange={(event) =>
                        setDraftValues((prev) => ({
                          ...prev,
                          [fieldKey]: event.target.value
                        }))
                      }
                      sx={{ mt: 1, background: "#ffffff" }}
                    />
                  ) : (
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: "#333333", mt: 1 }}
                    >
                      {displayValue}
                    </Typography>
                  )}
                {/* </Box> */}
              </Grid>
            )
          })}
        </Grid>

        {error ? (
          <Typography variant="caption" sx={{ color: "#b91c1c" }}>
            {error}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  )
}

export default DealInfoCardData
