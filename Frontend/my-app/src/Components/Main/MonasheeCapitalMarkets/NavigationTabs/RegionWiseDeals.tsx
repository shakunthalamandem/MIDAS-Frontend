import React from 'react';

interface RegionWiseDealsProps {
  data: Record<string, any>;
}

const RegionWiseDeals: React.FC<RegionWiseDealsProps> = ({ data }) => {
  return (
    <div>
      <h3>RegionWiseDeals</h3>
      <div>
        {Object.entries(data).map(([region, stats]) => (
          <div key={region}>
            <h4>{region}</h4>
            <p>Count: {stats.count}</p>
            <p>Volume: {stats.volume}</p>
            <p>Opportunity Exits Return: {stats.opp_exs_return}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegionWiseDeals;
