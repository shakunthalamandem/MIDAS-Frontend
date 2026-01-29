import { BasicDealDetails } from "../types/DealInformation"

interface IPOWriteUpMetaDataDealIndicationProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataDealIndication: React.FC<
  IPOWriteUpMetaDataDealIndicationProps
> = ({ basicDealDetails }) => {
  const { ticker, region, deal_id } = basicDealDetails

  return (
    <section>
      <h4>Deal Indication</h4>
      <p>Ticker: {ticker}</p>
      <p>Region: {region}</p>
      <p>Deal ID: {deal_id}</p>
    </section>
  )
}

export default IPOWriteUpMetaDataDealIndication
