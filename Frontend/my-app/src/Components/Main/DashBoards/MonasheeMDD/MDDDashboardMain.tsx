import React from 'react'
import AllocationGraphsMain from './AllocationGraphsMain'
import WeekelyMDD from './WeekelyMDD'
import DashboardSectorWiseTable from './DashboardSectorWiseTable'
import SummaryGraphsGap from './SummaryGapGraph'
import { Typography, Grid, Paper, Box } from '@mui/material'
import AiDashboard from '../Equity/AiDashboard'

const MDDDashboardMain = () => {
  return (
    <>
    <Box sx={{ p: 2 }}>
    <Paper elevation={3} sx={{ p: 3, backgroundColor: '#f5faff', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#002060', fontWeight: 'bold', mb: 1 }}>
          📉 MDD Performance & Allocation Gap Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#333' }}>
          This dashboard delivers an in-depth analysis of deal allocations and PnL performance gaps between modeled and actual results across sectors, regions, and deal types. 
          Track deal activity trends over the past six quarters, observe capital deployment as a percentage of IOIs and deal sizes, and analyze YTD performance deviations across key markets like the US and EMEA. 
          Designed to support strategic adjustments and uncover inefficiencies in deal allocation or modeling assumptions.
        </Typography>
      </Paper>
      <AllocationGraphsMain selectedFilters={{}} />

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        {/* Left side: Two stacked rows */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <WeekelyMDD selectedWeek={null} />
          <DashboardSectorWiseTable />
        </div>

      </div>
      <SummaryGraphsGap />
      </Box>
    </>
  )
}

export default MDDDashboardMain
