import React, { useEffect, useMemo, useState } from "react"
import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import SaveIcon from "@mui/icons-material/Save"
import CancelIcon from "@mui/icons-material/Cancel"

interface IPOWriteUpMetaDataValuationAnalysisProps {
  basicDealDetails: BasicDealDetails
}

interface ValuationWriteUp {
  valuation?: string | string[]
  valuation_image_url?: string | null
}

const normalizeValuation = (value: string | string[] | undefined) => {
  if (!value) return ""
  if (Array.isArray(value)) return value.join("\n")
  return value
}

const splitValuationLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.replace(/^[\u2022\-]\s*/, "").trim())
    .filter(Boolean)

const IPOWriteUpMetaDataValuationAnalysis: React.FC<
  IPOWriteUpMetaDataValuationAnalysisProps
> = ({ basicDealDetails }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [valuationText, setValuationText] = useState("")
  const [valuationImageUrl, setValuationImageUrl] = useState<string>("")
  const [draftValuationText, setDraftValuationText] = useState("")
  const [draftImageUrl, setDraftImageUrl] = useState("")

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
    const fetchValuation = async () => {
      if (!apiUrl) {
        if (isActive) {
          setError("API URL not defined")
          setLoading(false)
        }
        return
      }

      try {
        if (isActive) setLoading(true)
        const res = await fetch(`${apiUrl}/api/writeup_data/`, {
          method: "POST",
          headers: getAuthHeaders,
          body: JSON.stringify({ ticker: basicDealDetails.ticker })
        })

        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.message || "Failed to fetch valuation data")
        }

        const data: ValuationWriteUp = await res.json()
        if (isActive) {
          const normalized = normalizeValuation(data?.valuation)
          setValuationText(normalized)
          setValuationImageUrl(data?.valuation_image_url ?? "")
          setDraftValuationText(normalized)
          setDraftImageUrl(data?.valuation_image_url ?? "")
          setError(null)
        }
      } catch (err: any) {
        if (isActive) setError(err.message || "Unknown error occurred")
      } finally {
        if (isActive) setLoading(false)
      }
    }

    if (basicDealDetails.ticker) {
      fetchValuation()
    }

    return () => {
      isActive = false
    }
  }, [apiUrl, basicDealDetails.ticker, getAuthHeaders])

  const handleSave = async () => {
    try {
      if (!apiUrl) throw new Error("API URL not defined")
      const payload = {
        ticker_name: basicDealDetails.ticker,
        valuation: draftValuationText,
        valuation_image_url: draftImageUrl || null
      }

      const res = await fetch(`${apiUrl}/api/writeup_data/`, {
        method: "PATCH",
        headers: getAuthHeaders,
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || "Failed to save valuation data")
      }

      setValuationText(draftValuationText)
      setValuationImageUrl(draftImageUrl)
      setEditMode(false)
      setError(null)
    } catch (err: any) {
      setError(err.message || "Save failed")
    }
  }

  const handleCancel = () => {
    setDraftValuationText(valuationText)
    setDraftImageUrl(valuationImageUrl)
    setEditMode(false)
  }

  const renderValuationContent = () => {
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
      <Stack spacing={2}>
        <Box
          sx={{
            borderRadius: 2,
            border: "1px solid #e0e6f5",
            background: "#f8faff",
            p: 2
          }}
        >
          {editMode ? (
            <TextField
              fullWidth
              multiline
              minRows={4}
              placeholder="Enter valuation notes"
              value={draftValuationText}
              onChange={(event) => setDraftValuationText(event.target.value)}
              sx={{
                mt: 1,
                background: "#ffffff",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": { borderRadius: 1 }
              }}
            />
          ) : (
            <Box component="ul" sx={{ mt: 1.5, pl: 3, mb: 0 }}>
              {splitValuationLines(valuationText).map((line, index) => (
                <li key={`${line}-${index}`}>
                  <Typography variant="body2" sx={{ color: "#2b3a67" }}>
                    {line}
                  </Typography>
                </li>
              ))}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            borderRadius: 2,
            border: "1px solid #e0e6f5",
            background: "#ffffff",
            p: 2
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1d2b5a" }}>
            Valuation Image
          </Typography>
          {editMode ? (
            <TextField
              fullWidth
              size="small"
              placeholder="Paste valuation image URL"
              value={draftImageUrl}
              onChange={(event) => setDraftImageUrl(event.target.value)}
              sx={{
                mt: 1,
                background: "#ffffff",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": { borderRadius: 1 }
              }}
            />
          ) : valuationImageUrl ? (
            <Box
              component="img"
              src={valuationImageUrl}
              alt="Valuation"
              sx={{
                mt: 1.5,
                width: "100%",
                maxHeight: 320,
                objectFit: "contain",
                borderRadius: 2,
                border: "1px solid #e6ebf5"
              }}
            />
          ) : (
            <Typography variant="body2" sx={{ mt: 1, color: "#6b7a99" }}>
              No valuation image available.
            </Typography>
          )}
        </Box>
      </Stack>
    )
  }

  return (
    <IPOWriteUpMetaDataSectionCard
      title="Valuation Analysis"
      basicDealDetails={basicDealDetails}
      showNotes={false}
    >
      <Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1d2b5a" }}>
            Valuation Details
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
        {renderValuationContent()}
      </Box>
    </IPOWriteUpMetaDataSectionCard>
  )
}

export default IPOWriteUpMetaDataValuationAnalysis
