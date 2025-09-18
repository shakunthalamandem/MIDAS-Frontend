import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import TableRowComponent from "./TableRowComponent";

type ComparableMetric = any;
type AveragesType = { [key: string]: { average?: number; median?: number } };
type ApiResponse = {
  [ticker: string]: { data: ComparableMetric[]; Averages?: AveragesType };
};

interface Props {
  ticker: string;
  data: ApiResponse;
}

const columns = [
  { key: "competitor", label: "Ticker" },
  { key: "price_usd", label: "Price (USD)" },
  { key: "market_cap", label: "Market Cap" },
  { key: "ev_usd_million", label: "EV" },
  { key: "present_year_ev_sales", label: "2025 EV/Sales" },
  { key: "one_year_later_ev_sales", label: "2026 EV/Sales" },
  { key: "present_year_price_earning", label: "2025 P/E" },
  { key: "one_year_later_price_earning", label: "2026 P/E" },
  { key: "present_year_ev_fcf", label: "2025 EV/EBITDA" },
  { key: "one_year_later_ev_fcf", label: "2026 EV/EBITDA" },
  { key: "sales_growth", label: "Sales Growth" },
  { key: "eps_growth", label: "EPS Growth" },
];

const MetricsTable: React.FC<Props> = ({ ticker, data }) => {
  const [rows, setRows] = useState<ComparableMetric[]>(data[ticker]?.data || []);
  const [newCompetitor, setNewCompetitor] = useState("");

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
        body: JSON.stringify({
          ticker,
          competitor: newCompetitor,
        }),
      });

      if (!res.ok) throw new Error(`Failed to add competitor: ${res.status}`);

      const result = await res.json();
      const newRow = result.record;

      setRows((prev) => [...prev, newRow]);
      setNewCompetitor("");
    } catch (error) {
      console.error("Error adding competitor:", error);
    }
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
      body: JSON.stringify({
        ticker: row.ticker,
        competitor: row.competitor,
      }),
    });

    if (!res.ok) throw new Error(`Failed to delete competitor: ${res.status}`);

    setRows((prev) => prev.filter((_, idx) => idx !== rowIndex));
  } catch (error) {
    console.error("Error deleting competitor:", error);
  }
};


  return (
    <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead sx={{ backgroundColor: "#002060" }}>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.key}
                sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}
              >
                {col.label}
              </TableCell>
            ))}
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
         {rows.map((row, idx) => (
  <TableRowComponent
    key={`${row.ticker}-${row.competitor}`}
    row={row}
    columns={columns}
    onDelete={() => handleDeleteRow(row, idx)}
  />
))}
          {/* Add new row input */}
          <TableRow>
            <TableCell colSpan={columns.length} align="center">
              <TextField
                size="small"
                placeholder="Enter competitor ticker"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
              />
            </TableCell>
            <TableCell align="center">
              <IconButton onClick={handleAddRow} color="primary">
                <Add />
              </IconButton>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MetricsTable;
