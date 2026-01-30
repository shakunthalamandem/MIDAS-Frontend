import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataKeyMetricsProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataKeyMetrics: React.FC<
  IPOWriteUpMetaDataKeyMetricsProps
> = ({ basicDealDetails }) => (
  <IPOWriteUpMetaDataSectionCard
    title="Key Metrics"
    basicDealDetails={basicDealDetails}
  />
)

export default IPOWriteUpMetaDataKeyMetrics
