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
  Paper,
  CircularProgress
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import EditIcon from "@mui/icons-material/Edit"
import SaveIcon from "@mui/icons-material/Save"
import CancelIcon from "@mui/icons-material/Cancel"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import GroupsIcon from "@mui/icons-material/Groups"
import AccountTreeIcon from "@mui/icons-material/AccountTree"
import NoDataNotice from "../../AIFewshotAnalysis/NoDataNotice"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"

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
  const [savingSection, setSavingSection] = useState<keyof WriteUpData | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  /* ===================== FETCH ===================== */

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL
      const token = localStorage.getItem("access_token")

      try {
        setLoading(true)
        const res = await fetch(`${apiUrl}/api/writeup_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify({ ticker: basicDealDetails.ticker })
        })

        if (!res.ok) throw new Error("Failed to fetch data")

        const data = await res.json()
        setWriteUpData(data)
        setUpdatedData(data)
        setBusinessOverviewDraft((data.business_overview || []).join(""))
      } catch (e: any) {
        setFetchError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [basicDealDetails])

  /* ===================== HANDLERS ===================== */

  const handlePointChange = (
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
      setSavingBusinessOverview(true)
      const payload = {
        ticker_name: basicDealDetails.ticker,
        business_overview: businessOverviewDraft
      }

      const res = await fetch(`${apiUrl}/api/writeup_data/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Save failed")

      setWriteUpData((prev) =>
        prev ? { ...prev, business_overview: [businessOverviewDraft] } : prev
      )
      setBusinessOverviewEditing(false)
    } catch (e: any) {
      setSaveError(e.message)
    } finally {
      setSavingBusinessOverview(false)
    }
  }

  const handleSaveSection = async (section: keyof WriteUpData) => {
    if (!updatedData) return

    const apiUrl = process.env.REACT_APP_API_URL
    const token = localStorage.getItem("access_token")
    const sectionValue = (updatedData[section] || []).join("")

    try {
      setSavingSection(section)

      const payload: Record<string, string> = {
        ticker_name: basicDealDetails.ticker,
        [section]: sectionValue
      }

      const res = await fetch(`${apiUrl}/api/writeup_data/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error("Save failed")

      setWriteUpData((prev) =>
        prev
          ? { ...prev, [section]: [...(updatedData[section] || [])] }
          : prev
      )
      setEditMode(null)
    } catch (e: any) {
      setSaveError(e.message)
    } finally {
      setSavingSection(null)
    }
  }

  const handleAccordionAction = (
    section: keyof WriteUpData,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation()

    if (editMode === section) {
      handleSaveSection(section)
    } else {
      setEditMode(section)
    }
  }

  /* ===================== RENDER HELPERS ===================== */

  const renderSectionContent = (
    section: keyof WriteUpData,
    data: string[]
  ) =>
    data.map((item, index) =>
      editMode === section ? (
        <Box key={index} mb={2}>
          <ReactQuill
            theme="snow"
            value={item}
            onChange={(val) => handlePointChange(section, index, val)}
            modules={quillModules}
            formats={quillFormats}
          />
        </Box>
      ) : (
        <Box
          key={index}
          mb={2}
          sx={{ color: "#1f2a44" }}
          dangerouslySetInnerHTML={{ __html: item }}
        />
      )
    )

  /* ===================== UI ===================== */

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (fetchError || !writeUpData) {
    return (
      <NoDataNotice
        title="No data found"
        subtitle="There is no data for this ticker."
      />
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: "linear-gradient(#f0f5ff)",
        border: "1px solid #E6ECF5"
      }}
    >
      {/* ================= BUSINESS OVERVIEW ================= */}
      <Box mb={4}>
        <Box display="flex" justifyContent="flex-end">
          {businessOverviewEditing ? (
            <>
              <IconButton onClick={handleSaveBusinessOverview}>
                <SaveIcon />
              </IconButton>
              <IconButton onClick={() => setBusinessOverviewEditing(false)}>
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            <IconButton onClick={() => setBusinessOverviewEditing(true)}>
              <EditIcon />
            </IconButton>
          )}
        </Box>

        <Typography variant="h5" fontWeight={600} color="#124180" mb={2}>
          Business Overview
        </Typography>

        {businessOverviewEditing ? (
          <ReactQuill
            theme="snow"
            value={businessOverviewDraft}
            onChange={setBusinessOverviewDraft}
            modules={quillModules}
            formats={quillFormats}
          />
        ) : (
          <Box
            sx={{ color: "#1f2a44" }}
            dangerouslySetInnerHTML={{ __html: businessOverviewDraft }}
          />
        )}
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
          <Accordion key={section}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1.5}>
                {icon}
                <Typography fontWeight={600}>{title}</Typography>
              </Box>

              <IconButton
                sx={{ ml: "auto" }}
                disabled={savingSection === section}
                onClick={(e) => handleAccordionAction(section, e)}
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
    </Paper>
  )
}

export default IPOWriteUpMetaDataBusinessOverview
