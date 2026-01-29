import { BasicDealDetails } from "../types/DealInformation"

interface IPOWriteUpMetaDataBusinessOverviewProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataBusinessOverview: React.FC<
  IPOWriteUpMetaDataBusinessOverviewProps
> = ({ basicDealDetails }) => {
  const { ticker, region, deal_id } = basicDealDetails

  return (
    <section>
      <h4>Business Overview</h4>
      <p>Ticker: {ticker}</p>
      <p>Region: {region}</p>
      <p>Deal ID: {deal_id}</p>
    </section>
  )
}

export default IPOWriteUpMetaDataBusinessOverview
