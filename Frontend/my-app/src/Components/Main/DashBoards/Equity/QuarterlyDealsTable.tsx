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

type QuarterData = {
  Total_Deal_Count: number;
  Total_Deal_Volume: number;
  Positively_Performing_Deals_Percentage: number;
  Negatively_Performing_Deals_Percentage: number;
  Average_T1M_Abs_Return_of_Positively: number;
  Average_T1M_Abs_Return_of_Negatively: number;
  Expected_Returns_Excess: number;
  Long_Opportunity_Value: number;
};

type ApiResponse = {
  Yearwise: {
    [period: string]: QuarterData;
  };
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


const QuarterlyDealsTable = () => {
  const [ipoData, setIpoData] = useState<
    { quarter: string; data: QuarterData }[]
  >([]);
  const [foData, setFoData] = useState<
    { quarter: string; data: QuarterData }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const handleCardClick = () => {
    window.open("/opportunity/equity/skew-table", "_blank");
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

      const payload = {
        filters: {
          year_range: [2023, 2026],
          region: ["Non-US America", "US", "EMEA", "APAC"],
          year_period: "Yearly",
        },
      };

      const fetchData = async (dealType: "IPO" | "FO") => {
        const fullPayload = {
          ...payload,
          filters: { ...payload.filters, deal_type: [dealType] },
        };

        const response = await fetch(`${apiUrl}/api/skewtable/calculations/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(fullPayload),
        });

        if (!response.ok) throw new Error(`Failed to fetch ${dealType} data`);

        const data = await response.json();
        return data.Yearwise;
      };

      const processData = (yearwise: { [key: string]: QuarterData }) => {
        const labels = ["2023", "2024", "2025", "2026"];

        return labels
          .map((label) => {
            if (yearwise[label]) {
              return {
                quarter: label,
                data: yearwise[label],
              };
            }
            return null;
          })
          .filter(
            (item): item is { quarter: string; data: QuarterData } =>
              item !== null
          ); // ✅ type-safe filter
      };

      try {
        const [ipoYearwise, foYearwise] = await Promise.all([
          fetchData("IPO"),
          fetchData("FO"),
        ]);

        setIpoData(processData(ipoYearwise));
        setFoData(processData(foYearwise));
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <TableContainer component={Paper} elevation={4}  >
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
              // display: "inline-block",
              // animation: "scroll-left 15s linear infinite",
              fontWeight: "bold",
              color: "#054511",
              alignContent: "center",
              textAlign: "center",
              p: 1.5,
            }}
          >
            Skew Table - IPO and FO Deals from 2023 to 2026 
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
          <TableHead sx={{ backgroundColor: "#f5f5f5",border: "1px solid #000" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", minWidth: "80px", py: 2, border: "1px solid #000" }}>
                Year
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", border: "1px solid #000" }}>
                Total Deal Count
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", border: "1px solid #000" }}>
                Total Deal Volume ($)
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", border: "1px solid #000" }}>
                Opportunity Value (T+1M Excess)
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", border: "1px solid #000" }}>
                % of Positively Performing Deals
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", border: "1px solid #000" }}>
                Expected Returns Excess
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                colSpan={6}
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#002060",
                  color: "white",
                  textAlign: "center",
                  border: "1px solid #000",
                }}
              >
                IPO
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ipoData.map((row) => (
              <TableRow key={`IPO-${row.quarter}`}>
                <TableCell sx={{ py: 0.5, border: "1px solid #000" }}>{row.quarter}</TableCell>
                <TableCell sx={{ border: "1px solid #000"}}>{row.data.Total_Deal_Count}</TableCell>
                <TableCell sx={{ border: "1px solid #000"}}>
                  {formatNumber(row.data.Total_Deal_Volume)}
                </TableCell>
                <TableCell sx={{ border: "1px solid #000"}}>
                  {formatNumber(row.data.Long_Opportunity_Value)}
                </TableCell>

                <TableCell sx={{ border: "1px solid #000"}}>
                  {(row.data.Positively_Performing_Deals_Percentage).toFixed(1)}%
                </TableCell>
                <TableCell sx={{ border: "1px solid #000"}}>{(row.data.Expected_Returns_Excess).toFixed(1)}%</TableCell>
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
                  border: "1px solid #000",
                }}
              >
                FO
              </TableCell>
            </TableRow>
            {foData.map((row) => (
              <TableRow key={`FO-${row.quarter}`}>
                <TableCell sx={{ py: 1.4 ,border: "1px solid #000" }}>{row.quarter}</TableCell>
                <TableCell sx={{ border: "1px solid #000"}}>{row.data.Total_Deal_Count}</TableCell>
                <TableCell sx={{ border: "1px solid #000"}}>
                  {formatNumber(row.data.Total_Deal_Volume)}
                </TableCell>
                <TableCell sx={{ border: "1px solid #000"}}>
                  {formatNumber(row.data.Long_Opportunity_Value)}
                </TableCell>
                <TableCell sx={{ border: "1px solid #000"}}>
                  {(row.data.Positively_Performing_Deals_Percentage).toFixed(1)}%
                </TableCell>
                <TableCell sx={{ border: "1px solid #000"}}>{(row.data.Expected_Returns_Excess).toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default QuarterlyDealsTable;
