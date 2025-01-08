import React from 'react';

interface SectorWiseDealsProps {
  data: Record<string, any>;
}

const SectorWiseDeals: React.FC<SectorWiseDealsProps> = ({ data }) => {
  return (
    <div>
      <h3>SectorWiseDealss</h3>
      <div>
        {Object.entries(data).map(([sector, stats]) => (
          <div key={sector}>
            <h4>{sector}</h4>
            <p>Count: {stats.count}</p>
            <p>Volume: {stats.volume}</p>
            <p>Opportunity Exits Return: {stats.opp_exs_return}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectorWiseDeals;
