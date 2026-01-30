import { Stack, Typography, Divider } from "@mui/material"
import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataBusinessOverviewProps {
  basicDealDetails: BasicDealDetails
  metadata?: Record<string, any>
}

const IPOWriteUpMetaDataBusinessOverview: React.FC<
  IPOWriteUpMetaDataBusinessOverviewProps
> = ({ basicDealDetails, metadata }) => {
  return (
    <IPOWriteUpMetaDataSectionCard
      title="Business Overview"
      basicDealDetails={basicDealDetails}
    >
      <Stack spacing={1.5}>
        <Typography variant="body2">
          {metadata?.business_overview ?? "—"}
        </Typography>

        <Divider />

        <Typography variant="body2">
          <strong>Proprietary Solution:</strong>{" "}
          {metadata?.proprietary_solution ?? "—"}
        </Typography>

        <Typography variant="body2">
          <strong>Customer Mix:</strong>{" "}
          {metadata?.customer_mix ?? "—"}
        </Typography>

        <Typography variant="body2">
          <strong>Supplier Mix:</strong>{" "}
          {metadata?.supplier_mix_category ?? "—"}
        </Typography>

        <Typography variant="body2">
          <strong>Barriers to Entry:</strong>{" "}
          {metadata?.barriers_to_entry ?? "—"}
        </Typography>
      </Stack>
    </IPOWriteUpMetaDataSectionCard>
  )
}

export default IPOWriteUpMetaDataBusinessOverview
