import React from "react";

interface ScreenerMainProps {
  appliedValues: {
    MonasheeSpecific: Record<string, string>;
    Technicals: Record<string, string>;
    Fundamentals: Record<string, string>;
  } | null;
}

const ScreenerMain: React.FC<ScreenerMainProps> = ({ appliedValues }) => {
  return (
    <div>
      <h2>Applied Filters</h2>
      {appliedValues ? (
        <div>
          <h3>Monashee Specific</h3>
          <pre>{JSON.stringify(appliedValues.MonasheeSpecific, null, 2)}</pre>
          <h3>Fundamentals</h3>
          <pre>{JSON.stringify(appliedValues.Fundamentals, null, 2)}</pre>
          <h3>Technicals</h3>
          <pre>{JSON.stringify(appliedValues.Technicals, null, 2)}</pre>
        </div>
      ) : (
        <p>No filters applied.</p>
      )}
    </div>
  );
};

export default ScreenerMain;
