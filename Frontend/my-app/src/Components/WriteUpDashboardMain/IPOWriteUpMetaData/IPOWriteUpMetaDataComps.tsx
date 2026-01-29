import { BasicDealDetails } from "../types/DealInformation"

interface IPOWriteUpMetaDataCompsProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataComps: React.FC<IPOWriteUpMetaDataCompsProps> = ({
  basicDealDetails
}) => {
  const { ticker, region, deal_id } = basicDealDetails

  return (
    <section>
      <h4>Comps</h4>
      <p>Ticker: {ticker}</p>
      <p>Region: {region}</p>
      <p>Deal ID: {deal_id}</p>
    </section>
  )
}

export default IPOWriteUpMetaDataComps
