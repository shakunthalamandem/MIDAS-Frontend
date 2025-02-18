import React, { useEffect, useState } from "react";

interface DealFormData {
  deal_captain: string;
  team: string;
  participants: string[];
  ticker: string;
  company: {
    name: string;
    description: string;
  };
  vendor_issuer: {
    type: string;
    from: string[];
  };
}

interface TempJsonDataProps {
  onDataLoaded: (data: DealFormData) => void;
}

const TempJsonData: React.FC<TempJsonDataProps> = ({ onDataLoaded }) => {
  const [filtersData, setFiltersData] = useState<DealFormData | null>(null);

  useEffect(() => {
    fetch("/Temp.json")
      .then((response) => response.json())
      .then((data: DealFormData) => {
        setFiltersData(data);
        onDataLoaded(data); // Pass data to parent
      })
      .catch((error) => console.error("Error loading data:", error));
  }, [onDataLoaded]);

  return null;
};

export default TempJsonData;
