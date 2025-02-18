import React, { useEffect, useState } from "react";

const TempJsonData: React.FC<{ onDataLoaded: (data: any) => void }> = ({ onDataLoaded }) => {
  const [filtersData, setFiltersData] = useState<any>(null);

  useEffect(() => {
    // Simulate fetching data from a JSON file or API
    fetch("/Temp.json")
      .then((response) => response.json())
      .then((data) => {
        setFiltersData(data);
        onDataLoaded(data); // Notify parent with loaded data
      })
      .catch((error) => console.error("Error loading data:", error));
  }, [onDataLoaded]);
  console.log("filtersData",filtersData)

  return null; 
};

export default TempJsonData;
