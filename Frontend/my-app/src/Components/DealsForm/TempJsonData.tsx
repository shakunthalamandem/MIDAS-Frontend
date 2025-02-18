import React, { useEffect, useState } from "react";
import { DealFormData } from "../../types/DealFormData";

interface TempJsonDataProps {
  onDataLoaded: (data: DealFormData) => void;
}

const TempJsonData: React.FC<TempJsonDataProps> = ({ onDataLoaded }) => {
  const [filtersData, setFiltersData] = useState<DealFormData | null>(null);

  useEffect(() => {
    fetch("/Temp.json") // Fetch data from the json file
      .then((response) => response.json())
      .then((data: DealFormData) => {
        setFiltersData(data);
        onDataLoaded(data); // Pass the full data to parent
      })
      .catch((error) => console.error("Error loading data:", error));
  }, [onDataLoaded]);

  return null;
};

export default TempJsonData;
