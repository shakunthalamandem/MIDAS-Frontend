import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataRedFlagProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataRedFlag: React.FC<IPOWriteUpMetaDataRedFlagProps> = ({
  basicDealDetails
}) => (
  <IPOWriteUpMetaDataSectionCard
    title="Red Flag"
    basicDealDetails={basicDealDetails}
  />
)

export default IPOWriteUpMetaDataRedFlag
