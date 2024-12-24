import React from 'react';

interface FilterOption {
  label: string;
  description: string;
  options: string[];
}

interface RiskProps {
  data: Record<string, FilterOption>; // Define the structure of the `data` prop
}

const Risk: React.FC<RiskProps> = ({ data }) => {
  return (
    <div>
      <h3>Risk Filters</h3>
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>
          <h4>{value.label}</h4>
          <p>{value.description}</p>
          {/* Render options dynamically */}
          <select>
            {value.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default Risk;
