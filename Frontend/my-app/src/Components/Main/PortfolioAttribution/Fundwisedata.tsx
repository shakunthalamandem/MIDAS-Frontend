import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Container,
} from "@mui/material";
import { Link } from "react-router-dom";

type FundData = {
  fund: string;
  [key: string]: string | number;
};

const formatNumber = (value: number) => {
  if (value === undefined || value === null || isNaN(value)) return "-";

  const isNegative = value < 0;
  const absValue = Math.abs(value);

  let formattedValue: string;

  if (absValue === 0) {
    formattedValue = "0";
  } else if (absValue >= 1_000) {
    const thousands = Math.floor(absValue / 1_000);
    formattedValue = thousands.toLocaleString() + "K";
  } else {
    formattedValue = absValue.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  return isNegative ? `-$${formattedValue}` : `$${formattedValue}`;
};


const Fundwisedata: React.FC = () => {
  const [data, setData] = useState<FundData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!apiUrl)
          throw new Error("API URL is not defined in environment variables");

        const response = await fetch(`${apiUrl}/api/portfolio_attribution/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ filter_type: "fund" }),
        });

        if (!response.ok) throw new Error("Failed to fetch fund-wise data");

        const result = await response.json();

        const extractedData: FundData[] = [];
        const uniqueMonths = new Set<string>();

        // First pass: collect all unique months
        result.forEach((item: any) => {
          const fundName = Object.keys(item)[0];
          const fundValues = item[fundName] || {};
          Object.keys(fundValues).forEach((month) => uniqueMonths.add(month));
        });

        const allMonths = Array.from(uniqueMonths);

        // Second pass: normalize each fund's data
        result.forEach((item: any) => {
          const fundName = Object.keys(item)[0];
          const fundValues = item[fundName] || {};

          const completeData: FundData = { fund: fundName };
          allMonths.forEach((month) => {
            const value = Number(fundValues[month]);
            completeData[month] = isNaN(value) ? 0 : value;
          });

          extractedData.push(completeData);
        });

        setData(extractedData);
        setMonths(
          allMonths.sort(
            (a, b) =>
              new Date(`${a} 1, 2025`).getTime() -
              new Date(`${b} 1, 2025`).getTime()
          )
        );
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, token]);

  // Calculate total values dynamically for each month
  const totals: Record<string, number> = {};
  months.forEach((month) => {
    totals[month] = data.reduce((sum, row) => sum + Number(row[month] || 0), 0);
  });

  return (
    <Box sx={{ width: "100%", backgroundColor: "#fff", p: 2 }}>
      <Container>
        <Typography
          variant="h5"
          color="#002060"
          align="center"
          fontWeight={600}
          marginBottom={2}
        >
          2025 YTD Net of Hedge P&L Attribution by Fund
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ border: "1px solid #ddd" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#466675" }}>
                  <TableCell
                    sx={{
                      color: "#ffffff",
                      fontWeight: "bold",
                      border: "1px solid #ddd",
                    }}
                  >
                    Fund
                  </TableCell>
                  {months.map((month) => (
                    <TableCell
                      key={month}
                      sx={{
                        color: "#ffffff",
                        fontWeight: "bold",
                        border: "1px solid #ddd",
                        textAlign: "center",
                      }}
                    >
                      {month === "YTD" ? "YTD (Till Today)" : month}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {data.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{ backgroundColor: index % 2 ? "#f5f5f5" : "#ffffff" }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        border: "1px solid #ddd",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Link
                        to={`/equity/portfolio-attribution/fund/${row.fund}`}
                        style={{ color: "#A52A2A", textDecoration: "none" }}
                        target="_blank"
                      >
                        {row.fund}
                      </Link>
                    </TableCell>
                    {months.map((month) => (
                      <TableCell
                        key={month}
                        sx={{ border: "1px solid #ddd", textAlign: "center" }}
                      >
                        {formatNumber(Number(row[month]))}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: "#91ce89" }}>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    Total
                  </TableCell>
                  {months.map((month) => (
                    <TableCell
                      key={month}
                      sx={{
                        border: "1px solid #ddd",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {formatNumber(totals[month])}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
};

export default Fundwisedata;
