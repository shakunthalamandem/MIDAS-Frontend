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

  let formattedValue: string;
  const absValue = Math.abs(value);

  if (absValue >= 1e9) {
    formattedValue = `${(absValue / 1e9).toFixed(1)}B`;
  } else if (absValue >= 1e6) {
    formattedValue = `${(absValue / 1e6).toFixed(1)}M`;
  } else if (absValue >= 1e3) {
    formattedValue = `${(absValue / 1e3).toFixed(1)}K`;
  } else {
    formattedValue = absValue.toFixed(1);
  }

  if (isCurrency) formattedValue = `$${formattedValue}`;
  if (isPercentage)
    formattedValue = `${parseFloat(formattedValue).toFixed(1)}%`;

  return value < 0 ? `-${formattedValue}` : formattedValue;
};

const SectorwiseTable: React.FC = () => {
  const [sectorData, setSectorData] = useState<Record<string, SectorMetrics>>(
    {}
  );

  useEffect(() => {
    const fetchDeals = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) {
        console.error("API URL is not defined in environment variables");
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/summary_data/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch sector data");

        const data: ApiResponse = await response.json();
        setSectorData(data.Sectorwise || {});
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
      .filter((val): val is number => typeof val === "number")
      .sort((a, b) => b - a);
    top3Values[metric] = sortedValues.slice(0, 3);
  });

  return (
    <Box>
      <TableContainer component={Paper} elevation={3}>
        <Typography
          variant="h6"
          sx={{ p: 2, fontWeight: "bold", color: "#002060" }}
        >
          Sectorwise Skew Table for 2025 (Q1) with Top 3 Highlights
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
                  const value = data[metric];
                  const isTop3 = top3Values[metric]?.includes(value) ?? false;
                  const isCurrency =
                    metric === "Total_Deal_Volume" ||
                    metric === "Long_Opportunity_Value";
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
                      {formatNumber(value, isCurrency, isPercentage)}
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
};
export default SectorwiseTable;
