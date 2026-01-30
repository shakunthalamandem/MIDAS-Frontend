import { useMemo } from "react"
import IPOComparablesAndAISection from "../../IPODashboardLLM/IPOComparablesAndAISection"
import { SelectedData } from "../../IPODashboardLLM/IPODealsS1DealData"
import { BasicDealDetails } from "../types/DealInformation"
import IPOWriteUpMetaDataSectionCard from "./IPOWriteUpMetaDataSectionCard"

interface IPOWriteUpMetaDataCompsProps {
  basicDealDetails: BasicDealDetails
}

const IPOWriteUpMetaDataComps: React.FC<IPOWriteUpMetaDataCompsProps> = ({
  basicDealDetails
}) => {
  const selectedData: SelectedData = useMemo(
    () => ({
      ticker_name: basicDealDetails.ticker,
      pricing_date: basicDealDetails.pricing_date
    }),
    [basicDealDetails.pricing_date, basicDealDetails.ticker]
  )

  return (

      <IPOComparablesAndAISection selectedData={selectedData} />
  )
}

export default IPOWriteUpMetaDataComps
