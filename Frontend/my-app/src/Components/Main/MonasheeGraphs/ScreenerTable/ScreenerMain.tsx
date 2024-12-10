import React, { useEffect, useState } from "react";
import Filters from './Filters';

const ScreenerMain: React.FC = () => {
  const [filtersData, setFiltersData] = useState([]);

  useEffect(() => {
    // Fetch the filters.json or provide your filters data
    fetch("/Filters.json")
      .then((response) => response.json())
      .then((data) => setFiltersData(data.screener))
      .catch((error) => console.error("Error loading filters:", error));
  }, []);
  return (
    <>
          <Filters filtersData={filtersData} />
          

    </>
  )
}

export default ScreenerMain