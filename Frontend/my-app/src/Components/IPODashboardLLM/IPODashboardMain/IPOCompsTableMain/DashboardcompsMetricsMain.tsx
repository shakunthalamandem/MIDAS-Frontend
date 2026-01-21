import React, { useState, useEffect, useMemo } from "react";
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
import { createColumns } from "./columns";
import { formatValue } from "./formatValue";
import { addCompetitor, deleteCompetitor, updateRow } from "./Services/api";

type ComparableMetric = any;
type AveragesType = { [key: string]: { average?: number; median?: number } };
type ApiResponse = {
  [ticker: string]: { data: ComparableMetric[]; Averages?: AveragesType };
};

interface Props {
  ticker: string;
  data: ApiResponse;
  onRefresh?: () => Promise<void> | void;
  onPeersUpdated?: () => void;
  pricingYear?: number;
}

const DashboardcompsMetricsMain: React.FC<Props> = ({
  ticker,
  data,
  onRefresh,
  onPeersUpdated,
  pricingYear,
}) => {
  const [rows, setRows] = useState<ComparableMetric[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // 🔹 state for delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    row: ComparableMetric | null;
    index: number | null;
  }>({
    open: false,
    row: null,
    index: null,
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
    try {
      await updateRow(rows[idx]);
      setEditIndex(null);
      setSnackbar({
        open: true,
        message: "Row updated successfully",
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  // 🔹 open confirmation dialog
  const handleDeleteRow = (row: ComparableMetric, rowIndex: number) => {
    setDeleteDialog({ open: true, row, index: rowIndex });
  };

  const handleChangeCell = (rowIndex: number, key: string, value: string) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[rowIndex] = { ...copy[rowIndex], [key]: value };
      return copy;
    });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.row || deleteDialog.index === null) return;
    try {
      await deleteCompetitor(
        deleteDialog.row.ticker,
        deleteDialog.row.competitor
      );

      // refresh if callback provided
      if (onRefresh) {
        try {
          await onRefresh();
          onPeersUpdated?.();
        } catch (refreshErr: any) {
          console.error("Error refreshing competitor metrics:", refreshErr);
          setSnackbar({
            open: true,
            message:
              refreshErr?.message ||
              "Competitor deleted, but failed to refresh the latest metrics.",
            severity: "error",
          });
          return;
        }
      } else {
        // fallback: update local state only
        setRows((prev) => prev.filter((_, idx) => idx !== deleteDialog.index));
        onPeersUpdated?.();
      }

      setSnackbar({
        open: true,
        message: "Competitor deleted permanently",
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally {
      setDeleteDialog({ open: false, row: null, index: null });
    }
  };

  const handleAddCompetitor = async (competitorTicker: string) => {
    const exists = rows.some(
      (row) => row.competitor.toLowerCase() === competitorTicker.toLowerCase()
    );
    if (exists) {
      setSnackbar({
        open: true,
        message: "Competitor already exists!",
        severity: "error",
      });
      return;
    }

    try {
      const result = await addCompetitor(ticker, competitorTicker);

      setRows((prev) => [...prev, result.record]);

      if (onRefresh) {
        try {
          await onRefresh();
          onPeersUpdated?.();
        } catch (refreshErr: any) {
          console.error("Error refreshing competitor metrics:", refreshErr);
          setSnackbar({
            open: true,
            message:
              refreshErr?.message ||
              "Competitor added, but failed to refresh the latest metrics.",
            severity: "error",
          });
          return;
        }
      } else {
        onPeersUpdated?.();
      }

      setSnackbar({
        open: true,
        message: "Competitor added successfully!",
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Error adding competitor",
        severity: "error",
      });
    } finally {
    }
  };

  const tableColumns = useMemo(() => createColumns(pricingYear), [pricingYear]);
  const headerCellSx = {
    color: "white",
    fontWeight: 600,
    textAlign: "center",
    fontSize: "0.7rem",
    padding: "6px 8px",
    lineHeight: 1.2,
    whiteSpace: "normal",
    wordBreak: "break-word",
  };
  const bodyCellSx = {
    fontSize: "0.75rem",
    padding: "6px 8px",
    lineHeight: 1.2,
    whiteSpace: "nowrap",
  };

  return (
    <Box style={{ marginTop: 20, overflow: "auto" }}>
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
        <CompetitorSearch onSelect={handleAddCompetitor} />
      </Box>

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table size="small" sx={{ tableLayout: "fixed" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#002060" }}>
              {tableColumns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{
                    ...headerCellSx,
                    minWidth: col.minWidth ? Math.max(55, col.minWidth - 20) : 55,
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
              <TableCell
                sx={{ ...headerCellSx, minWidth: 55 }}
              >
                Action
              </TableCell>
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
                onChangeCell={handleChangeCell}
                columns={tableColumns}
                formatValue={formatValue}
              />
            ))}
            {/* Append Average and Median rows with heading */}
            {data[ticker]?.Averages &&
              ["average", "median"].map((type) => (
                <TableRow key={type} sx={{ backgroundColor: "#f5f5f5" }}>
                  {tableColumns.map((col, colIdx) => {
                    if (colIdx === 0) {
                      return (
                        <TableCell
                          key={col.key}
                          colSpan={4}
                          align="center"
                          sx={{
                            ...bodyCellSx,
                            fontWeight: "bold",
                            color: "primary.main",
                          }}
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
                        <TableCell key={col.key} align="center" sx={bodyCellSx}>
                          {formatValue(col.key, avgValue)}
                        </TableCell>
                      );
                    }

                    return null;
                  })}
                  <TableCell sx={bodyCellSx} />
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 🔹 Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog.open}
        competitor={deleteDialog.row?.competitor}
        onCancel={() =>
          setDeleteDialog({ open: false, row: null, index: null })
        }
        onConfirm={confirmDelete}
      />

      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default DashboardcompsMetricsMain;
