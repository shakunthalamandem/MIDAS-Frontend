import { Box, Typography } from "@mui/material"
import { BasicDealDetails } from "../types/DealInformation"

interface FOWriteUpMetaDataKeyRisksProps {
  basicDealDetails: BasicDealDetails
}

const FOWriteUpMetaDataKeyRisks: React.FC<FOWriteUpMetaDataKeyRisksProps> = ({
  basicDealDetails
}) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#124180", mb: 2 }}>
        Key Risks
      </Typography>
      <Typography variant="body2" sx={{ color: "#1f2937" }}>
        Ticker: {basicDealDetails.ticker}
      </Typography>
    </Box>
  )
}

export default FOWriteUpMetaDataKeyRisks
