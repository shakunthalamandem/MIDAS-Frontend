import { BasicDealDetails } from "../types/DealInformation"

interface IPOWriteUpMetaDataDealInfoProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataDealInfo: React.FC<IPOWriteUpMetaDataDealInfoProps> = ({
  basicDealDetails
}) => {
  const { ticker, region, deal_id } = basicDealDetails

  return (
    <section>
      <h4>Deal Info</h4>
      <p>Ticker: {ticker}</p>
      <p>Region: {region}</p>
      <p>Deal ID: {deal_id}</p>
    </section>
  )
}

export default IPOWriteUpMetaDataDealInfo
