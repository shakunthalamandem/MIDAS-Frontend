import React, { useEffect, useState } from "react";
import MDDScreenerFiltersMain from "./MDDScrenner/MDDScreenerFiltersMain";

// Define the FiltersConfig interface to match the JSON structure
interface FiltersConfig {
  screener: {
    year_range: { options: number[]; label: string; description: string };
    deal_type: { options: string[]; label: string; description: string };
    region: { options: string[]; label: string; description: string };
    sector: { options: string[]; label: string; description: string };
    t1d_returns: { options: string[]; label: string; description: string };
    t1m_returns: { options: string[]; label: string; description: string };
    deal_value: { options: string[]; label: string; description: string };
  };
  DealSpecific: {
    percentage_primary: { type: string; description: string; options: string[] };
    LeadBank: { type: string; description: string; api: string; key: string };
    sponsor: { type: string; description: string; options: string[] };
    fo_discount: { type: string; description: string; fields: { type: string; operator: string; label: string; placeholder: string }[] };
    tplus_1d_issueprice: { type: string; description: string; fields: { type: string; operator: string; label: string; placeholder: string }[] };
  };
  MonahseeSpecific: {
    AllocationPercentOfDealSize: { type: string; description: string; fields: { type: string; operator: string; label: string; placeholder: string }[] };
    AllocationPercentOfIOI: { type: string; description: string; fields: { type: string; operator: string; label: string; placeholder: string }[] };
    HoldPeriod: { type: string; description: string; fields: { type: string; operator: string; label: string; placeholder: string }[] };
    DealCaption: { type: string; description: string; api: string; key: string };
  };
}

const MDDScreener: React.FC = () => {
  const [filtersData, setFiltersData] = useState<FiltersConfig | null>(null);

  useEffect(() => {
    // Fetch the filters.json or provide your filters data
    fetch("/MDDFilters.json")
      .then((response) => {
        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
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
