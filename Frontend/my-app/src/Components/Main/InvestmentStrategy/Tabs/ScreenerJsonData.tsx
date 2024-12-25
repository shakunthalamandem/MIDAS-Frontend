import React, { useEffect, useState } from "react";

const ScreenerJsonData: React.FC<{ onDataLoaded: (data: any) => void }> = ({ onDataLoaded }) => {
  const [filtersData, setFiltersData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch data if it's not loaded yet
    if (filtersData) return;

    setLoading(true);
    fetch("/InvestmentFilters.json")
      .then((response) => response.json())
      .then((data) => {
        setFiltersData(data);
        onDataLoaded(data); // Notify parent with loaded data
        setLoading(false); // Stop loading once data is fetched
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        setLoading(false);
      });
  }, [filtersData, onDataLoaded]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return null;
};

export default ScreenerJsonData;
