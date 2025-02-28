import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography, Container, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Radio, RadioGroup, FormControlLabel, FormControl } from "@mui/material";
import { Link } from "react-router-dom";

interface FundData {
  fund?: string; // Optional for sector view
  pnl: number;
  aum: number;
  net?: number; // Optional for sector view
  custom_group_2?: string; // Optional for fund view
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
  const [view, setView] = useState<string>('fund'); // Track which view is selected: 'fund' or 'sector'

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        // Send filter type based on the selected view ('fund' or 'sector')
        const filterType = view === 'fund' ? 'fund' : 'custom_group_2';

        const response = await fetch(`${apiUrl}/api/portfolio_attribution/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ filter_type: filterType }), // Send filter type in the payload
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();
        if (isMounted) {
          let formattedData: FundData[] = [];

          // Process data based on the filter type
          if (filterType === 'fund') {
            formattedData = result.map((row: any) => ({
              fund: row.fund || "N/A",
              pnl: row.pnl || 0,
              aum: row.aum || 0,
              net: row.net || 0,
            }));
          } else if (filterType === 'custom_group_2') {
            formattedData = result.map((row: any) => ({
              custom_group_2: row.custom_group_2 || "N/A", // Use custom_group_2 for Sector view
              pnl: row.pnl || 0,
              aum: row.aum || 0,
            }));
          }

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
  }, [apiUrl, token, view]); // Add `view` as dependency to refetch data when the view changes

  const totalPnl = formatNumber(data.reduce((sum, row) => sum + row.pnl, 0));
  const totalAum = formatNumber(data.reduce((sum, row) => sum + row.aum, 0));
  const totalNet = formatNumber(data.reduce((sum, row) => sum + (row.net || 0), 0)); // Handle net for "fund" only

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

      {/* Radio Buttons for selecting Fund or Sector */}
      <Box sx={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
        <FormControl component="fieldset">
          <RadioGroup row value={view} onChange={(e) => setView(e.target.value)}>
            <FormControlLabel value="fund" control={<Radio />} label="Fund" />
            <FormControlLabel value="sector" control={<Radio />} label="Sector" />
          </RadioGroup>
        </FormControl>
      </Box>

      <Container>
        <Typography variant="h5" color="#002060" align="center" fontWeight={500} marginBottom={2}>
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
                <TableRow sx={{ backgroundColor: "#466675" }}>
                  <TableCell sx={{ color: "#ffffff", fontWeight: "bold", width: "120px", border: "1px solid #ddd", textAlign: "center" }}>
                    {view === "fund" ? "Fund" : "Sector"}
                  </TableCell>
                  <TableCell sx={{ color: "#ffffff", fontWeight: "bold", width: "120px", border: "1px solid #ddd", textAlign: "center" }}>YTD PnL</TableCell>
                  <TableCell sx={{ color: "#ffffff", fontWeight: "bold", width: "120px", border: "1px solid #ddd", textAlign: "center" }}>Hurdle Return</TableCell>
                  <TableCell sx={{ color: "#ffffff", fontWeight: "bold", width: "120px", border: "1px solid #ddd", textAlign: "center" }}>Net PnL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>
                      <Link to={`/fund/${row.fund || row.custom_group_2}`} style={{ color: "#A52A2A", textDecoration: "none" }} target="_blank">
                        {view === "fund" ? row.fund : row.custom_group_2} {/* Show sector data when "Sector" is selected */}
                      </Link>
                    </TableCell>
                    <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>{formatNumber(row.pnl)}</TableCell>
                    <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>{formatNumber(row.aum)}</TableCell>
                    <TableCell sx={{ border: "1px solid #ddd", textAlign: "center" }}>{formatNumber(row.net || 0)}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: "#91ce89" }}>
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
