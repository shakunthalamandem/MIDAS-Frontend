import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

// Types
type SectorMetrics = {
  Total_Deal_Count: number;
  Total_Deal_Volume: number;
  Positively_Performing_Deals_Percentage: number;
  Expected_Returns_Excess: number;
  Long_Opportunity_Value: number;
};

type ApiResponse = {
  Sectorwise: Record<string, SectorMetrics>;
};

// Metrics to show in table
const metrics: (keyof SectorMetrics)[] = [
  "Total_Deal_Count",
  "Total_Deal_Volume",
  "Long_Opportunity_Value",
  "Positively_Performing_Deals_Percentage",
  "Expected_Returns_Excess",
];

// Display names
const metricDisplayNames: Record<keyof SectorMetrics, string> = {
  Total_Deal_Count: "Total Deal Count",
  Total_Deal_Volume: "Total Deal Volume ($)",
  Long_Opportunity_Value: "Opportunity Value (T + 1M Excess)",
  Positively_Performing_Deals_Percentage: "% of Positively Performing Deals",
  Expected_Returns_Excess: "Expected Returns Excess (T + 1M)",
};

// Format function
const formatNumber = (
  value: number,
  isCurrency = false,
  isPercentage = false
): string => {
  if (value === null || value === undefined) return "N/A";

  const absValue = Math.abs(value);
  let formattedValue: string;

  if (absValue >= 1e9) {
    formattedValue = `${(absValue / 1e9).toFixed()}B`;
  } else if (absValue >= 1e6) {
    formattedValue = `${(absValue / 1e6).toFixed()}M`;
  } else if (absValue >= 1e3) {
    formattedValue = `${(absValue / 1e3).toFixed()}K`;
  } else {
    formattedValue = absValue.toString();
  }

  if (isCurrency) formattedValue = `$${formattedValue}`;
if (isPercentage) formattedValue = `${parseFloat(formattedValue).toFixed(1)}%`;

  return value < 0 ? `-${formattedValue}` : formattedValue;
};

export default function SectorwiseTable() {
  const [sectorData, setSectorData] = useState<Record<string, SectorMetrics>>({});

  useEffect(() => {
    const fetchDeals = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) {
        console.error("API URL is not defined in environment variables");
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/zxx/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data: ApiResponse = await response.json();
        setSectorData(data.Sectorwise);
      } catch (error) {
        console.error("Error fetching sector data:", error);
      }
    };

    fetchDeals();
  }, []);

  // Compute top 3 values for each metric
  const top3Values: Partial<Record<keyof SectorMetrics, number[]>> = {};
  metrics.forEach((metric) => {
    const sortedValues = Object.values(sectorData)
      .map((data) => data[metric])
      .sort((a, b) => b - a);
    top3Values[metric] = sortedValues.slice(0, 3);
  });

  return (
    <Box sx={{ width: "60%", margin: "auto", mt: 4 }}>
      <TableContainer component={Paper}>
        <Typography variant="h6" sx={{ p: 2 ,fontWeight: "bold"}}>
          Sectorwise SkewTable for 2025(Q1) with Top 3 Highlights
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Sector</TableCell>
              {metrics.map((metric) => (
                <TableCell key={metric} sx={{ fontWeight: "bold" }}>
                  {metricDisplayNames[metric]}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(sectorData).map(([sector, data]) => (
              <TableRow key={sector}>
                <TableCell>{sector}</TableCell>
                {metrics.map((metric) => {
                  const isTop3 = top3Values[metric]?.includes(data[metric]) ?? false;
                  const isCurrency =
                    metric === "Long_Opportunity_Value" || metric === "Total_Deal_Volume";
                  const isPercentage =
                    metric === "Positively_Performing_Deals_Percentage" ||
                    metric === "Expected_Returns_Excess";
                  return (
                    <TableCell
                      key={metric}
                      sx={{
                        backgroundColor: isTop3 ? "#ffd9b3" : "inherit",
                        fontWeight: isTop3 ? "bold" : "normal",
                      }}
                    >
                      {typeof data[metric] === "number"
                        ? formatNumber(data[metric], isCurrency, isPercentage)
                        : data[metric]}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
