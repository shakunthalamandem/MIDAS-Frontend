import { Box } from "@mui/material"
import { BasicDealDetails } from "../types/DealInformation"
import FOCompareNewDashbaord from "./FOCompareNewDashbaord"

interface FOWriteUpMetaDataCompsProps {
  basicDealDetails: BasicDealDetails
}

const FOWriteUpMetaDataComps: React.FC<FOWriteUpMetaDataCompsProps> = ({
  basicDealDetails
}) => {
  return (
    <>
      <FOCompareNewDashbaord
        ticker={basicDealDetails.ticker}
        pricingDate={basicDealDetails.pricing_date}
      />
    </>
  )
}

export default FOWriteUpMetaDataComps
