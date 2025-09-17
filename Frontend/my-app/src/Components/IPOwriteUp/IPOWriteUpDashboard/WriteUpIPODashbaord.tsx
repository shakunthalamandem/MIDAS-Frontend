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
import { Link, useParams } from "react-router-dom"; // ✅ useParams added
import { formatDate, formatDealSize } from "./IPOWriteUpUtils";
import IPODashboardMain from "../../IPODashboardLLM/IPODashboardMain";

interface IpoData {
  ticker: string;
  company_name: string;
  sector: string | null;
  pricing_date: string | null;
  pricing_range_min: number | null;
  pricing_range_max: number | null;
  exchange: string | null;
  deal_size: number | null;
}

const WriteUpIPODashbaord: React.FC = () => {
  const [ipoData, setIpoData] = useState<IpoData[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string>("");
  const { ticker } = useParams<{ ticker: string }>(); // ✅ get ticker from URL

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

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

        const json = await response.json();
        const data: IpoData[] = json.results || [];

        // Ensure uniqueness by ticker + pricing_date
        const uniqueRows = Array.from(
          new Map(
            data.map((item) => [`${item.ticker}_${item.pricing_date}`, item])
          ).values()
        );

        setIpoData(uniqueRows);

        // ✅ If ticker comes from URL, use it; else fallback to first IPO
        if (ticker) {
          setSelectedTicker(ticker);}
        // } else if (uniqueRows.length > 0) {
        //   setSelectedTicker(uniqueRows[0].ticker);
        // }
      } catch (error) {
        console.error("Error fetching IPO data:", error);
      }
    };

    fetchIpoData();
  }, [apiUrl, token, ticker]); // ✅ depend on ticker also

  return (
    <>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: "#FFFFFF",
          fontSize: { xs: "1rem", sm: "1.2rem" },
          backgroundColor: "#002060",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "4vh",
          padding: "8px 16px",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "40px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          animation: "fadeIn 1.5s ease-in-out",
          "@keyframes fadeIn": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
        }}
      >
        Welcome to detailed Insights on IPO - {selectedTicker}
      </Typography>

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
            📅 All Upcoming IPO's
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
                    "Pricing Date",
                    "Sector",
                    "Price Range",
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
                      backgroundColor:
                        row.ticker === selectedTicker ? "#e6f7ff" : "inherit", // ✅ highlight selected
                      border: "1px solid black",
                    }}
                  >
                    {/* Symbol */}
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
                        to={`/equity/ipo_dashboard/${row.ticker}`}
                        state={{ fromTickerClick: true }}
                        onClick={() => setSelectedTicker(row.ticker)}
                        style={{
                          color: "#d80606ff",
                          fontWeight: "bold",
                          textDecoration: "underline",
                        }}
                      >
                        {row.ticker}
                      </Link>
                    </TableCell>

                    {/* Company */}
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

                    {/* Pricing Date */}
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
                      {row.sector || "—"}
                    </TableCell>

                    {/* Price Range */}
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: "0.78rem",
                        padding: "6px 8px",
                        border: "1px solid black",
                        lineHeight: 1.2,
                      }}
                    >
                      {row.pricing_range_min !== null &&
                      row.pricing_range_max !== null
                        ? `$${row.pricing_range_min} - $${row.pricing_range_max}`
                        : "TBA"}
                    </TableCell>

                    {/* Exchange */}
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

                    {/* Deal Size */}
                    <TableCell
                      align="center"
                      sx={{
                        fontSize: "0.78rem",
                        padding: "6px 8px",
                        border: "1px solid black",
                        lineHeight: 1.2,
                      }}
                    >
                      {formatDealSize(row.deal_size)}
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
          sx={{
            fontStyle: "italic",
            mt: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <InfoOutlinedIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          Note: IPO deals above $50M offer size.
        </Typography>
      </Container>

      {/* Pass selectedTicker to IPODashboardMain */}
      <IPODashboardMain selectedTicker={selectedTicker} />
    </>
  );
};

export default WriteUpIPODashbaord;
