import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Child Components for NumberOfDeals, Region, and Sector
import NumberOfDeals from './NavigationTabs/NumberOfDeals';
import RegionWiseDeals from './NavigationTabs/RegionWiseDeals';
import SectorWiseDeals from './NavigationTabs/SectorWiseDeals';

interface MarketCapitalMainProps {
  selectedFilters: Record<string, string | number | (string | number)[]>;
}

const MarketCapitalMain: React.FC<MarketCapitalMainProps> = ({ selectedFilters }) => {
  const [apiData, setApiData] = useState<any>(null); // Store the API response
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Reset error

      try {
        const response = await axios.post('http://192.168.1.59:9000/api/investment_screener/', selectedFilters);
        setApiData(response.data); // Store API response data
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (Object.keys(selectedFilters).length > 0) {
      fetchData(); // Fetch data when selectedFilters change
    }
  }, [selectedFilters]); // Dependency array to trigger useEffect when selectedFilters change

  return (
    <div>
      <h2>Market Capital Main</h2>
      
      {/* Display loading state */}
      {loading && <p>Loading...</p>}
      
      {/* Display error message if any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* Display applied filters */}
      <div>
        <h3>Applied Filters:</h3>
        {Object.keys(selectedFilters).length > 0 ? (
          <ul>
            {Object.entries(selectedFilters).map(([key, value], index) => (
              <li key={index}>
                <strong>{key}:</strong> {Array.isArray(value) ? value.join(', ') : value.toString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No filters applied.</p>
        )}
      </div>
      
      {/* Display the API data */}
      {apiData && (
        <>
          <NumberOfDeals data={apiData.deal_type} />
          <RegionWiseDeals data={apiData.region} />
          <SectorWiseDeals data={apiData.sectors} />
        </>
      )}
    </div>
  );
};

export default MarketCapitalMain;
