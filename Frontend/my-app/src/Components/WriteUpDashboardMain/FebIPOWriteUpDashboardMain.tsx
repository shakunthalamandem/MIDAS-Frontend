import { BasicDealDetails } from "./types/DealInformation"

interface FebIPOWriteUpDashboardMainProps {
  basicDealDetails: BasicDealDetails
}

const FebIPOWriteUpDashboardMain: React.FC<FebIPOWriteUpDashboardMainProps> = ({
  basicDealDetails
}) => {
  const { ticker, region, deal_id } = basicDealDetails

  return (
    <>
      <h3>IPO Write-up</h3>
      <p>Ticker: {ticker}</p>
      <p>Region: {region}</p>
      <p>Deal ID: {deal_id}</p>
    </>
  )
}

export default FebIPOWriteUpDashboardMain
