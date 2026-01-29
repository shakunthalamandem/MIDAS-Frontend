import { BasicDealDetails } from "../types/DealInformation"

interface IPOWriteUpMetaDataKeyMetricsProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataKeyMetrics: React.FC<
  IPOWriteUpMetaDataKeyMetricsProps
> = ({ basicDealDetails }) => {
  const { ticker, region, deal_id } = basicDealDetails

  return (
    <section>
      <h4>Key Metrics</h4>
      <p>Ticker: {ticker}</p>
      <p>Region: {region}</p>
      <p>Deal ID: {deal_id}</p>
    </section>
  )
}

export default IPOWriteUpMetaDataKeyMetrics
