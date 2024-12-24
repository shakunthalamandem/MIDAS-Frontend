import React from 'react';
import TickerDropdown from './Tradingview/TickerDropdown';
import TabsMain from './Tabs/TabsMain';
import { Typography } from '@mui/material';

const InvestmentMain = () => {
  const filtersData = {
    technical: {
      label: 'Technical Filters',
      description: 'Choose technical indicators',
      options: ['Moving Average', 'RSI', 'MACD'],
    },
    fundamental: {
      label: 'Fundamental Filters',
      description: 'Choose fundamental parameters',
      options: ['P/E Ratio', 'Market Cap', 'Dividend Yield'],
    },
  };

  return (
    <>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 'bold',
          color: '#FFFFFF',
          fontSize: { xs: '2rem' },
          backgroundColor: '#002060',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '5vh',
          textAlign: 'center',
          marginBottom: '10px',
          animation: 'fadeInScale 2s ease-out',
          '@keyframes fadeInScale': {
            '0%': { opacity: 0, transform: 'scale(0.8)' },
            '100%': { opacity: 1, transform: 'scale(1)' },
          },
        }}
      >
        Investment Strategies
      </Typography>
      <TabsMain filtersData={filtersData} />
      <TickerDropdown />
      {/* <TradingViewWidget /> */}
    </>
  );
};

export default InvestmentMain;
