import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataValuationAnalysisProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataValuationAnalysis: React.FC<
  IPOWriteUpMetaDataValuationAnalysisProps
> = ({ basicDealDetails }) => (
  <IPOWriteUpMetaDataSectionCard
    title="Valuation Analysis"
    basicDealDetails={basicDealDetails}
  />
)

export default IPOWriteUpMetaDataValuationAnalysis
