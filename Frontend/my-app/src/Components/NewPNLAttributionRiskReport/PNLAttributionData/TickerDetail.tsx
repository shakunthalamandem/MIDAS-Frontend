import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  IconButton,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  DataGrid,
  GridColDef,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import type { TickerItem, AttributionGroupBy } from "./types";
import { formatCurrency } from "./utils";
import "./TickerDetail.css";

const apiUrl = process.env.REACT_APP_API_URL;

const FONT = "Inter, ui-sans-serif, system-ui, sans-serif";

const GROUP_BY_LABELS: Record<AttributionGroupBy, string> = {
  analyst: "Analyst",
  sector: "Sector",
  industry: "Industry",
  holding_period: "Holding Period",
  issuer: "Issuer",
};

const formatPctVal = (value: number) => `${value.toFixed(2)}%`;

const CustomToolbar = () => (
  <Box className="ticker-detail-toolbar">
    <GridToolbarExport
      printOptions={{ disableToolbarButton: true }}
      csvOptions={{ fileName: "ticker_detail_data" }}
    />
    <GridToolbarQuickFilter debounceMs={300} />
  </Box>
);

const TickerDetail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const fundParam = searchParams.get("fund") || "";
  const date = searchParams.get("date") || "";
  const groupBy = (searchParams.get("groupBy") || "analyst") as AttributionGroupBy;
  const groupValue = searchParams.get("groupValue") || "";

  const selectedFunds = useMemo(() => {
    try {
      return JSON.parse(fundParam) as string[];
    } catch {
      return fundParam ? [fundParam] : [];
    }
  }, [fundParam]);

  const [data, setData] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPct, setShowPct] = useState(false);

  const fetchTickerData = useCallback(async () => {
    if (selectedFunds.length === 0 || !date || !groupValue) return;
    const token = localStorage.getItem("access_token");
    setLoading(true);
    setError("");
    try {
      const payload: Record<string, any> = {
        fund: selectedFunds,
        date,
        [groupBy]: groupValue,
      };
      const res = await fetch(
        `${apiUrl}/api/portfolio_attribution_ticker_data/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to fetch ticker data");
      const result = await res.json();
      setData(result.tickers || []);
    } catch (err: any) {
      setError(err.message || "Failed to load ticker data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFunds, date, groupBy, groupValue]);

  useEffect(() => {
    fetchTickerData();
  }, [fetchTickerData]);

  const rows = useMemo(
    () => data.map((item, idx) => ({ id: idx, ...item })),
    [data]
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "ticker",
        headerName: "Ticker",
        flex: 1,
        minWidth: 130,
        cellClassName: "ticker-detail-cell--name",
      },
      {
        field: "issuer",
        headerName: "Issuer",
        flex: 1.4,
        minWidth: 180,
        cellClassName: "ticker-detail-cell--name",
      },
      {
        field: "days_hld",
        headerName: "Days Held",
        flex: 0.7,
        minWidth: 100,
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }) =>
          value != null ? Math.round(value) : "—",
      },
      {
        field: "dtd_pnl",
        headerName: "DTD P&L",
        flex: 1,
        minWidth: 130,
        headerAlign: "right",
        align: "right",
        valueGetter: (value: number, row: TickerItem) =>
          showPct ? row.dtd_pnl_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.dtd_pnl_pct)
            : formatCurrency(row.dtd_pnl),
      },
      {
        field: "wtd_pnl",
        headerName: "WTD P&L",
        flex: 1,
        minWidth: 130,
        headerAlign: "right",
        align: "right",
        valueGetter: (value: number, row: TickerItem) =>
          showPct ? row.wtd_pnl_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.wtd_pnl_pct)
            : formatCurrency(row.wtd_pnl),
      },
      {
        field: "ytd_pnl",
        headerName: "YTD P&L",
        flex: 1,
        minWidth: 130,
        headerAlign: "right",
        align: "right",
        valueGetter: (value: number, row: TickerItem) =>
          showPct ? row.ytd_pnl_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.ytd_pnl_pct)
            : formatCurrency(row.ytd_pnl),
      },
      {
        field: "net_exp",
        headerName: "Net Exp",
        flex: 1,
        minWidth: 130,
        headerAlign: "right",
        align: "right",
        valueGetter: (value: number, row: TickerItem) =>
          showPct ? row.net_exp_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.net_exp_pct)
            : formatCurrency(row.net_exp),
      },
      {
        field: "beta_adj_net",
        headerName: "Beta Adj Net",
        flex: 1,
        minWidth: 130,
        headerAlign: "right",
        align: "right",
        valueGetter: (value: number, row: TickerItem) =>
          showPct ? row.beta_adj_net_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.beta_adj_net_pct)
            : formatCurrency(row.beta_adj_net),
      },
    ],
    [showPct]
  );

  const fundLabel =
    selectedFunds.length === 1
      ? selectedFunds[0]
      : `${selectedFunds.length} Funds`;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box className="ticker-detail">
        {/* Header */}
        <Box className="ticker-detail-header">
          <Box className="ticker-detail-header-left">
            <IconButton
              onClick={() => navigate(-1)}
              className="ticker-detail-back-btn"
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography className="ticker-detail-title">
                {GROUP_BY_LABELS[groupBy]}: {groupValue}
              </Typography>
              <Typography className="ticker-detail-subtitle">
                {fundLabel} &nbsp;|&nbsp; {date}
              </Typography>
            </Box>
          </Box>
          <Box className="ticker-detail-toggle">
            <Box
              className={`ticker-detail-toggle-btn${!showPct ? " ticker-detail-toggle-btn--active" : ""}`}
              onClick={() => setShowPct(false)}
            >
              $
            </Box>
            <Box
              className={`ticker-detail-toggle-btn${showPct ? " ticker-detail-toggle-btn--active" : ""}`}
              onClick={() => setShowPct(true)}
            >
              % AUM
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: "12px" }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box className="ticker-detail-loading">
            <CircularProgress />
          </Box>
        ) : data.length > 0 ? (
          <Box className="ticker-detail-table-wrapper">
            <DataGrid
              rows={rows}
              columns={columns}
              density="compact"
              rowHeight={42}
              disableRowSelectionOnClick
              disableColumnMenu
              slots={{ toolbar: CustomToolbar }}
              initialState={{
                sorting: {
                  sortModel: [{ field: "ytd_pnl", sort: "desc" }],
                },
              }}
              sx={{
                fontFamily: FONT,
                border: "none",
                borderRadius: "12px",
                "& .MuiDataGrid-main": {
                  borderRadius: "0 0 12px 12px",
                },
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: "#002060",
                  color: "#fff",
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "13px",
                  color: "#fff",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                },
                "& .MuiDataGrid-sortIcon": {
                  color: "#fff !important",
                },
                "& .MuiDataGrid-columnSeparator": {
                  display: "none",
                },
                "& .MuiDataGrid-cell": {
                  fontFamily: FONT,
                  fontSize: "13px",
                  borderBottom: "1px solid #e8ecf1",
                },
                "& .MuiDataGrid-row:nth-of-type(even)": {
                  backgroundColor: "#f0f4fa",
                },
                "& .MuiDataGrid-row:nth-of-type(odd)": {
                  backgroundColor: "#fff",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#dbe5f5 !important",
                },
                "& .ticker-detail-cell--name": {
                  fontWeight: 500,
                  color: "#1e293b",
                  textTransform: "uppercase",
                },
                "& .MuiDataGrid-toolbarContainer": {
                  padding: "0",
                },
                "& .ticker-detail-toolbar": {
                  background: "#e8eef8",
                },
                "& .ticker-detail-toolbar .MuiButton-root": {
                  color: "#fff",
                  background: "#002060",
                  fontWeight: 700,
                  fontSize: "12px",
                  padding: "6px 18px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                },
                "& .ticker-detail-toolbar .MuiButton-root:hover": {
                  background: "#002060",
                  filter: "brightness(0.85)",
                  color: "#fff",
                },
                "& .MuiDataGrid-footerContainer": {
                  fontFamily: FONT,
                  borderTop: "1px solid #e2e8f0",
                },
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              color: "#94a3b8",
              fontSize: 14,
            }}
          >
            No ticker data available
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default TickerDetail;
