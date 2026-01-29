import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataDealInfoProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataDealInfo: React.FC<IPOWriteUpMetaDataDealInfoProps> = ({
  basicDealDetails
}) => (
  <IPOWriteUpMetaDataSectionCard
    title="Deal Info"
    basicDealDetails={basicDealDetails}
  />
)

export default IPOWriteUpMetaDataDealInfo
