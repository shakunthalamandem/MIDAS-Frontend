import React from "react"
import { Stack, Typography } from "@mui/material"
import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataRedFlagProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataRedFlag: React.FC<IPOWriteUpMetaDataRedFlagProps> = ({
  basicDealDetails
}) => {
  return (
    <IPOWriteUpMetaDataSectionCard
      title="Red Flags"
      basicDealDetails={basicDealDetails}
      accentColor="#ffdddd"
    >
      <Stack spacing={1.5}>
        <Typography variant="body2">
          • Regulatory or compliance risks not fully disclosed
        </Typography>

        <Typography variant="body2">
          • High customer concentration or revenue dependency
        </Typography>

        <Typography variant="body2">
          • Aggressive valuation compared to peers
        </Typography>

        <Typography variant="body2">
          • Unclear post-IPO capital allocation strategy
        </Typography>
      </Stack>
    </IPOWriteUpMetaDataSectionCard>
  )
}

export default IPOWriteUpMetaDataRedFlag
