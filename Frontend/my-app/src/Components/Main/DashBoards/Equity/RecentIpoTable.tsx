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

interface IpoData {
  ticker: string;
  company_name: string;
  pricing_date: string;
  price_min: number | null;
  price_max: number | null;
  expected_date: string;
  price: string | null;
  exchange?: string;
  deal_size: string | null;
  deal_type?: string | null;
  t1d_actual?: number | string | null;
  total_committed_capital?: number | null;
}

interface RecentIpoTableProps {
  selectedRows: string[]; // controlled from parent
  onSelectionChange: (selected: string[]) => void; // callback to update parent
}

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
  fontSize: "0.78rem",
  padding: "2px 8px",
  border: "1px solid black",
  lineHeight: 1.2,
};

const RecentIpoTable: React.FC<RecentIpoTableProps> = ({
  selectedRows,
  onSelectionChange,
}) => {
  const [ipoData, setIpoData] = useState<IpoData[]>([]);
  const [dashboardTickers, setDashboardTickers] = useState<string[]>([]);
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
          body: JSON.stringify({ type: "recent_ipo" }),
        });

        if (!response.ok) throw new Error("Failed to fetch recent IPO data");

        const data: IpoData[] = await response.json();
        const uniqueRows = Array.from(
          new Map(
            data.map((item) => [`${item.ticker}_${item.pricing_date}`, item])
          ).values()
        );

        setIpoData(uniqueRows);
      } catch (error) {
        console.error("Error fetching recent IPO data:", error);
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

  const formatPriceRange = (
    min: number | null,
    max: number | null
  ): string => {
    if (min === null && max === null) return "—";
    if (min !== null && max !== null) return `${min.toFixed(2)} - ${max.toFixed(2)}`;
    return min !== null ? `${min.toFixed(2)}` : `${max?.toFixed(2)}`;
  };

  const handleCheckboxChange = async (row: IpoData) => {
    const rowId = `${row.ticker}_${row.pricing_date}`;
    const isSelected = selectedRows.includes(rowId);

    if (!isSelected && selectedRows.length >= 3) {
      setError("You can select a maximum of 3 IPOs.");
      return;
    }

    const updated = isSelected
      ? selectedRows.filter((id) => id !== rowId)
      : [...selectedRows, rowId];

    onSelectionChange(updated);
    setError(null);

    // send ticker + pricing_date
    try {
      const response = await fetch(`${apiUrl}/api/unified_new_deal_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          type: "ticker_status",
          ticker: row.ticker,
          pricing_date: row.pricing_date,
        }),
      });

      if (!response.ok) throw new Error("Failed to update ticker status");

      const result = await response.json();
      console.log("API success:", result);
    } catch (err) {
      console.error("Error posting ticker status:", err);
    }
  };

  return (
    <Container maxWidth="xl">
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
          📈 Recently Listed Deals : Past Two Weeks
        </Typography>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, maxHeight: "320px" }}
        >
          <Table sx={{ borderCollapse: "collapse", border: "1px solid black" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#002060" }}>
                <TableCell sx={headerStyle}></TableCell>
                {[
                  "Symbol",
                  "Company",
                  "Deal Type",
                  "Pricing Date",
                  "Offer Price",
                  "Deal Size",
                  "T+1D Return",
                  "Total Committed Capital",
                ].map((heading) => (
                  <TableCell key={heading} align="center" sx={headerStyle}>
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {ipoData.map((row) => {
                const rowId = `${row.ticker}_${row.pricing_date}`;
                const returnValue = parseFloat(row.t1d_actual as any);
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
                        onChange={() => handleCheckboxChange(row)}
                        size="small"
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

                    <TableCell align="center" sx={cellStyle}>
                      {row.company_name || "—"}
                    </TableCell>

                    <TableCell align="center" sx={cellStyle}>
                      {row.deal_type || "—"}
                    </TableCell>

                    <TableCell align="center" sx={cellStyle}>
                      {formatDate(row.pricing_date)}
                    </TableCell>

                    <TableCell align="center" sx={cellStyle}>
                      {formatPriceRange(row.price_min, row.price_max)}
                    </TableCell>

                    <TableCell align="center" sx={cellStyle}>
                      {row.deal_size && !isNaN(Number(row.deal_size))
                        ? formatCapital(Number(row.deal_size))
                        : row.deal_size ?? "—"}
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        ...cellStyle,
                        color: isNaN(returnValue)
                          ? "inherit"
                          : returnValue > 0
                          ? "green"
                          : returnValue < 0
                          ? "red"
                          : "inherit",
                        fontWeight: 500,
                      }}
                    >
                      {formatReturn(row.t1d_actual)}
                    </TableCell>

                    <TableCell align="center" sx={cellStyle}>
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
