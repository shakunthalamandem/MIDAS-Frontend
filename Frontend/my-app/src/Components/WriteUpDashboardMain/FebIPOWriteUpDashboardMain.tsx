import { BasicDealDetails } from "./types/DealInformation"
import IPOWriteUpMetaDataBusinessOverview from "./IPOWriteUpMetaData/IPOWriteUpMetaDataBusinessOverview"
import IPOWriteUpMetaDataComps from "./IPOWriteUpMetaData/IPOWriteUpMetaDataComps"
import IPOWriteUpMetaDataDealIndication from "./IPOWriteUpMetaData/IPOWriteUpMetaDataDealIndication"
import IPOWriteUpMetaDataDealInfo from "./IPOWriteUpMetaData/IPOWriteUpMetaDataDealInfo"
import IPOWriteUpMetaDataFinalVerdict from "./IPOWriteUpMetaData/IPOWriteUpMetaDataFinalVerdict"
import IPOWriteUpMetaDataFinancialHighlights from "./IPOWriteUpMetaData/IPOWriteUpMetaDataFinancialHighlights"
import IPOWriteUpMetaDataKeyMetrics from "./IPOWriteUpMetaData/IPOWriteUpMetaDataKeyMetrics"
import IPOWriteUpMetaDataMarketStatergy from "./IPOWriteUpMetaData/IPOWriteUpMetaDataMarketStatergy"
import IPOWriteUpMetaDataRedFlag from "./IPOWriteUpMetaData/IPOWriteUpMetaDataRedFlag"
import IPOWriteUpMetaDataTrends from "./IPOWriteUpMetaData/IPOWriteUpMetaDataTrends"
import IPOWriteUpMetaDataValuationAnalysis from "./IPOWriteUpMetaData/IPOWriteUpMetaDataValuationAnalysis"

interface FebIPOWriteUpDashboardMainProps {
  basicDealDetails: BasicDealDetails
}

const FebIPOWriteUpDashboardMain: React.FC<FebIPOWriteUpDashboardMainProps> = ({
  basicDealDetails
}) => {
  return (
    <>
      <h3>IPO Write-up</h3>
      <IPOWriteUpMetaDataDealInfo basicDealDetails={basicDealDetails} />
      <IPOWriteUpMetaDataDealIndication basicDealDetails={basicDealDetails} />
      <IPOWriteUpMetaDataMarketStatergy basicDealDetails={basicDealDetails} />
      <IPOWriteUpMetaDataBusinessOverview basicDealDetails={basicDealDetails} />
      <IPOWriteUpMetaDataKeyMetrics basicDealDetails={basicDealDetails} />
      <IPOWriteUpMetaDataFinancialHighlights
        basicDealDetails={basicDealDetails}
      />
      <IPOWriteUpMetaDataTrends basicDealDetails={basicDealDetails} />
      <IPOWriteUpMetaDataComps basicDealDetails={basicDealDetails} />
      <IPOWriteUpMetaDataValuationAnalysis
        basicDealDetails={basicDealDetails}
      />
      <IPOWriteUpMetaDataRedFlag basicDealDetails={basicDealDetails} />
      <IPOWriteUpMetaDataFinalVerdict basicDealDetails={basicDealDetails} />
    </>
  )
}

export default FebIPOWriteUpDashboardMain
