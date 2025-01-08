import React from 'react';

interface NumberOfDealsProps {
  data: Record<string, any>;
}

const NumberOfDeals: React.FC<NumberOfDealsProps> = ({ data }) => {
  return (
    <div>
      <h3>Deal Type</h3>
      <div>
        {Object.entries(data).map(([year, stats]) => (
          <div key={year}>
            <h4>{year}</h4>
            <p>IPO Count: {stats.count.IPO}</p>
            <p>FO Count: {stats.count.FO}</p>
            <p>IPO Volume: {stats.volume.IPO}</p>
            <p>FO Volume: {stats.volume.FO}</p>
            <p>IPO Opportunity Exits Value: {stats.opp_exs_value.IPO}</p>
            <p>FO Opportunity Exits Value: {stats.opp_exs_value.FO}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NumberOfDeals;
