import NewFinancialTableMain from "../../IPODashboardLLM/IPOFinancialForecast/NewFinancialTableMain"
import { BasicDealDetails } from "../types/DealInformation"

interface IPOWriteUpMetaDataFinancialHighlightsProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataFinancialHighlights: React.FC<
  IPOWriteUpMetaDataFinancialHighlightsProps
> = ({ basicDealDetails }) => (

    <NewFinancialTableMain
      defaultTicker={basicDealDetails.ticker}
      deal_id={String(basicDealDetails.deal_id)}
    />
)

export default IPOWriteUpMetaDataFinancialHighlights
