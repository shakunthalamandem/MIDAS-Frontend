import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Typography
} from "@mui/material"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined"
import { useEffect, useMemo, useState } from "react"
import { BasicDealDetails } from "../types/DealInformation"
import NoDataNotice from "../../AIFewshotAnalysis/NoDataNotice"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"

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

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const getWordStats = (value: string, limit = 50) => {
  const cleaned = stripHtml(value)
  const words = cleaned ? cleaned.split(" ") : []
  const isLong = words.length > limit
  const preview = isLong ? `${words.slice(0, limit).join(" ")}…` : cleaned
  return { isLong, preview }
}

interface IPOWriteUpMetaDataMarketStatergyProps {
  basicDealDetails: BasicDealDetails
  metadata?: Record<string, any>
}

type FairValueData = {
  fair_value_estimate?: string | number | null
  indication_of_interest?: string | null
  after_market_threshold?: string | null
  internal_notes?: string | null
}

const IPOWriteUpMetaDataMarketStatergy: React.FC<
  IPOWriteUpMetaDataMarketStatergyProps
> = ({ basicDealDetails }) => {
  const API_URL = process.env.REACT_APP_API_URL
  const token = localStorage.getItem("access_token")

  const [data, setData] = useState<FairValueData | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [isEditingCards, setIsEditingCards] = useState(false)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [draftCards, setDraftCards] = useState<Record<string, string>>({})
  const [draftNotes, setDraftNotes] = useState("")
  const [isSavingCards, setIsSavingCards] = useState(false)
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  })

  const fetchFairValues = async () => {
    if (!API_URL) throw new Error("REACT_APP_API_URL is not set.")
    const response = await fetch(`${API_URL}/api/ipo_deal_data_fairvalues/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ticker: basicDealDetails.ticker })
    })
    const raw = await response.text()
    if (!response.ok) throw new Error(raw || "Failed to load fair value data")
    return raw ? (JSON.parse(raw) as FairValueData) : ({} as FairValueData)
  }

  const patchFairValues = async (payload: Record<string, unknown>) => {
    if (!API_URL) throw new Error("REACT_APP_API_URL is not set.")
    const response = await fetch(`${API_URL}/api/ipo_deal_data_fairvalues/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    })
    const raw = await response.text()
    if (!response.ok) throw new Error(raw || "Failed to save fair value data")
    return raw ? JSON.parse(raw) : null
  }

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!basicDealDetails.ticker) return
      try {
        setLoading(true)
        setFetchError(null)
        const result = await fetchFairValues()
        if (!cancelled) setData(result)
      } catch (err) {
        console.error("Error fetching fair value data", err)
        if (!cancelled) setFetchError("No data found.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [API_URL, basicDealDetails.ticker])

  // Format numbers with commas
  const formatNumberWithCommas = (value: string | number | null | undefined): string => {
    if (!value || value === "--") return "--"
    const strValue = String(value).trim()

    // Check if it's a number
    const numMatch = strValue.match(/^[\$]?([0-9,]+\.?[0-9]*)/)
    if (numMatch) {
      const cleanNum = numMatch[1].replace(/,/g, '')
      const num = parseFloat(cleanNum)
      if (!isNaN(num)) {
        const formatted = num.toLocaleString('en-US', { maximumFractionDigits: 2 })
        return strValue.startsWith('$') ? `$${formatted}` : formatted
      }
    }
    return strValue
  }

  const formattedCards = useMemo(
    () => [
      {
        label: "Fair Value Estimate",
        key: "fair_value_estimate",
        value: formatNumberWithCommas(data?.fair_value_estimate)
      },
      {
        label: "Indication of Interest",
        key: "indication_of_interest",
        value: formatNumberWithCommas(data?.indication_of_interest)
      },
      {
        label: "After Market Threshold",
        key: "after_market_threshold",
        value: formatNumberWithCommas(data?.after_market_threshold)
      }
    ],
    [data]
  )

  const openEditCards = () => {
    setSaveError(null)
    setIsEditingCards(true)
    setDraftCards({
      fair_value_estimate: String(data?.fair_value_estimate ?? ""),
      indication_of_interest: String(data?.indication_of_interest ?? ""),
      after_market_threshold: String(data?.after_market_threshold ?? "")
    })
  }

  const openEditNotes = () => {
    setSaveError(null)
    setIsEditingNotes(true)
    setDraftNotes(String(data?.internal_notes ?? ""))
  }

  const cancelEditCards = () => {
    setIsEditingCards(false)
    setDraftCards({})
  }

  const cancelEditNotes = () => {
    setIsEditingNotes(false)
    setDraftNotes("")
  }

  const handleSaveCards = async () => {
    try {
      setIsSavingCards(true)
      await patchFairValues({
        ticker: basicDealDetails.ticker,
        fair_value_estimate: draftCards.fair_value_estimate?.trim() ?? "",
        indication_of_interest: draftCards.indication_of_interest?.trim() ?? "",
        after_market_threshold: draftCards.after_market_threshold?.trim() ?? ""
      })
      const refreshed = await fetchFairValues()
      setData(refreshed)
      cancelEditCards()
    } catch (saveError: any) {
      setSaveError(saveError?.message || "Unable to save changes")
    } finally {
      setIsSavingCards(false)
    }
  }

  const handleSaveNotes = async () => {
    try {
      setIsSavingNotes(true)
      await patchFairValues({
        ticker: basicDealDetails.ticker,
        internal_notes: draftNotes
      })
      const refreshed = await fetchFairValues()
      setData(refreshed)
      cancelEditNotes()
    } catch (saveError: any) {
      setSaveError(saveError?.message || "Unable to save changes")
    } finally {
      setIsSavingNotes(false)
    }
  }

  if (!loading && fetchError) {
    return (
      <NoDataNotice
        title="IOI and After-Market Strategy is not available."
        subtitle=" We will update soon."
      />
    )
  }

  if (!loading && !data) {
    return (
      <NoDataNotice
        title="IOI and After-Market Strategy is not available."
        subtitle=" We will update soon."
      />
    )
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          borderRadius: 3,
          border: "1px solid #e5e7ef",
          // background: "#f7f9ff",
          background: "#ffffff",
          p: { xs: 2.5, md: 3 },
          boxShadow: "0 12px 24px rgba(32, 70, 150, 0.08)"
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1fr" },
            alignItems: "center",
            gap: 1.5,
            px: 0.5,
            background: "#c7d8f1",
            borderRadius: 2,
            py: 1.5
          }}
        >
          <Box sx={{ display: { xs: "none", sm: "block" } }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#124180", textAlign: "center" }}
          >
IOI and After-Market Strategy          </Typography>
          <Box sx={{ justifySelf: { xs: "end", sm: "end" } }}>
            {isEditingCards ? (
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  onClick={handleSaveCards}
                  disabled={isSavingCards}
                  sx={{ color: "#1f3b73" }}
                >
                  <SaveOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={cancelEditCards}
                  disabled={isSavingCards}
                  sx={{ color: "#6b7280" }}
                >
                  <CloseOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
            ) : (
              <IconButton
                size="small"
                onClick={openEditCards}
                sx={{ color: "#1f3b73" }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 2 }}>
            <CircularProgress size={18} />
            <Typography variant="body2">Loading fair value data...</Typography>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1, mb: 4 }} alignItems="stretch">
            {formattedCards.map((card) => {
              const cardValue = String(card.value)
              const { isLong: isLongText, preview } = getWordStats(cardValue, 50)
              const isExpanded = expandedCards[card.key] || false

              return (
                <Grid item xs={12} md={4} key={card.key}>
                  <Box
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      border: "1px solid #e5e7ef",
                      background: "#ecf0f5ff",
                      boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
                      p: 2.25,
                      minHeight: 90,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "flex-start"
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontSize:"1rem",fontWeight: 700, color: "#124180", mb: 1 }}
                    >
                      {card.label}
                    </Typography>
                    {isEditingCards ? (
                      <Box sx={{ background: "#ffffff", borderRadius: 1, width: "100%" }}>
                        <ReactQuill
                          theme="snow"
                          value={draftCards[card.key] ?? ""}
                          onChange={(value) =>
                            setDraftCards((prev) => ({
                              ...prev,
                              [card.key]: value
                            }))
                          }
                          modules={quillModules}
                          formats={quillFormats}
                          style={{ minHeight: "100px" }}
                        />
                      </Box>
                    ) : (
                      <Box sx={{ width: "100%" }}>
                        {cardValue.startsWith("<") ? (
                          <Box>
                            <Box
                              sx={{
                                fontWeight: 400,
                                color: "#000000",
                                lineHeight: 1.6,
                                "& p": { margin: 0, marginBottom: 0.5 },
                                "& ul, & ol": { marginLeft: 2, marginTop: 0.5, marginBottom: 0.5 },
                                overflow: isExpanded ? "visible" : "hidden",
                                display: isExpanded ? "block" : "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: isExpanded ? "unset" : 6
                              }}
                              dangerouslySetInnerHTML={{ __html: cardValue }}
                            />
                            {isLongText && (
                              <Typography
                                component="span"
                                className="pdf-hidden"
                                sx={{
                                  color: "#059669",
                                  cursor: "pointer",
                                  fontStyle: "italic",
                                  fontSize: "0.875rem",
                                  ml: 0.5,
                                  "&:hover": { textDecoration: "underline" }
                                }}
                                onClick={() =>
                                  setExpandedCards((prev) => ({
                                    ...prev,
                                    [card.key]: !isExpanded
                                  }))
                                }
                              >
                                {isExpanded ? "Read Less" : "Read More"}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Box>
                            <Typography
                              variant="body1"
                              component="div"
                              sx={{
                                fontWeight: 400,
                                color: "#111827",
                                lineHeight: 1.6,
                                overflow: isExpanded ? "visible" : "hidden",
                                display: isExpanded ? "block" : "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: isExpanded ? "unset" : 6
                              }}
                            >
                              {cardValue}
                            </Typography>
                            {isLongText && (
                              <Typography
                                component="span"
                                className="pdf-hidden"
                                sx={{
                                  color: "#059669",
                                  cursor: "pointer",
                                  fontStyle: "italic",
                                  fontSize: "0.875rem",
                                  ml: 0.5,
                                  "&:hover": { textDecoration: "underline" }
                                }}
                                onClick={() =>
                                  setExpandedCards((prev) => ({
                                    ...prev,
                                    [card.key]: !isExpanded
                                  }))
                                }
                              >
                                {isExpanded ? "Read Less" : "Read More"}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Box>

      <Box
        className="pdf-hidden"
        sx={{
          borderRadius: 3,
          border: "1px solid #e5e7ef",
          background: "#ffffff",
          p: { xs: 2.5, md: 3 },
          boxShadow: "0 12px 24px rgba(32, 70, 150, 0.08)"
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1fr" },
              alignItems: "center",
              gap: 1,
              background: "#c7d8f1",
              borderRadius: 2,
              py: 1.5,
              px: 0.5
            }}
          >
            <Box sx={{ display: { xs: "none", sm: "block" } }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#124180", textAlign: "center" }}
            >
              Aftermarket Strategy
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifySelf="end"
            >
              <Typography
                variant="caption"
                sx={{ color: "#6b7280", fontStyle: "italic" }}
              >
                (For internal use only, not included in PDF)
              </Typography>
              {isEditingNotes ? (
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    sx={{ color: "#1f3b73" }}
                  >
                    <SaveOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={cancelEditNotes}
                    disabled={isSavingNotes}
                    sx={{ color: "#6b7280" }}
                  >
                    <CloseOutlinedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ) : (
                <IconButton
                  size="small"
                  onClick={openEditNotes}
                  sx={{ color: "#1f3b73" }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          </Box>

          {isEditingNotes ? (
            <Box sx={{ background: "#ffffff", borderRadius: 1 }}>
              <ReactQuill
                theme="snow"
                value={draftNotes}
                onChange={setDraftNotes}
                modules={quillModules}
                formats={quillFormats}
              />
            </Box>
          ) : data?.internal_notes ? (
            <Box
              sx={{
                color: "#1f2937",
                lineHeight: 1.7,
                minHeight: 144
              }}
              dangerouslySetInnerHTML={{ __html: data.internal_notes }}
            />
          ) : (
            <Typography
              variant="body2"
              sx={{
                fontStyle: "italic",
                color: "#6b7280"
              }}
            >
              --
            </Typography>
          )}
        </Stack>
      </Box>

      {saveError ? (
        <Typography variant="body2" sx={{ color: "#b91c1c" }}>
          {saveError}
        </Typography>
      ) : null}
    </Stack>
  )
}

export default IPOWriteUpMetaDataMarketStatergy
