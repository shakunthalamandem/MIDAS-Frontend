import React from 'react';

interface ChildProps {
  ticker: string;
  deal_id: string;
}

const FOStrengthWriteUp: React.FC<ChildProps> = ({ ticker, deal_id }) => {
  return (
    <div>
      <h2>Business Highlights</h2>
      <p>Ticker: {ticker}</p>
      <p>Deal ID: {deal_id}</p>
    </div>
  );
};

export default FOStrengthWriteUp;
