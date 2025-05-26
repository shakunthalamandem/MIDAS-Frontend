import React from 'react'
import SummaryGapGraph from './SummaryGapGrapgh'
import AllocationGraphsMain from './AllocationGraphsMain'
import WeekelyMDD from './WeekelyMDD'

const MDDDashboardMain = () => {
  return (
    
    <>
    <AllocationGraphsMain selectedFilters={{}} />
    <WeekelyMDD selectedWeek={null} />


    <SummaryGapGraph />
    </>
  )
}

export default MDDDashboardMain