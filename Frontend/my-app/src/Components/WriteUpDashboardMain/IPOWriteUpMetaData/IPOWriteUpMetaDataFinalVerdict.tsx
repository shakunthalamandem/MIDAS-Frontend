import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataFinalVerdictProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataFinalVerdict: React.FC<
  IPOWriteUpMetaDataFinalVerdictProps
> = ({ basicDealDetails }) => (
  <IPOWriteUpMetaDataSectionCard
    title="Final Verdict"
    basicDealDetails={basicDealDetails}
  />
)

export default IPOWriteUpMetaDataFinalVerdict
