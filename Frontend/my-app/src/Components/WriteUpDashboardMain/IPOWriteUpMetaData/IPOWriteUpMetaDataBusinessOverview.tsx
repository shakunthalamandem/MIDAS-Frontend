import React, { useEffect, useState, ReactElement } from "react"
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  TextField,
  Box,
  Chip,
  Paper
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import EditIcon from "@mui/icons-material/Edit"
import SaveIcon from "@mui/icons-material/Save"
import CancelIcon from "@mui/icons-material/Cancel"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import GroupsIcon from "@mui/icons-material/Groups"
import AccountTreeIcon from "@mui/icons-material/AccountTree"

/* ===================== TYPES ===================== */

interface WriteUpData {
  business_overview: string[]
  key_highlights: string[]
  concerns: string[]
  principal_stockholders_preipo: string[]
  key_management_personnel: string[]
  [key: string]: string[]
}

interface Props {
  basicDealDetails: {
    ticker: string
  }
}

type AccordionSection = {
  section: keyof WriteUpData
  title: string
  icon: ReactElement
}

/* ===================== CONFIG ===================== */

const ACCORDION_SECTIONS: AccordionSection[] = [
  {
    section: 'key_highlights',
    title: 'Key Highlights',
    icon: <TrendingUpIcon />,
  },
  {
    section: 'concerns',
    title: 'Concerns',
    icon: <WarningAmberIcon />,
  },
  {
    section: 'principal_stockholders_preipo',
    title: 'Principal Stockholders Pre-IPO',
    icon: <AccountTreeIcon />,
  },
  {
    section: "key_management_personnel",
    title: "Key Management Personnel",
    icon: <GroupsIcon />
  }
]

/* ===================== COMPONENT ===================== */

const IPOWriteUpMetaDataBusinessOverview: React.FC<Props> = ({
  basicDealDetails
}) => {
  const [writeUpData, setWriteUpData] = useState<WriteUpData | null>(null)
  const [updatedData, setUpdatedData] = useState<WriteUpData | null>(null)
  const [editMode, setEditMode] = useState<keyof WriteUpData | null>(null)
  const [businessOverviewEditing, setBusinessOverviewEditing] = useState(false)
  const [businessOverviewDraft, setBusinessOverviewDraft] = useState("")
  const [savingBusinessOverview, setSavingBusinessOverview] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  /* ===================== FETCH ===================== */

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL
      const token = localStorage.getItem("access_token")

      const res = await fetch(`${apiUrl}/api/writeup_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ ticker: basicDealDetails.ticker })
      })

      const data = await res.json()
      setWriteUpData(data)
      setUpdatedData(data)
      const overviewText = (data?.business_overview || []).join("\n\n")
      setBusinessOverviewDraft(overviewText)
    }

    fetchData()
  }, [basicDealDetails])

  /* ===================== HANDLERS ===================== */

  const handleChange = (
    section: keyof WriteUpData,
    index: number,
    value: string
  ) => {
    if (!updatedData) return
    const copy = { ...updatedData }
    copy[section][index] = value
    setUpdatedData(copy)
  }

  const handleSaveBusinessOverview = async () => {
    if (!updatedData) return
    const apiUrl = process.env.REACT_APP_API_URL
    const token = localStorage.getItem("access_token")

    try {
      if (!apiUrl) throw new Error("API URL not configured")
      setSavingBusinessOverview(true)
      setSaveError(null)
      const lines = businessOverviewDraft
        .split(/\n{2,}|\r\n{2,}/)
        .map((line) => line.trim())
        .filter(Boolean)
      const payload = {
        ticker_name: basicDealDetails.ticker,
        business_overview: lines
      }

      const res = await fetch(`${apiUrl}/api/writeup_data/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "Failed to save business overview")
      }

      setWriteUpData((prev) =>
        prev ? { ...prev, business_overview: lines } : prev
      )
      setUpdatedData((prev) =>
        prev ? { ...prev, business_overview: lines } : prev
      )
      setBusinessOverviewEditing(false)
    } catch (error: any) {
      setSaveError(error?.message || "Failed to save business overview")
    } finally {
      setSavingBusinessOverview(false)
    }
  }

  const handleCancelBusinessOverview = () => {
    setUpdatedData(writeUpData)
    const overviewText = (writeUpData?.business_overview || []).join("\n\n")
    setBusinessOverviewDraft(overviewText)
    setBusinessOverviewEditing(false)
    setSaveError(null)
  }

  const renderSectionContent = (
    section: keyof WriteUpData,
    data: string[]
  ) =>
    data.map((item, index) =>
      editMode === section ||
      (businessOverviewEditing && section === "business_overview") ? (
        <TextField
          key={index}
          fullWidth
          value={item}
          onChange={(e) => handleChange(section, index, e.target.value)}
          sx={{ mb: 2 }}
        />
      ) : (
        <Typography key={index} variant="body2" sx={{ mb: 1.5 }}>
          {item}
        </Typography>
      )
    )

  if (!writeUpData) return null

  /* ===================== UI ===================== */

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: "#F8FAFF",
        border: "1px solid #E6ECF5"
      }}
    >
      {/* ================= BUSINESS OVERVIEW ================= */}
      <Box textAlign="center" mb={4}>
        <Box display="flex" justifyContent="flex-end" mb={1}>
          {businessOverviewEditing ? (
            <>
              <IconButton
                onClick={handleSaveBusinessOverview}
                disabled={savingBusinessOverview}
              >
                <SaveIcon />
              </IconButton>
              <IconButton onClick={handleCancelBusinessOverview}>
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            <IconButton onClick={() => setBusinessOverviewEditing(true)}>
              <EditIcon />
            </IconButton>
          )}
        </Box>

        <Typography variant="h5" fontWeight={600}>
          Business Overview
        </Typography>

        <Chip
          label="Rating - 9/10"
          size="small"
          sx={{
            mt: 1,
            backgroundColor: "#EAF1FF",
            color: "#2563EB",
            fontWeight: 500
          }}
        />

        <Box mt={3}>
          {businessOverviewEditing ? (
            <TextField
              fullWidth
              multiline
              minRows={6}
              value={businessOverviewDraft}
              onChange={(e) => setBusinessOverviewDraft(e.target.value)}
              placeholder="Enter business overview"
              sx={{ background: "#ffffff" }}
            />
          ) : (
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-line", color: "#1f2a44" }}
            >
              {businessOverviewDraft}
            </Typography>
          )}
        </Box>
      </Box>

      {/* ================= ACCORDIONS ================= */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2
        }}
      >
        {ACCORDION_SECTIONS.map(({ section, title, icon }) => (
          <Accordion
            key={section}
            sx={{
              borderRadius: 2,
              border: "1px solid #E6ECF5",
              "&:before": { display: "none" }
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    backgroundColor: "#EEF4FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2563EB"
                  }}
                >
                  {icon}
                </Box>

                <Typography fontWeight={600}>{title}</Typography>
              </Box>

              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  setEditMode(editMode === section ? null : section)
                }}
                sx={{ ml: "auto" }}
              >
                {editMode === section ? <SaveIcon /> : <EditIcon />}
              </IconButton>
            </AccordionSummary>

            <AccordionDetails>
              {renderSectionContent(section, writeUpData[section] || [])}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {saveError ? (
        <Typography variant="caption" color="error" sx={{ mt: 2 }}>
          {saveError}
        </Typography>
      ) : null}
    </Paper>
  )
}

export default IPOWriteUpMetaDataBusinessOverview
