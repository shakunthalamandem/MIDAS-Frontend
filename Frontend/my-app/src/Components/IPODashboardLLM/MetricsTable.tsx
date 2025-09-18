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
} from "@mui/material";
import { Edit, Save, Delete } from "@mui/icons-material";

type ComparableMetric = any;
type ApiResponse = {
  [ticker: string]: { data: ComparableMetric[] };
};

interface Props {
  ticker: string;
  data: ApiResponse;
}

const columns = [
  { key: "competitor", label: "Competitor" },
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

const formatValue = (key: string, value: number) => {
  if (value === null || value === undefined) return "N/A";

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

  if (negativeColumns.includes(key)) return value < 0 ? "N/A" : `${Math.round(value * 10) / 10}x`;
  if (percentageColumns.includes(key)) return value < 0 ? "N/A" : `${Math.round(value * 10) / 10}%`;
  if (numberColumns.includes(key)) return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);

  return value;
};

const MetricsTable: React.FC<Props> = ({ ticker, data }) => {
  const [rows, setRows] = useState<ComparableMetric[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newCompetitor, setNewCompetitor] = useState("");

  // Move highlighted row to top
  useEffect(() => {
    const allRows = data[ticker]?.data || [];
    const highlightRow = allRows.find(
      (r) => r.ticker === r.competitor || r.competitor.startsWith(r.ticker)
    );
    const otherRows = allRows.filter((r) => !highlightRow || r !== highlightRow);
    setRows(highlightRow ? [highlightRow, ...otherRows] : otherRows);
  }, [data, ticker]);

  const handleSave = (idx: number) => {
    setEditIndex(null);
    // TODO: Call API to save updated row if needed
  };

  const handleDeleteRow = async (row: ComparableMetric, rowIndex: number) => {
    const apiUrl = process.env.REACT_APP_API_URL!;
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`${apiUrl}/api/fs_ticker_competitor_delete/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ ticker: row.ticker, competitor: row.competitor }),
      });

      if (!res.ok) throw new Error(`Failed to delete competitor: ${res.status}`);
      setRows((prev) => prev.filter((_, idx) => idx !== rowIndex));
    } catch (error) {
      console.error("Error deleting competitor:", error);
    }
  };

  const handleAddRow = async () => {
    if (!newCompetitor) return;
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

      if (!res.ok) throw new Error(`Failed to add competitor: ${res.status}`);
      const result = await res.json();
      setRows((prev) => [...prev, result.record]);
      setNewCompetitor("");
    } catch (error) {
      console.error("Error adding competitor:", error);
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      {/* Add competitor input above table */}
      <div style={{ display: "flex", marginBottom: 15, gap: 10 }}>
        <TextField
          size="small"
          label="Add Competitor"
          value={newCompetitor}
          onChange={(e) => setNewCompetitor(e.target.value)}
        />
        <Button
          onClick={handleAddRow}
          sx={{ backgroundColor: "#002060", color: "white" }}
          variant="contained"
        >
          Add
        </Button>
      </div>

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#002060" }}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}
                >
                  {col.label}
                </TableCell>
              ))}
              <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, idx) => {
              const isFirstRow = idx === 0 && (row.ticker === row.competitor || row.competitor.startsWith(row.ticker));

              return (
                <TableRow
                  key={`${row.ticker}-${row.competitor}`}
                  sx={{ backgroundColor: isFirstRow ? "#D9E1F2" : "inherit" }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} align="center">
                      {isFirstRow && editIndex === idx && col.key === "competitor" ? (
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
                        <IconButton onClick={() => handleSave(idx)} sx={{ color: "#002060" }}>
                          <Save />
                        </IconButton>
                      ) : (
                        <IconButton onClick={() => setEditIndex(idx)} sx={{ color: "#002060" }}>
                          <Edit />
                        </IconButton>
                      )
                    ) : (
                      <IconButton onClick={() => handleDeleteRow(row, idx)} sx={{ color: "red" }}>
                        <Delete />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default MetricsTable;
