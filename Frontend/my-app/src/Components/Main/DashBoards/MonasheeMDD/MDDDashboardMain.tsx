import React from 'react'
import SummaryGapGraph from './SummaryGapGrapgh'
import AllocationGraphsMain from './AllocationGraphsMain'
import WeekelyMDD from './WeekelyMDD'
import SectorWiseTable from './SectorWiseTable'

const MDDDashboardMain = () => {
  return (
    
    <>
    <AllocationGraphsMain selectedFilters={{}} />
    <WeekelyMDD selectedWeek={null} />
    <SectorWiseTable />


    <SummaryGapGraph />
    </>
  )
}

export default MDDDashboardMain