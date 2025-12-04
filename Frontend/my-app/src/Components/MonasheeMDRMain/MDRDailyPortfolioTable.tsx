import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

export interface MDRDailyPortfolioRow {
  id: string;
  ticker: string;
  type: string;
  deal_cap: string;
  days_held: number;
  current_shares: number;
  current_exposure: number;
  max_pct: number;
  gross_pct: number;
  excess_return_pct: number;
  dtd_pnl: number;
  cumulative_gross_pnl: number;
  cumulative_net_pnl: number;
  issue_price: number;
  avg_in_price: number;
  avg_exit_price: number | null;
  current_price: number | null;
  ultimate_stop: number | null;
  target_price: number | null;
}

interface Props {
  rows: MDRDailyPortfolioRow[];
  hasApplied: boolean;
  loading: boolean;
  error?: string | null;
}

const PRIMARY_COLOR = "#002060";

const formatInteger = (value: number | null | undefined) => {
  if (!Number.isFinite(value as number)) return "-";
  return Math.round(Number(value)).toLocaleString();
};

const formatPrice = (value: number | null | undefined) => {
  if (!Number.isFinite(value as number)) return "-";
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const numeric = Number(value);
  const needsDecimals = numeric !== 0 && numeric !== 100;
  const formatted = needsDecimals ? numeric.toFixed(2) : numeric.toString();
  return `${formatted}%`;
};

const columns: GridColDef[] = [
  {
    field: "ticker",
    headerName: "Ticker",
    flex: 1,
    minWidth: 140,
    renderCell: (params) => (
      <Typography sx={{ color: "red", fontWeight: 600 }}>
        {params.value || "-"}
      </Typography>
    ),
    headerAlign: "left",
    align: "left",
    cellClassName: "tickerCell",
  },
  { field: "deal_type", headerName: "Type", flex: 1, minWidth: 130 },
  { field: "deal_captain", headerName: "Deal Capt", flex: 1, minWidth: 130 },
  {
    field: "days_held",
    headerName: "Days Held",
    flex: 0.8,
    minWidth: 110,
    align: "right",
    headerAlign: "right",
    valueFormatter: (params) => formatInteger(params as number),
  },
  {
    field: "current_shares",
    headerName: "Current Shares",
    flex: 1,
    minWidth: 140,
    align: "right",
    headerAlign: "right",
    valueFormatter: (params) => formatInteger(params as number),
  },
  {
    field: "current_exposure",
    headerName: "Current $ Exposure",
    flex: 1.2,
    minWidth: 170,
    align: "right",
    headerAlign: "right",
    valueFormatter: (params) => formatInteger(params as number),
  },
  {
    field: "max_pct",
    headerName: "% Max",
    flex: 0.9,
    minWidth: 110,
    align: "right",
    headerAlign: "right",
    valueFormatter: (params) => formatPercent(params as number),
  },
  {
    field: "gross_pct",
    headerName: "Gross %",
    flex: 0.9,
    minWidth: 110,
    align: "right",
    headerAlign: "right",
    valueFormatter: (params) => formatPercent(params as number),
  },
  {
    field: "excess_return_pct",
    headerName: "Excess Return %",
    flex: 1,
    minWidth: 140,
    align: "right",
    headerAlign: "right",
    valueFormatter: (params) => formatPercent(params as number),
  },
  {
    field: "dtd_pnl",
    headerName: "DTD P&L",
    flex: 1,
    minWidth: 130,
    align: "right",
    headerAlign: "right",
    valueFormatter: (params) => formatInteger(params as number),
    cellClassName: (params) =>
      params.value > 0 ? "positive" : params.value < 0 ? "negative" : "",
  },
  {
    field: "cumulative_gross_pnl",
    headerName: "Cumulative Gross P&L",
    flex: 1.3,
    minWidth: 180,
    align: "right",
    headerAlign: "right",
    valueFormatter: (params) => formatInteger(params as number),
    cellClassName: (params) =>
      params.value > 0 ? "positive" : params.value < 0 ? "negative" : "",
  },
  {
    field: "cumulative_net_pnl",
    headerName: "Cumulative Net P&L",
    flex: 1.2,
    minWidth: 170,
    align: "right",
    headerAlign: "right",
    valueFormatter: (params) => formatInteger(params as number),
    cellClassName: (params) =>
      params.value > 0 ? "positive" : params.value < 0 ? "negative" : "",
  },
  {
    field: "issue_price",
    headerName: "Issue Price",
    flex: 1,
    minWidth: 130,
    align: "right",
    headerAlign: "right",
    valueFormatter: (params) => formatPrice(params as number),
  },
  {
    field: "avg_in_price",
    headerName: "Avg In Price",
    flex: 1,
    minWidth: 130,
    align: "right",
    headerAlign: "right",
    valueFormatter: (params) => formatPrice(params as number),
  },
  {
    field: "avg_exit_price",
    headerName: "Avg Exit Price",
    flex: 1,
    minWidth: 130,
    align: "right",
    headerAlign: "right",
    valueFormatter: (params) => formatPrice(params as number),
  },
  {
    field: "current_price",
    headerName: "Current Price",
    flex: 1,
    minWidth: 130,
    align: "right",
    headerAlign: "right",
    valueFormatter: (params) => formatPrice(params as number),
  },
  {
    field: "ultimate_stop",
    headerName: "Ultimate Stop",
    flex: 1,
    minWidth: 130,
    align: "right",
    headerAlign: "right",
    valueFormatter: (params) => formatPrice(params as number),
  },
  {
    field: "target_price",
    headerName: "Target Price",
    flex: 1,
    minWidth: 130,
    align: "right",
    headerAlign: "right",
    valueFormatter: (params) => formatPrice(params as number),
  },
];

const MDRDailyPortfolioTable: React.FC<Props> = ({
  rows,
  hasApplied,
  loading,
  error,
}) => {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const tickerOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.ticker)))
        .filter(Boolean)
        .sort(),
    [rows]
  );

  const filteredRows = useMemo(() => {
    if (!selectedTicker) return rows;
    return rows.filter((row) => row.ticker === selectedTicker);
  }, [rows, selectedTicker]);

  useEffect(() => {
    if (selectedTicker && !tickerOptions.includes(selectedTicker)) {
      setSelectedTicker(null);
    }
  }, [selectedTicker, tickerOptions]);

  if (!hasApplied) return null;

  return (
    <Paper elevation={1} sx={{ borderRadius: 2, p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: PRIMARY_COLOR, letterSpacing: 0.4 }}
          >
            Monashee Daily Report
          </Typography>
          <Autocomplete
            size="small"
            options={tickerOptions}
            value={selectedTicker}
            onChange={(_event, value) => setSelectedTicker(value)}
            sx={{ minWidth: 240 }}
            renderInput={(params) => (
              <TextField {...params} label="Ticker" placeholder="Select ticker" />
            )}
            disabled={rows.length === 0}
          />
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{ width: "100%" }}>
          <DataGrid
            autoHeight
            density="compact"
            rows={filteredRows}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            disableColumnMenu
            pageSizeOptions={[20, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 20, page: 0 } },
            }}
            slots={{
              noRowsOverlay: () => (
                <Stack
                  height="100%"
                  alignItems="center"
                  justifyContent="center"
                  spacing={0.5}
                >
                  <Typography variant="body2" color="text.secondary">
                    No data available.
                  </Typography>
                </Stack>
              ),
            }}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f0f3ff",
                color: PRIMARY_COLOR,
                fontWeight: 700,
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 700,
                fontSize: 13,
              },
              "& .MuiDataGrid-cell": {
                fontSize: 13,
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: "#fafbff",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f5f7ff",
              },
              "& .tickerCell": {
                color: "red",
                fontWeight: 600,
              },
              "& .positive": {
                color: "green",
                fontWeight: 600,
              },
              "& .negative": {
                color: "red",
                fontWeight: 600,
              },
            }}
          />
        </Box>
      </Stack>
    </Paper>
  );
};

export default MDRDailyPortfolioTable;
