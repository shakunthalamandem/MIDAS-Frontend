import { BasicDealDetails } from "../types/DealInformation"

interface IPOWriteUpMetaDataFinancialHighlightsProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataFinancialHighlights: React.FC<
  IPOWriteUpMetaDataFinancialHighlightsProps
> = ({ basicDealDetails }) => {
  const { ticker, region, deal_id } = basicDealDetails

  return (
    <section>
      <h4>Financial Highlights</h4>
      <p>Ticker: {ticker}</p>
      <p>Region: {region}</p>
      <p>Deal ID: {deal_id}</p>
    </section>
  )
}

export default IPOWriteUpMetaDataFinancialHighlights
