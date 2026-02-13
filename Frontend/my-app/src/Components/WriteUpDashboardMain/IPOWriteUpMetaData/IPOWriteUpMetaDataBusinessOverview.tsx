import React, { useEffect, useState, ReactElement } from "react"
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Box,
  Paper,
  CircularProgress,
  Button
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import EditIcon from "@mui/icons-material/Edit"
import SaveIcon from "@mui/icons-material/Save"
import CancelIcon from "@mui/icons-material/Cancel"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
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
  // icon: ReactElement
}

/* ===================== CONFIG ===================== */

const ACCORDION_SECTIONS: AccordionSection[] = [
  {
    section: 'differentiated_summary',
    title: 'Differentiated Summary',
    // icon: <TrendingUpIcon />,
  },
  {
    section: 'concerns',
    title: 'Concerns',
    // icon: <WarningAmberIcon />,
  },
  {
    section: 'principal_stockholders_preipo',
    title: 'Principal Stockholders ',
    // icon: <AccountTreeIcon />,
  },
  {
    section: "key_management_personnel",
    title: "Key Management Personnel",
    // icon: <GroupsIcon />
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

type ClampedContentProps = {
  children: React.ReactNode
  disabled?: boolean
  clampLines?: number
}

const ClampedContent: React.FC<ClampedContentProps> = ({
  children,
  disabled = false,
  clampLines = 6
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showToggle, setShowToggle] = useState(false)
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (disabled) {
      setShowToggle(false)
      return
    }

    const updateToggleVisibility = () => {
      const el = contentRef.current
      if (!el) return
      const computed = window.getComputedStyle(el)
      const lineHeight = parseFloat(computed.lineHeight) || 24
      const maxHeight = lineHeight * clampLines
      setShowToggle(el.scrollHeight > maxHeight + 1)
    }

    updateToggleVisibility()
    window.addEventListener("resize", updateToggleVisibility)
    return () => window.removeEventListener("resize", updateToggleVisibility)
  }, [children, disabled, clampLines])

  if (disabled) {
    return <>{children}</>
  }

  return (
    <Box>
      <Box
        ref={contentRef}
        sx={{
          color: "#1f2a44",
          lineHeight: 1.7,
          overflow: isExpanded ? "visible" : "hidden",
          display: isExpanded ? "block" : "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: isExpanded ? "unset" : clampLines
        }}
      >
        {children}
      </Box>
      {showToggle ? (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <Button
            size="small"
            onClick={() => setIsExpanded((prev) => !prev)}
            sx={{
              textTransform: "none",
              color: "#115f02ff",
              fontWeight: 600,
              px: 0,
              minWidth: "auto"
            }}
          >
            {isExpanded ? "...Read less" : "...Read more"}
          </Button>
        </Box>
      ) : null}
    </Box>
  )
}

/* ===================== COMPONENT ===================== */

const IPOWriteUpMetaDataBusinessOverview: React.FC<Props> = ({
  basicDealDetails,
  pdfMode = false
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

    // Listen for ratings update event from Final Verdict
    const handleRatingsUpdate = () => {
      fetchData()
    }

    window.addEventListener('ratingsUpdated', handleRatingsUpdate)

    return () => {
      window.removeEventListener('ratingsUpdated', handleRatingsUpdate)
    }
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

  const handleAddPoint = (section: keyof WriteUpData, index?: number) => {
    if (!updatedData) return
    const copy = { ...updatedData }
    const sectionArray = [...(((copy[section] as string[]) ?? []))]
    const insertAt = index === undefined ? sectionArray.length : index + 1
    sectionArray.splice(insertAt, 0, "")
    copy[section] = sectionArray
    setUpdatedData(copy)
  }

  const handleDeletePoint = (section: keyof WriteUpData, index: number) => {
    if (!updatedData) return
    const copy = { ...updatedData }
    const sectionArray = [...(((copy[section] as string[]) ?? []))]
    sectionArray.splice(index, 1)
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
        <Box key={index} mb={2} sx={{ position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              zIndex: 2,
              display: "flex",
              gap: 0.5,
              background: "rgba(240, 245, 255, 0.9)",
              borderRadius: 2,
              px: 0.5
            }}
          >
            <IconButton
              size="small"
              onClick={() => handleAddPoint(section, index)}
              aria-label="add-item"
            >
              <AddIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeletePoint(section, index)}
              aria-label="delete-item"
              disabled={data.length <= 1}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
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
        title="Business Overview is not available."
        subtitle=" We will update soon."
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
        // background: "linear-gradient(#ffffff)",
                  background: "#ffffff",

        border: "1px solid #E6ECF5"
      }}
    >
      {/* ================= BUSINESS OVERVIEW ================= */}
      <Box mb={4}>
        <Box sx={{ position: "relative", mb: 2, background: "#c7d8f1", borderRadius: 2, py: 1.5, px: 2 }}>
          {/* Rating - Left aligned */}
          {businessOverviewRatingText && (
            <Box
              sx={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                borderRadius: 999,
                border: "1px solid rgba(52, 144, 220, 0.4)",
                // background: "linear-gradient(135deg, #ffffff, #e9f2ff)",
                background: "#ffffff",

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

          {/* Heading - Center aligned */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Typography variant="h6" fontWeight={700} color="#124180">
              Company Overview
            </Typography>
          </Box>

          {/* Edit buttons - Right aligned */}
          {!pdfMode && (
            <Box sx={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
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
          <ClampedContent disabled={pdfMode}>
            <Box dangerouslySetInnerHTML={{ __html: businessOverviewDraft }} />
          </ClampedContent>
        )}
      </Box>

      {/* ================= ACCORDIONS ================= */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: pdfMode ? "1fr" : { xs: "1fr", md: "1fr 1fr" },
          gap: 2
        }}
      >
        {ACCORDION_SECTIONS.map(({ section, title,  }) => (
          <Accordion
            key={section}
            defaultExpanded={pdfMode}
            sx={{
              borderRadius: 2,
              border: "1px solid #E6ECF5",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              "&:before": { display: "none" },
                // background: "linear-gradient(135deg, #ffffff, #e9f2ff)",
                                  background: "#ffffff",

            }}
          >
            <AccordionSummary
              expandIcon={!pdfMode ? <ExpandMoreIcon sx={{ color: "#124180" }} /> : null}
              sx={{
                minHeight: 64,
                background: "#e8ecf1",
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
                {/* <Box
                  sx={{
                    color: "#124180",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  {icon}
                </Box> */}
                <Typography
                  fontWeight={700}
                  color="#124180"
                  sx={{ fontSize: "1rem" }}
                >
                  {title}
                </Typography>
              </Box>

              {!pdfMode && (
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
              )}
            </AccordionSummary>

            <AccordionDetails
              sx={{
                p: 3,
                // background: "linear-gradient(135deg, #ffffff, #e9f2ff)",
                background: "#ffffff",
                borderRadius: "0 0 8px 8px"
              }}
            >
              {editMode === section ? (
                renderSectionContent(section, getSectionData(section))
              ) : pdfMode ? (
                renderSectionContent(section, getSectionData(section))
              ) : (
                <ClampedContent>
                  {getSectionData(section).map((item, index) => (
                    <Box
                      key={index}
                      mb={2}
                      sx={{ color: "#124180" }}
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                </ClampedContent>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Paper>
  )
}

export default IPOWriteUpMetaDataBusinessOverview
