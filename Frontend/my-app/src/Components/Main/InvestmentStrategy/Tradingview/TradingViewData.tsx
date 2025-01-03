import React from 'react';
import { SingleTicker } from 'react-ts-tradingview-widgets'; // Correct import for SingleTicker widget

interface TradingViewDataProps {
  ticker: string;
}

const TradingViewData: React.FC<TradingViewDataProps> = ({ ticker }) => {
  // Remove " US" or other country suffix from the ticker symbol
  const cleanedTicker = ticker.replace(/\s+US$/, '');


  return (
    <div
      style={{
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        
      }}
      
    >
      <style>
        {`
          .tradingview-widget-copyright {
            display: none !important;
          }
        `}
      </style>
      <div style={{ position: 'relative' }}>
        {/* Add styles to hide the TradingView watermark if using an appropriate plan */}
        <SingleTicker
          symbol={cleanedTicker}
          autosize={true}
        />
      </div>
    </div>
  );
};

export default TradingViewData;
