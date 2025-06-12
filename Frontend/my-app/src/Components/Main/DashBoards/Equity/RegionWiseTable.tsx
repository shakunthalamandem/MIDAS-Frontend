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
  Regionwise_IPO: Record<string, Record<string, RegionData>> | Record<string, RegionData>;
  Regionwise_FO: Record<string, Record<string, RegionData>> | Record<string, RegionData>;
};

const formatNumber = (value: number): string => {
  if (value === null || value === undefined) {
    return "N/A";
  }
  const absValue = Math.abs(value);
  let formattedValue: string;

  if (absValue >= 1e9) {
    formattedValue = `$${(absValue / 1e9).toFixed(1)}B`;
  } else if (absValue >= 1e6) {
    formattedValue = `$${(absValue / 1e6).toFixed(1)}M`;
  } else if (absValue >= 1e3) {
    formattedValue = `$${(absValue / 1e3).toFixed(1)}K`;
  } else {
    formattedValue = absValue.toString();
  }

  return value < 0 ? `-${formattedValue}` : formattedValue;
};

const getRowStyle = (type: "IPO" | "FO", region: string) => {
  if ((type === "IPO" && region === "US") || (type === "FO" && region === "EMEA")) {
    return { backgroundColor: "#cef5f1" };
  }
  return {};
};

const RegionWiseTable = () => {
  const [ipoData, setIpoData] = useState<{ region: string; data: RegionData }[]>([]);
  const [foData, setFoData] = useState<{ region: string; data: RegionData }[]>([]);
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

      // --- MINIMAL CHANGE: Extract "2025 H1" or latest period if nested ---
      let ipo = result.Regionwise_IPO;
      let fo = result.Regionwise_FO;

      if (
        ipo &&
        typeof Object.values(ipo)[0] === "object" &&
        !Array.isArray(Object.values(ipo)[0])
      ) {
        ipo = (ipo as any)["2025 H1"] || ipo[Object.keys(ipo).sort().reverse()[0]] || {};
      }
      if (
        fo &&
        typeof Object.values(fo)[0] === "object" &&
        !Array.isArray(Object.values(fo)[0])
      ) {
        fo = (fo as any)["2025 H1"] || fo[Object.keys(fo).sort().reverse()[0]] || {};
      }

      // Force type to satisfy TypeScript
       const processData = (regionwise: { [region: string]: RegionData }) =>
        Object.entries(regionwise).map(([region, data]) => ({
          region,
          data,
        }));
        
      setIpoData(processData(ipo as { [region: string]: RegionData }));
      setFoData(processData(fo as { [region: string]: RegionData }));

     

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

  return (
    <Box>
      <TableContainer component={Paper} elevation={4}>
        <Box
          sx={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            width: "100%",
            cursor: "pointer",
          }}
          onClick={handleCardClick}
        >
          <Typography
            variant="body1"
            sx={{
              fontWeight: "bold",
              color: "#054511",
              textAlign: "center",
              p: 1.5,
              cursor: "pointer",
            }}
          >
            Region-wise Skew Table - IPO and FO Deals for 2025 (H1) with{" "}
            <span style={{ color: "red" }}>Top</span> Highlights
          </Typography>
        </Box>

        <Table
          size="small"
          sx={{
            borderCollapse: "collapse",
            width: "100%",
          }}
        >
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", border: "1px solid #000", minWidth: "110px" }}>
                Region
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", border: "1px solid #000", minWidth: "40px" }}>
                Total Deal Count
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", border: "1px solid #000", minWidth: "60px" }}>
                Total Deal Volume ($)
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", border: "1px solid #000", minWidth: "70px" }}>
                Opportunity Value (T+1M Excess)
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", border: "1px solid #000", minWidth: "80px" }}>
                % of Positively Performing Deals
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", border: "1px solid #000", minWidth: "80px" }}>
                Expected Returns Excess
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            <TableRow>
              <TableCell colSpan={6} sx={{ fontWeight: "bold", backgroundColor: "#002060", color: "white", textAlign: "center", border: "1px solid #000" }}>
                IPO
              </TableCell>
            </TableRow>

            {ipoData.map((row) => (
              <TableRow key={`IPO-${row.region}`} sx={getRowStyle("IPO", row.region)}>
                <TableCell sx={{ border: "1px solid #000" }}>{row.region}</TableCell>
                <TableCell sx={{ border: "1px solid #000" }}>
                  {row.data.Total_Deal_Count}
                </TableCell>
                <TableCell sx={{ border: "1px solid #000" }}>
                  {formatNumber(row.data.Total_Deal_Volume)}
                </TableCell>
                <TableCell sx={{ border: "1px solid #000" }}>
                  {formatNumber(row.data.Long_Opportunity_Value)}
                </TableCell>
                <TableCell sx={{ border: "1px solid #000" }}>
                  {(row.data.Positively_Performing_Deals_Percentage).toFixed(1)}%
                </TableCell>
                <TableCell sx={{ border: "1px solid #000" }}>
                  {(row.data.Expected_Returns_Excess).toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}

            <TableRow>
              <TableCell colSpan={6} sx={{ fontWeight: "bold", backgroundColor: "#002060", color: "white", textAlign: "center", border: "1px solid #000" }}>
                FO
              </TableCell>
            </TableRow>

            {foData.map((row) => (
              <TableRow key={`FO-${row.region}`} sx={getRowStyle("FO", row.region)}>
                <TableCell sx={{ border: "1px solid #000" }}>{row.region}</TableCell>
                <TableCell sx={{ border: "1px solid #000" }}>
                  {row.data.Total_Deal_Count}
                </TableCell>
                <TableCell sx={{ border: "1px solid #000" }}>
                  {formatNumber(row.data.Total_Deal_Volume)}
                </TableCell>
                <TableCell sx={{ border: "1px solid #000" }}>
                  {formatNumber(row.data.Long_Opportunity_Value)}
                </TableCell>
                <TableCell sx={{ border: "1px solid #000" }}>
                  {(row.data.Positively_Performing_Deals_Percentage).toFixed(1)}%
                </TableCell>
                <TableCell sx={{ border: "1px solid #000" }}>
                  {(row.data.Expected_Returns_Excess).toFixed(1)}%
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