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
  Card,
  CardContent,
} from "@mui/material";
import { motion } from "framer-motion";

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

  const cellBorder = {
    border: "1px solid #ddd",
    textAlign: "center",
    fontSize: 13,
    padding: "8px",
  };
  const overallRowBgColor = "#fff3e0";

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          elevation={4}
          sx={{
            borderRadius: 4,
            background: "linear-gradient(to bottom, #ffffff, #f1f8e9)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
            p: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                fontWeight: 700,
                textAlign: "center",
                background: "linear-gradient(to right, #004e92, #000428)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Fund-Wise P&L Attribution – {fund}
            </Typography>

            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 2,
                overflowX: "auto",
                border: "1px solid #ccc",
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
                    <TableRow
                      sx={{
                        background:'#002060'                      }}
                    >
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
                      const groupedByAsset: Record<string, TableRowData[]> = {};
                      data.forEach((row) => {
                        if (!groupedByAsset[row.assetType])
                          groupedByAsset[row.assetType] = [];
                        groupedByAsset[row.assetType].push(row);
                      });

                      const overallTotals: { [month: string]: number } = {};
                      months.forEach((m) => (overallTotals[m] = 0));

                      const tableRows: JSX.Element[] = [];

                      const sortedAssetTypes = Object.keys(groupedByAsset).sort(
                        (a, b) => {
                          const indexA = assetOrder.indexOf(a);
                          const indexB = assetOrder.indexOf(b);
                          const orderA =
                            indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
                          const orderB =
                            indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
                          return orderA - orderB;
                        }
                      );

                      sortedAssetTypes.forEach((assetType) => {
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
                          <TableRow
                            key={assetType}
                            sx={{
                              transition: "all 0.2s ease",
                              "&:hover": { backgroundColor: "#f4f4f4" },
                            }}
                          >
                            <TableCell sx={cellBorder}>{assetType}</TableCell>
                            {months.map((m) => (
                              <TableCell
                                key={m}
                                sx={{
                                  ...cellBorder,
                                  color:
                                    m === "YTD"
                                      ? assetTotals[m] > 0
                                        ? "green"
                                        : assetTotals[m] < 0
                                          ? "red"
                                          : "inherit"
                                      : "inherit",
                                }}
                              >
                                {formatCurrency(assetTotals[m])}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      });

                      tableRows.push(
                        <TableRow
                          key="overall-total"
                          sx={{
                            backgroundColor: overallRowBgColor,
                            fontWeight: "bold",
                            borderTop: "2px solid #333",
                          }}
                        >
                          <TableCell sx={{ ...cellBorder, fontWeight: "bold" }}>
                            Overall Total
                          </TableCell>
                          {months.map((m) => (
                            <TableCell
                              key={m}
                              sx={{
                                ...cellBorder,
                                fontWeight: "bold",
                                color:
                                  m === "YTD"
                                    ? overallTotals[m] > 0
                                      ? "green"
                                      : overallTotals[m] < 0
                                        ? "red"
                                        : "inherit"
                                    : "inherit",
                              }}
                            >
                              {formatCurrency(overallTotals[m])}
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
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default FundSummaryTable;
