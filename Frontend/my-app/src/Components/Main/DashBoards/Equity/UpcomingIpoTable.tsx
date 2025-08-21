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
  Checkbox,
  Alert,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

interface IpoData {
  ticker: string;
  company_name: string;
  expected_listing_date: string;
  price: string | number | null;
  exchange: string | null;
  deal_size: number | null;
  deal_type: string | null;
}

const UpcomingIpoTable: React.FC = () => {
  const [ipoData, setIpoData] = useState<IpoData[]>([]);
  const [dashboardTickers, setDashboardTickers] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchIpoData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/unified_new_deal_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ type: "upcoming_ipo" }),
        });

        if (!response.ok) throw new Error("Failed to fetch IPO data");

        const data: IpoData[] = await response.json();

        const uniqueRows = Array.from(
          new Map(
            data.map((item) => [`${item.ticker}_${item.expected_listing_date}`, item])
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

  const formatValue = (value?: number | null): string => {
    if (value === null || value === undefined) return "-";
    const absValue = Math.abs(value);
    const suffix = absValue >= 1_000_000 ? "M" : absValue >= 1_000 ? "K" : "";
    const divisor = suffix === "M" ? 1_000_000 : suffix === "K" ? 1_000 : 1;

    const formatted = (absValue / divisor).toFixed(2);
    return `${value < 0 ? "-" : ""}$${formatted}${suffix}`;
  };

  const handleCheckboxChange = (rowId: string) => {
    const isSelected = selectedRows.includes(rowId);

    if (!isSelected && selectedRows.length >= 3) {
      setError("You can select a maximum of 3 IPOs.");
      return;
    }

    setSelectedRows((prev) =>
      isSelected ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
    setError(null); // Clear error if any
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
          📅 Upcoming IPO's and FO's
        </Typography>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table sx={{ borderCollapse: "collapse", border: "1px solid black" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#002060" }}>
                <TableCell sx={headerStyle}></TableCell> {/* Checkbox Column */}
                {[
                  "Symbol",
                  "Company",
                  "Deal Type",
                  "Expected Date",
                  "Offer Price",
                  "Exchange",
                  "Deal Size",
                ].map((heading) => (
                  <TableCell key={heading} align="center" sx={headerStyle}>
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {ipoData.map((row) => {
                const rowId = `${row.ticker}_${row.expected_listing_date}`;
                const isChecked = selectedRows.includes(rowId);

                return (
                  <TableRow
                    key={rowId}
                    hover
                    sx={{
                      "&:hover": { backgroundColor: "#f0f8ff" },
                      border: "1px solid black",
                    }}
                  >
                    <TableCell align="center" sx={cellStyle}>
                      <Checkbox
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(rowId)}
                        disabled={!isChecked && selectedRows.length >= 3}
                      />
                    </TableCell>

                    <TableCell align="center" sx={cellStyle}>
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
                            const url = `/equity/ipo_dashboard?ticker=${row.ticker}&pricing_date=${row.expected_listing_date}`;
                            window.open(url, "_blank");
                          }}
                        >
                          {row.ticker}
                        </Box>
                      ) : (
                        row.ticker
                      )}
                    </TableCell>

                    <TableCell align="center" sx={cellStyle}>
                      {row.company_name}
                    </TableCell>

                    <TableCell align="center" sx={cellStyle}>
                      {row.deal_type || "—"}
                    </TableCell>

                    <TableCell align="center" sx={cellStyle}>
                      {formatDate(row.expected_listing_date)}
                    </TableCell>

                    <TableCell align="center" sx={cellStyle}>
                      {row.price !== null
                        ? formatValue(typeof row.price === "string" ? parseFloat(row.price) : row.price)
                        : "—"}
                    </TableCell>

                    <TableCell align="center" sx={cellStyle}>
                      {row.exchange || "—"}
                    </TableCell>

                    <TableCell align="center" sx={cellStyle}>
                      {formatValue(row.deal_size)}
                    </TableCell>
                  </TableRow>
                );
              })}
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
        <InfoOutlinedIcon fontSize="small" color="action" />
        &nbsp;Note: IPO deals above $50M offer size.
      </Typography>
    </Container>
  );
};

const headerStyle = {
  color: "#fff",
  fontWeight: 600,
  fontSize: "0.78rem",
  padding: "6px 8px",
  border: "1px solid black",
  lineHeight: 1.2,
  backgroundColor: "#002060",
};

const cellStyle = {
  fontSize: "0.80rem",
  padding: "2px 8px",  // less vertical padding, smaller row height
  border: "1px solid black",
  lineHeight: 1.2,
};


export default UpcomingIpoTable;
