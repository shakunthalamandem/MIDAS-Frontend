import React from 'react'
// import TradingViewWidget from './Tradingview/TradingViewWidget'
import TickerDropdown from './Tradingview/TickerDropdown'
import Fundamental from './Tabs/Fundamental'
import Technical from './Tabs/Technical'
import TabsMain from './Tabs/TabsMain'
import { Typography } from '@mui/material'

const InvestmentMain = () => {
  return (
  <>

<Typography
        variant="h3"
        sx={{
          fontWeight: "bold",
          color: "#FFFFFF",
          fontSize: { xs: "2rem" },
          backgroundColor: "#002060",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "5vh",
          textAlign: "center",
          marginBottom: "10px",
          animation: "fadeInScale 2s ease-out",
          "@keyframes fadeInScale": {
            "0%": { opacity: 0, transform: "scale(0.8)" },
            "100%": { opacity: 1, transform: "scale(1)" },
          },
        }}
      >
       Investment Strategies
      </Typography>
   <TabsMain />
    <TickerDropdown />
    {/* <TradingViewWidget /> */}
  </>

  )
}

export default InvestmentMain