import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";

type RegionData = {
  Total_Deal_Count: number;
  Total_Deal_Volume: number;
  Positively_Performing_Deals_Percentage: number;
  Expected_Returns_Excess: number;
  Long_Opportunity_Value: number;
};

type ApiRegionResponse = {
  Regionwise_IPO: { [region: string]: RegionData };
  Regionwise_FO: { [region: string]: RegionData };
};

const formatNumber = (value: number): string => {
  if (value === null || value === undefined) {
    return "N/A";
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

// Helper to get max for each field
const getMaxValues = (data: { region: string; data: RegionData }[]) => ({
  Total_Deal_Count: Math.max(...data.map((d) => d.data.Total_Deal_Count)),
  Total_Deal_Volume: Math.max(...data.map((d) => d.data.Total_Deal_Volume)),
  Long_Opportunity_Value: Math.max(
    ...data.map((d) => d.data.Long_Opportunity_Value)
  ),
  Positively_Performing_Deals_Percentage: Math.max(
    ...data.map((d) => d.data.Positively_Performing_Deals_Percentage)
  ),
  Expected_Returns_Excess: Math.max(
    ...data.map((d) => d.data.Expected_Returns_Excess)
  ),
});

const RegionWiseTable = () => {
  const [ipoData, setIpoData] = useState<
    { region: string; data: RegionData }[]
  >([]);
  const [foData, setFoData] = useState<{ region: string; data: RegionData }[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handleCardClick = () => {
  window.open("/equity/capital-markets/skew-table", "_blank");
};

  useEffect(() => {
    const fetchDeals = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) {
        setError("API URL is not defined in environment variables");
        setLoading(false);
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

        if (!response.ok) throw new Error("Failed to fetch data");
        const result: ApiRegionResponse = await response.json();

        const processData = (regionwise: { [region: string]: RegionData }) =>
          Object.entries(regionwise).map(([region, data]) => ({
            region,
            data,
          }));

        setIpoData(processData(result.Regionwise_IPO));
        setFoData(processData(result.Regionwise_FO));
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  if (loading)
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Typography color="error" textAlign="center">
        {error}
      </Typography>
    );

  const ipoMax = getMaxValues(ipoData);
  const foMax = getMaxValues(foData);

  const getStyle = (value: number, max: number) =>
    value === max ? { fontWeight: "bold", backgroundColor: "#ffd9b3" } : {};

  return (
    <Box>
      <TableContainer component={Paper} elevation={4} >
        <Box
          sx={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            width: "100%",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              // display: "inline-block",
              // animation: "scroll-left 15s linear infinite",
              fontWeight: "bold",
              color: "#054511",
              textAlign: "center",
              p: 1.5,
            }}
          >
            Region-wise Skew Table - IPO and FO Deals for 2025 (Q1) with{" "}
            <span style={{ color: "red" }}>Top</span> Highlights
          </Typography>

          {/* <style>
            {`
      @keyframes scroll-left {
        0% {
          transform: translateX(100%);
        }
        100% {
          transform: translateX(-100%);
        }
      }
    `}
          </style> */}
        </Box>

        <Table size="small">
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", minWidth: "110px" }}>
                Region
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "40px" }}>
                Total Deal Count
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "60px" }}>
                Total Deal Volume ($)
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "70px" }}>
                Opportunity Value (T + 1M Excess)
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "80px" }}>
                % of Positively Performing Deals
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", minWidth: "80px" }}>
                Expected Returns Excess(T + 1M)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={6}
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#002060",
                  color: "white",
                  textAlign: "center",
                }}
              >
                IPO
              </TableCell>
            </TableRow>
            {ipoData.map((row) => (
              <TableRow key={`IPO-${row.region}`}>
                <TableCell>{row.region}</TableCell>
                <TableCell
                  sx={getStyle(
                    row.data.Total_Deal_Count,
                    ipoMax.Total_Deal_Count
                  )}
                >
                  {row.data.Total_Deal_Count}
                </TableCell>
                <TableCell
                  sx={getStyle(
                    row.data.Total_Deal_Volume,
                    ipoMax.Total_Deal_Volume
                  )}
                >
                  {formatNumber(row.data.Total_Deal_Volume)}
                </TableCell>
                <TableCell
                  sx={getStyle(
                    row.data.Long_Opportunity_Value,
                    ipoMax.Long_Opportunity_Value
                  )}
                >
                  {formatNumber(row.data.Long_Opportunity_Value)}
                </TableCell>
                <TableCell
                  sx={getStyle(
                    row.data.Positively_Performing_Deals_Percentage,
                    ipoMax.Positively_Performing_Deals_Percentage
                  )}
                >
                  {row.data.Positively_Performing_Deals_Percentage}%
                </TableCell>
                <TableCell
                  sx={getStyle(
                    row.data.Expected_Returns_Excess,
                    ipoMax.Expected_Returns_Excess
                  )}
                >
                  {row.data.Expected_Returns_Excess}%
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell
                colSpan={6}
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#002060",
                  color: "white",
                  textAlign: "center",
                }}
              >
                FO
              </TableCell>
            </TableRow>
            {foData.map((row) => (
              <TableRow key={`FO-${row.region}`}>
                <TableCell>{row.region}</TableCell>
                <TableCell
                  sx={getStyle(
                    row.data.Total_Deal_Count,
                    foMax.Total_Deal_Count
                  )}
                >
                  {row.data.Total_Deal_Count}
                </TableCell>
                <TableCell
                  sx={getStyle(
                    row.data.Total_Deal_Volume,
                    foMax.Total_Deal_Volume
                  )}
                >
                  {formatNumber(row.data.Total_Deal_Volume)}
                </TableCell>
                <TableCell
                  sx={getStyle(
                    row.data.Long_Opportunity_Value,
                    foMax.Long_Opportunity_Value
                  )}
                >
                  {formatNumber(row.data.Long_Opportunity_Value)}
                </TableCell>
                <TableCell
                  sx={getStyle(
                    row.data.Positively_Performing_Deals_Percentage,
                    foMax.Positively_Performing_Deals_Percentage
                  )}
                >
                  {row.data.Positively_Performing_Deals_Percentage}%
                </TableCell>
                <TableCell
                  sx={getStyle(
                    row.data.Expected_Returns_Excess,
                    foMax.Expected_Returns_Excess
                  )}
                >
                  {row.data.Expected_Returns_Excess}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RegionWiseTable;
