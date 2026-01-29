import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataDealIndicationProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataDealIndication: React.FC<
  IPOWriteUpMetaDataDealIndicationProps
> = ({ basicDealDetails }) => (
  <IPOWriteUpMetaDataSectionCard
    title="Deal Indication"
    basicDealDetails={basicDealDetails}
  />
)

export default IPOWriteUpMetaDataDealIndication
