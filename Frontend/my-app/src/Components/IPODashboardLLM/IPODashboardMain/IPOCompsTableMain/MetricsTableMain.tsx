import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,

} from "@mui/material";
import CompetitorSearch from "./CompetitorSearch";
import MetricsRow from "./MetricsRow";
import SnackbarAlert from "./SnackbarAlert";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { columns } from "./columns";
import { formatValue } from "./formatValue";
import { addCompetitor, deleteCompetitor, updateRow } from "./Services/api";

type ComparableMetric = any;
type AveragesType = { [key: string]: { average?: number; median?: number } };
type ApiResponse = { [ticker: string]: { data: ComparableMetric[]; Averages?: AveragesType } };

interface Props {
  ticker: string;
  data: ApiResponse;
}

const MetricsTableMain: React.FC<Props> = ({ ticker, data }) => {
  const [rows, setRows] = useState<ComparableMetric[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  // 🔹 state for delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; row: ComparableMetric | null; index: number | null }>({
    open: false,
    row: null,
    index: null,
  });

  useEffect(() => {
    const allRows = data[ticker]?.data || [];
    const highlightRow = allRows.find((r) => r.ticker === r.competitor || r.competitor.startsWith(r.ticker));
    const otherRows = allRows.filter((r) => !highlightRow || r !== highlightRow);
    setRows(highlightRow ? [highlightRow, ...otherRows] : otherRows);
  }, [data, ticker]);

  const handleSave = async (idx: number) => {
    try {
      await updateRow(rows[idx]);
      setEditIndex(null);
      setSnackbar({ open: true, message: "Row updated successfully", severity: "success" });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  // 🔹 open confirmation dialog
  const handleDeleteRow = (row: ComparableMetric, rowIndex: number) => {
    setDeleteDialog({ open: true, row, index: rowIndex });
  };

  // 🔹 confirm delete action
  const confirmDelete = async () => {
    if (!deleteDialog.row || deleteDialog.index === null) return;
    try {
      await deleteCompetitor(deleteDialog.row.ticker, deleteDialog.row.competitor);
      setRows((prev) => prev.filter((_, idx) => idx !== deleteDialog.index));
      setSnackbar({ open: true, message: "Competitor deleted permanently", severity: "success" });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setDeleteDialog({ open: false, row: null, index: null });
    }
  };

  const handleAddCompetitor = async (competitorTicker: string) => {
    try {
      const result = await addCompetitor(ticker, competitorTicker);
      setRows((prev) => [...prev, result.record]);
      setSnackbar({ open: true, message: "Competitor added", severity: "success" });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" color="#002060" fontWeight={600}>
          Comparative Trading Multiples & Performance Metrics
        </Typography>
        <CompetitorSearch onSelect={handleAddCompetitor} />
      </Box>

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#002060" }}>
              {columns.map((col) => (
                <TableCell key={col.key} sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                  {col.label}
                </TableCell>
              ))}
              <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, idx) => (
              <MetricsRow
                key={`${row.ticker}-${row.competitor}`}
                row={row}
                idx={idx}
                editIndex={editIndex}
                setEditIndex={setEditIndex}
                onSave={handleSave}
                onDelete={handleDeleteRow}  
                columns={columns}
                formatValue={formatValue}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 🔹 Delete Confirmation Dialog */}
    <DeleteConfirmDialog
  open={deleteDialog.open}
  competitor={deleteDialog.row?.competitor}
  onCancel={() => setDeleteDialog({ open: false, row: null, index: null })}
  onConfirm={confirmDelete}
/>

      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
};

export default MetricsTableMain;
