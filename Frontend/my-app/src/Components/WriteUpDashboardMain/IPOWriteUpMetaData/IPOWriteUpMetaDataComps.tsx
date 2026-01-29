import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataCompsProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataComps: React.FC<IPOWriteUpMetaDataCompsProps> = ({
  basicDealDetails
}) => (
  <IPOWriteUpMetaDataSectionCard
    title="Comps"
    basicDealDetails={basicDealDetails}
  />
)

export default IPOWriteUpMetaDataComps
