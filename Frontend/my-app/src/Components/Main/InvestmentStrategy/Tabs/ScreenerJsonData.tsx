import React, { useEffect, useState } from "react";
import TabsMain from "./TabsMain";

const ScreenerJsonData: React.FC = () => {
    const [filtersData, setFiltersData] = useState<any>(null);

  useEffect(() => {
    // Fetch the filters.json or provide your filters data
    fetch("/InvestmentFilters.json")
    .then((response) => response.json())
    .then((data) => setFiltersData(data))
    .catch((error) => console.error("Error loading data:", error));
}, []);
  return (
    <>
{filtersData && <TabsMain filtersData={filtersData} />}
          

    </>
  )
}

export default ScreenerJsonData