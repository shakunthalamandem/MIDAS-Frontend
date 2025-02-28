import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Container, Grid } from "@mui/material";
import NoDataPopup from "../../../Pages/NoDataPopup";

interface FundData {
  broad_region: string;
  custom_group_1: string;
  pnl: number;
  aum: number;
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

const FundWiseTable: React.FC = () => {
  const { fund } = useParams<{ fund: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FundData[]>([]);
  const [openNoDataPopup, setOpenNoDataPopup] = useState<boolean>(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/api/detailed_fund_pnl/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ fund }),
        });
        const result: FundData[] = await response.json();

        if (!result || result.length === 0) {
          setOpenNoDataPopup(true);
          setData([]);
        } else {
          setData(result.sort((a, b) => a.broad_region.localeCompare(b.broad_region)));
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    if (fund) {
      fetchData();
    }
  }, [fund, apiUrl, token]);

  const handleCloseNoDataPopup = () => {
    setOpenNoDataPopup(false);
  };

  let regionTotals: Record<string, { pnl: number; aum: number }> = {};
  let overallTotal = { pnl: 0, aum: 0 };

  data.forEach(({ broad_region, pnl, aum }) => {
    if (!regionTotals[broad_region]) {
      regionTotals[broad_region] = { pnl: 0, aum: 0 };
    }
    regionTotals[broad_region].pnl += pnl;
    regionTotals[broad_region].aum += aum;
    overallTotal.pnl += pnl;
    overallTotal.aum += aum;
  });

  // Initialize rowSpans and other necessary variables for span logic
  let rowSpans: Record<string, number> = {};
  let previousRegion: string | null = null;

  data.forEach(({ broad_region }) => {
    if (broad_region !== previousRegion) {
      rowSpans[broad_region] = 1;
    } else {
      rowSpans[broad_region]++;
    }
    previousRegion = broad_region;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Container>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12}>
            {loading ? (
              <CircularProgress />
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <Box>
                <Typography variant="h5" align="center" color="#002060" fontWeight={500} marginBottom={2}>
                  {`${fund} : 2025 YTD Net of Hedge P&L Strategy`}
                </Typography>
                <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#466675" }}>
                        <TableCell sx={{ color: "#ffffff", fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>
                          <b>Region</b>
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff", fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>
                          <b>Deal Type</b>
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff", fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>
                          <b>Jan-2025</b>
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff", fontWeight: "bold", border: "1px solid #ddd", textAlign: "center" }}>
                          <b>2025 YTD</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((row, index, array) => {
                        const isLastInRegion = index === array.length - 1 || array[index + 1].broad_region !== row.broad_region;
                        const regionSpan = rowSpans[row.broad_region];

                        return (
                          <>
                            <TableRow key={index}>
                              {index === 0 || array[index - 1].broad_region !== row.broad_region ? (
                                <TableCell rowSpan={regionSpan}>{row.broad_region}</TableCell>
                              ) : null}
                              <TableCell>{row.custom_group_1}</TableCell>
                              <TableCell>{formatNumber(row.pnl)}</TableCell>
                              <TableCell>{formatNumber(row.aum)}</TableCell>
                            </TableRow>
                            {isLastInRegion && (
                              <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                                <TableCell colSpan={2} sx={{ fontWeight: "bold" }}>Total for {row.broad_region}</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>{formatNumber(regionTotals[row.broad_region].pnl)}</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>{formatNumber(regionTotals[row.broad_region].aum)}</TableCell>
                              </TableRow>
                            )}
                          </>
                        );
                      })}
                      <TableRow sx={{ backgroundColor: "#cfd8dc" }}>
                        <TableCell colSpan={2} sx={{ fontWeight: "bold" }}>Overall Total</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>{formatNumber(overallTotal.pnl)}</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>{formatNumber(overallTotal.aum)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
      <NoDataPopup open={openNoDataPopup} onClose={handleCloseNoDataPopup} />
    </Box>
  );
};

export default FundWiseTable;
