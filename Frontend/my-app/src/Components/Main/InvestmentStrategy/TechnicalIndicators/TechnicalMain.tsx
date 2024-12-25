import React from 'react'
import TickerDropdown from '../Tradingview/TickerDropdown'
import TradingViewWidget from '../Tradingview/TradingViewWidget'
import { Box, Container, Typography } from '@mui/material'

const TechnicalMain = () => {
  return (

<>
<Container maxWidth="lg" sx={{ paddingY: 4 }}>

<Box sx={{ width: "100%", backgroundColor: "#fff" }}>

<Typography variant="h4"  style={{ color: '#002060',fontWeight:'bold' }}>
  Technical Analysis
</Typography>
<TickerDropdown/>
<TradingViewWidget />
</Box>
</Container>


</>)
}

export default TechnicalMain