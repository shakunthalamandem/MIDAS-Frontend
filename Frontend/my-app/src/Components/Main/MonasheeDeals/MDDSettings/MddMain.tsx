import React, { useEffect, useState } from "react";
import MDDFilters from "./MDDFilters";
import MDDScreenergrid from "./MDDScreenergrid";

interface MddMainProps {
  apiName: string;
}

interface Filter {
  // Replace these with the actual fields of the filter objects in your JSON
  id: string;
  name: string;
  [key: string]: any;
}

const MddMain: React.FC<MddMainProps> = ({ apiName }) => {
  const [filtersData, setFiltersData] = useState<Filter[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // const response = await fetch("/MDDFilters.json");
        const response = await fetch(`${apiUrl}/api/mdd_distinct_values/`, {method: "GET"});
        if (!response.ok) {
          throw new Error(`Failed to fetch filters: ${response.statusText}`);
        }
        const data = await response.json();
        // setFiltersData(data.screener || []);
        setFiltersData(data || []);
      } catch (error) {
        console.error("Error loading filters:", error);
      }
    };

    fetchFilters();
  }, []);

  return<>
  <MDDFilters filtersData={filtersData} apiName={apiName} />;
  {/* <MDDScreenergrid sectorwiseData={filtersData || {}} /> */}

  
  </> 
};

export default MddMain;
