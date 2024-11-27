import { Typography } from "@mui/material";
import React from "react";
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

interface DealAllocationGraphProps {
  responseData: any; // The response data from the API
  apiName: string; // The API name that determines the key
}

// Function to format numbers into human-readable formats like "M" for millions and "B" for billions
const formatValue = (value: number, apiName: string): string => {
  if (apiName === "mdd_deals_volume" || apiName === "avg_deal_size") {
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (absValue >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    } else if (absValue >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  } else if (apiName === "mdd_allocation_percentage" || apiName === "mdd_allocation_ioi") {
    return `${value.toFixed(2)}%`;
  }
  return value.toFixed(0); // Return integer for mdd_deals_graph
};

const DealAllocationGraph: React.FC<DealAllocationGraphProps> = ({ responseData, apiName }) => {
  // Dynamic key mapping based on the API name
  const allocationKeyMap: { [key: string]: string } = {
    mdd_deals_graph: "count",
    mdd_deals_volume: "deal_size",
    avg_deal_size: "deal_size",
    mdd_allocation_percentage: "allocation_deal_size_percentage",
    mdd_allocation_ioi: "allocation_percentage",
  };

  const allocationKey = allocationKeyMap[apiName] || "allocation_deal_size_percentage";

  const formatChartData = (data: any) => {
    const formattedData: any[] = [];

    for (const quarter in data) {
      const sectors = data[quarter];
      const chartRow: any = { quarter };

      ["FO", "IPO", "OTHER", "PRIVATE"].forEach((dealType) => {
        let dealTypeTotal = 0;

        if (sectors[dealType]) {
          for (const region in sectors[dealType]) {
            for (const sector in sectors[dealType][region]) {
              const allocation = sectors[dealType][region][sector][allocationKey];
              dealTypeTotal += parseFloat(allocation);
            }
          }
        }

        chartRow[dealType] = dealTypeTotal;
      });

      formattedData.push(chartRow);
    }

    return formattedData;
  };

  const chartData = responseData ? formatChartData(responseData) : [];

  // Tooltip formatter
  const tooltipFormatter = (value: number) => formatValue(value, apiName);

  return (
    <div>
      {chartData.length === 0 ? (
        <Typography
          variant="body1"
          align="center"
          sx={{ mt: 5, color: "#002060", fontWeight: "bold" }}
        >
          Please select the filters to show the plots.
        </Typography>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="transparent" />
            <XAxis dataKey="quarter" />
            <YAxis
              tickFormatter={(value) => formatValue(value, apiName)} // Format Y-axis labels
            />
            <Tooltip formatter={(value) => tooltipFormatter(Number(value))} />
            <Legend />
            <Bar dataKey="FO" stackId="a" fill="#8884d8" />
            <Bar dataKey="IPO" stackId="a" fill="#82ca9d" />
            <Bar dataKey="OTHER" stackId="a" fill="#ffc658" />
            <Bar dataKey="PRIVATE" stackId="a" fill="#002060" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DealAllocationGraph;
