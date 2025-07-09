import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Typography, Container, Box, Card
} from "@mui/material";

type StrategyData = {
  [month: string]: number;
};

type ApiResponse = {
  [strategyName: string]: StrategyData;
};

interface TableRowData {
  strategyName: string;
  values: { [month: string]: number };
}

const formatCurrency = (value: number): string => {
  const absValue = Math.abs(value);
  const suffix = absValue >= 1_000_000 ? "M" : absValue >= 1_000 ? "K" : "";
  const divisor = suffix === "M" ? 1_000_000 : suffix === "K" ? 1_000 : 1;
  const formatted = (absValue / divisor).toFixed(2);
  return `${value < 0 ? "-" : ""}$${formatted}${suffix}`;
};

const DealTypeTable: React.FC = () => {
  const [data, setData] = useState<TableRowData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const strategyOrder = [
    "IPO", "FO", "STRATEGIC", "DEC", "Other", "Overlay", "PRIVATE", "Hedging"
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/pnl_by_dealtype/`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        });
        const result: ApiResponse = await res.json();

        const rows: TableRowData[] = [];
        const monthSet: Set<string> = new Set();

        const hedgingKeys = ["Hedging_Converts", "Hedging_HY", "Hedging_Other", "Hedging"];
        const hedgingCombined: { [month: string]: number } = {};

        for (const [strategyName, monthValues] of Object.entries(result)) {
          const isAllZero = Object.values(monthValues).every((val) => !val || val === 0);
          if (isAllZero) continue;

          Object.keys(monthValues).forEach((m) => monthSet.add(m));

          if (hedgingKeys.includes(strategyName)) {
            for (const [month, value] of Object.entries(monthValues)) {
              hedgingCombined[month] = (hedgingCombined[month] || 0) + value;
            }
          } else {
            rows.push({ strategyName, values: monthValues });
          }
        }

        const isHedgingNonZero = Object.values(hedgingCombined).some((val) => val !== 0);
        if (isHedgingNonZero) {
          rows.push({ strategyName: "Hedging", values: hedgingCombined });
        }

        const orderedMonths = Array.from(monthSet).sort((a, b) => {
          const order = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December", "YTD"
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
  }, [apiUrl, token]);

  const cellBorder = { border: "1px solid #ccc", textAlign: "center" };
  const totalRowBgColor = "#fde8b7";
  const hedgingRowBgColor = "rgb(145, 206, 137)";

  return (
    <Container maxWidth="xl" sx={{ mb: 4 }}>
      <Card
        elevation={4}
        sx={{
          background: "linear-gradient(to right, #e0f7fa, #f1f8e9)",
          borderRadius: 3,
          p: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: "bold",
            color: "#002060",
            textAlign: "center",
          }}
        >
          Equities Detailed Strategy-wise
        </Typography>

        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            overflowX: "auto",
            maxHeight: 600,
            boxShadow: 2,
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small" sx={{ borderCollapse: "collapse", minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#002060" }}>
                  <TableCell sx={{ color: "#ffffff", ...cellBorder, fontWeight: "bold" }}>
                    Strategy
                  </TableCell>
                  {months.map((month) => (
                    <TableCell key={month} align="center" sx={{ color: "#ffffff", ...cellBorder, fontWeight: "bold" }}>
                      {month}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {strategyOrder.map((strategy) => {
                  const row = data.find((d) => d.strategyName === strategy);
                  if (!row) return null;

                  const isHedgingRow = strategy === "Hedging";
                  return (
                    <TableRow
                      key={strategy}
                      sx={{
                        backgroundColor: isHedgingRow ? hedgingRowBgColor : undefined,
                        "&:hover": { backgroundColor: "#f5f5f5" },
                      }}
                    >
                      <TableCell sx={{ ...cellBorder, fontWeight: "bold" }}>{strategy}</TableCell>
                      {months.map((m) => (
                        <TableCell key={m} sx={cellBorder}>
                          {formatCurrency(row.values[m] ?? 0)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}

                {/* Overall total row */}
                <TableRow key="overall-total" sx={{ backgroundColor: totalRowBgColor }}>
                  <TableCell sx={{ ...cellBorder, fontWeight: "bold" }}>Overall Total</TableCell>
                  {months.map((m) => {
                    const total = data.reduce((sum, row) => sum + (row.values[m] ?? 0), 0);
                    return (
                      <TableCell key={m} sx={cellBorder}>
                        <b>{formatCurrency(total)}</b>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Card>
    </Container>
  );
};

export default DealTypeTable;
