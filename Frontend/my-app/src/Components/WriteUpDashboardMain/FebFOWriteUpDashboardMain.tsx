import { Typography } from '@mui/material'
import React from 'react'

interface FebFOWriteUpDashboardMainProps {
  ticker: string
  pricingDate?: string  
}

const FebFOWriteUpDashboardMain: React.FC<FebFOWriteUpDashboardMainProps> = ({ ticker, pricingDate }) => {
  return (
    <div>
      <Typography>Hey {ticker} and {pricingDate }</Typography>
    </div>
  )
}

export default FebFOWriteUpDashboardMain
