import { Typography, Stack } from "@mui/material"
import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataDealIndicationProps {
  basicDealDetails: BasicDealDetails
  metadata?: Record<string, any>
}

const IPOWriteUpMetaDataDealIndication: React.FC<
  IPOWriteUpMetaDataDealIndicationProps
> = ({ basicDealDetails, metadata }) => {
  return (
    <IPOWriteUpMetaDataSectionCard
      title="Deal Indication"
      basicDealDetails={basicDealDetails}
    >
      <Stack spacing={1.5}>
        <Typography variant="body2">
          <strong>Indication of Interest:</strong>{" "}
          {metadata?.indication_of_interest ?? "—"}
        </Typography>

        <Typography variant="body2">
          <strong>Valuation:</strong> {metadata?.valuation ?? "—"}
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
      </Stack>
    </IPOWriteUpMetaDataSectionCard>
  )
}

export default IPOWriteUpMetaDataDealIndication
