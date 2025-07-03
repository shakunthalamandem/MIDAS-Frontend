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
  IconButton,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

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
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const collapsedOnlyAssets = ["Cash", "Warrants", "Futures"];

  const handleAssetClick = (assetType: string) => {
    const url = `/portfolio-attribution/details/${encodeURIComponent(assetType)}`;
    window.open(url, "_blank");
  };

  const toggleExpand = (assetType: string) => {
    setExpandedAssets((prev) => {
      const updated = new Set(prev);
      if (updated.has(assetType)) {
        updated.delete(assetType);
      } else {
        updated.add(assetType);
      }
      return updated;
    });
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
            const monthValues = rest as { [month: string]: number };

            const isAllZero = Object.values(monthValues).every(
              (value) => !value || value === 0
            );

            if (!isAllZero) {
              Object.keys(monthValues).forEach((month) => monthSet.add(month));
              rows.push({
                assetType,
                fundName,
                values: monthValues,
              });
            }
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

  const cellBorder = { border: "1px solid black", textAlign: "center" };
  const totalRowBgColor = "rgb(145, 206, 137)";
  const overallRowBgColor = "#fde8b7";

  return (
    <Container>
      <Typography
        variant="h6"
        sx={{ mt: 4, mb: 1, fontWeight: "bold", color: "#002060", textAlign: "center" }}
      >
        Fund-Level Performance Breakdown
      </Typography>

      <Typography
        variant="body1"
        align="left"
        sx={{ color: "#666", mb: 2, p: 2 }}
      >
        Dive deeper into the performance drivers by analyzing how each
        individual fund has contributed to overall P&L. This breakdown allows
        for a granular view of asset-specific returns, strategy effectiveness,
        and risk-adjusted performance across the Monashee platform.
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          mt: 4,
          mb: 4,
          borderRadius: 2,
          boxShadow: 3,
          overflow: "auto",
          border: "1px solid #000",
        }}
      >
  {loading ? (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
    <CircularProgress />
  </Box>
) : (
  <Table size="small" sx={{ borderCollapse: "collapse" }}>

            <TableHead>
              <TableRow sx={{ backgroundColor: "#002060" }}>
                <TableCell sx={{ color: "#ffffff", ...cellBorder }}>
                  <b>Asset Type</b>
                </TableCell>
                <TableCell sx={{ color: "#ffffff", ...cellBorder }}>
                  <b>Fund Name</b>
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
                const groupedData = data.reduce<Record<string, TableRowData[]>>(
                  (acc, row) => {
                    if (!acc[row.assetType]) acc[row.assetType] = [];
                    acc[row.assetType].push(row);
                    return acc;
                  },
                  {}
                );

                const rows: JSX.Element[] = [];
                const overallTotals: { [month: string]: number } = {};
                months.forEach((m) => (overallTotals[m] = 0));

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

                sortedGroupedEntries.forEach(([assetType, fundRows]) => {
                  const showCollapsed = collapsedOnlyAssets.includes(assetType);
                  const isExpanded = expandedAssets.has(assetType);

                  const sortedFundRows = [...fundRows].sort((a, b) =>
                    a.fundName.localeCompare(b.fundName)
                  );

                  const totals: { [month: string]: number } = {};
                  months.forEach((month) => {
                    totals[month] = sortedFundRows.reduce(
                      (sum, row) => sum + (row.values[month] ?? 0),
                      0
                    );
                    overallTotals[month] += totals[month]; // accumulate for overall
                  });

                  if (showCollapsed && !isExpanded) {
                    rows.push(
                      <TableRow key={`${assetType}-total`}>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            textDecoration: "underline",
                            color: "#f40b00",
                            cursor: "pointer",
                            ...cellBorder,
                            backgroundColor: "inherit",
                          }}
                          onClick={() => handleAssetClick(assetType)}
                        >
                          {assetType}
                        </TableCell>
                        <TableCell
                          sx={{
                            ...cellBorder,
                            backgroundColor: totalRowBgColor,
                            fontWeight: "bold",
                          }}
                        >
                          Sum{" "}
                          <IconButton size="small" onClick={() => toggleExpand(assetType)}>
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                        {months.map((month) => (
                          <TableCell
                            key={month}
                            align="center"
                            sx={{
                              ...cellBorder,
                              backgroundColor: totalRowBgColor,
                              fontWeight: "bold",
                            }}
                          >
                            {formatCurrency(totals[month])}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                    return;
                  }

                  sortedFundRows.forEach((row, idx) => {
                    rows.push(
                      <TableRow key={`${assetType}-${idx}`}>
                        {idx === 0 && (
                          <TableCell
                            rowSpan={sortedFundRows.length + 1}
                            sx={{
                              cursor: "pointer",
                              fontWeight: "bold",
                              textDecoration: "underline",
                              color: "#f40b00",
                              "&:hover": {
                                textDecoration: "underline",
                                opacity: 0.8,
                              },
                              ...cellBorder,
                            }}
                            onClick={() => handleAssetClick(assetType)}
                          >
                            {assetType}
                          </TableCell>
                        )}
                        <TableCell sx={cellBorder}>{row.fundName}</TableCell>
                        {months.map((month) => (
                          <TableCell key={month} align="center" sx={cellBorder}>
                            {formatCurrency(row.values[month] ?? 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  });

                  rows.push(
                    <TableRow
                      key={`${assetType}-total`}
                      sx={{ backgroundColor: totalRowBgColor }}
                    >
                      <TableCell colSpan={1} sx={cellBorder}>
                        {collapsedOnlyAssets.includes(assetType) ? (
                          <b>
                            Sum{" "}
                            <IconButton
                              size="small"
                              onClick={() => toggleExpand(assetType)}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                          </b>
                        ) : (
                          <b>Sum </b>
                        )}
                      </TableCell>
                      {months.map((month) => (
                        <TableCell key={month} align="center" sx={cellBorder}>
                          <b>{formatCurrency(totals[month])}</b>
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                });

                // Add Overall Total row
                rows.push(
                  <TableRow
                    key="overall-total"
                    sx={{ backgroundColor: overallRowBgColor }}
                  >
                    <TableCell colSpan={2} sx={{ ...cellBorder, fontWeight: "bold" }}>
                      Overall Total
                    </TableCell>
                    {months.map((month) => (
                      <TableCell key={month} align="center" sx={cellBorder}>
                        <b>{formatCurrency(overallTotals[month])}</b>
                      </TableCell>
                    ))}
                  </TableRow>
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
