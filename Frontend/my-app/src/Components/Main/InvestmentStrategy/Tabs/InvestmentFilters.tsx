import React from "react";

interface InvestmentFiltersProps {
  filtersData: any[];  // Define the type of the filtersData prop (array of filter objects)
}

const InvestmentFilters: React.FC<InvestmentFiltersProps> = ({ filtersData }) => {
  return (
    <div>
      <h2>Investment Filters</h2>
      <pre>{JSON.stringify(filtersData, null, 2)}</pre> {/* Displaying filters data as an example */}
    </div>
  );
};

export default InvestmentFilters;
