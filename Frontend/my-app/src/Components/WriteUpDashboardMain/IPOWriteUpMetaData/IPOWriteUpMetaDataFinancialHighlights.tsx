import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataFinancialHighlightsProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataFinancialHighlights: React.FC<
  IPOWriteUpMetaDataFinancialHighlightsProps
> = ({ basicDealDetails }) => (
  <IPOWriteUpMetaDataSectionCard
    title="Financial Highlights"
    basicDealDetails={basicDealDetails}
  />
)

export default IPOWriteUpMetaDataFinancialHighlights
