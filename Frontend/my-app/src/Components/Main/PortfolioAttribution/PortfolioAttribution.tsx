import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography, Container, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from "@mui/material";
import { Link } from "react-router-dom";

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

  return isNegative ? `-$${formattedValue}` : `$${formattedValue}`;
};

const PortfolioAttribution: React.FC = () => {
  const [data, setData] = useState<FundData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

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
            pnl: row.pnl || 0,
            aum: row.aum || 0,
            net: row.net || 0,
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

  const totalPnl = formatNumber(data.reduce((sum, row) => sum + row.pnl, 0));
  const totalAum = formatNumber(data.reduce((sum, row) => sum + row.aum, 0));
  const totalNet = formatNumber(data.reduce((sum, row) => sum + row.net, 0));

  return (
    <Box sx={{ width: "100%", backgroundColor: "#fff", p: 2 }}>
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
      <Container>
        <Typography variant="h5" gutterBottom align="center">
          Fund Performance Data
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ border: "1px solid #ddd" }}>
            <Table size="small" sx={{ borderCollapse: "collapse" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#466675"}}>
                  <TableCell sx={{ color: "#ffffff" ,fontWeight: "bold", width: "120px", border: "1px solid #ddd", textAlign: "center" }}>Fund</TableCell>
                  <TableCell sx={{color: "#ffffff" , fontWeight: "bold", width: "120px", border: "1px solid #ddd", textAlign: "center" }}>YTD PnL</TableCell>
                  <TableCell sx={{color: "#ffffff" , fontWeight: "bold", width: "120px", border: "1px solid #ddd", textAlign: "center" }}>Hurdle Return</TableCell>
                  <TableCell sx={{ color: "#ffffff" , fontWeight: "bold", width: "120px", border: "1px solid #ddd", textAlign: "center" }}>Net PnL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>
                      <Link to={`/fund/${row.fund}`} style={{ color: "#A52A2A", textDecoration: "none" }} target="_blank">
                        {row.fund}
                      </Link>
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>{formatNumber(row.pnl)}</TableCell>
                    <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>{formatNumber(row.aum)}</TableCell>
                    <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>{formatNumber(row.net)}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx ={{backgroundColor: "#91ce89"}} >
                  <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>Total</TableCell>
                  <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>{totalPnl}</TableCell>
                  <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>{totalAum}</TableCell>
                  <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>{totalNet}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
};

export default PortfolioAttribution;