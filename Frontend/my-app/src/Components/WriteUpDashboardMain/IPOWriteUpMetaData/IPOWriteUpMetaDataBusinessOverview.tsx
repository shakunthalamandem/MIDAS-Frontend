import React, { useEffect, useState, ReactElement } from "react"
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Box,
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
import StarRateOutlinedIcon from "@mui/icons-material/StarRateOutlined"
import NoDataNotice from "../../AIFewshotAnalysis/NoDataNotice"
import ReactQuill from "react-quill"
import 'react-quill/dist/quill.snow.css'
import { BasicDealDetails, WriteupRatings } from "../types/DealInformation"

/* ===================== TYPES ===================== */

interface WriteUpData {
  business_overview: string[]
  key_highlights?: string[]
  concerns: string[]
  principal_stockholders_preipo: string[]
  key_management_personnel: string[]
  differentiated_summary: string[]
  [key: string]: string | string[] | WriteupRatings | undefined
  writeup_ratings?: WriteupRatings
}

interface Props {
  basicDealDetails: BasicDealDetails
  pdfMode?: boolean
}

type AccordionSection = {
  section: keyof WriteUpData
  title: string
  icon: ReactElement
}

/* ===================== CONFIG ===================== */

const ACCORDION_SECTIONS: AccordionSection[] = [
  {
    section: 'differentiated_summary',
    title: 'Differentiated Summary',
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

const parseSectionRating = (value?: number | string | null) => {
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
        const normalizedData = {
          ...data,
          differentiated_summary: Array.isArray(data.differentiated_summary)
            ? data.differentiated_summary
            : data.differentiated_summary
            ? [data.differentiated_summary]
            : []
        }
        setWriteUpData(normalizedData)
        setUpdatedData(normalizedData)
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
    const sectionArray = [...(((copy[section] as string[]) ?? []))]

    if (sectionArray[index] === value) {
      return
    }

    sectionArray[index] = value
    copy[section] = sectionArray
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
    const sectionValue = ((updatedData[section] as string[]) ?? []).join("")

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
          ? { ...prev, [section]: [...(((updatedData[section] as string[]) ?? []))] }
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

  const getSectionData = (section: keyof WriteUpData): string[] => {
    const source =
      editMode === section ? updatedData : writeUpData

    if (!source) return []

    return [...(((source[section] as string[]) ?? []))]
  }

  /* ===================== RENDER HELPERS ===================== */

  const renderSectionContent = (section: keyof WriteUpData, data: string[]) =>
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

  const businessOverviewRating =
    parseSectionRating(
      writeUpData.writeup_ratings?.["business-overview"] ??
        basicDealDetails.writeup_ratings?.["business-overview"]
    ) ?? null

  const businessOverviewRatingText =
    businessOverviewRating !== null ? formatRating(businessOverviewRating) : null

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

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 2
          }}
        >
          <Typography variant="h5" fontWeight={600} color="#124180">
            Business Overview
          </Typography>
          {businessOverviewRatingText && (
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
                Rating - {businessOverviewRatingText}/10
              </Typography>
            </Box>
          )}
        </Box>

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
          <Accordion
            key={section}
            sx={{
              borderRadius: 2,
              border: "1px solid #E6ECF5",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              "&:before": { display: "none" },
              background: "linear-gradient(135deg, #ffffff, #f8fbff)"
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#124180" }} />}
              sx={{
                minHeight: 64,
                background: "linear-gradient(135deg, #f0f5ff, #e9f2ff)",
                borderRadius: "8px 8px 0 0",
                "&:hover": {
                  background: "linear-gradient(135deg, #e8f0fe, #dae7fc)"
                }
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={1.5}
                width="100%"
              >
                <Box
                  sx={{
                    color: "#124180",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  {icon}
                </Box>
                <Typography
                  fontWeight={700}
                  color="#124180"
                  sx={{ fontSize: "1rem" }}
                >
                  {title}
                </Typography>
              </Box>

              <IconButton
                sx={{
                  ml: "auto",
                  color: "#124180",
                  "&:hover": { backgroundColor: "rgba(18, 65, 128, 0.1)" }
                }}
                disabled={savingSection === section}
                onClick={(e) => handleAccordionAction(section, e)}
              >
                {editMode === section ? <SaveIcon /> : <EditIcon />}
              </IconButton>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #f8fbff, #ffffff)",
                borderRadius: "0 0 8px 8px"
              }}
            >
              {renderSectionContent(section, getSectionData(section))}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Paper>
  )
}

export default IPOWriteUpMetaDataBusinessOverview
