import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataTrendsProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataTrends: React.FC<IPOWriteUpMetaDataTrendsProps> = ({
  basicDealDetails
}) => (
  <IPOWriteUpMetaDataSectionCard
    title="Trends"
    basicDealDetails={basicDealDetails}
  />
)

export default IPOWriteUpMetaDataTrends
