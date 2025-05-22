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

const metrics: (keyof SectorMetrics)[] = [
  "Total_Deal_Count",
  "Total_Deal_Volume",
  "Long_Opportunity_Value",
  "Positively_Performing_Deals_Percentage",
  "Expected_Returns_Excess",
];

// Manual display names for columns
const metricDisplayNames: Record<keyof SectorMetrics, string> = {
  Total_Deal_Count: "Total Deal Count",
  Total_Deal_Volume: "Total Deal Volume",
  Long_Opportunity_Value: "Long Opportunity Value",
  Positively_Performing_Deals_Percentage: "Positively Performing Deals %",
  Expected_Returns_Excess: "Expected Returns Excess",
};

// Format large numbers with suffixes like K, M, B
const formatNumber = (value: number): string => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
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

  return value < 0 ? `-${formattedValue}` : formattedValue;
};

export default function SectorwiseTable() {
  const [sectorData, setSectorData] = useState<Record<string, SectorMetrics>>({});

  // Fetch data from API
  useEffect(() => {
    fetch("http://192.168.1.38:9000/api/zxx/")
      .then((res) => res.json())
      .then((data: ApiResponse) => setSectorData(data.Sectorwise))
      .catch(console.error);
  }, []);

  // Compute top 3 values per metric
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
        <Typography variant="h6" sx={{ p: 2 }}>
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
                  return (
                    <TableCell
                      key={metric}
                      sx={{
                        backgroundColor: isTop3 ? " #ffd9b3" : "inherit",
                        fontWeight: isTop3 ? "bold" : "normal",
                      }}
                    >
                      {typeof data[metric] === "number"
                        ? formatNumber(data[metric])
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
