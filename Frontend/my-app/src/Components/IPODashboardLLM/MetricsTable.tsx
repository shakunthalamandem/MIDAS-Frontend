import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Edit, Save, Delete } from "@mui/icons-material";

type ComparableMetric = any;

type AveragesType = {
  [key: string]: { average?: number; median?: number };
};

type ApiResponse = {
  [ticker: string]: { data: ComparableMetric[]; Averages?: AveragesType };
};

interface Props {
  ticker: string;
  data: ApiResponse;
}

const columns = [
  { key: "competitor", label: "Ticker", minWidth: 100 },
  { key: "price_usd", label: "Price (USD)" },
  { key: "market_cap", label: "Market Cap (USDm)" },
  { key: "ev_usd_million", label: "EV (USDm)" },
  { key: "present_year_ev_sales", label: "2025 EV/Sales" },
  { key: "one_year_later_ev_sales", label: "2026 EV/Sales" },
  { key: "present_year_price_earning", label: "2025 P/E" },
  { key: "one_year_later_price_earning", label: "2026 P/E" },
  { key: "present_year_ev_fcf", label: "2025 EV/EBITDA" },
  { key: "one_year_later_ev_fcf", label: "2026 EV/EBITDA" },
  { key: "sales_growth", label: "Sales Growth (25-26)" },
  { key: "eps_growth", label: "EPS Growth (25-26)" },
];

// Helper to format values
const formatValue = (key: string, value: number | string) => {
  if (value === null || value === undefined || value === "") return "N/A";

  const negativeColumns = [
    "present_year_ev_sales",
    "one_year_later_ev_sales",
    "present_year_price_earning",
    "one_year_later_price_earning",
    "present_year_ev_fcf",
    "one_year_later_ev_fcf",
  ];
  const percentageColumns = ["sales_growth", "eps_growth"];
  const numberColumns = ["market_cap", "ev_usd_million"];

  if (typeof value === "string") return value;

  if (percentageColumns.includes(key) && value > 500) return "N/A";
  if (negativeColumns.includes(key))
    return value < 0 ? "N/A" : `${Math.round(value * 10) / 10}x`;
  if (percentageColumns.includes(key))
    return value < 0 ? "N/A" : `${Math.round(value * 10) / 10}%`;
  if (numberColumns.includes(key))
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(
      value
    );

  return value;
};

const MetricsTable: React.FC<Props> = ({ ticker, data }) => {
  const [rows, setRows] = useState<ComparableMetric[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newCompetitor, setNewCompetitor] = useState("");
  const [adding, setAdding] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const allRows = data[ticker]?.data || [];
    const highlightRow = allRows.find(
      (r) => r.ticker === r.competitor || r.competitor.startsWith(r.ticker)
    );
    const otherRows = allRows.filter(
      (r) => !highlightRow || r !== highlightRow
    );
    setRows(highlightRow ? [highlightRow, ...otherRows] : otherRows);
  }, [data, ticker]);

  const handleSave = async (idx: number) => {
    const updatedRow = { ...rows[idx] };

    // Convert numeric fields back to numbers before sending to API and storing
    const numericColumns = [
      "present_year_ev_sales",
      "one_year_later_ev_sales",
      "present_year_price_earning",
      "one_year_later_price_earning",
      "present_year_ev_fcf",
      "one_year_later_ev_fcf",
      "sales_growth",
      "eps_growth",
      "market_cap",
      "ev_usd_million",
      "price_usd",
    ];

    numericColumns.forEach((key) => {
      if (
        updatedRow[key] !== "" &&
        updatedRow[key] !== null &&
        updatedRow[key] !== undefined
      ) {
        updatedRow[key] = Number(updatedRow[key]);
      }
    });

    const apiUrl = process.env.REACT_APP_API_URL!;
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`${apiUrl}/api/fs_fundamental_data_upload/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(updatedRow),
      });

      if (!res.ok) throw new Error(`Failed to update row: ${res.status}`);

      // Update row in state with proper number types so formatValue works
      setRows((prev) => {
        const copy = [...prev];
        copy[idx] = updatedRow;
        return copy;
      });

      setEditIndex(null);
    } catch (error) {
      console.error("Error updating row:", error);
    }
  };

  // Delete other rows
  const handleDeleteRow = async (row: ComparableMetric, rowIndex: number) => {
    const apiUrl = process.env.REACT_APP_API_URL!;
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`${apiUrl}/api/fs_ticker_competitor_delete/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          ticker: row.ticker,
          competitor: row.competitor,
        }),
      });

      if (!res.ok)
        throw new Error(`Failed to delete competitor: ${res.status}`);
      setRows((prev) => prev.filter((_, idx) => idx !== rowIndex));
    } catch (error) {
      console.error("Error deleting competitor:", error);
    }
  };

  const handleAddRow = async () => {
    if (!newCompetitor) return;

    const exists = rows.some(
      (row) => row.competitor.toLowerCase() === newCompetitor.toLowerCase()
    );
    if (exists) {
      setSnackbar({
        open: true,
        message: "Competitor already exists!",
        severity: "error",
      });
      return;
    }

    setAdding(true); // start loading
    const apiUrl = process.env.REACT_APP_API_URL!;
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`${apiUrl}/api/fs_ticker_competitor_insert/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ ticker, competitor: newCompetitor }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData?.detail || `Failed to add competitor: ${res.status}`
        );
      }

      const result = await res.json();
      setRows((prev) => [...prev, result.record]);
      setNewCompetitor("");

      setSnackbar({
        open: true,
        message: "Competitor added successfully!",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || "Error adding competitor",
        severity: "error",
      });
    } finally {
      setAdding(false); // stop loading
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" color="#002060" fontWeight={600}>
          Comparative Trading Multiples & Performance Metrics
        </Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            size="small"
            label="Add Competitor"
            value={newCompetitor}
            onChange={(e) => setNewCompetitor(e.target.value)}
          />
          <Button
            onClick={handleAddRow}
            sx={{ backgroundColor: "#002060", color: "white", minWidth: 80 }}
            variant="contained"
            disabled={adding} // disable while loading
          >
            {adding ? <CircularProgress size={20} color="inherit" /> : "Add"}
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#002060" }}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                    minWidth: col.minWidth || 70,
                  }}
                  
                >
                  {col.label}
                </TableCell>
              ))}
              <TableCell
                sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, idx) => {
              const isFirstRow =
                idx === 0 &&
                (row.ticker === row.competitor ||
                  row.competitor.startsWith(row.ticker));

              return (
                <TableRow
                  key={`${row.ticker}-${row.competitor}`}
                  sx={{ backgroundColor: isFirstRow ? "#f2e1d9ff" : "inherit" }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} align="center">
                      {isFirstRow &&
                      editIndex === idx &&
                      col.key !== "competitor" ? (
                        <TextField
                          value={row[col.key]}
                          size="small"
                          onChange={(e) => {
                            const val = e.target.value;
                            setRows((prev) => {
                              const copy = [...prev];
                              copy[idx][col.key] = val;
                              return copy;
                            });
                          }}
                        />
                      ) : (
                        formatValue(col.key, row[col.key])
                      )}
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    {isFirstRow ? (
                      editIndex === idx ? (
                        <IconButton
                          onClick={() => handleSave(idx)}
                          sx={{ color: "#002060" }}
                        >
                          <Save fontSize="small" />
                        </IconButton>
                      ) : (
                        <IconButton
                          onClick={() => setEditIndex(idx)}
                          sx={{ color: "#002060" }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      )
                    ) : (
                      <IconButton
                        onClick={() => handleDeleteRow(row, idx)}
                        sx={{ color: "red" }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Append Average and Median rows with heading */}
            {data[ticker]?.Averages &&
              ["average", "median"].map((type) => (
                <TableRow key={type} sx={{ backgroundColor: "#f5f5f5" }}>
                  {columns.map((col, colIdx) => {
                    if (colIdx === 0) {
                      return (
                        <TableCell
                          key={col.key}
                          colSpan={4}
                          align="center"
                          sx={{ fontWeight: "bold", color: "primary.main" }}
                        >
                          {type === "average"
                            ? "Overall Average"
                            : "Overall Median"}
                        </TableCell>
                      );
                    }

                    if (colIdx > 3) {
                      const avgValue: number | string =
                        data[ticker].Averages?.[col.key]?.[
                          type as "average" | "median"
                        ] ?? "N/A";
                      return (
                        <TableCell key={col.key} align="center">
                          {formatValue(col.key, avgValue)}
                        </TableCell>
                      );
                    }

                    return null;
                  })}
                  <TableCell />
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MetricsTable;
