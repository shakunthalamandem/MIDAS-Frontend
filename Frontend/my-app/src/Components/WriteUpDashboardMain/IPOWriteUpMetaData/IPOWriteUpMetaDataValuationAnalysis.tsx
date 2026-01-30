import { useMemo } from "react"
import { Stack, Typography } from "@mui/material"
import IPOValuationSection from "../../IPODashboardLLM/IPOValuationSection"
import { SelectedData } from "../../IPODashboardLLM/IPODealsS1DealData"
import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataValuationAnalysisProps {
  basicDealDetails: BasicDealDetails
  metadata?: Record<string, any>
}

const IPOWriteUpMetaDataValuationAnalysis: React.FC<
  IPOWriteUpMetaDataValuationAnalysisProps
> = ({ basicDealDetails, metadata }) => {
  const selectedData: SelectedData = useMemo(
    () => ({
      ticker_name: basicDealDetails.ticker,
      pricing_date: basicDealDetails.pricing_date
    }),
    [basicDealDetails.pricing_date, basicDealDetails.ticker]
  )

  return (
    <IPOWriteUpMetaDataSectionCard
      title="Valuation Analysis"
      basicDealDetails={basicDealDetails}
    >
      <Stack spacing={2}>
        {/* Backend-driven valuation context */}
        <Typography variant="body2">
          <strong>Valuation Attractiveness:</strong>{" "}
          {metadata?.valuation_attractiveness ?? "—"}
        </Typography>

        <Typography variant="body2">
          <strong>Fair Value Estimate:</strong>{" "}
          {metadata?.fair_value_estimate
            ? `$${metadata.fair_value_estimate}`
            : "—"}
        </Typography>

        <Typography variant="body2">
          <strong>After Market Threshold:</strong>{" "}
          {metadata?.after_market_threshold ?? "—"}
        </Typography>

        {/* Existing valuation model */}
        <IPOValuationSection selectedData={selectedData} />
      </Stack>
    </IPOWriteUpMetaDataSectionCard>
  )
}

export default IPOWriteUpMetaDataValuationAnalysis
