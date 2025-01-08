import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Checkbox, Container, FormControlLabel, Box, Typography } from "@mui/material";

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
    const ipoValue = stats[selectedMetric]?.IPO || 0; // IPO value for the selected metric
    const foValue = stats[selectedMetric]?.FO || 0; // FO value for the selected metric
    return {
      year,
      IPO: ipoValue,
      FO: foValue,
    };
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Heading */}
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ color: "#002060", fontWeight: "bold" }}
      >
        Deal Type
      </Typography>

      {/* Checkboxes for selecting the metric */}
      <Box display="flex" justifyContent="center" mb={2}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedMetric === "count"}
              onChange={handleCheckboxChange}
              value="count"
              color="primary"
            />
          }
          label="Deal Count"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedMetric === "deal_value"}
              onChange={handleCheckboxChange}
              value="deal_value"
              color="primary"
            />
          }
          label="Deal Value"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={selectedMetric === "opportunity_value_ex"}
              onChange={handleCheckboxChange}
              value="opportunity_value_ex"
              color="primary"
            />
          }
          label="Opportunity Exits Value"
        />
      </Box>

      {/* Stacked Bar Chart using Recharts */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="IPO" stackId="a" fill="#8884d8" />
          <Bar dataKey="FO" stackId="a" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </Container>
  );
};

export default NumberOfDeals;
