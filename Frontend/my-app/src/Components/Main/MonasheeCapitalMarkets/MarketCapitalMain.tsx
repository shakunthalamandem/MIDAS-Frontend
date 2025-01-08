import React from 'react';

interface MarketCapitalMainProps {
  selectedFilters: Record<string, string | number | (string | number)[]>;
}

const MarketCapitalMain: React.FC<MarketCapitalMainProps> = ({ selectedFilters }) => {
    console.log("selectedFilters",selectedFilters)
  return (
    
    <div>
      <h2>MarketCapitalMain</h2>
      <div>
        <h3>Applied Filters:</h3>
        {Object.keys(selectedFilters).length > 0 ? (
          <ul>
            {Object.entries(selectedFilters).map(([key, value], index) => (
              <li key={index}>
                <strong>{key}:</strong>{' '}
                {Array.isArray(value) ? value.join(', ') : value.toString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No filters applied.</p>
        )}
      </div>
    </div>
  );
};

export default MarketCapitalMain;
