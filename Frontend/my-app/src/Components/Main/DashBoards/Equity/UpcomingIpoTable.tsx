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
import MddIpoOpportunityChart from "./MddIpoOpportunityChart";

interface IpoData {
  ticker: string;
  company_name: string;
  expected_date: string;
  price: string | number | null;
  exchange: string;
  deal_size: number | null;
}

const UpcomingIpoTable: React.FC = () => {
  const [ipoData, setIpoData] = useState<IpoData[]>([]);
  const [dashboardTickers, setDashboardTickers] = useState<string[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIpoData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/ipo_dashboard_data/`, {
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

  const formatNumber = (value: number): string => {
    const abs = Math.abs(value);
    if (abs >= 1e9) return `$${(abs / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `$${(abs / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `$${(abs / 1e3).toFixed(1)}K`;
    return `${abs.toFixed(2)}`;
  };

  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
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

  return (
    <>
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
          📈 Upcoming & Recent IPOs : Past Week to Next Two Weeks
        </Typography>

        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#002060" }}>
                {[
                  "Symbol",
                  "Company",
                  "Expected Date",
                  "Offer Price",
                  "Exchange",
                  "Deal Size",
                ].map((heading) => (
                  <TableCell
                    key={heading}
                    sx={{
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      padding: "10px 12px",
                    }}
                  >
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {ipoData.map((row, index) => (
                <TableRow
                  key={index}
                  hover
                  sx={{ "&:hover": { backgroundColor: "#f0f8ff" } }}
                >
                  <TableCell sx={{ fontSize: "0.85rem", padding: "10px 12px" }}>
                    {dashboardTickers.includes(row.ticker) ? (
                      <Box
                        component="span"
                        sx={{
                          color: "#fc1400",
                          textDecoration: "underline",
                          cursor: "pointer",
                          fontWeight: 600,
                          "&:hover": {
                            color: "#8f0082",
                            textDecoration: "none",
                          },
                        }}
                        onClick={() => {
                          localStorage.setItem("selected_ticker", row.ticker);
                          window.open("/equity/ipo_dashboard", "_blank");
                        }}
                      >
                        {row.ticker}
                      </Box>
                    ) : (
                      row.ticker
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.85rem", padding: "10px 12px" }}>
                    {row.company_name}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.85rem", padding: "10px 12px" }}>
                    {formatDate(row.expected_date)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.85rem", padding: "10px 12px" }}>
                    {row.price !== null ? `${row.price}` : "—"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.85rem", padding: "10px 12px" }}>
                    {row.exchange}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.85rem", padding: "10px 12px" }}>
                    {/* {row.deal_size !== null ? formatNumber(row.deal_size) : "—"} */}
                    {row.deal_size !== null ? `${row.deal_size}` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>

    </>
  );
};

export default UpcomingIpoTable;
