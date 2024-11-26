import React, { useEffect, useState } from "react";
import MDDFilters from "./MDDFilters";

const MddMain: React.FC = () => {
  const [filtersData, setFiltersData] = useState([]);

  useEffect(() => {
    // Fetch the filters.json or provide your filters data
    fetch("/MDDFilters.json")
      .then((response) => response.json())
      .then((data) => setFiltersData(data.screener))
      .catch((error) => console.error("Error loading filters:", error));
  }, []);
  return (
    <>
          <MDDFilters filtersData={filtersData} />

    </>
  )
}

export default MddMain