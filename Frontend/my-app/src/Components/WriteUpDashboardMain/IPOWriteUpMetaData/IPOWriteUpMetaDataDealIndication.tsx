import { Typography, Stack } from "@mui/material"
import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataDealIndicationProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataDealIndication: React.FC<
  IPOWriteUpMetaDataDealIndicationProps
> = ({ basicDealDetails }) => {
  return (
    <IPOWriteUpMetaDataSectionCard
      title="Deal Indication"
      basicDealDetails={basicDealDetails}
    >
      <Stack spacing={1.5}>
        <Typography variant="body2">
          <strong>Indication of Interest:</strong> —
        </Typography>

        <Typography variant="body2">
          <strong>Valuation:</strong> —
        </Typography>

        <Typography variant="body2">
          <strong>Fair Value Estimate:</strong> —
        </Typography>

        <Typography variant="body2">
          <strong>After Market Threshold:</strong> —
        </Typography>
      </Stack>
    </IPOWriteUpMetaDataSectionCard>
  )
}

export default IPOWriteUpMetaDataDealIndication
