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

interface BaseData {
  broad_region: string;
  YTD_pnl: number;
  [key: string]: string | number;
}

interface FundData extends BaseData {
  custom_group_1: string;
}

interface SectorData extends BaseData {
  custom_group_2: string;
}

const formatNumber = (value: number) => {
  if (value === undefined || value === null || isNaN(value)) return "-";
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  let formattedValue: string;

  if (absValue === 0) {
    formattedValue = "0";
  } else if (absValue >= 1000) {
    const thousands = Math.floor(absValue / 1000);
    formattedValue = thousands.toLocaleString() + "K";
  } else {
    formattedValue = absValue.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  return isNegative ? `-$${formattedValue}` : `$${formattedValue}`;
};

const FundWiseTable: React.FC = () => {
  const { fund } = useParams<{ fund: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<(FundData | SectorData)[]>([]);
  const [view, setView] = useState<"fund" | "sector">("fund");
  const [months, setMonths] = useState<string[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const endpoint =
          view === "fund" ? "/api/detailed_fund_pnl/" : "/api/detailed_sector_pnl/";
        const response = await fetch(`${apiUrl}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ fund }),
        });

        const result = await response.json();
        if (!response.ok || result.error === "No data found.") {
          setData([]);
        } else {
          setData(result);
          const sample = result[0];
          const dynamicMonths = Object.keys(sample)
            .filter((key) => key.endsWith("_pnl") && key !== "YTD_pnl")
            .map((key) => key.replace("_pnl", ""));
          setMonths(dynamicMonths);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (fund) fetchData();
  }, [fund, apiUrl, token, view]);

  const regionTotals: Record<string, Record<string, number>> = {};
  const overallTotal: Record<string, number> = {};

  months.forEach((m) => (overallTotal[`${m}_pnl`] = 0));
  overallTotal["YTD_pnl"] = 0;

  data.forEach((row) => {
    const region = row.broad_region;
    if (!regionTotals[region]) {
      regionTotals[region] = {};
      months.forEach((m) => (regionTotals[region][`${m}_pnl`] = 0));
      regionTotals[region]["YTD_pnl"] = 0;
    }

    months.forEach((m) => {
      regionTotals[region][`${m}_pnl`] += Number(row[`${m}_pnl`] || 0);
      overallTotal[`${m}_pnl`] += Number(row[`${m}_pnl`] || 0);
    });

    regionTotals[region]["YTD_pnl"] += Number(row.YTD_pnl || 0);
    overallTotal["YTD_pnl"] += Number(row.YTD_pnl || 0);
  });

  const rowSpans: Record<string, number> = {};
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
          <Grid item xs={12} textAlign="center">
            <FormControl>
              <RadioGroup
                row
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
                <Typography variant="h5" align="center" fontWeight={500} mb={2} color="#002060">
                  {view === "sector"
                    ? `${fund}: 2025 YTD Net of Hedge P&L by Sector`
                    : `${fund}: 2025 YTD Net of Hedge P&L Strategy`}
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#466675" }}>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold", border: "1px solid black", textAlign: "center" }}>
                          Region
                        </TableCell>
                        <TableCell sx={{ color: "#fff", fontWeight: "bold", border: "1px solid black", textAlign: "center" }}>
                          {view === "sector" ? "Sector" : "Deal Type"}
                        </TableCell>
                        {months.map((month) => (
                          <TableCell
                            key={month}
                            sx={{ color: "#fff", fontWeight: "bold", border: "1px solid black", textAlign: "center" }}
                          >
                            {month}-2025
                          </TableCell>
                        ))}
                        <TableCell sx={{ color: "#fff", fontWeight: "bold", border: "1px solid black", textAlign: "center" }}>
                          YTD (Till Today)
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.map((row, index, array) => {
                        const isLastInRegion =
                          index === array.length - 1 || array[index + 1].broad_region !== row.broad_region;
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
                                {view === "sector"
                                  ? (row as SectorData).custom_group_2
                                  : (row as FundData).custom_group_1}
                              </TableCell>
                              {months.map((m) => (
                                <TableCell key={m} sx={{ border: "1px solid black" }}>
                                  {formatNumber(Number(row[`${m}_pnl`] || 0))}
                                </TableCell>
                              ))}
                              <TableCell sx={{ border: "1px solid black" }}>
                                {formatNumber(row.YTD_pnl)}
                              </TableCell>
                            </TableRow>

                            {isLastInRegion && (
                              <TableRow sx={{ backgroundColor: "#91ce89" }}>
                                <TableCell colSpan={2} sx={{ fontWeight: "bold", border: "1px solid black" }}>
                                  Total for {row.broad_region}
                                </TableCell>
                                {months.map((m) => (
                                  <TableCell key={m} sx={{ fontWeight: "bold", border: "1px solid black" }}>
                                    {formatNumber(regionTotals[row.broad_region][`${m}_pnl`])}
                                  </TableCell>
                                ))}
                                <TableCell sx={{ fontWeight: "bold", border: "1px solid black" }}>
                                  {formatNumber(regionTotals[row.broad_region]["YTD_pnl"])}
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
                        {months.map((m) => (
                          <TableCell key={m} sx={{ fontWeight: "bold", border: "1px solid black" }}>
                            {formatNumber(overallTotal[`${m}_pnl`])}
                          </TableCell>
                        ))}
                        <TableCell sx={{ fontWeight: "bold", border: "1px solid black" }}>
                          {formatNumber(overallTotal["YTD_pnl"])}
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