import React from 'react'
import SummaryGapGraph from './SummaryGapGrapgh'
import AllocationGraphsMain from './AllocationGraphsMain'

const MDDDashboardMain = () => {
  return (
    
    <>
    <AllocationGraphsMain selectedFilters={{}} />

    <SummaryGapGraph />
    </>
  )
}

export default MDDDashboardMain