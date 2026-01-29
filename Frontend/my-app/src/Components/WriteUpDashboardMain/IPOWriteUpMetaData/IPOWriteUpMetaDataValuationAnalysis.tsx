import { BasicDealDetails } from "../types/DealInformation"

interface IPOWriteUpMetaDataValuationAnalysisProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataValuationAnalysis: React.FC<
  IPOWriteUpMetaDataValuationAnalysisProps
> = ({ basicDealDetails }) => {
  const { ticker, region, deal_id } = basicDealDetails

  return (
    <section>
      <h4>Valuation Analysis</h4>
      <p>Ticker: {ticker}</p>
      <p>Region: {region}</p>
      <p>Deal ID: {deal_id}</p>
    </section>
  )
}

export default IPOWriteUpMetaDataValuationAnalysis
