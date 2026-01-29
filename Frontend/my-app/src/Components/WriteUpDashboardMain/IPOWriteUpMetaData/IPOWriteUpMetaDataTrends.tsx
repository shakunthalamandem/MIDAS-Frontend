import { BasicDealDetails } from "../types/DealInformation"

interface IPOWriteUpMetaDataTrendsProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataTrends: React.FC<IPOWriteUpMetaDataTrendsProps> = ({
  basicDealDetails
}) => {
  const { ticker, region, deal_id } = basicDealDetails

  return (
    <section>
      <h4>Trends</h4>
      <p>Ticker: {ticker}</p>
      <p>Region: {region}</p>
      <p>Deal ID: {deal_id}</p>
    </section>
  )
}

export default IPOWriteUpMetaDataTrends
