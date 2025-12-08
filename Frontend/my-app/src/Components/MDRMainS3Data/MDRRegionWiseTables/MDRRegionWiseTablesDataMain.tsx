// MDRRegionWiseTablesDataMain.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
// import MDRFundRegionWiseFilters from "path-to-your-component";

const PRIMARY_COLOR = "#002060";

// Same order as backend
const REGION_ORDER = ["US", "AmerExUS", "APAC", "EMEA", "Total"];

interface RegionRow {
  region: string;
  dtd: number;
  mtd: number;
  ytd: number;
}

interface FundBlock {
  fund: string;
  rows: RegionRow[];
}

// --- API response types (matching your Django view) ---
interface ApiRegionPnL {
  DTD: number;
  MTD: number;
  YTD: number;
}

interface ApiFundsResponse {
  funds: {
    [fundName: string]: {
      [region: string]: ApiRegionPnL;
    };
  };
}

const MDRRegionWiseTablesDataMain: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const [data, setData] = useState<FundBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false); // if you use filters

  // 🔹 ROUND OFF values (no decimals)
  const formatPnL = (num: number) => {
    if (num === null || num === undefined) return "";
    return Math.round(num).toLocaleString(undefined);
  };

  const pnlColor = (v: number) =>
    v < 0 ? "#d32f2f" : v > 0 ? "#2e7d32" : undefined;

  // 🔹 Fetch data from API (no payload)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${apiUrl}/api/mdr_fund_wise_data_table/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            // ⛔ No body / payload required by backend
            // body: JSON.stringify({}),
          }
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Failed to fetch region/fund P&L data");
        }

        const json: ApiFundsResponse = await response.json();

        // 🔹 Transform { funds: { fund: { region: {DTD,MTD,YTD} } } }
        //     into FundBlock[] expected by the UI
        const transformed: FundBlock[] = Object.entries(json.funds || {}).map(
          ([fundName, regionsObj]) => {
            const rows: RegionRow[] = REGION_ORDER.map((regionName) => {
              const regionData = regionsObj[regionName] || {
                DTD: 0,
                MTD: 0,
                YTD: 0,
              };

              return {
                region: regionName,
                dtd: regionData.DTD,
                mtd: regionData.MTD,
                ytd: regionData.YTD,
              };
            });

            return {
              fund: fundName,
              rows,
            };
          }
        );

        setData(transformed);
        setHasApplied(true); // optional – if you want "no data" message logic to work
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (apiUrl) {
      fetchData();
    }
  }, [apiUrl, token]);

  // 🔹 Split normal funds vs "Total" overall fund
  const normalFunds = data.filter(
    (f) => f.fund.toLowerCase() !== "total"
  );
  const totalFund = data.find((f) => f.fund.toLowerCase() === "total");

  // Helper – one card with a single table (Region rows + Total row)
  const renderFundCard = (fund: FundBlock) => (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 1.5 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            mb: 1,
            textAlign: "center",
          }}
        >
          {fund.fund}
        </Typography>

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: "1px solid #ccc", overflowX: "hidden" }}
        >
          <Table
            size="small"
            sx={{ tableLayout: "fixed", width: "100%" }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    width: "34%",
                    fontWeight: 700,
                    color: "#002060",
                    backgroundColor: "#f0f3ff",
                    borderRight: "1px solid #ccc",
                    borderBottom: "1px solid #ccc",
                    padding: "4px 8px",
                  }}
                >
                  Region
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    width: "22%",
                    fontWeight: 700,
                    color: "#002060",
                    backgroundColor: "#f0f3ff",
                    borderBottom: "1px solid #ccc",
                    padding: "4px 8px",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  DTD
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    width: "22%",
                    fontWeight: 700,
                    color: "#002060",
                    backgroundColor: "#f0f3ff",
                    borderBottom: "1px solid #ccc",
                    padding: "4px 8px",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  MTD
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    width: "22%",
                    fontWeight: 700,
                    color: "#002060",
                    backgroundColor: "#f0f3ff",
                    borderBottom: "1px solid #ccc",
                    padding: "4px 8px",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  YTD
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {fund.rows.map((row) => (
                <TableRow key={`${fund.fund}-${row.region}`}>
                  <TableCell
                    sx={{
                      width: "34%",
                      fontWeight:
                        row.region.toLowerCase() === "total" ? 700 : 400,
                      borderRight: "1px solid #ccc",
                      borderBottom: "1px solid #eee",
                      padding: "4px 8px",
                    }}
                  >
                    {row.region}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      width: "22%",
                      color: pnlColor(row.dtd),
                      borderBottom: "1px solid #eee",
                      padding: "4px 8px",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatPnL(row.dtd)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      width: "22%",
                      color: pnlColor(row.mtd),
                      borderBottom: "1px solid #eee",
                      padding: "4px 8px",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatPnL(row.mtd)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      width: "22%",
                      color: pnlColor(row.ytd),
                      borderBottom: "1px solid #eee",
                      padding: "4px 8px",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatPnL(row.ytd)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ p: 3, backgroundColor: "#f5f6fa" }}>
        <Paper
          elevation={3}
          sx={{ p: 3, borderRadius: 3, backgroundColor: "#ffffff" }}
        >
          <Typography
            variant="h6"
            align="center"
            sx={{ mb: 2, fontWeight: 600, color: PRIMARY_COLOR }}
          >
            Region / Fund wise P&amp;L (Net of Hedge, Net of FX, before fees and
            expenses)
          </Typography>

          {/* Keep this only if you still use filters */}
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {loading && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          <Grid container spacing={2}>
            {hasApplied && !loading && data.length === 0 && (
              <Typography variant="body2" sx={{ ml: 2, mt: 1 }}>
                No data available for the selected filters.
              </Typography>
            )}

            {/* 3-per-row normal funds */}
            {normalFunds.map((fund) => (
              <Grid item xs={12} md={4} key={fund.fund}>
                {renderFundCard(fund)}
              </Grid>
            ))}

            {/* Total fund in its own smaller row, centered */}
            {totalFund && (
              <Grid item xs={12} md={8} lg={6} sx={{ mx: "auto" }}>
                {renderFundCard(totalFund)}
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default MDRRegionWiseTablesDataMain;
