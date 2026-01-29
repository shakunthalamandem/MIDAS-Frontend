import { Typography } from '@mui/material'
import React from 'react'

interface FebIPOWriteUpDashboardMainProps {
  ticker: string
  pricingDate?: string  
}

const FebIPOWriteUpDashboardMain: React.FC<FebIPOWriteUpDashboardMainProps> = ({ ticker, pricingDate }) => {
  return (
    <div>
      <Typography>Hey {ticker}</Typography>
    </div>
  )
}

export default FebIPOWriteUpDashboardMain
