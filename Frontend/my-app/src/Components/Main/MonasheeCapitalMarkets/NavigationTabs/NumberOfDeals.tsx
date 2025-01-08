import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Checkbox, FormControlLabel } from "@mui/material";

interface NumberOfDealsProps {
  data: Record<string, any>;
}

const NumberOfDeals: React.FC<NumberOfDealsProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>("count"); // Default to "count" (Deal Count)
  
  // Function to handle the checkbox change
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMetric(event.target.value);
  };

  // Prepare the data for the chart, based on the selected metric
  const chartData = Object.entries(data).map(([year, stats]) => {
    const ipoValue = stats[selectedMetric]?.IPO || 0;  // IPO value for the selected metric
    const foValue = stats[selectedMetric]?.FO || 0;    // FO value for the selected metric
    return {
      year,
      IPO: ipoValue,
      FO: foValue,
    };
  });

  return (
    <div>
      <h3>Deal Type</h3>

      {/* Checkboxes for selecting the metric */}
      <div>
        <FormControlLabel
          control={<Checkbox checked={selectedMetric === "count"} onChange={handleCheckboxChange} value="count" />}
          label="Deal Count"
        />
        <FormControlLabel
          control={<Checkbox checked={selectedMetric === "volume"} onChange={handleCheckboxChange} value="volume" />}
          label="Deal Size"
        />
        <FormControlLabel
          control={<Checkbox checked={selectedMetric === "opp_exs_value"} onChange={handleCheckboxChange} value="opp_exs_value" />}
          label="Opportunity Exits Value"
        />
      </div>

      {/* Bar Chart using Recharts */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="IPO" fill="#8884d8" />
          <Bar dataKey="FO" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NumberOfDeals;
