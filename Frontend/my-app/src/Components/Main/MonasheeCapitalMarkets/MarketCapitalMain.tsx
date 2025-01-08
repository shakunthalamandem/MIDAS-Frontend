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
        const apiUrl = process.env.REACT_APP_API_URL;

        if (!apiUrl) {
          throw new Error('API URL is not defined in environment variables');
        }

        // Make the POST request with selectedFilters as the payload
        const response = await fetch(`${apiUrl}/api/dealogic_graph/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(selectedFilters), // Payload from selected filters
        });

        if (response.ok) {
          const result = await response.json();
          setApiData(result); // Store API response data
          console.log("result",result)
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    if (Object.keys(selectedFilters).length > 0) {
      fetchData(); // Fetch data when selectedFilters change
    }
  }, [selectedFilters]); // Dependency array to trigger useEffect when selectedFilters change
console.log("apiData",apiData)
  return (
    <div>

      {/* Display loading state */}
      {loading && <p>Loading...</p>}

      {/* Display error message if any */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Display applied filters */}


      {/* Display the API data */}
      {apiData && (
        <>
          <NumberOfDeals data={apiData.deal_type} />
          <RegionWiseDeals data={apiData.regions} />
          <SectorWiseDeals data={apiData.sectors} />
        </>
      )}
    </div>
  );
};

export default MarketCapitalMain;
