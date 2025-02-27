import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box, Typography, Container } from "@mui/material";

interface FundData {
  fund: string;
  pnl: number;
  aum: number;
  net: number;
}

const formatNumber = (value: number) => {
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  let formattedValue;

  if (absValue >= 1_000_000_000) {
    formattedValue = (absValue / 1_000_000_000).toFixed(1) + "B";
  } else if (absValue >= 1_000_000) {
    formattedValue = (absValue / 1_000_000).toFixed(1) + "M";
  } else if (absValue >= 1_000) {
    formattedValue = (absValue / 1_000).toFixed(0) + "K";
  } else {
    formattedValue = absValue.toFixed(2);
  }

  return isNegative ? `-${formattedValue}` : formattedValue;
};

const FundTable: React.FC = () => {
  const [data, setData] = useState<FundData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const response = await fetch(`${apiUrl}/api/portfolio_attribution/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();
        if (isMounted) {
          const formattedData = result.map((row: FundData) => ({
            fund: row.fund || "N/A",
            pnl: formatNumber(row.pnl || 0),
            aum: formatNumber(row.aum || 0),
            net: formatNumber(row.net || 0),
          }));
          setData(formattedData);
          setLoading(false);
        }
      } catch (error: any) {
        if (isMounted) {
          setError(error.message);
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [apiUrl, token]);

  return (
    <Box sx={{ width: "100%", backgroundColor: "#fff" }}>
      {/* Heading */}
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
          marginBottom: "20px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          animation: "fadeIn 2s ease-out",
        }}
      >
        Uncover the driving forces behind your portfolio’s performance with detailed attribution analysis.
      </Typography>

      {/* Table Content */}
      <Box sx={{ p: 1 }}>
        <Container>
          <Typography variant="h5" gutterBottom>
            Fund Performance Data
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "5%" }}><b>Fund</b></TableCell>
                    <TableCell sx={{ width: "5%" }}><b>YTD PnL</b></TableCell>
                    <TableCell sx={{ width: "5%" }}><b>Hurdle Return</b></TableCell>
                    <TableCell sx={{ width: "5%" }}><b>Net PnL</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.fund}</TableCell>
                      <TableCell>{row.pnl}</TableCell>
                      <TableCell>{row.aum}</TableCell>
                      <TableCell>{row.net}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default FundTable;
