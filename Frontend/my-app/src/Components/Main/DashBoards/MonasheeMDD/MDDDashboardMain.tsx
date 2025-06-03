import React from 'react'
import AllocationGraphsMain from './AllocationGraphsMain'
import WeekelyMDD from './WeekelyMDD'
import DashboardSectorWiseTable from './DashboardSectorWiseTable'
import SummaryGraphsGap from './SummaryGapGraph'
import { Typography, Grid } from '@mui/material'
import AiDashboard from '../Equity/AiDashboard'

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

      </div>
      <SummaryGraphsGap />
    </>
  )
}

export default MDDDashboardMain
