import { useMemo } from "react"
import IPOValuationSection from "../../IPODashboardLLM/IPOValuationSection"
import { SelectedData } from "../../IPODashboardLLM/IPODealsS1DealData"
import { BasicDealDetails } from "../types/DealInformation"

interface IPOWriteUpMetaDataValuationAnalysisProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataValuationAnalysis: React.FC<
  IPOWriteUpMetaDataValuationAnalysisProps
> = ({ basicDealDetails }) => {
  const selectedData: SelectedData = useMemo(
    () => ({
      ticker_name: basicDealDetails.ticker,
      pricing_date: basicDealDetails.pricing_date
    }),
    [basicDealDetails.pricing_date, basicDealDetails.ticker]
  )

  return (

      <IPOValuationSection selectedData={selectedData} />
  )
}

export default IPOWriteUpMetaDataValuationAnalysis
