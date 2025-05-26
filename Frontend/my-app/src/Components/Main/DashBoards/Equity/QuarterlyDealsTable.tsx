import React, { useEffect, useState } from "react";
import axios from "axios";
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
  Expected_Returns_Excess: number;
  Long_Opportunity_Value: number;
};

type ApiResponse = {
  Yearwise: {
    [quarter: string]: QuarterData;
  };
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

const QuarterlyDealsTable = () => {
  const [ipoData, setIpoData] = useState<
    { quarter: string; data: QuarterData }[]
  >([]);
  const [foData, setFoData] = useState<
    { quarter: string; data: QuarterData }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          year_range: [2023, 2025],
          region: ["Non-US America", "US", "EMEA", "APAC"],
          year_period: "Quarterly",
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
        const getLastCompletedQuarterIn2025 = (): string => {
          const now = new Date();
          const year = now.getFullYear();
          const month = now.getMonth(); // 0 = Jan

          const quarter = Math.floor(month / 3); // 0 = Q1
          const completedQuarter = quarter === 0 ? 4 : quarter;
          const targetQuarter = year === 2025 ? completedQuarter : 4;

          return `Q${targetQuarter}`;
        };

        const quarterName = getLastCompletedQuarterIn2025();
        const years = ["2023", "2024", "2025"];

        return years
          .map((year) => {
            const key = `${year} ${quarterName}`;
            if (yearwise[key]) {
              return {
                quarter: key,
                data: yearwise[key],
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
      <TableContainer component={Paper}>
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
              display: "inline-block",
              animation: "scroll-left 15s linear infinite",
              fontWeight: "bold",
              color: "#054511",
              p: 2,
            }}
          >
            Skew Table - IPO and FO Deals from 2023 to 2025 for Q1
          </Typography>

          <style>
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
          </style>
        </Box>

        <Table size="small">
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", minWidth: "80px" }}>
                Quarter
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Total Deal Count
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Total Deal Volume ($)
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Opportunity Value (T + 1M Excess)
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                % of Positively Performing Deals
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                Expected Returns Excess(T + 1M)
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
                }}
              >
                IPO
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ipoData.map((row) => (
              <TableRow key={`IPO-${row.quarter}`}>
                <TableCell>{row.quarter}</TableCell>
                <TableCell>{row.data.Total_Deal_Count}</TableCell>
                <TableCell>
                  {formatNumber(row.data.Total_Deal_Volume)}
                </TableCell>
                <TableCell>
                  {formatNumber(row.data.Long_Opportunity_Value)}
                </TableCell>

                <TableCell>
                  {row.data.Positively_Performing_Deals_Percentage}%
                </TableCell>
                <TableCell>{row.data.Expected_Returns_Excess}%</TableCell>
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
              <TableRow key={`FO-${row.quarter}`}>
                <TableCell>{row.quarter}</TableCell>
                <TableCell>{row.data.Total_Deal_Count}</TableCell>
                <TableCell>
                  {formatNumber(row.data.Total_Deal_Volume)}
                </TableCell>
                <TableCell>
                  {formatNumber(row.data.Long_Opportunity_Value)}
                </TableCell>
                <TableCell>
                  {row.data.Positively_Performing_Deals_Percentage}%
                </TableCell>
                <TableCell>{row.data.Expected_Returns_Excess}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default QuarterlyDealsTable;
