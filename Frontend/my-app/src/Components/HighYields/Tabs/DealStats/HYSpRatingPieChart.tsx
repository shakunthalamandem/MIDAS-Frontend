import React, { useState } from "react";
import { Box, FormControlLabel, Checkbox, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface HYSpRatingPieChartProps {
  data: Record<string, any>; // API response for regions
  selectedMetric: string; // Metric to display (e.g., 'count', 'deal_value', 'opportunity_value_ex')
  checkedItems?: string[]; // List of initially checked regions (optional)
}

const HYSpRatingPieChart: React.FC<HYSpRatingPieChartProps> = ({
  data,
  selectedMetric,
  checkedItems,
}) => {
  const [visibleRegions, setVisibleRegions] = useState<string[]>(
    checkedItems && checkedItems.length > 0
      ? checkedItems
      : Object.keys(data[Object.keys(data)[0]] || []) // Default to all regions if no checkedItems
  );

  const chartData = Object.entries(data).map(([year, regions]) => {
    const yearData: any = { year };
    Object.entries(regions).forEach(([region, metrics]: [string, any]) => {
      yearData[region] = metrics[selectedMetric];
    });
    return yearData;
  });

  const allRegions = Object.keys(data[Object.keys(data)[0]] || {});

  const handleCheckboxChange = (region: string) => {
    setVisibleRegions((prev) =>
      prev.includes(region)
        ? prev.filter((item) => item !== region)
        : [...prev, region]
    );
  };
  
  const formatNumber = (value: number): string => {
    if (selectedMetric === "count") {
      return value.toString(); // Just show the number for count
    }

    const absValue = Math.abs(value);
    let formattedValue: string;

    if (absValue >= 1e9) {
      formattedValue = `${(absValue / 1e9).toFixed(1)}B`; // Billion
    } else if (absValue >= 1e6) {
      formattedValue = `${(absValue / 1e6).toFixed(1)}M`; // Million
    } else if (absValue >= 1e3) {
      formattedValue = `${(absValue / 1e3).toFixed(1)}K`; // Thousand
    } else {
      formattedValue = absValue.toString(); // No formatting for values < 1000
    }

    return value < 0 ? `-${formattedValue}` : formattedValue;
  };

  // Define colors for the lines
  const colors = [
  "#2E3A87",
    "#D94E8A",
    "#5B9E6E",
    "#C8A700",
    "#D2768F",
    "#7B4C92",
    "#4A88B6",
    "#3E7A3B",
    "#C04C97",
    "#7A3F5F",
    "#A16329",
    "#4D7893",
    "#9C6F1F",
    "#5F4774",
    "#DE5D85",
    "#83C3DA",
    "#4B3563",
  ];

  return (
    <Box>
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ color: "#002060", fontWeight: "bold" }}
      >
        Region-wise Data Over the Years
      </Typography>
      <Box display="flex" justifyContent="center" flexWrap="wrap" mb={2}>
        {allRegions.map((region) => (
          <FormControlLabel
            key={region}
            control={
              <Checkbox
                checked={visibleRegions.includes(region)}
                onChange={() => handleCheckboxChange(region)}
                color="primary"
                sx={{
                  "&.Mui-checked": {
                    color: "#a20000", // Change the color of the tick (red, in this case)
                  },
                }}
              />
            }
            label={
              <Typography
                sx={{
                  color: "#626262", // Set label color
                }}
              >
                {region}
              </Typography>
            }
          />
        ))}
      </Box>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <XAxis dataKey="year" />
          <YAxis tickFormatter={formatNumber} /> {/* Apply custom formatter */}
          <Tooltip formatter={(value: number) => formatNumber(value)} />
          <Legend />
          {visibleRegions.map((region, index) => (
            <Line
              key={region}
              type="monotone"
              dataKey={region}
              stroke={colors[index % colors.length]} // Assign color from the array
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default HYSpRatingPieChart;
