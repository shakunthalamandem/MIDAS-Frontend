import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface IpoData {
  ticker: string;
  company_name: string;
  expected_date: string;
  price: string | null;
  exchange?: string;
  deal_size: string | null;
  t1d_return_from_bloomberg?: number | string | null;
  total_committed_capital?: number | null;
}

const RecentIpoTable: React.FC = () => {
  const [ipoData, setIpoData] = useState<IpoData[]>([]);
  const [dashboardTickers, setDashboardTickers] = useState<string[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIpoData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/recent_ipos/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch IPO data");

        const data: IpoData[] = await response.json();
        const uniqueRows = Array.from(
          new Map(
            data.map((item) => [`${item.ticker}_${item.expected_date}`, item])
          ).values()
        );

        setIpoData(uniqueRows);
      } catch (error) {
        console.error("Error fetching IPO data:", error);
      }
    };

    const fetchDashboardTickers = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/ipo_dashboard_tickers/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch dashboard tickers");

        const data = await response.json();
        setDashboardTickers(data.distinct_tickers || []);
      } catch (error) {
        console.error("Error fetching dashboard tickers:", error);
      }
    };

    fetchIpoData();
    fetchDashboardTickers();
  }, [apiUrl, token]);

  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const suffix = getOrdinalSuffix(day);
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };

  const formatReturn = (value: any): string => {
    const num = parseFloat(value);
    return !isNaN(num) ? `${num.toFixed(2)}%` : "—";
  };

  const formatCapital = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "—";
    const abs = Math.abs(value);
    if (abs >= 1e9) return `$${(abs / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `$${(abs / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `$${(abs / 1e3).toFixed(1)}K`;
    return `$${abs.toFixed(2)}`;
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          backgroundColor: "#f9f9f9",
          borderRadius: 3,
          boxShadow: 2,
          p: 3,
          mt: 2,
          mb: 4,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          textAlign="center"
          color="#002060"
          mb={2}
        >
          📈 Recently Listed IPOs : Past Two Weeks
        </Typography>

        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            maxHeight: "320px",

          }}
        >
          <Table
            sx={{
              borderCollapse: "collapse",
              border: "1px solid black",
            }}
          >
            <TableHead>
              <TableRow sx={{ backgroundColor: "#002060" }}>
                {[
                  "Symbol",
                  "Company",
                  "Expected Date",
                  "Offer Price",
                  "Deal Size",
                  "T+1D Return",
                  "Total Committed Capital",
                ].map((heading) => (
                  <TableCell
                    key={heading}
                    align="center"
                    sx={{
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.78rem",
                      padding: "6px 8px",
                      border: "1px solid black",
                      lineHeight: 1.2,
                    }}
                  >
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {ipoData.map((row, index) => {
                const returnValue = parseFloat(row.t1d_return_from_bloomberg as any);

                return (
                  <TableRow
                    key={index}
                    hover
                    sx={{
                      "&:hover": { backgroundColor: "#f0f8ff" },
                      border: "1px solid black",
                    }}
                  >
                    <TableCell
                      align="center"
                      sx={{ fontSize: "0.78rem", padding: "6px 8px", border: "1px solid black", lineHeight: 1.2 }}
                    >
                      {dashboardTickers.includes(row.ticker) ? (
                        <Box
                          component="span"
                          // sx={{
                          //   color: "#fc1400",
                          //   textDecoration: "underline",
                          //   cursor: "pointer",
                          //   fontWeight: 600,
                          //   "&:hover": {
                          //     color: "#8f0082",
                          //     textDecoration: "none",
                          //   },
                          // }}
                          // onClick={() => {
                          //   localStorage.setItem("selected_ticker", row.ticker);
                          //   window.open("/equity/ipo_dashboard", "_blank");
                          // }}
                        >
                          {row.ticker}
                        </Box>
                      ) : (
                        row.ticker
                      )}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: "0.78rem", padding: "6px 8px", border: "1px solid black", lineHeight: 1.2 }}>
                      {row.company_name}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: "0.78rem", padding: "6px 8px", border: "1px solid black", lineHeight: 1.2 }}>
                      {formatDate(row.expected_date)}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: "0.78rem", padding: "8px 10px", border: "1px solid black", lineHeight: 1.2 }}>
                      {row.price ?? "—"}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: "0.78rem", padding: "6px 8px", border: "1px solid black", lineHeight: 1.2 }}>
                      {row.deal_size ?? "—"}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: "0.78rem",
                        padding: "6px 8px",
                        border: "1px solid black",
                        color: isNaN(returnValue)
                          ? "inherit"
                          : returnValue > 0
                          ? "green"
                          : returnValue < 0
                          ? "red"
                          : "inherit",
                        fontWeight: 500,
                        lineHeight: 1.2,
                      }}
                    >
                      {formatReturn(row.t1d_return_from_bloomberg)}
                    </TableCell>
                    <TableCell align="center" sx={{ fontSize: "0.78rem", padding: "6px 8px", border: "1px solid black", lineHeight: 1.2 }}>
                      {formatCapital(row.total_committed_capital)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default RecentIpoTable;
