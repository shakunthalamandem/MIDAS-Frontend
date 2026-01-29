import { BasicDealDetails } from "../types/DealInformation"

interface IPOWriteUpMetaDataMarketStatergyProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataMarketStatergy: React.FC<
  IPOWriteUpMetaDataMarketStatergyProps
> = ({ basicDealDetails }) => {
  const { ticker, region, deal_id } = basicDealDetails

  return (
    <section>
      <h4>Market Strategy</h4>
      <p>Ticker: {ticker}</p>
      <p>Region: {region}</p>
      <p>Deal ID: {deal_id}</p>
    </section>
  )
}

export default IPOWriteUpMetaDataMarketStatergy
