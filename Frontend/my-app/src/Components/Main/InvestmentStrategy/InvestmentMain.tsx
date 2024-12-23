import React from 'react'
import TradingViewWidget from './Tradingview/TradingViewWidget'
import TickerDropdown from './Tradingview/TickerDropdown'

const InvestmentMain = () => {
  return (<>
    <div>InvestmentMain</div>
    <TickerDropdown />
    <TradingViewWidget />
    </>

  )
}

export default InvestmentMain