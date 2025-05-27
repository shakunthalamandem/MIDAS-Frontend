import React from 'react'
import SummaryGapGraph from './SummaryGapGrapgh'
import AllocationGraphsMain from './AllocationGraphsMain'
import WeekelyMDD from './WeekelyMDD'
import DashboardSectorWiseTable from './DashboardSectorWiseTable'

const MDDDashboardMain = () => {
  return (
    <>
      <AllocationGraphsMain selectedFilters={{}} />

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        {/* Left side: Two stacked rows */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <WeekelyMDD selectedWeek={null} />
          <DashboardSectorWiseTable />
        </div>

        {/* Right side: Single tall component */}
        <div style={{ flex: 1 }}>
          <SummaryGapGraph />
        </div>
      </div>
    </>
  )
}

export default MDDDashboardMain
