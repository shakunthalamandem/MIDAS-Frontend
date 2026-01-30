import { useEffect, useState } from "react"
import IPODashboardCardRatings from "../../IPODashboardLLM/IPODashboardCardRatings"
import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataKeyMetricsProps {
  basicDealDetails: BasicDealDetails
  metadata?: Record<string, any>
}

type IPOData = {
  revenue_growth?: Record<
    string,
    {
      color?: string
      category?: string
    }
  >
}

const IPOWriteUpMetaDataKeyMetrics: React.FC<
  IPOWriteUpMetaDataKeyMetricsProps
> = ({ basicDealDetails, metadata }) => {
  const [ipoData, setIpoData] = useState<IPOData>({})

  // 🔗 Map backend metadata → rating card format
  useEffect(() => {
    if (!metadata) return

    setIpoData({
      revenue_growth: {
        "Revenue Growth": {
          color: metadata.revenue_growth_profile_color,
          category: metadata.revenue_growth_profile_category
        },
        Profitability: {
          color: metadata.margin_profile_color,
          category: metadata.margin_profile_category
        },
        Leverage: {
          color: metadata.leverage_profile_color,
          category: metadata.leverage_profile_category
        },
        "Market Position": {
          color: metadata.market_analysis_color,
          category: metadata.market_analysis_category
        },
        "Growth Catalysts": {
          color: metadata.growth_catalysts_color,
          category: metadata.growth_catalysts_category
        }
      }
    })
  }, [metadata])

  return (
    <IPOWriteUpMetaDataSectionCard
      title="Key Metrics"
      basicDealDetails={basicDealDetails}
    >
      <IPODashboardCardRatings
        selectedTicker={basicDealDetails.ticker}
        ipodata={ipoData}
        setIpoData={setIpoData}
      />
    </IPOWriteUpMetaDataSectionCard>
  )
}

export default IPOWriteUpMetaDataKeyMetrics
