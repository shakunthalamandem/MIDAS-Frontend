import { BasicDealDetails } from "../types/DealInformation"

interface IPOWriteUpMetaDataRedFlagProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataRedFlag: React.FC<IPOWriteUpMetaDataRedFlagProps> = ({
  basicDealDetails
}) => {
  const { ticker, region, deal_id } = basicDealDetails

  return (
    <section>
      <h4>Red Flag</h4>
      <p>Ticker: {ticker}</p>
      <p>Region: {region}</p>
      <p>Deal ID: {deal_id}</p>
    </section>
  )
}

export default IPOWriteUpMetaDataRedFlag
