import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataBusinessOverviewProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataBusinessOverview: React.FC<
  IPOWriteUpMetaDataBusinessOverviewProps
> = ({ basicDealDetails }) => (
  <IPOWriteUpMetaDataSectionCard
    title="Business Overview"
    basicDealDetails={basicDealDetails}
  />
)

export default IPOWriteUpMetaDataBusinessOverview
