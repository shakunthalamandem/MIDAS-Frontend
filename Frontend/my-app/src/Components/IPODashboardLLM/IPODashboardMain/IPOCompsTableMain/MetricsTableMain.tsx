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
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import CompetitorSearch from "./CompetitorSearch";
import MetricsRow from "./MetricsRow";
import SnackbarAlert from "./SnackbarAlert";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { createColumns } from "./columns";
import { formatValue } from "./formatValue";
import { addCompetitor, deleteCompetitor, updateRow } from "./Services/api";
import StarRateOutlinedIcon from "@mui/icons-material/StarRateOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

const parseRatingValue = (value?: number | string | null) => {
  if (value === undefined || value === null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^-?\d+(\.\d+)?/);
  if (match) {
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : null;
  }
  const fallback = Number(trimmed);
  return Number.isFinite(fallback) ? fallback : null;
};

const formatRatingValue = (value: number) => {
  const normalized = Math.round(value * 10) / 10;
  return Number.isInteger(normalized) ? `${normalized}` : normalized.toFixed(1);
};

type ComparableMetric = any;
type AveragesType = { [key: string]: { average?: number; median?: number } };
type ApiResponse = {
  [ticker: string]: { data: ComparableMetric[]; Averages?: AveragesType; latest_updated_at?: string };
};

interface Props {
  ticker: string;
  data: ApiResponse;
  onRefresh?: () => Promise<void> | void;
  onPeersUpdated?: () => void;
  pricingYear?: number;
}

const MetricsTableMain: React.FC<Props> = ({
  ticker,
  data,
  onRefresh,
  onPeersUpdated,
  pricingYear,
}) => {
  const [rows, setRows] = useState<ComparableMetric[]>([]);
  const [ratingText, setRatingText] = useState<string | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
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

  useEffect(() => {
    let active = true;
    const apiUrl = process.env.REACT_APP_API_URL;
    if (!ticker || !apiUrl) return;

    const fetchRating = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        };

        const res = await fetch(`${apiUrl}/api/writeup_data/`, {
          method: "POST",
          headers,
          body: JSON.stringify({ ticker })
        });

        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;

        const incoming =
          (data?.writeup_ratings as Record<string, any>) ??
          data?.section_scores ??
          data?.final_verdict_section_scores ??
          {};
        const parsed = parseRatingValue(incoming?.["comps"] ?? incoming?.["key-metrics"]);
        if (parsed !== null) {
          setRatingText(formatRatingValue(parsed));
        }
      } catch (err) {
        console.error("Failed to fetch rating", err);
      }
    };

    fetchRating();

    // Listen for ratings update event from Final Verdict
    const handleRatingsUpdate = () => {
      fetchRating();
    };

    window.addEventListener('ratingsUpdated', handleRatingsUpdate);

    return () => {
      active = false;
      window.removeEventListener('ratingsUpdated', handleRatingsUpdate);
    };
  }, [ticker]);

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

  const handleRefreshComps = async () => {
    setRefreshing(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${apiUrl}/api/fs_ticker_competitor_update/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ ticker }),
      });
      if (!res.ok) throw new Error("Failed to refresh comps data");
      setSnackbar({ open: true, message: "Comps data refreshed successfully!", severity: "success" });
      if (onRefresh) await onRefresh();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Error refreshing comps data", severity: "error" });
    } finally {
      setRefreshing(false);
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
      <Box sx={{ position: "relative", mb: 2 }}>
        {/* Rating - Left aligned */}
        {ratingText && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              borderRadius: 999,
              border: "1px solid rgba(52, 144, 220, 0.4)",
              background: "linear-gradient(135deg, #e9f2ff, #ffffff)",
              px: 1.5,
              py: 0.4,
              boxShadow: "0 4px 10px rgba(15, 81, 166, 0.08)"
            }}
          >
            <StarRateOutlinedIcon fontSize="small" sx={{ color: "#0d4dec" }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#0d4dec" }}>
              Rating - {ratingText}/10
            </Typography>
          </Box>
        )}

        {/* Heading - Center aligned */}
        <Box sx={{ display: "flex", justifyContent: "center",          paddingTop:1
 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#124180" }}>
            Comparative Trading Multiples
          </Typography>
        </Box>

        {/* Search - Right aligned */}
        <Box sx={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
          <CompetitorSearch onSelect={handleAddCompetitor} />
        </Box>
      </Box>

      {/* Updated + Refresh - Below heading, right aligned */}
      <Box className="pdf-hidden" sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 0.5, mb: 0.5 }}>
        {data[ticker]?.latest_updated_at && (
          <Typography sx={{ fontSize: 11, color: "#888", whiteSpace: "nowrap", fontStyle: "italic" }}>
            Last updated: {data[ticker].latest_updated_at}
          </Typography>
        )}
        <Tooltip title="Refresh comps data">
          <IconButton
            size="small"
            onClick={handleRefreshComps}
            disabled={refreshing}
            sx={{
              color: "#124180",
              p: 0.3,
              "&:hover": { color: "#002060", backgroundColor: "rgba(18,65,128,0.1)" },
            }}
          >
            {refreshing ? <CircularProgress size={14} /> : <RefreshIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Tooltip>
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
                className="pdf-hidden"
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
export default MetricsTableMain;
