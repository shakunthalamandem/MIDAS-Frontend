import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TablePagination,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";

import {
  DealUnifiedRow,
  fetchDealsData,
  createDeal,
  updateDeal,
  deleteDeal,
} from "./dealsDataService";
import DealFormDialog from "./DealFormDialog";

/** Columns shown in the main table (subset for readability). */
const TABLE_COLUMNS: { key: keyof DealUnifiedRow; label: string }[] = [
  { key: "id", label: "ID" },
  { key: "ticker", label: "Ticker" },
  { key: "issuer_name", label: "Issuer" },
  { key: "pricing_date", label: "Pricing Date" },
  { key: "region", label: "Region" },
  { key: "deal_type", label: "Deal Type" },
  { key: "sector", label: "Sector" },
  { key: "deal_size", label: "Deal Size" },
  { key: "deal_status", label: "Status" },
  { key: "lead_bank", label: "Lead Bank" },
  { key: "issue_price", label: "Issue Price" },
  { key: "market_cap", label: "Market Cap" },
  { key: "deal_captain", label: "Deal Captain" },
  { key: "exchange", label: "Exchange" },
  { key: "sponsor", label: "Sponsor" },
  { key: "allocation_amount", label: "Allocation" },
  { key: "t1d_pred", label: "T+1D Pred" },
  { key: "t1d_actual_return", label: "T+1D Actual" },
  { key: "deal_color_rating", label: "Color Rating" },
  { key: "updated_at", label: "Updated" },
];

const DealsDataDashboard: React.FC = () => {
  const [rows, setRows] = useState<DealUnifiedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState("");
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<DealUnifiedRow | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete dialog — double confirm
  const [deleteTarget, setDeleteTarget] = useState<DealUnifiedRow | null>(null);
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0); // 0=closed 1=first 2=second
  const [deleting, setDeleting] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "info" });

  const showMsg = (message: string, severity: "success" | "error" | "info" = "info") =>
    setSnackbar({ open: true, message, severity });

  // ─── Data Loading ──────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchDealsData(page + 1, pageSize, search);
      setRows(res.results);
      setTotal(res.count);
    } catch {
      showMsg("Failed to load deals data", "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounced search
  const handleSearchChange = (val: string) => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setSearch(val);
      setPage(0);
    }, 400);
  };

  // ─── Create / Edit ────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingDeal(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (row: DealUnifiedRow) => {
    setEditingDeal(row);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: Partial<DealUnifiedRow>) => {
    setSaving(true);
    try {
      if (editingDeal) {
        await updateDeal(editingDeal.id, data);
        showMsg(`Deal #${editingDeal.id} updated`, "success");
      } else {
        await createDeal(data);
        showMsg("New deal created", "success");
      }
      setFormOpen(false);
      loadData();
    } catch (err: any) {
      showMsg(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete (double confirm) ──────────────────────────────
  const handleDeleteRequest = (row: DealUnifiedRow) => {
    setDeleteTarget(row);
    setDeleteStep(1);
  };

  const handleDeleteFirstConfirm = () => {
    setDeleteStep(2);
  };

  const handleDeleteFinalConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDeal(deleteTarget.id);
      showMsg(`Deal #${deleteTarget.id} (${deleteTarget.ticker}) deleted`, "success");
      setDeleteStep(0);
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      showMsg(err.message || "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteStep(0);
    setDeleteTarget(null);
  };

  // ─── Helpers ──────────────────────────────────────────────
  const formatCell = (val: unknown): string => {
    if (val === null || val === undefined) return "—";
    if (typeof val === "number") return val.toLocaleString(undefined, { maximumFractionDigits: 4 });
    return String(val);
  };

  // ─── Render ───────────────────────────────────────────────
  return (
    <Box sx={{ bgcolor: "#f0f2f5", minHeight: "100vh", p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color="#1e293b">
            Unified Deals Data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {total} total records
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search ticker, issuer, sector..."
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "#94a3b8" }} /> }}
            sx={{ width: 280, bgcolor: "#fff", borderRadius: 1 }}
          />
          <Tooltip title="Refresh">
            <IconButton onClick={loadData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }}
          >
            New Deal
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <Paper sx={{ overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 260px)" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {TABLE_COLUMNS.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      fontWeight: 700,
                      bgcolor: "#1e293b",
                      color: "#fff",
                      whiteSpace: "nowrap",
                      fontSize: "0.75rem",
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
                <TableCell
                  sx={{
                    fontWeight: 700,
                    bgcolor: "#1e293b",
                    color: "#fff",
                    whiteSpace: "nowrap",
                    fontSize: "0.75rem",
                    position: "sticky",
                    right: 0,
                    zIndex: 3,
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={TABLE_COLUMNS.length + 1} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={TABLE_COLUMNS.length + 1} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No deals found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    {TABLE_COLUMNS.map((col) => (
                      <TableCell
                        key={col.key}
                        sx={{
                          whiteSpace: "nowrap",
                          fontSize: "0.75rem",
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {col.key === "deal_status" && row.deal_status ? (
                          <Chip
                            label={row.deal_status}
                            size="small"
                            sx={{
                              bgcolor:
                                row.deal_status === "Priced"
                                  ? "#dcfce7"
                                  : row.deal_status === "Launched"
                                  ? "#dbeafe"
                                  : "#f1f5f9",
                              color:
                                row.deal_status === "Priced"
                                  ? "#166534"
                                  : row.deal_status === "Launched"
                                  ? "#1e40af"
                                  : "#475569",
                              fontWeight: 600,
                              fontSize: "0.7rem",
                            }}
                          />
                        ) : (
                          formatCell(row[col.key])
                        )}
                      </TableCell>
                    ))}
                    <TableCell
                      sx={{
                        whiteSpace: "nowrap",
                        position: "sticky",
                        right: 0,
                        bgcolor: "#fff",
                        zIndex: 1,
                      }}
                    >
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenEdit(row)}>
                          <EditIcon fontSize="small" sx={{ color: "#3b82f6" }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteRequest(row)}>
                          <DeleteIcon fontSize="small" sx={{ color: "#ef4444" }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[25, 50, 100]}
        />
      </Paper>

      {/* ─── Create / Edit Dialog ──────────────────────────── */}
      <DealFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={loadData}
        existingDeal={editingDeal}
        saving={saving}
        onSubmit={handleFormSubmit}
      />

      {/* ─── Delete Confirmation Step 1 ──────────────────────── */}
      <Dialog open={deleteStep === 1} onClose={handleDeleteCancel}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Deal?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete deal{" "}
            <strong>#{deleteTarget?.id}</strong> ({deleteTarget?.ticker || "N/A"} —{" "}
            {deleteTarget?.issuer_name || "N/A"})?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteFirstConfirm}
          >
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Delete Confirmation Step 2 (Final) ──────────────── */}
      <Dialog open={deleteStep === 2} onClose={handleDeleteCancel}>
        <DialogTitle sx={{ fontWeight: 700, color: "#dc2626" }}>
          Final Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action is <strong>irreversible</strong>. Deal{" "}
            <strong>#{deleteTarget?.id}</strong> ({deleteTarget?.ticker}) will be
            permanently deleted. Are you absolutely sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteFinalConfirm}
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} /> : "Permanently Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Snackbar ──────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DealsDataDashboard;
