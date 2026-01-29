import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataMarketStatergyProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataMarketStatergy: React.FC<
  IPOWriteUpMetaDataMarketStatergyProps
> = ({ basicDealDetails }) => (
  <IPOWriteUpMetaDataSectionCard
    title="Market Strategy"
    basicDealDetails={basicDealDetails}
  />
)

export default IPOWriteUpMetaDataMarketStatergy
