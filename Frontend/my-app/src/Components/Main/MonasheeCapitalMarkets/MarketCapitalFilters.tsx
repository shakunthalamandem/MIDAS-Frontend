import React, { useEffect, useState } from "react";

const MarketCapitalFilters: React.FC<{ onDataLoaded: (data: any) => void }> = ({ onDataLoaded }) => {
  const [filtersData, setFiltersData] = useState<any>(null);

  // Run only once when the component mounts
  useEffect(() => {
    if (!filtersData) { // Check if data is already loaded to avoid re-fetching
      // Simulate fetching data from a JSON file or API
      fetch("/MarketFilters.json")
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetched data:", data); // Log the fetched data
          setFiltersData(data);
          onDataLoaded(data); // Notify parent with loaded data
        })
        .catch((error) => console.error("Error loading data:", error));
    }
  }, [filtersData, onDataLoaded]); // Empty dependency ensures it only runs once

  return null;
};

export default MarketCapitalFilters;
