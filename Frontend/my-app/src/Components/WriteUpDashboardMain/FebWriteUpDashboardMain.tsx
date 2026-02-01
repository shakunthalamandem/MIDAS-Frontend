import React from 'react'
import FebFOWriteUpDashboardMain from './FebFOWriteUpDashboardMain'
import FebIPOWriteUpDashboardMain from './FebIPOWriteUpDashboardMain'
import { BasicDealDetails } from './types/DealInformation'

interface FebWriteUpDashboardMainProps {
  basicDealDetails: BasicDealDetails
}

const FebWriteUpDashboardMain: React.FC<FebWriteUpDashboardMainProps> = ({
  basicDealDetails
}) => {
  return (
    <>
      {basicDealDetails.deal_type === 'IPO' ? (
        <FebIPOWriteUpDashboardMain
          basicDealDetails={basicDealDetails}
        />
      ) : (
        <FebFOWriteUpDashboardMain
          basicDealDetails={basicDealDetails}
        />
      )}
    </>
  )
}

export default FebWriteUpDashboardMain
