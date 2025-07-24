import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Container,
  Box,
} from "@mui/material";

type AssetData = {
  asset_type: string;
  [month: string]: number | string;
};

type ApiResponse = {
  [fundName: string]: {
    [assetType: string]: AssetData;
  };
};

interface TableRowData {
  fundName: string;
  assetType: string;
  values: { [month: string]: number };
}

interface Props {
  fund: string;
}

// Custom asset display order
const assetOrder = [
  "Equities",
  "Convertible Bond",
  "Corporate Bond",
  "Cash",
  "Warrants",
  "Futures",
];

const formatCurrency = (value: number): string => {
  const absValue = Math.abs(value);
  const suffix = absValue >= 1_000_000 ? "M" : absValue >= 1_000 ? "K" : "";
  const divisor = suffix === "M" ? 1_000_000 : suffix === "K" ? 1_000 : 1;
  const formatted = (absValue / divisor).toFixed(2);
  return `${value < 0 ? "-" : ""}$${formatted}${suffix}`;
};

const FundSummaryTable: React.FC<Props> = ({ fund }) => {
  const [data, setData] = useState<TableRowData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!fund || !apiUrl) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/fund_summary/`, {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fund }),
        });

        const result: ApiResponse = await res.json();

        const rows: TableRowData[] = [];
        const monthSet: Set<string> = new Set();

        for (const [, assetMap] of Object.entries(result)) {
          for (const [assetType, assetData] of Object.entries(assetMap)) {
            const { asset_type, ...rest } = assetData;
            const monthValues = rest as { [month: string]: number };

            const isAllZero = Object.values(monthValues).every(
              (val) => !val || val === 0
            );
            if (!isAllZero) {
              Object.keys(monthValues).forEach((m) => monthSet.add(m));
              rows.push({ fundName: "", assetType, values: monthValues });
            }
          }
        }

        const orderedMonths = Array.from(monthSet).sort((a, b) => {
          const order = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
            "YTD",
          ];
          return order.indexOf(a) - order.indexOf(b);
        });

        setMonths(orderedMonths);
        setData(rows);
      } catch (err) {
        console.error("Data fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fund, apiUrl, token]);

  const cellBorder = { border: "1px solid black", textAlign: "center" };
  const overallRowBgColor = "#fde8b7";

  return (
    <Container maxWidth="xl">
      <Typography
        variant="h6"
        sx={{
          mt: 1,
          mb: 1,
          fontWeight: "bold",
          color: "#002060",
          textAlign: "center",
        }}
      >
        Fund-Wise P&L Attribution
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          mt: 1,
          mb: 4,
          borderRadius: 2,
          boxShadow: 3,
          overflow: "auto",
          border: "1px solid #000",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 300,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small" sx={{ borderCollapse: "collapse" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#002060" }}>
                {/* Removed Fund column */}
                <TableCell sx={{ color: "#ffffff", ...cellBorder }}>
                  <b>Asset Type</b>
                </TableCell>
                {months.map((month) => (
                  <TableCell
                    key={month}
                    align="center"
                    sx={{ color: "#ffffff", ...cellBorder }}
                  >
                    <b>{month}</b>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(() => {
                // Group data by assetType across funds (fundName is ignored)
                const groupedByAsset: Record<string, TableRowData[]> = {};
                data.forEach((row) => {
                  if (!groupedByAsset[row.assetType])
                    groupedByAsset[row.assetType] = [];
                  groupedByAsset[row.assetType].push(row);
                });

                const overallTotals: { [month: string]: number } = {};
                months.forEach((m) => (overallTotals[m] = 0));

                const tableRows: JSX.Element[] = [];

                // Sort asset types by defined order
                const sortedAssetTypes = Object.keys(groupedByAsset).sort((a, b) => {
                  const indexA = assetOrder.indexOf(a);
                  const indexB = assetOrder.indexOf(b);
                  const orderA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
                  const orderB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
                  return orderA - orderB;
                });

                sortedAssetTypes.forEach((assetType) => {
                  // Sum values for this asset type across all funds (since fund is ignored)
                  const rows = groupedByAsset[assetType];
                  const assetTotals: { [month: string]: number } = {};
                  months.forEach((m) => (assetTotals[m] = 0));

                  rows.forEach((row) => {
                    months.forEach((m) => {
                      assetTotals[m] += row.values[m] ?? 0;
                      overallTotals[m] += row.values[m] ?? 0;
                    });
                  });

                  tableRows.push(
                    <TableRow key={assetType}>
                      <TableCell sx={cellBorder}>{assetType}</TableCell>
                      {months.map((m) => (
                        <TableCell key={m} sx={cellBorder}>
                          {formatCurrency(assetTotals[m])}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                });

                tableRows.push(
                  <TableRow key="overall-total" sx={{ backgroundColor: overallRowBgColor }}>
                    <TableCell sx={{ ...cellBorder, fontWeight: "bold" }}>
                      Overall Total
                    </TableCell>
                    {months.map((m) => (
                      <TableCell key={m} sx={cellBorder}>
                        <b>{formatCurrency(overallTotals[m])}</b>
                      </TableCell>
                    ))}
                  </TableRow>
                );

                return tableRows;
              })()}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Container>
  );
};

export default FundSummaryTable;
