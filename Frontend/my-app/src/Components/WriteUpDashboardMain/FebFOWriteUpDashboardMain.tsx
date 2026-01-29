import { BasicDealDetails } from "./types/DealInformation"

interface FebFOWriteUpDashboardMainProps {
  basicDealDetails: BasicDealDetails
}

const FebFOWriteUpDashboardMain: React.FC<FebFOWriteUpDashboardMainProps> = ({
  basicDealDetails
}) => {
  const { ticker, pricing_date, region } = basicDealDetails

  return (
    <>
      <h3>FO Write-up</h3>
      <p>Ticker: {ticker}</p>
      <p>Pricing Date: {pricing_date}</p>
      <p>Region: {region}</p>
    </>
  )
}

export default FebFOWriteUpDashboardMain
