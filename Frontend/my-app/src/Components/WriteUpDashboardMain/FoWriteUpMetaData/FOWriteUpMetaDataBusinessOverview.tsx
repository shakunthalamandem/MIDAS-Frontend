import { Box, Typography } from "@mui/material"
import { BasicDealDetails } from "../types/DealInformation"

interface FOWriteUpMetaDataBusinessOverviewProps {
  basicDealDetails: BasicDealDetails
}

const FOWriteUpMetaDataBusinessOverview: React.FC<
  FOWriteUpMetaDataBusinessOverviewProps
> = ({ basicDealDetails }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#124180", mb: 2 }}>
        Business Overview
      </Typography>
      <Typography variant="body2" sx={{ color: "#1f2937" }}>
        Ticker: {basicDealDetails.ticker}
      </Typography>
    </Box>
  )
}

export default FOWriteUpMetaDataBusinessOverview
