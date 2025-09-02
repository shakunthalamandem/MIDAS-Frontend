import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from "@mui/material";
import FOSectionsMain from "./FOWriteUpHooks/FOSectionsMain";

interface FOData {
  ticker: string;
  company_name: string;
  pricing_date: string | null;
  deal_id: string;
  exchange: string | null;
  deal_size: number | null;
  expected_listing_date: string | null;
}

const FOWriteUpDashboardMain: React.FC = () => {
  const [FOData, setFOData] = useState<FOData[]>([]);
  const [selected, setSelected] = useState<{ ticker: string; deal_id: string } | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/fo_writeup_tickers/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch FO data");

        const json = await response.json();
        setFOData(json);
      } catch (err) {
        console.error("Error fetching FO data:", err);
      }
    };

    fetchDashboardData();
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
    if (!dateStr) return "To Be Announced";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "To Be Announced";

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
        <Table sx={{ borderCollapse: "collapse", border: "1px solid black" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#002060" }}>
              {[
                "Symbol",
                "Company",
                "Expected Listing Date",
                "Pricing Date",
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
                  "&:hover": { backgroundColor: "#f0f8ff", cursor: "pointer" },
                  border: "1px solid black",
                }}
                onClick={() => setSelected({ ticker: row.ticker, deal_id: row.deal_id })}
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
                  {row.ticker}
                </TableCell>
                <TableCell align="center">{row.company_name}</TableCell>
                <TableCell align="center">
                  {formatDate(row.expected_listing_date)}
                </TableCell>
                <TableCell align="center">
                  {formatDate(row.pricing_date)}
                </TableCell>
                <TableCell align="center">{row.exchange || "—"}</TableCell>
                <TableCell align="center">
                  {row.deal_size !== null ? `${row.deal_size}` : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ✅ Show FOSectionsMain below table if a row is clicked */}
      {selected && (
        <Box mt={4}>
          <FOSectionsMain ticker={selected.ticker} deal_id={selected.deal_id} />
        </Box>
      )}
    </Container>
  );
};

export default FOWriteUpDashboardMain;
