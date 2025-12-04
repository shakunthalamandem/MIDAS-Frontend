// MDRDailyPortfolioTableMainS3.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

export interface MDRDailyPortfolioRow {
  id: string;
  ticker: string;
  dealType: string;
  dealCaptain: string;
  daysHeld: number;
  currentShares: number;
  currentExposure: number;
  maxPercent: number | null;
  grossPercent: number | null;
  excessReturnPercent: number | null;
  dtdPnl: number;
  cumulativeGrossPnl: number;
  cumulativeNetPnl: number;
  issuePrice: number;
  avgInPrice: number;
  avgExitPrice: number | null;
  currentPrice: number | null;
  ultimateStop: number | null;
  targetPrice: number | null;
}

interface MDRDailyPortfolioTableMainS3Props {
  rows: MDRDailyPortfolioRow[];
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
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
    flex: 0.75,
    minWidth: 110,
    renderCell: (params) => (
      <Typography sx={{ color: "red", fontWeight: 500, fontSize: 12 }}>
        {params.value || "-"}
      </Typography>
    ),
    headerAlign: "left",
    align: "left",
    cellClassName: "tickerCell",
  },
  {
    field: "dealType",
    headerName: "Deal Type",
    flex: 0.7,
    minWidth: 80,
  },
  {
    field: "dealCaptain",
    headerName: "Deal Captain",
    flex: 0.9,
    minWidth: 100,
  },
  {
    field: "daysHeld",
    headerName: "Days Held",
    flex: 0.6,
    minWidth: 85,
    align: "left",
    headerAlign: "left",
    valueFormatter: (params) => formatInteger(params as number),
  },
  {
    field: "currentShares",
    headerName: "Current Shares",
    flex: 0.9,
    minWidth: 100,
    align: "center",
    headerAlign: "left",
    valueFormatter: (params) => formatInteger(params as number),
  },
  {
    field: "currentExposure",
    headerName: "Current $ Exposure",
    flex: 1,
    minWidth: 130,
    align: "center",
    headerAlign: "left",
    valueFormatter: (params) => formatInteger(params as number),
  },
  {
    field: "maxPercent",
    headerName: "% Max",
    flex: 0.7,
    minWidth: 70,
    align: "center",
    headerAlign: "left",
    valueFormatter: (params) => formatPercent(params as number),
  },
  {
    field: "grossPercent",
    headerName: "Gross %",
    flex: 0.7,
    minWidth: 80,
    align: "center",
    headerAlign: "left",
    valueFormatter: (params) => formatPercent(params as number),
  },
  {
    field: "excessReturnPercent",
    headerName: "Excess Return %",
    flex: 0.9,
    minWidth: 120,
    align: "left",
    headerAlign: "left",
    valueFormatter: (params) => formatPercent(params as number),
  },
  {
    field: "dtdPnl",
    headerName: "DTD P&L",
    flex: 0.8,
    minWidth: 80,
    align: "center",
    headerAlign: "left",
    valueFormatter: (params) => formatInteger(params as number),
    cellClassName: (params) =>
      params.value > 0 ? "positive" : params.value < 0 ? "negative" : "",
  },
  {
    field: "cumulativeGrossPnl",
    headerName: "Cumulative Gross P&L",
    flex: 1,
    minWidth: 130,
    align: "left",
    headerAlign: "left",
    valueFormatter: (params) => formatInteger(params as number),
    cellClassName: (params) =>
      params.value > 0 ? "positive" : params.value < 0 ? "negative" : "",
  },
  {
    field: "cumulativeNetPnl",
    headerName: "Cumulative Net P&L",
    flex: 1,
    minWidth: 130,
    align: "left",
    headerAlign: "left",
    valueFormatter: (params) => formatInteger(params as number),
    cellClassName: (params) =>
      params.value > 0 ? "positive" : params.value < 0 ? "negative" : "",
  },
  {
    field: "issuePrice",
    headerName: "Issue Price",
    flex: 0.8,
    minWidth: 90,
    align: "left",
    headerAlign: "left",
    valueFormatter: (params) => formatPrice(params as number),
  },
  {
    field: "avgInPrice",
    headerName: "Avg In Price",
    flex: 0.8,
    minWidth: 100,
    align: "left",
    headerAlign: "left",
    valueFormatter: (params) => formatPrice(params as number),
  },
  {
    field: "avgExitPrice",
    headerName: "Avg Exit Price",
    flex: 0.8,
    minWidth: 110,
    align: "left",
    headerAlign: "left",
    valueFormatter: (params) => formatPrice(params as number),
  },
  {
    field: "currentPrice",
    headerName: "Current Price",
    flex: 0.8,
    minWidth: 100,
    align: "left",
    headerAlign: "left",
    valueFormatter: (params) => formatPrice(params as number),
  },
  {
    field: "ultimateStop",
    headerName: "Ultimate Stop",
    flex: 0.8,
    minWidth: 100,
    align: "left",
    headerAlign: "left",
    valueFormatter: (params) => formatPrice(params as number),
  },
  {
    field: "targetPrice",
    headerName: "Target Price",
    flex: 0.8,
    minWidth: 100,
    align: "left",
    headerAlign: "left",
    valueFormatter: (params) => formatPrice(params as number),
  },
];

const MDRDailyPortfolioTableMainS3: React.FC<MDRDailyPortfolioTableMainS3Props> = ({
  rows,
  loading,
  error,
  onRefresh,
}) => {
  // search text (live filter)
  const [searchText, setSearchText] = useState<string>("");

  const tickerOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.ticker)))
        .filter(Boolean)
        .sort(),
    [rows]
  );

  // Filter rows as user types (no need to click/select)
  const filteredRows = useMemo(() => {
    if (!searchText) return rows;
    const value = searchText.toLowerCase();
    return rows.filter((row) =>
      row.ticker.toLowerCase().includes(value)
    );
  }, [rows, searchText]);

  return (
    <Container maxWidth="xl">
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: PRIMARY_COLOR, letterSpacing: 0.4 }}
          >
            Monashee Daily Portfolio Report
          </Typography>

          <Autocomplete
            size="small"
            freeSolo
            options={tickerOptions}
            inputValue={searchText}
            onInputChange={(_event, value) => setSearchText(value)}
            sx={{ minWidth: 260 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Ticker"
                placeholder="Type to search ticker"
              />
            )}
            disabled={rows.length === 0}
          />
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            disableColumnMenu
            columnHeaderHeight={50}
            rowHeight={45}
            // fixed height 500px + internal scrolling
            autoHeight={false}
            sx={{
              height: 600,
              fontSize: 12,
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f0f3ff",
                color: PRIMARY_COLOR,
                fontWeight: 700,
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 700,
                fontSize: 12,
              },
              "& .MuiDataGrid-cell": {
                fontSize: 12,
                paddingTop: "6px",
                paddingBottom: "6px",
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
            // pagination: 100 rows per page
            pageSizeOptions={[100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 100, page: 0 } },
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
                  {onRefresh && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ cursor: "pointer" }}
                      onClick={onRefresh}
                    >
                      Tap to retry
                    </Typography>
                  )}
                </Stack>
              ),
            }}
          />
        </Box>
      </Stack>
    </Container>
  );
};

export default MDRDailyPortfolioTableMainS3;
