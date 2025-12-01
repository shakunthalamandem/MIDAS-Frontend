// MDRFundRegionWiseTableMain.tsx
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

import MDRFundRegionWiseFilters, {
  FundRegionFilterState,
  FundRegionFilterOptions,
} from "./MDRFundRegionWiseFilters";

const PRIMARY_COLOR = "#002060";

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

interface MetaData {
  start_date: string;
  end_date: string;
  as_of_date: string;
  assets: string[];
}

const initialFilters: FundRegionFilterState = {
  startDate: "",
  endDate: "",
  asset: [],
};

const MDRFundRegionWiseTableMain: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const [filters, setFilters] =
    useState<FundRegionFilterState>(initialFilters);
  const [filterOptions, setFilterOptions] =
    useState<FundRegionFilterOptions>({
      assetTypes: [],
    });

  const [data, setData] = useState<FundBlock[]>([]);
  const [meta, setMeta] = useState<MetaData | null>(null);

  const [loading, setLoading] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  const handleFiltersChange = (
    updated: Partial<FundRegionFilterState>
  ) => {
    setFilters((prev: FundRegionFilterState) => ({ ...prev, ...updated }));
  };

  // 🔹 Load Asset Types
  useEffect(() => {
    const loadFilters = async () => {
      if (!apiUrl) {
        setError("API URL is not defined in environment variables");
        return;
      }

      try {
        setFiltersLoading(true);

        const response = await fetch(`${apiUrl}/api/daily_trades_filters/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Failed to fetch filter options");
        }

        const json = await response.json();
        setFilterOptions({
          assetTypes: json.asset_type || [],
        });
      } catch (err: any) {
        setError(err.message || "Failed to load filter options");
      } finally {
        setFiltersLoading(false);
      }
    };

    loadFilters();
  }, [apiUrl, token]);

  // 🔹 Fetch Region/Fund Net Hedge PnL
  const handleApply = async () => {
    setHasApplied(true);
    setError(null);

    if (!apiUrl) {
      setError("API URL is not defined in environment variables");
      return;
    }

    const payload = {
      start_date: filters.startDate,
      end_date: filters.endDate,
      assets: filters.asset,
    };

    try {
      setLoading(true);

      const response = await fetch(
        `${apiUrl}/api/mdr_region_fund_net_hedge_pnl/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to fetch region/fund P&L data");
      }

      const json: { data: FundBlock[]; meta: MetaData } =
        await response.json();

      setData(Array.isArray(json.data) ? json.data : []);
      setMeta(json.meta || null);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
      setData([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setData([]);
    setMeta(null);
    setHasApplied(false);
    setError(null);
  };

  const formatPnL = (num: number) =>
    num?.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const pnlColor = (v: number) =>
    v < 0 ? "#d32f2f" : v > 0 ? "#2e7d32" : undefined;

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
                <TableRow key={row.region}>
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

          <MDRFundRegionWiseFilters
            filters={filters}
            filterOptions={filterOptions}
            loading={loading || filtersLoading}
            onChange={handleFiltersChange}
            onApply={handleApply}
            onReset={handleReset}
          />

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

export default MDRFundRegionWiseTableMain;
