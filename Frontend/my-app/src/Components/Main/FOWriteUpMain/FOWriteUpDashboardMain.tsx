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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Link } from "react-router-dom";

interface FOData {
  ticker: string;
  company_name: string;
  pricing_date: string | null;
  price: string | number | null;
  exchange: string | null;
  deal_size: number | null;
}

const FOWriteUpDashboardMain: React.FC = () => {
  const [FOData, setFOData] = useState<FOData[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchFOData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/ipo_dashboard_data/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch IPO data");

        const json = await response.json();
        const data: FOData[] = json.results || [];

        // Ensure uniqueness by ticker + pricing_date
        const uniqueRows = Array.from(
          new Map(
            data.map((item) => [`${item.ticker}_${item.pricing_date}`, item])
          ).values()
        );

        setFOData(uniqueRows);
      } catch (error) {
        console.error("Error fetching IPO data:", error);
      }
    };

    fetchFOData();
  }, [apiUrl, token]);

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
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "To Be Announced"; // ✅ Empty date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "To Be Announced"; // ✅ Invalid date

    const day = date.getDate();
    const suffix = getOrdinalSuffix(day);
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };

  return (
    <Container maxWidth="lg">
        <Typography
          variant="h6"
          fontWeight="bold"
          textAlign="center"
          color="#002060"
          mb={2}
        >
          📅 All Upcoming Follow On's
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
                  "Expected Listing Date",
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
              {FOData.map((row, index) => (
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
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    <Link
                      to={`/ipo-dashboard/${row.ticker}`}
                      state={{ fromTickerClick: true }}
                      style={{
                        color: "#d80606ff",
                        fontWeight: "bold",
                        textDecoration: "underline",
                      }}
                    >
                      {row.ticker}
                    </Link>
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      fontSize: "0.78rem",
                      padding: "6px 8px",
                      border: "1px solid black",
                      lineHeight: 1.2,
                    }}
                  >
                    {row.company_name}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: "0.78rem",
                      padding: "6px 8px",
                      border: "1px solid black",
                      lineHeight: 1.2,
                    }}
                  >
                    {formatDate(row.pricing_date)}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: "0.78rem",
                      padding: "6px 8px",
                      border: "1px solid black",
                      lineHeight: 1.2,
                    }}
                  >
                    {row.price !== null ? `${row.price}` : "—"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: "0.78rem",
                      padding: "6px 8px",
                      border: "1px solid black",
                      lineHeight: 1.2,
                    }}
                  >
                    {row.exchange || "—"}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: "0.78rem",
                      padding: "6px 8px",
                      border: "1px solid black",
                      lineHeight: 1.2,
                    }}
                  >
                    {row.deal_size !== null ? `${row.deal_size}` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

  );
};

export default FOWriteUpDashboardMain;
