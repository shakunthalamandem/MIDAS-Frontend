import { Box, CircularProgress, Typography } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import DashboardcompsMetricsMain from "../../IPODashboardLLM/IPODashboardMain/IPOCompsTableMain/DashboardcompsMetricsMain"
import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

type ComparableMetric = Record<string, unknown>
type ApiResponse = {
  [ticker: string]: { data: ComparableMetric[]; Averages?: Record<string, any> }
}

interface IPOWriteUpMetaDataCompsProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataComps: React.FC<IPOWriteUpMetaDataCompsProps> = ({
  basicDealDetails
}) => {
  const [loading, setLoading] = useState(false)
  const [comparables, setComparables] = useState<ComparableMetric[]>([])
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.REACT_APP_API_URL
  const ticker = basicDealDetails.ticker

  useEffect(() => {
    if (!apiUrl || !ticker) return
    let isActive = true

    const fetchComparables = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${apiUrl}/api/new_dashboard_maincycle/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`
          },
          body: JSON.stringify({ operation: "ipo", ticker })
        })

        if (!response.ok) throw new Error("Failed to load comparable metrics")
        const payload = await response.json()
        const metrics =
          payload?.data?.comparable_company_metrics ??
          payload?.data?.comparable_company_metrics_data ??
          []
        if (isActive) setComparables(metrics)
      } catch (fetchError: any) {
        if (isActive) setError(fetchError?.message || "Unable to load data")
      } finally {
        if (isActive) setLoading(false)
      }
    }

    fetchComparables()
    return () => {
      isActive = false
    }
  }, [apiUrl, ticker])

  const comparableData: ApiResponse = useMemo(
    () => ({
      [ticker]: { data: comparables }
    }),
    [ticker, comparables]
  )

  const pricingYear = useMemo(() => {
    const rawDate = basicDealDetails.pricing_date
    if (!rawDate) return undefined
    const parsed = new Date(rawDate)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.getFullYear()
  }, [basicDealDetails.pricing_date])

  return (
    <IPOWriteUpMetaDataSectionCard
      title=""
      basicDealDetails={basicDealDetails}
      showSummary={false}
      showNotes={false}
    >
      <Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={26} />
          </Box>
        ) : error ? (
          <Typography variant="body2" sx={{ color: "#b91c1c" }}>
            {error}
          </Typography>
        ) : (
          <DashboardcompsMetricsMain
            ticker={ticker}
            data={comparableData}
            pricingYear={pricingYear}
          />
        )}
      </Box>
    </IPOWriteUpMetaDataSectionCard>
  )
}

export default IPOWriteUpMetaDataComps
