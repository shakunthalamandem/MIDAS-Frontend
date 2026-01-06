import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Typography, Container, Box, Card,
} from "@mui/material";

type SectorData = {
  [month: string]: number;
};

type ApiResponse = {
  [sectorName: string]: SectorData;
};

type YearlyApiResponse = {
  [year: string]: ApiResponse;
};

interface TableRowData {
  sectorName: string;
  values: { [month: string]: number };
}

interface EquityPNLSectorWiseTableProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
}

const formatCurrency = (value: number): string => {
  const absValue = Math.abs(value);
  const suffix = absValue >= 1_000_000 ? "M" : absValue >= 1_000 ? "K" : "";
  const divisor = suffix === "M" ? 1_000_000 : suffix === "K" ? 1_000 : 1;
  const formatted = (absValue / divisor).toFixed(2);
  return `${value < 0 ? "-" : ""}$${formatted}${suffix}`;
};

const EquityPNLSectorWiseTable: React.FC<EquityPNLSectorWiseTableProps> = ({
  selectedYear,
  onYearChange: _onYearChange,
}) => {
  const [data, setData] = useState<TableRowData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/pnl_by_sector/`, {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ year: Number(selectedYear) }),
        });
        const result: YearlyApiResponse = await res.json();
        const yearData = result[selectedYear] || {};

        const rows: TableRowData[] = [];
        const monthSet: Set<string> = new Set();

        for (const [sectorName, monthValues] of Object.entries(yearData)) {
          const isAllZero = Object.values(monthValues).every((val) => !val || val === 0);
          if (!isAllZero) {
            Object.keys(monthValues).forEach((m) => monthSet.add(m));
            rows.push({ sectorName, values: monthValues });
          }
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
  }, [apiUrl, token, selectedYear]);

  const cellBorder = { border: "1px solid #ccc", textAlign: "center" };
  const totalRowBgColor = "#e0f2f1";
  const hedgingRowBgColor = "#ffe0b2";

  // Sort sectors alphabetically, with "Hedging" always last
  const sortedData = [
    ...data.filter((d) => d.sectorName !== "Hedging").sort((a, b) => a.sectorName.localeCompare(b.sectorName)),
    ...data.filter((d) => d.sectorName === "Hedging")
  ];

  return (
    <Container maxWidth="xl" sx={{ mb: 4 }}>
      <Card
        elevation={4}
        sx={{
          background: "linear-gradient(to right, #f9fbe7, #e8f5e9)",
          borderRadius: 3,
          p: 3,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#002060",
              textAlign: "center",
            }}
          >
            Equities Detailed Sector-wise
          </Typography>
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            mt: 2,
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
                    Sector
                  </TableCell>
                  {months.map((month) => (
                    <TableCell
                      key={month}
                      align="center"
                      sx={{ color: "#ffffff", ...cellBorder, fontWeight: "bold" }}
                    >
                      {month}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map((row) => (
                  <TableRow
                    key={row.sectorName}
                    sx={{
                      backgroundColor: row.sectorName === "Hedging" ? hedgingRowBgColor : undefined,
                      "&:hover": { backgroundColor: "#f0f0f0" },
                    }}
                  >
                    <TableCell sx={{ ...cellBorder, fontWeight: "bold" }}>{row.sectorName}</TableCell>
                    {months.map((m) => (
                      <TableCell key={m} sx={cellBorder}>
                        {formatCurrency(row.values[m] ?? 0)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

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

export default EquityPNLSectorWiseTable;
