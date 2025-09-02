import React from 'react';

interface ChildProps {
  ticker: string;
  deal_id: string;
}

const FOComparisionTableMain: React.FC<ChildProps> = ({ ticker, deal_id }) => {
  return (
    <div>
      <h2>Comparision Table </h2>
      <p>Ticker: {ticker}</p>
      <p>Deal ID: {deal_id}</p>
    </div>
  );
};

export default FOComparisionTableMain;
