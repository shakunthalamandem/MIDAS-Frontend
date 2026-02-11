import { Box, Typography } from "@mui/material"
import { BasicDealDetails } from "../types/DealInformation"
import MarketSentimentFOWriteUp from "../../Main/FOWriteUpMain/FOWriteSections/MarketSentimentFOWriteUp"

interface FOWriteUpMetaDataAIIndicationProps {
  basicDealDetails: BasicDealDetails
}

const FOWriteUpMetaDataAIIndication: React.FC<
  FOWriteUpMetaDataAIIndicationProps
> = ({ basicDealDetails }) => {
  return (
    <>
      <MarketSentimentFOWriteUp
        ticker={basicDealDetails.ticker}
        pricing_date={basicDealDetails.pricing_date}
      />
    </>
  )
}

export default FOWriteUpMetaDataAIIndication
