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
import { ColumnDef, createColumns } from "../../../IPODashboardLLM/IPODashboardMain/IPOCompsTableMain/columns";
import CompetitorSearch from "../../../IPODashboardLLM/IPODashboardMain/IPOCompsTableMain/CompetitorSearch";
import DeleteConfirmDialog from "../../../IPODashboardLLM/IPODashboardMain/IPOCompsTableMain/DeleteConfirmDialog";
import MetricsRow from "../../../IPODashboardLLM/IPODashboardMain/IPOCompsTableMain/MetricsRow";
import { updateRow, deleteCompetitor, addCompetitor } from "../../../IPODashboardLLM/IPODashboardMain/IPOCompsTableMain/Services/api";
import SnackbarAlert from "../../../IPODashboardLLM/IPODashboardMain/IPOCompsTableMain/SnackbarAlert";
import { FOformatValue } from "../../../Main/FOWriteUpMain/FOWriteSections/FOComparisionData/FOformatValues";



type ComparableMetric = any;
type AveragesType = { [key: string]: { average?: number; median?: number } };
type ApiResponse = {
  [ticker: string]: { data: ComparableMetric[]; Averages?: AveragesType };
};

interface Props {
  ticker: string;
  data: ApiResponse;
  onRefresh?: () => Promise<void> | void;
  pricingYear?: number;
}
const FOWriteUpCompsTableMainData: React.FC<Props> = ({ ticker, data, onRefresh, pricingYear }) => {
  const showActions = true;
  const [rows, setRows] = useState<ComparableMetric[]>([]);
  const columns: ColumnDef[] = useMemo(() => createColumns(pricingYear), [pricingYear]);
  
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
    await deleteCompetitor(deleteDialog.row.ticker, deleteDialog.row.competitor);

    // refresh if callback provided
    if (onRefresh) {
      try {
        await onRefresh();
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

  return (
    <div style={{ marginTop: 20, marginBottom: 20 }}>
      <Box
        sx={{
          display: "flex",
        justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" color="#002060" fontWeight={600}>
          Comparative Trading Multiples & Performance 
        </Typography>
        <CompetitorSearch onSelect={handleAddCompetitor} />
      </Box>

      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          borderRadius: 2,
          maxWidth: 1100,
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            height: 6,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f0f0f0",
            borderRadius: 3,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#b0b0b0",
            borderRadius: 3,
            "&:hover": {
              backgroundColor: "#888",
            },
          },
        }}
      >
        <Table size="small" sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#002060" }}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                    minWidth: col.minWidth || 60,
                    fontSize: 12,
                    padding: "6px 8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
              {showActions && (
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                    minWidth: 60,
                    fontSize: 12,
                    padding: "6px 8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Action
                </TableCell>
              )}
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
                columns={columns}
                formatValue={FOformatValue}
                showActions={showActions}
              />
            ))}
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
                          {FOformatValue(col.key, avgValue)}
                        </TableCell>
                      );
                    }

                    return null;
                  })}
                  {showActions && <TableCell />}
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
    </div>
  );
};

export default FOWriteUpCompsTableMainData;
