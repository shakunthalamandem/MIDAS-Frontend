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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';


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
          📅 Upcoming & Recent IPOs : Past Week to Next Two Weeks
        </Typography>

        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
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
                  "Exchange",
                  "Deal Size",
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
              {ipoData.map((row, index) => (
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
                    sx={{
                      fontSize: "0.78rem",
                      padding: "6px 8px",
                      border: "1px solid black",
                      lineHeight: 1.2,
                    }}
                  >
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
                  <TableCell
                    align="center"
                    sx={{ fontSize: "0.78rem", padding: "6px 8px", border: "1px solid black", lineHeight: 1.2 }}
                  >
                    {row.company_name}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontSize: "0.78rem", padding: "6px 8px", border: "1px solid black", lineHeight: 1.2 }}
                  >
                    {formatDate(row.expected_date)}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontSize: "0.78rem", padding: "8px 10px", border: "1px solid black", lineHeight: 1.2 }}
                  >
                    {row.price !== null ? `${row.price}` : "—"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontSize: "0.78rem", padding: "6px 8px", border: "1px solid black", lineHeight: 1.2 }}
                  >
                    {row.exchange}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontSize: "0.78rem", padding: "6px 8px", border: "1px solid black", lineHeight: 1.2 }}
                  >
                    {row.deal_size !== null ? `${row.deal_size}` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
     <Typography
  variant="body2"
  textAlign="center"
  color="textSecondary"
  sx={{ fontStyle: "italic", mt: 1, display: "flex", justifyContent: "center", alignItems: "center" }}
>
  <InfoOutlinedIcon fontSize="small" color="action" />
  Note: IPO deals above $50M offer size.
</Typography>

    </Container>
  );
};

export default UpcomingIpoTable;
