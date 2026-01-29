import { Typography } from '@mui/material'
import React from 'react'

interface FebWriteUpDashboardMainProps {
  ticker: string
  pricingDate?: string  
}

const FebWriteUpDashboardMain: React.FC<FebWriteUpDashboardMainProps> = ({ ticker, pricingDate }) => {
  return (
    <div>
      <Typography>Hey {ticker}</Typography>
    </div>
  )
}

export default FebWriteUpDashboardMain
