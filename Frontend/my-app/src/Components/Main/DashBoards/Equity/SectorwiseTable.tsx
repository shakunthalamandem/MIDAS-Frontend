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
  Long_Opportunity_Value: "Opportunity Value (T+1M Excess)",
  Positively_Performing_Deals_Percentage: "% of Positively Performing Deals",
  Expected_Returns_Excess: "Expected Returns Excess",
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
    formattedValue = Number.isInteger(absValue / 1e9)
      ? `${(absValue / 1e9).toFixed(0)}B`
      : `${(absValue / 1e9).toFixed(1)}B`;
  } else if (absValue >= 1e6) {
    formattedValue = Number.isInteger(absValue / 1e6)
      ? `${(absValue / 1e6).toFixed(0)}M`
      : `${(absValue / 1e6).toFixed(1)}M`;
  } else if (absValue >= 1e3) {
    formattedValue = Number.isInteger(absValue / 1e3)
      ? `${(absValue / 1e3).toFixed(0)}K`
      : `${(absValue / 1e3).toFixed(1)}K`;
  } else {
    formattedValue = Number.isInteger(absValue)
      ? absValue.toFixed(0)
      : absValue.toFixed(1);
  }

  if (isCurrency) formattedValue = `$${formattedValue}`;
  if (isPercentage) {
    const val = parseFloat(formattedValue);
    formattedValue = Number.isInteger(val)
      ? `${val.toFixed(0)}%`
      : `${val.toFixed(1)}%`;
  }

  return value < 0 ? `-${formattedValue}` : formattedValue;
};

const SectorwiseTable: React.FC = () => {
  const [sectorData, setSectorData] = useState<Record<string, SectorMetrics>>(
    {}
  );

  const handleCardClick = () => {
    window.open("/equity/capital-markets/skew-table", "_blank");
  };

  useEffect(() => {
    const fetchDeals = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) {
        console.error("API URL is not defined in environment variables");
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/dealogic_summary_data/`, {
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

  // Highlight specific rows only
  const highlightSectors = [
    "Information Technology",
    "Financials",
    "Consumer Discretionary",
    "Health Care",
  ];
  const getRowStyle = (sector: string) =>
    highlightSectors.includes(sector)
      ? { backgroundColor: "#e3d681" }
      : {};

  return (
    <Box>
      <TableContainer component={Paper} elevation={4}>
        <Box
          sx={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            width: "100%",
          }}
        >
          <Typography
            variant="body1"
            onClick={handleCardClick}
            sx={{
              fontWeight: "bold",
              color: "#054511",
              textAlign: "center",
              p: 1.5,
            }}
          >
            Sector-wise Skew Table for 2025 (Q1) –{" "}
            <span style={{ color: "red" }}>Highlighted Key Sectors</span>
          </Typography>
        </Box>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#002060" }}>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#FFFFFF",
                  border: "1px solid #000000",
                }}
              >
                Sector
              </TableCell>
              {metrics.map((metric) => (
                <TableCell
                  key={metric}
                  sx={{
                    fontWeight: "bold",
                    color: "#FFFFFF",
                    border: "1px solid #000000",
                    textAlign: "center",
                  }}
                >
                  {metricDisplayNames[metric]}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(sectorData).map(([sector, data]) => (
              <TableRow key={sector} sx={getRowStyle(sector)}>
                <TableCell sx={{ border: "1px solid #000000" }}>
                  {sector}
                </TableCell>
                {metrics.map((metric) => {
                  const value = data[metric];
                  const isCurrency =
                    metric === "Total_Deal_Volume" ||
                    metric === "Long_Opportunity_Value";
                  const isPercentage =
                    metric === "Positively_Performing_Deals_Percentage" ||
                    metric === "Expected_Returns_Excess";

                  return (
                    <TableCell
                      key={metric}
                      align="center"
                      sx={{
                        border: "1px solid #000000",
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
