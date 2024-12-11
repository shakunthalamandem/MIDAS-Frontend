import React, { useEffect, useState } from "react";
import MDDScreenerFiltersMain from "./MDDScrenner/MDDScreenerFiltersMain";

// Define the FiltersConfig interface here
interface FiltersConfig {
  screener: Record<string, any>[];  // Array of records with string keys and any type of value
  DealSpecific: Record<string, any>; // A single record with string keys and any type of value
  MonasheeSpecific: Record<string, any>; // Another single record similar to DealSpecific
}

const MDDScreener: React.FC = () => {
  const [filtersData, setFiltersData] = useState<FiltersConfig | null>(null);

  useEffect(() => {
    // Fetch the filters.json or provide your filters data
    fetch("/ScreenerFilters.json")
      .then((response) => {
        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched Filters Data:", data); // Debugging the fetched data
        setFiltersData(data);
      })
      .catch((error) => console.error("Error loading filters:", error));
  }, []);

  return (
    <>
      {filtersData ? (
        <MDDScreenerFiltersMain filtersData={filtersData} />
      ) : (
        <div>Loading filters...</div>
      )}
    </>
  );
};

export default MDDScreener;
