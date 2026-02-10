import { Box, Typography } from "@mui/material"
import { BasicDealDetails } from "../types/DealInformation"
import FOCompareNewDashbaord from "./FOCompareNewDashbaord"

interface FOWriteUpMetaDataCompsProps {
  basicDealDetails: BasicDealDetails
}

const FOWriteUpMetaDataComps: React.FC<FOWriteUpMetaDataCompsProps> = ({
  basicDealDetails
}) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#124180", mb: 2 }}>
        Comparative Multiples
      </Typography>
      <FOCompareNewDashbaord
        ticker={basicDealDetails.ticker}
        deal_id={basicDealDetails.deal_id}
        pricingDate={basicDealDetails.pricing_date}
      />
    </Box>
  )
}

export default FOWriteUpMetaDataComps
