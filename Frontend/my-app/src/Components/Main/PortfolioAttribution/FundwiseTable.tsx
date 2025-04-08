import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

interface FundData {
  broad_region: string;
  custom_group_1: string;
  Jan_pnl: number;
  Feb_pnl: number;
  Mar_pnl: number;
}

interface SectorData {
  broad_region: string;
  custom_group_2: string;
  Jan_pnl: number;
  Feb_pnl: number;
  Mar_pnl: number;
}

const formatNumber = (value: number) => {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  let formattedValue;

  if (absValue >= 1_000) {
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
  const [view, setView] = useState<"fund" | "sector">("fund"); // Default view is "fund"
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let response;
        const endpoint =
          view === "fund"
            ? "/api/detailed_fund_pnl/"
            : "/api/detailed_sector_pnl/";

        response = await fetch(`${apiUrl}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ fund }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data from the API.");
        }

        const responseData = await response.json();

        // Check for specific error from API response
        if (responseData.error === "No data found.") {
          setData([]);
        } else {
          setData(responseData);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "An error occurred while fetching data"
        );
        navigate("/error");
      } finally {
        setLoading(false);
      }
    };

    if (fund) {
      fetchData();
    }
  }, [fund, apiUrl, token, view]);

  // Region totals and overall totals initialization
  let regionTotals: Record<
    string,
    { Jan_pnl: number; Feb_pnl: number; Mar_pnl: number }
  > = {};
  let overallTotal = { Jan_pnl: 0, Feb_pnl: 0, Mar_pnl: 0 };

  if (Array.isArray(data)) {
    data.forEach(
      ({ broad_region, Jan_pnl, Feb_pnl, Mar_pnl }: FundData | SectorData) => {
        if (!regionTotals[broad_region]) {
          regionTotals[broad_region] = { Jan_pnl: 0, Feb_pnl: 0, Mar_pnl: 0 };
        }
        regionTotals[broad_region].Jan_pnl += Jan_pnl;
        regionTotals[broad_region].Feb_pnl += Feb_pnl;
        regionTotals[broad_region].Mar_pnl += Mar_pnl;

        overallTotal.Jan_pnl += Jan_pnl;
        overallTotal.Feb_pnl += Feb_pnl;
        overallTotal.Mar_pnl += Mar_pnl;
      }
    );
  }

  // Row span logic
  let rowSpans: Record<string, number> = {};
  let previousRegion: string | null = null;

  if (Array.isArray(data)) {
    data.forEach(({ broad_region }: FundData | SectorData) => {
      if (broad_region !== previousRegion) {
        rowSpans[broad_region] = 1;
      } else {
        rowSpans[broad_region]++;
      }
      previousRegion = broad_region;
    });
  }

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
                <FormControlLabel
                  value="fund"
                  control={<Radio />}
                  label="Fund Detail"
                />
                <FormControlLabel
                  value="sector"
                  control={<Radio />}
                  label="Sector Detail"
                />
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
                <Typography
                  variant="h5"
                  align="center"
                  color="#002060"
                  fontWeight={500}
                  marginBottom={2}
                >
                  {view === "sector"
                    ? `${fund}: 2025 YTD Net of Hedge P&L by Sector`
                    : `${fund} : 2025 YTD Net of Hedge P&L Strategy`}
                </Typography>
                <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                  <Table size="small" sx={{ borderCollapse: "collapse" }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#466675" }}>
                        <TableCell
                          sx={{
                            color: "#ffffff",
                            fontWeight: "bold",
                            border: "1px solid black",
                            textAlign: "center",
                          }}
                        >
                          <b>Region</b>
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#ffffff",
                            fontWeight: "bold",
                            border: "1px solid black",
                            textAlign: "center",
                          }}
                        >
                          <b>{view === "sector" ? "Sector" : "Deal Type"}</b>
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#ffffff",
                            fontWeight: "bold",
                            border: "1px solid black",
                            textAlign: "center",
                          }}
                        >
                          <b>Jan-2025</b>
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#ffffff",
                            fontWeight: "bold",
                            border: "1px solid black",
                            textAlign: "center",
                          }}
                        >
                          <b>Feb-2025</b>
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#ffffff",
                            fontWeight: "bold",
                            border: "1px solid black",
                            textAlign: "center",
                          }}
                        >
                          <b>Mar-2025</b>
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#ffffff",
                            fontWeight: "bold",
                            border: "1px solid black",
                            textAlign: "center",
                          }}
                        >
                          <b>2025 YTD</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.isArray(data) &&
                        data.map((row, index, array) => {
                          const isLastInRegion =
                            index === array.length - 1 ||
                            array[index + 1].broad_region !== row.broad_region;
                          const regionSpan = rowSpans[row.broad_region];

                          const ytd =
                            (row.Jan_pnl || 0) +
                            (row.Feb_pnl || 0) +
                            (row.Mar_pnl || 0);

                          return (
                            <React.Fragment key={index}>
                              <TableRow>
                                {index === 0 ||
                                array[index - 1].broad_region !==
                                  row.broad_region ? (
                                  <TableCell
                                    rowSpan={regionSpan}
                                    sx={{ border: "1px solid black" }}
                                  >
                                    {row.broad_region}
                                  </TableCell>
                                ) : null}
                                <TableCell sx={{ border: "1px solid black" }}>
                                  {view === "sector"
                                    ? (row as SectorData).custom_group_2
                                    : (row as FundData).custom_group_1}
                                </TableCell>
                                <TableCell sx={{ border: "1px solid black" }}>
                                  {formatNumber(row.Jan_pnl)}
                                </TableCell>
                                <TableCell sx={{ border: "1px solid black" }}>
                                  {formatNumber(row.Feb_pnl)}
                                </TableCell>
                                <TableCell sx={{ border: "1px solid black" }}>
                                  {formatNumber(row.Mar_pnl)}
                                </TableCell>
                                <TableCell sx={{ border: "1px solid black" }}>
                                  {formatNumber(ytd)}
                                </TableCell>
                              </TableRow>
                              {isLastInRegion && (
                                <TableRow sx={{ backgroundColor: "#91ce89" }}>
                                  <TableCell
                                    colSpan={2}
                                    sx={{
                                      fontWeight: "bold",
                                      border: "1px solid black",
                                    }}
                                  >
                                    Total for {row.broad_region}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontWeight: "bold",
                                      border: "1px solid black",
                                    }}
                                  >
                                    {formatNumber(
                                      regionTotals[row.broad_region].Jan_pnl
                                    )}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontWeight: "bold",
                                      border: "1px solid black",
                                    }}
                                  >
                                    {formatNumber(
                                      regionTotals[row.broad_region].Feb_pnl
                                    )}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontWeight: "bold",
                                      border: "1px solid black",
                                    }}
                                  >
                                    {formatNumber(
                                      regionTotals[row.broad_region].Mar_pnl
                                    )}
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontWeight: "bold",
                                      border: "1px solid black",
                                    }}
                                  >
                                    {formatNumber(
                                      (Number(
                                        regionTotals[row.broad_region]?.Jan_pnl
                                      ) || 0) +
                                        (Number(
                                          regionTotals[row.broad_region]
                                            ?.Feb_pnl
                                        ) || 0) +
                                        (Number(
                                          regionTotals[row.broad_region]
                                            ?.Mar_pnl
                                        ) || 0)
                                    )}
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          );
                        })}
                      <TableRow sx={{ backgroundColor: "#cfd8dc" }}>
                        <TableCell
                          colSpan={2}
                          sx={{ fontWeight: "bold", border: "1px solid black" }}
                        >
                          Overall Total
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", border: "1px solid black" }}
                        >
                          {formatNumber(overallTotal.Jan_pnl)}
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", border: "1px solid black" }}
                        >
                          {formatNumber(overallTotal.Feb_pnl)}
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", border: "1px solid black" }}
                        >
                          {formatNumber(overallTotal.Mar_pnl)}
                        </TableCell>
                        <TableCell
                          sx={{ fontWeight: "bold", border: "1px solid black" }}
                        >
                          {formatNumber(
                            (Number(overallTotal?.Jan_pnl) || 0) +
                              (Number(overallTotal?.Feb_pnl) || 0) +
                              (Number(overallTotal?.Mar_pnl) || 0)
                          )}
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
    </Box>
  );
};

export default FundWiseTable;
