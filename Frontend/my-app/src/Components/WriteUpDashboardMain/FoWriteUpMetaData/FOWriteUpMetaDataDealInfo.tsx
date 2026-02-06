import { Box, Typography } from "@mui/material"
import { BasicDealDetails } from "../types/DealInformation"

interface FOWriteUpMetaDataDealInfoProps {
  basicDealDetails: BasicDealDetails
}

const FOWriteUpMetaDataDealInfo: React.FC<FOWriteUpMetaDataDealInfoProps> = ({
  basicDealDetails
}) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#124180", mb: 2 }}>
        Deal Info
      </Typography>
      <Typography variant="body2" sx={{ color: "#1f2937" }}>
        Ticker: {basicDealDetails.ticker}
      </Typography>
    </Box>
  )
}

export default FOWriteUpMetaDataDealInfo
