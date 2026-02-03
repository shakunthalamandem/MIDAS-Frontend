import React, { useEffect, useMemo, useState } from "react"
import { BasicDealDetails } from "../types/DealInformation"
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import SaveIcon from "@mui/icons-material/Save"
import CancelIcon from "@mui/icons-material/Cancel"
import NoDataNotice from "../../AIFewshotAnalysis/NoDataNotice"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"

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

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"]
  ]
}

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
  "link"
]

const IPOWriteUpMetaDataValuationAnalysis: React.FC<
  IPOWriteUpMetaDataValuationAnalysisProps
> = ({ basicDealDetails }) => {
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
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
          setFetchError("API URL not defined")
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
          setFetchError(null)
        }
      } catch (err: any) {
        if (isActive) setFetchError(err.message || "No data found.")
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
      setSaveError(null)
    } catch (err: any) {
      setSaveError(err.message || "Save failed")
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

    if (fetchError) {
      return (
        <NoDataNotice
          title="No data found"
          subtitle="There is no data for this ticker. We will update soon."
        />
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
            <Box
              sx={{
                mt: 1,
                background: "#ffffff",
                borderRadius: 1,
                px: 0.5,
                py: 0.5
              }}
            >
              <ReactQuill
                theme="snow"
                value={draftValuationText}
                onChange={setDraftValuationText}
                modules={quillModules}
                formats={quillFormats}
              />
            </Box>
          ) : valuationText ? (
            <Box
              sx={{
                mt: 1,
                minHeight: 120,
                color: "#1f2a44",
                lineHeight: 1.7
              }}
              dangerouslySetInnerHTML={{ __html: valuationText }}
            />
          ) : (
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                fontStyle: "italic",
                color: "#6b7280"
              }}
            >
              --
            </Typography>
          )}
        </Box>


      </Stack>
    )
  }

  return (

      <Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1fr" },
            alignItems: "center",
            gap: 2,
            mb: 2
          }}
        >
          <Box sx={{ display: { xs: "none", sm: "block" } }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#1d2b5a", textAlign: "center" }}
          >
            Valuation Details
          </Typography>
          <Box sx={{ justifySelf: { xs: "end", sm: "end" } }}>
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
        {saveError ? (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {saveError}
          </Typography>
        ) : null}
      </Box>
  )
}

export default IPOWriteUpMetaDataValuationAnalysis
