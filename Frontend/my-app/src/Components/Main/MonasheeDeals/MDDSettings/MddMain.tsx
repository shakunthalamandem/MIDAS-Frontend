import React, { useEffect, useState } from "react";
import MDDFilters from "./MDDFilters";

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

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch("/MDDFilters.json");
        if (!response.ok) {
          throw new Error(`Failed to fetch filters: ${response.statusText}`);
        }
        const data = await response.json();
        setFiltersData(data.screener || []);
      } catch (error) {
        console.error("Error loading filters:", error);
      }
    };

    fetchFilters();
  }, []);

  return <MDDFilters filtersData={filtersData} apiName={apiName} />;
};

export default MddMain;
