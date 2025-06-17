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
} from "@mui/material";

type FundData = {
  asset_type: string;
  [month: string]: number | string;
};

type ApiResponse = {
  [assetType: string]: {
    [fundName: string]: FundData;
  };
};

interface TableRowData {
  assetType: string;
  fundName: string;
  values: { [month: string]: number };
}

const formatCurrency = (value: number): string => {
  const absValue = Math.abs(value);
  const suffix = absValue >= 1_000_000 ? "M" : absValue >= 1_000 ? "K" : "";
  const divisor = suffix === "M" ? 1_000_000 : suffix === "K" ? 1_000 : 1;

  const formatted = (absValue / divisor).toFixed(2);
  return `${value < 0 ? "-" : ""}$${formatted}${suffix}`;
};

const PnlAttributionTable: React.FC = () => {
  const [data, setData] = useState<TableRowData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const handleAssetClick = (assetType: string) => {
    const url = `/portfolio-attribution/details/${encodeURIComponent(assetType)}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/pnls_summary/`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });

        const result: ApiResponse = await res.json();

        const rows: TableRowData[] = [];
        const monthSet: Set<string> = new Set();

        Object.entries(result).forEach(([assetType, funds]) => {
          Object.entries(funds).forEach(([fundName, fundData]) => {
            const { asset_type, ...rest } = fundData;
            Object.keys(rest).forEach((month) => monthSet.add(month));
            rows.push({
              assetType,
              fundName,
              values: rest as { [month: string]: number },
            });
          });
        });

        const sortedMonths = Array.from(monthSet).sort((a, b) => {
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

        setMonths(sortedMonths);
        setData(rows);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, token]);

  return (
    <Container>
      <TableContainer
        component={Paper}
        sx={{ mt: 4, mb: 4, borderRadius: 2, boxShadow: 3 }}
      >
        <Typography variant="h6" sx={{ p: 2 }} align="center" color="#002060">
          Fund-Level Performance Breakdown
        </Typography>

        {loading ? (
          <CircularProgress sx={{ m: 2 }} />
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#002060" }}>
                <TableCell sx={{ color: "#ffffff" }}>
                  <b>Asset Type</b>
                </TableCell>
                <TableCell sx={{ color: "#ffffff" }}>
                  <b>Fund Name</b>
                </TableCell>
                {months.map((month) => (
                  <TableCell
                    key={month}
                    align="right"
                    sx={{ color: "#ffffff" }}
                  >
                    <b>{month}</b>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {(() => {
                const groupedData = data.reduce<Record<string, TableRowData[]>>(
                  (acc, row) => {
                    if (!acc[row.assetType]) acc[row.assetType] = [];
                    acc[row.assetType].push(row);
                    return acc;
                  },
                  {}
                );

                const rows: JSX.Element[] = [];

                const assetOrder = [
                  "Equities",
                  "Convertible Bond",
                  "Corporate Bond",
                  "Cash",
                  "Warrants",
                  "Futures",
                ];

                const sortedGroupedEntries = Object.entries(groupedData).sort(
                  ([a], [b]) => assetOrder.indexOf(a) - assetOrder.indexOf(b)
                );

                sortedGroupedEntries.forEach(
                  ([assetType, fundRows], assetIdx) => {
                    fundRows.forEach((row, idx) => {
                      rows.push(
                        <TableRow key={`${assetType}-${idx}`}>
                          {idx === 0 && (
                            <TableCell
                              rowSpan={fundRows.length + 1}
                              sx={{
                                cursor: "pointer",
                                fontWeight: "bold",
                                textDecoration: "underline",
                                bgcolor: "#e3f2fd",
                                color: "#d10b02",
                                "&:hover": {
                                  textDecoration: "underline",
                                  opacity: 0.8,
                                },
                              }}
                              onClick={() => handleAssetClick(assetType)}
                            >
                              {assetType}
                            </TableCell>
                          )}

                          <TableCell>{row.fundName}</TableCell>
                          {months.map((month) => (
                            <TableCell key={month} align="right">
                              {formatCurrency(row.values[month] ?? 0)}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    });

                    // Add Total row for the assetType
                    const totals: { [month: string]: number } = {};
                    months.forEach((month) => {
                      totals[month] = fundRows.reduce(
                        (sum, row) => sum + (row.values[month] ?? 0),
                        0
                      );
                    });

                    rows.push(
                      <TableRow
                        key={`${assetType}-total`}
                        sx={{ backgroundColor: "#c8e6c9" }}
                      >
                        <TableCell colSpan={1}>
                          <b>Total</b>
                        </TableCell>
                        {months.map((month) => (
                          <TableCell key={month} align="right">
                            <b>{formatCurrency(totals[month])}</b>
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  }
                );

                return rows;
              })()}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Container>
  );
};

export default PnlAttributionTable;
