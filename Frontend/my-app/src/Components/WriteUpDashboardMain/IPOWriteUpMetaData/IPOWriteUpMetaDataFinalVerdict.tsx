import { BasicDealDetails } from "../types/DealInformation"

interface IPOWriteUpMetaDataFinalVerdictProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataFinalVerdict: React.FC<
  IPOWriteUpMetaDataFinalVerdictProps
> = ({ basicDealDetails }) => {
  const { ticker, region, deal_id } = basicDealDetails

  return (
    <section>
      <h4>Final Verdict</h4>
      <p>Ticker: {ticker}</p>
      <p>Region: {region}</p>
      <p>Deal ID: {deal_id}</p>
    </section>
  )
}

export default IPOWriteUpMetaDataFinalVerdict
