import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
} from "@mui/material";
import NoDataPopup from "../../../Pages/NoDataPopup";

interface FundData {
  broad_region: string;
  custom_group_1: string;
  pnl: number;
}

interface SectorData {
  broad_region: string;
  custom_group_2: string;
  custom_group_1: string;
  pnl: number;
  adjusted_hedge: number;
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
  const [data, setData] = useState<FundData[] | SectorData[]>([]);
  const [openNoDataPopup, setOpenNoDataPopup] = useState<boolean>(false);
  const [view, setView] = useState<"fund" | "sector">("fund"); // Default view is "fund"
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response;
        if (view === "fund") {
          response = await fetch(`${apiUrl}/api/detailed_fund_pnl/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({ fund }),
          });
        } else if (view === "sector") {
          response = await fetch(`${apiUrl}/api/detailed_sector_pnl/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({ fund }), // Assuming sector data requires the same parameter
          });
        }

        if (!response || !response.ok) {
          throw new Error("Failed to fetch data from the API.");
        }

        const result: (FundData[] | SectorData[]) = await response.json();

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
  }, [fund, apiUrl, token, view]);

  const handleCloseNoDataPopup = () => {
    setOpenNoDataPopup(false);
  };

  // Region totals and overall totals initialization
  let regionTotals: Record<string, { pnl: number }> = {};
  let overallTotal = { pnl: 0 };

  data.forEach(({ broad_region, pnl }: FundData | SectorData) => {
    if (!regionTotals[broad_region]) {
      regionTotals[broad_region] = { pnl: 0 };
    }
    regionTotals[broad_region].pnl += pnl;
    overallTotal.pnl += pnl;
  });

  // Row span logic
  let rowSpans: Record<string, number> = {};
  let previousRegion: string | null = null;

  data.forEach(({ broad_region }: FundData | SectorData) => {
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
          <Grid item xs={12} textAlign="center">
            <FormControl>
              <RadioGroup
                row
                aria-labelledby="view-toggle-label"
                value={view}
                onChange={(e) => setView(e.target.value as "fund" | "sector")}
              >
                <FormControlLabel value="fund" control={<Radio />} label="Fund Detail" />
                <FormControlLabel value="sector" control={<Radio />} label="Sector Detail" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            {loading ? (
              <CircularProgress />
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <Box>
                <Typography variant="h5" align="center" color="#002060" fontWeight={500} marginBottom={2}>
                  {view === "sector"
                    ? `${fund}: 2025 YTD Net of Hedge P&L by Sector`
                    : `${fund} : 2025 YTD Net of Hedge P&L Strategy`}
                </Typography>
                <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                  <Table size="small" sx={{ borderCollapse: "collapse" }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#466675" }}>
                        <TableCell sx={{ color: "#ffffff", fontWeight: "bold", border: "1px solid black", textAlign: "center" }}>
                          <b>{view === "sector" ? "Sector" : "Region"}</b>
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff", fontWeight: "bold", border: "1px solid black", textAlign: "center" }}>
                          <b>Deal Type</b>
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff", fontWeight: "bold", border: "1px solid black", textAlign: "center" }}>
                          <b>Jan-2025</b>
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff", fontWeight: "bold", border: "1px solid black", textAlign: "center" }}>
                          <b>2025 YTD</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((row, index, array) => {
                        const isLastInRegion = index === array.length - 1 || array[index + 1].broad_region !== row.broad_region;
                        const regionSpan = rowSpans[row.broad_region];

                        return (
                          <React.Fragment key={index}>
                            <TableRow>
                              {index === 0 || array[index - 1].broad_region !== row.broad_region ? (
                                <TableCell rowSpan={regionSpan} sx={{ border: "1px solid black" }}>
                                  {row.broad_region}
                                </TableCell>
                              ) : null}
                              <TableCell sx={{ border: "1px solid black" }}>
                                {view === "sector" ? (row as SectorData).custom_group_2 : (row as FundData).custom_group_1}
                              </TableCell>
                              <TableCell sx={{ border: "1px solid black" }}>{formatNumber(row.pnl)}</TableCell>
                              <TableCell sx={{ border: "1px solid black" }}>{formatNumber(row.pnl)}</TableCell> {/* Change here */}
                            </TableRow>
                            {isLastInRegion && (
                              <TableRow sx={{ backgroundColor: "#91ce89" }}>
                                <TableCell colSpan={2} sx={{ fontWeight: "bold", border: "1px solid black" }}>
                                  Total for {row.broad_region}
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", border: "1px solid black" }}>
                                  {formatNumber(regionTotals[row.broad_region].pnl)}
                                </TableCell>
                                <TableCell sx={{ fontWeight: "bold", border: "1px solid black" }}>
                                  {formatNumber(regionTotals[row.broad_region].pnl)} {/* Change here */}
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                      <TableRow sx={{ backgroundColor: "#cfd8dc" }}>
                        <TableCell colSpan={2} sx={{ fontWeight: "bold", border: "1px solid black" }}>
                          Overall Total
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold", border: "1px solid black" }}>
                          {formatNumber(overallTotal.pnl)}
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold", border: "1px solid black" }}>
                          {formatNumber(overallTotal.pnl)} {/* Change here */}
                        </TableCell>
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
