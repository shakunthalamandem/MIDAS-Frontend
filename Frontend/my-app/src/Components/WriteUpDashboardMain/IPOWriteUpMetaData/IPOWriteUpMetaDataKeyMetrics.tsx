import { useState } from "react"
import IPODashboardCardRatings from "../../IPODashboardLLM/IPODashboardCardRatings"
import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataKeyMetricsProps {
  basicDealDetails: BasicDealDetails
}

type IPOData = {
  revenue_growth?: Record<string, { color?: string; category?: string }>
}

const IPOWriteUpMetaDataKeyMetrics: React.FC<
  IPOWriteUpMetaDataKeyMetricsProps
> = ({ basicDealDetails }) => {
  const [ipoData, setIpoData] = useState<IPOData>({})

  return (

      <IPODashboardCardRatings
        selectedTicker={basicDealDetails.ticker}
        ipodata={ipoData}
        setIpoData={setIpoData}
      />
  )
}

export default IPOWriteUpMetaDataKeyMetrics
