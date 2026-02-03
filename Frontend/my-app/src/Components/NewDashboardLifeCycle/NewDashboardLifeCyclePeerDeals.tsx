import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Link,
  Autocomplete,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogContent,
  DialogActions,
  Fade,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

// ─── types ───────────────────────────────────────────────────────────────────
type PeerRow = {
  ticker: string;
  issuer_name: string;
  pricing_date: string;
  deal_type: string;
  number_of_shares_offered: number;
  issue_offer_price: number;
  deal_size: number;
  allocation_deal_size_percentage: number;
  allocation_percentage: number;
  t1d_return_from_bloomberg: number;
  t1w_percent_change: number;
  t1m_return_from_bloomberg: number;
};

type PeerSummary = {
  average_deal_size: number;
  avg_allocation_as_percent_of_deal_size: number;
  avg_allocation_of_ioi: number;
  avg_t1d_return: number;
  avg_t1w_return: number;
  avg_t1m_return: number;
};

type ApiResponse = {
  data: PeerRow[];
  summary: PeerSummary;
};

/** What the confirmation dialog needs to know */
type ConfirmPayload = {
  action: "add" | "delete";
  peerTicker: string;
};

interface NewDashboardLifeCyclePeerDealsProps {
  selectedDeal?: { ticker?: string };
  ticker?: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────
const cleanNumber = (v: any): number => {
  if (v == null || v === "") return 0;
  const n =
    typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const fmtMoney = (n: any, digits = 2) => {
  const v = cleanNumber(n);
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000)
    return `${v < 0 ? "-$" : "$"}${(abs / 1_000_000_000).toFixed(digits)}B`;
  if (abs >= 1_000_000)
    return `${v < 0 ? "-$" : "$"}${(abs / 1_000_000).toFixed(digits)}M`;
  return `${v < 0 ? "-$" : "$"}${abs.toLocaleString("en-US", {
    maximumFractionDigits: digits,
  })}`;
};

const fmtPct = (n: any, digits = 2) => `${cleanNumber(n).toFixed(digits)}%`;

// ─── ConfirmDialog ───────────────────────────────────────────────────────────
function ConfirmDialog({
  open,
  payload,
  baseTicker,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  payload: ConfirmPayload | null;
  baseTicker: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!payload) return null;

  const isDelete = payload.action === "delete";

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      TransitionComponent={Fade}
      PaperProps={{
        elevation: 24,
        sx: {
          borderRadius: 4,
          minWidth: 380,
          maxWidth: 440,
          overflow: "hidden",
          border: "1px solid rgba(148,163,184,0.18)",
        },
      }}
    >
      {/* coloured top strip */}
      <Box
        sx={{
          height: 5,
          background: isDelete
            ? "linear-gradient(90deg, #ef4444, #dc2626)"
            : "linear-gradient(90deg, #3b82f6, #2563eb)",
        }}
      />

      <DialogContent sx={{ px: 3, pt: 2.75, pb: 1.5 }}>
        {/* icon + heading row */}
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box
            sx={{
              mt: 0.25,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: isDelete
                ? "rgba(239, 68, 68, 0.10)"
                : "rgba(59, 130, 246, 0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <WarningAmberRoundedIcon
              sx={{
                fontSize: 22,
                color: isDelete ? "#dc2626" : "#2563eb",
              }}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: 15,
                color: "#0f172a",
                lineHeight: 1.3,
              }}
            >
              {isDelete ? "Remove Peer Ticker?" : "Add Peer Ticker?"}
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: "#64748b", mt: 0.75, lineHeight: 1.6 }}
            >
              {isDelete ? (
                <>
                  Are you sure you want to remove{" "}
                  <Typography
                    component="span"
                    sx={{ fontWeight: 900, color: "#0f172a" }}
                  >
                    {payload.peerTicker}
                  </Typography>{" "}
                  from the peer list of{" "}
                  <Typography
                    component="span"
                    sx={{ fontWeight: 900, color: "#0f172a" }}
                  >
                    {baseTicker}
                  </Typography>
                  ? This action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to add{" "}
                  <Typography
                    component="span"
                    sx={{ fontWeight: 900, color: "#0f172a" }}
                  >
                    {payload.peerTicker}
                  </Typography>{" "}
                  as a peer for{" "}
                  <Typography
                    component="span"
                    sx={{ fontWeight: 900, color: "#0f172a" }}
                  >
                    {baseTicker}
                  </Typography>
                  ?
                </>
              )}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          pt: 0.75,
          gap: 1,
          justifyContent: "flex-end",
        }}
      >
        <Button
          onClick={onCancel}
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
            color: "#475569",
            px: 2.25,
            "&:hover": { background: "rgba(71,85,105,0.06)" },
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{
            borderRadius: 2,
            fontWeight: 800,
            textTransform: "none",
            px: 2.25,
            background: isDelete
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : "linear-gradient(135deg, #3b82f6, #2563eb)",
            "&:hover": {
              background: isDelete
                ? "linear-gradient(135deg, #dc2626, #b91c1c)"
                : "linear-gradient(135deg, #2563eb, #1d4ed8)",
            },
            boxShadow: isDelete
              ? "0 3px 10px rgba(220,38,38,0.30)"
              : "0 3px 10px rgba(37,99,235,0.30)",
          }}
        >
          {isDelete ? "Delete" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── main component ──────────────────────────────────────────────────────────
const NewDashboardLifeCyclePeerDeals: React.FC<
  NewDashboardLifeCyclePeerDealsProps
> = ({ selectedDeal, ticker }) => {
  const baseTicker = (ticker ?? selectedDeal?.ticker ?? "").trim();
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<PeerRow[]>([]);
  const [summary, setSummary] = useState<PeerSummary | null>(null);

  // dropdown
  const [tickerOptions, setTickerOptions] = useState<string[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [selectedPeerTicker, setSelectedPeerTicker] = useState<string | null>(
    null,
  );

  // confirmation dialog
  const [confirmPayload, setConfirmPayload] = useState<ConfirmPayload | null>(
    null,
  );

  // toast
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    severity: "success" | "error" | "info";
  }>({ open: false, msg: "", severity: "info" });

  const authHeaders = useMemo(() => {
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    } as Record<string, string>;
  }, [token]);

  const showToast = (msg: string, severity: "success" | "error" | "info") => {
    setToast({ open: true, msg, severity });
  };

  // ── fetchers ──────────────────────────────────────────────────────────────
  const fetchPeers = async () => {
    if (!baseTicker) return;
    if (!apiUrl) {
      showToast("REACT_APP_API_URL is not set.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/get_peer_tickers_data/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ ticker: baseTicker }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          `Failed to fetch peers (${res.status})${txt ? `: ${txt}` : ""}`,
        );
      }
      const json = (await res.json()) as ApiResponse;
      setRows(Array.isArray(json.data) ? json.data : []);
      setSummary(json.summary ?? null);
    } catch (e: any) {
      console.error("Peer Fetch Error:", e);
      showToast(e?.message || "Failed to load peer tickers data", "error");
      setRows([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickerOptions = async () => {
    if (!apiUrl) {
      showToast("REACT_APP_API_URL is not set.", "error");
      return;
    }
    setOptionsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/get_mdd_tickers/`, {
        method: "GET",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error(`Failed to fetch tickers (${res.status})`);
      const json = await res.json();
      const list: string[] = (
        Array.isArray(json) ? json : (json?.data ?? json?.tickers ?? [])
      ).map((x: any) =>
        typeof x === "string" ? x : (x?.ticker ?? x?.symbol ?? ""),
      );
      setTickerOptions(list.filter(Boolean));
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || "Failed to load ticker options", "error");
      setTickerOptions([]);
    } finally {
      setOptionsLoading(false);
    }
  };

  useEffect(() => {
    if (!baseTicker) return;
    fetchPeers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTicker]);

  useEffect(() => {
    fetchTickerOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── actions ───────────────────────────────────────────────────────────────
  /** Opens the confirmation dialog – does NOT call the API yet */
  const requestConfirmation = (action: "add" | "delete", peerTicker: string) => {
    if (!baseTicker) {
      showToast("Base ticker is missing.", "error");
      return;
    }
    if (!peerTicker) {
      showToast("Peer ticker is missing.", "error");
      return;
    }
    setConfirmPayload({ action, peerTicker });
  };

  /** Fires after the user clicks the confirm button in the dialog */
  const handleConfirmedAction = async () => {
    if (!confirmPayload || !apiUrl) return;

    const { action, peerTicker } = confirmPayload;
    setConfirmPayload(null); // close dialog immediately

    try {
      const res = await fetch(`${apiUrl}/api/update_peer_tickers/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          action,
          ticker: baseTicker,
          peer_ticker: peerTicker,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(
          `update_peer_tickers failed (${res.status})${txt ? `: ${txt}` : ""}`,
        );
      }
      await res.json().catch(() => null);

      showToast(
        action === "add"
          ? "Peer added successfully."
          : "Peer removed successfully.",
        "success",
      );

      if (action === "add") setSelectedPeerTicker(null);
      await fetchPeers();
    } catch (e: any) {
      console.error(e);
      showToast(e?.message || "Failed to update peers.", "error");
    }
  };

  // ── derived rows ──────────────────────────────────────────────────────────
  const displayRows = useMemo(() => {
    const seen = new Set<string>();
    const out: PeerRow[] = [];
    for (const r of rows) {
      const key = `${r.ticker}-${r.pricing_date}-${r.issue_offer_price}-${r.deal_size}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(r);
    }
    out.sort((a, b) =>
      String(b.pricing_date).localeCompare(String(a.pricing_date)),
    );
    return out;
  }, [rows]);

  // ── columns ───────────────────────────────────────────────────────────────
  const columns: GridColDef[] = [
    // ── DELETE (sticky left, first column) ──────────────────────────────────
    {
      field: "actions",
      headerName: "",
      width: 62,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: "center",
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={() =>
            requestConfirmation("delete", String(params.row.ticker))
          }
          sx={{
            bgcolor: "rgba(239,68,68,0.08)",
            color: "#dc2626",
            "&:hover": {
              bgcolor: "rgba(239,68,68,0.18)",
              color: "#b91c1c",
            },
            transition: "background 0.18s, color 0.18s",
          }}
          aria-label="Delete peer"
        >
          <DeleteOutlineRoundedIcon fontSize="small" />
        </IconButton>
      ),
    },

    {
      field: "ticker",
      headerName: "Ticker",
      width: 110,
      renderCell: (params) => (
        <Link
          href={`/opportunity/equity/${params.row.ticker}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ fontWeight: 900, textDecoration: "none", color: "#7c2d12" }}
        >
          {params.row.ticker}
        </Link>
      ),
    },
    { field: "issuer_name", headerName: "Issuer Name", width: 240 },
    { field: "pricing_date", headerName: "Pricing Date", width: 125 },
    { field: "deal_type", headerName: "Deal Type", width: 90 },
    {
      field: "number_of_shares_offered",
      headerName: "Shares Offered",
      width: 150,
      renderCell: (params) => {
        const v = Number(params.row.number_of_shares_offered);
        return isNaN(v)
          ? ""
          : v.toLocaleString(undefined, { maximumFractionDigits: 0 });
      },
      sortComparator: (v1, v2) => cleanNumber(v1) - cleanNumber(v2),
    },
    {
      field: "issue_offer_price",
      headerName: "Issue Offer Price",
      width: 150,
      renderCell: (params) => fmtMoney(params.row.issue_offer_price),
      sortComparator: (v1, v2) => cleanNumber(v1) - cleanNumber(v2),
    },
    {
      field: "deal_size",
      headerName: "Deal Size",
      width: 150,
      renderCell: (params) => fmtMoney(params.row.deal_size, 0),
      sortComparator: (v1, v2) => cleanNumber(v1) - cleanNumber(v2),
    },
    {
      field: "allocation_deal_size_percentage",
      headerName: "Allocation % of Deal Size",
      width: 200,
      renderCell: (params) =>
        fmtPct(params.row.allocation_deal_size_percentage, 2),
      sortComparator: (v1, v2) => cleanNumber(v1) - cleanNumber(v2),
    },
    {
      field: "allocation_percentage",
      headerName: "Allocation IOI %",
      width: 150,
      renderCell: (params) => fmtPct(params.row.allocation_percentage, 2),
      sortComparator: (v1, v2) => cleanNumber(v1) - cleanNumber(v2),
    },
    {
      field: "t1d_return_from_bloomberg",
      headerName: "T+1 Day Return",
      width: 150,
      renderCell: (params) => fmtPct(params.row.t1d_return_from_bloomberg, 2),
      sortComparator: (v1, v2) => cleanNumber(v1) - cleanNumber(v2),
    },
    {
      field: "t1w_percent_change",
      headerName: "T+1 Week Return",
      width: 150,
      renderCell: (params) => fmtPct(params.row.t1w_percent_change, 2),
      sortComparator: (v1, v2) => cleanNumber(v1) - cleanNumber(v2),
    },
    {
      field: "t1m_return_from_bloomberg",
      headerName: "T+1 Month Return",
      width: 160,
      renderCell: (params) => fmtPct(params.row.t1m_return_from_bloomberg, 2),
      sortComparator: (v1, v2) => cleanNumber(v1) - cleanNumber(v2),
    },
  ];

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      {!baseTicker ? (
        <Alert severity="info">
          Ticker is missing. Provide selectedDeal.ticker or prop ticker.
        </Alert>
      ) : null}

      {/* ── SUMMARY + ADD PEER CONTROLS ───────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 2,
          borderRadius: 3,
          bgcolor: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={900}
              sx={{
                mb: 0.25,
                color: "#002060",
                fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
              }}
            >
              Peer Deals for {baseTicker}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "#475569", fontWeight: 600 }}
            >
              Summary metrics
            </Typography>
          </Box>

          {/* searchable dropdown + add button */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            alignItems="center"
          >
            <Autocomplete
              size="small"
              sx={{ width: { xs: "100%", sm: 280 } }}
              options={tickerOptions}
              loading={optionsLoading}
              value={selectedPeerTicker}
              onChange={(_, v) => setSelectedPeerTicker(v)}
              filterOptions={(opts, state) => {
                const q = state.inputValue.trim().toLowerCase();
                if (!q) return opts.slice(0, 200);
                return opts
                  .filter((t) => t.toLowerCase().includes(q))
                  .slice(0, 200);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Add peer ticker"
                  placeholder="Search ticker…"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {optionsLoading ? (
                          <CircularProgress color="inherit" size={16} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              disabled={!selectedPeerTicker || loading}
              onClick={() =>
                selectedPeerTicker &&
                requestConfirmation("add", selectedPeerTicker)
              }
              sx={{
                borderRadius: 2,
                fontWeight: 900,
                textTransform: "none",
                px: 2,
              }}
            >
              Add
            </Button>
          </Stack>
        </Stack>

        {/* summary tiles */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 2 }}
        >
          {[
            {
              label: "Average Deal Size",
              value: summary ? fmtMoney(summary.average_deal_size, 0) : "-",
              bg: "#e8f2ff",
            },
            {
              label: "Avg Allocation % of Deal Size",
              value: summary
                ? fmtPct(summary.avg_allocation_as_percent_of_deal_size, 2)
                : "-",
              bg: "#ecfdf3",
            },
            {
              label: "Avg Allocation IOI %",
              value: summary
                ? fmtPct(summary.avg_allocation_of_ioi, 2)
                : "-",
              bg: "#fff4e6",
            },
            {
              label: "Avg T+1 Day Return",
              value: summary ? fmtPct(summary.avg_t1d_return, 2) : "-",
              bg: "#f3e8ff",
            },
            {
              label: "Avg T+1 Week Return",
              value: summary ? fmtPct(summary.avg_t1w_return, 2) : "-",
              bg: "#e0f2fe",
            },
            {
              label: "Avg T+1 Month Return",
              value: summary ? fmtPct(summary.avg_t1m_return, 2) : "-",
              bg: "#f1f5f9",
            },
          ].map((tile) => (
            <Box
              key={tile.label}
              sx={{
                px: 1.25,
                py: 0.8,
                borderRadius: 2,
                bgcolor: tile.bg,
                display: "inline-flex",
                gap: 1,
                alignItems: "center",
                width: { xs: "100%", md: "auto" },
                justifyContent: { xs: "space-between", md: "flex-start" },
                border: "1px solid rgba(15, 23, 42, 0.06)",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#475569", fontWeight: 900 }}
              >
                {tile.label}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 1000, color: "#0b1844" }}
              >
                {tile.value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* ── DATA TABLE ────────────────────────────────────────────────────── */}
      <Box
        sx={{
          height: 520,
          width: "100%",
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
          backgroundColor: "#ffffff",
        }}
      >
        <DataGrid
          loading={loading}
          rows={displayRows.map((r, idx) => ({
            id: `${r.ticker}-${r.pricing_date}-${idx}`,
            ...r,
          }))}
          columns={columns}
          pageSizeOptions={[15, 25, 50]}
          disableRowSelectionOnClick
          rowHeight={44}
          sx={{
            border: "none",

            /* HEADER */
            "& .MuiDataGrid-columnHeaders": {
              background: "linear-gradient(90deg, #002060, #003a8c)",
              color: "#09378b",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 1000,
              fontSize: "13px",
              color: "#002060",
            },
            "& .MuiDataGrid-sortIcon": {
              color: "#fff",
            },

            /* CELLS */
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f1f5f9",
              fontWeight: 650,
              color: "#0f172a",
              fontSize: "13px",
            },

            /* STRIPED ROWS */
            "& .MuiDataGrid-row:nth-of-type(even)": {
              backgroundColor: "#f8fafc",
            },

            /* HOVER */
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#e0f2fe",
              cursor: "pointer",
            },

            /* ── STICKY LEFT: actions column (first) ── */
            "& .MuiDataGrid-cell:first-of-type": {
              position: "sticky",
              left: 0,
              zIndex: 10,
              backgroundColor: "#002060",
              borderRight: "1px solid #002060",
            },
            "& .MuiDataGrid-row:nth-of-type(even) .MuiDataGrid-cell:first-of-type":
              {
                backgroundColor: "#f8fafc",
              },
            "& .MuiDataGrid-row:hover .MuiDataGrid-cell:first-of-type": {
              backgroundColor: "#e0f2fe",
            },
            "& .MuiDataGrid-columnHeaders .MuiDataGrid-columnHeader:first-of-type":
              {
                position: "sticky",
                left: 0,
                zIndex: 11,
                background: "linear-gradient(90deg, #002060, #003a8c)",
                borderRight: "1px solid rgba(255,255,255,0.20)",
              },

            /* FOOTER */
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
            },
          }}
        />
      </Box>

      {/* ── CONFIRMATION DIALOG ────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!confirmPayload}
        payload={confirmPayload}
        baseTicker={baseTicker}
        onConfirm={handleConfirmedAction}
        onCancel={() => setConfirmPayload(null)}
      />

      {/* ── TOAST ───────────────────────────────────────────────────────── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ fontWeight: 800 }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NewDashboardLifeCyclePeerDeals;