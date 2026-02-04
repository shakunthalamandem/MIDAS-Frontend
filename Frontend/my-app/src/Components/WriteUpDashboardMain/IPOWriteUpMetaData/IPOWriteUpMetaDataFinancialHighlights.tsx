import React, { useEffect, useState } from "react"
import NewFinancialTableMain from "../../IPODashboardLLM/IPOFinancialForecast/NewFinancialTableMain"
import { Box, Typography } from "@mui/material"
import StarRateOutlinedIcon from "@mui/icons-material/StarRateOutlined"
import { BasicDealDetails } from "../types/DealInformation"

interface IPOWriteUpMetaDataFinancialHighlightsProps {
  basicDealDetails: BasicDealDetails
}

const parseRatingValue = (value?: number | string | null) => {
  if (value === undefined || value === null) return null
  if (typeof value === "number") return Number.isFinite(value) ? value : null
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

const formatRatingValue = (value: number) => {
  const normalized = Math.round(value * 10) / 10
  return Number.isInteger(normalized) ? `${normalized}` : normalized.toFixed(1)
}

const IPOWriteUpMetaDataFinancialHighlights: React.FC<
  IPOWriteUpMetaDataFinancialHighlightsProps
> = ({ basicDealDetails }) => {
  const [ratingValue, setRatingValue] = useState<number | null>(null)
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    let active = true

    const fetchRating = async () => {
      if (!basicDealDetails.ticker || !apiUrl) return
      const token = localStorage.getItem("access_token")
      const headers = {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : ""
      }
      try {
      const token = localStorage.getItem("access_token");
      if (!apiUrl) throw new Error("API URL not set");
        const res = await fetch(`${apiUrl}/api/writeup_data/`, {
          method: "POST",
          headers,
          body: JSON.stringify({ ticker: basicDealDetails.ticker })
        })
        if (!res.ok) return
        const data = await res.json()
        if (!active) return
        const incoming =
          data?.writeup_ratings ??
          data?.section_scores ??
          data?.final_verdict_section_scores ??
          {}
        const parsed = parseRatingValue(incoming?.["financial-highlights"])
        setRatingValue(parsed)
      } catch {
        // ignore
      }
    }

    fetchRating()
    return () => {
      active = false
    }
  }, [apiUrl, basicDealDetails.ticker])

  const ratingText =
    ratingValue !== null
      ? formatRatingValue(ratingValue)
      : null

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 2
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#124180" }}>
          Financial Highlights
        </Typography>
        {ratingText && (
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
              Rating - {ratingText}/10
            </Typography>
          </Box>
        )}
      </Box>

      <NewFinancialTableMain
        defaultTicker={basicDealDetails.ticker}
        deal_id={String(basicDealDetails.deal_id)}
      />
    </Box>
  )
}

export default IPOWriteUpMetaDataFinancialHighlights
