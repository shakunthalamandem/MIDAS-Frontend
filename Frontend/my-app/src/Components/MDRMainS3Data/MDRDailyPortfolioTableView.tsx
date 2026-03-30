// MDRDailyPortfolioTableView.tsx
import React from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { MDRDailyPortfolioRow } from "./MDRDailyPortfolioTypes";

const PRIMARY_COLOR = "#002060";

/* ========= Formatting helpers (UI only) ========= */

const formatInteger = (value: number | null | undefined) => {
  if (!Number.isFinite(value as number)) return "-";
  return Math.round(Number(value)).toLocaleString();
};

const formatCurrencyInteger = (value: number | null | undefined) => {
  if (!Number.isFinite(value as number)) return "-";
  const num = Number(value);
  const absVal = Math.abs(num).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return num < 0 ? `-$${absVal}` : `$${absVal}`;
};

const formatCurrencyPrice = (value: number | null | undefined) => {
  if (!Number.isFinite(value as number)) return "-";
  const num = Number(value);
  const absVal = Math.abs(num).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return num < 0 ? `-$${absVal}` : `$${absVal}`;
};

const formatPercent = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const numeric = Number(value);
  const needsDecimals = numeric !== 0 && numeric !== 100;
  const formatted = needsDecimals ? numeric.toFixed(2) : numeric.toString();
  return `${formatted}%`;
};

const formatPercent1Digit = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${Number(value).toFixed(1)}%`;
};

/* ========= Columns ========= */

const columns: GridColDef[] = [
  {
    field: "ticker",
    headerName: "Ticker",
    flex: 0.7,
    minWidth: 110,
    headerAlign: "center",
    align: "left",
    renderCell: (params) => (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Link
          to={`/equity/technical/${params.value}`}
          style={{ color: "#ac0600ff", textDecoration: "none" }}
          target="_blank"
        >
          {params.value}
        </Link>
      </div>
    ),
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
    minWidth: 120,
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
    valueFormatter: (params) => formatCurrencyInteger(params as number),
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
    valueFormatter: (params) => formatPercent1Digit(params as number),
  },
  {
    field: "excessReturnPercent",
    headerName: "Excess Return %",
    flex: 0.9,
    minWidth: 130,
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
    valueFormatter: (params) => formatCurrencyInteger(params as number),
    cellClassName: (params) =>
      params.value > 0 ? "positive" : params.value < 0 ? "negative" : "",
  },
  {
    field: "cumulativeGrossPnl",
    headerName: "Cumulative Gross $ P&L",
    flex: 1,
    minWidth: 150,
    align: "left",
    headerAlign: "left",
    valueFormatter: (params) => formatCurrencyInteger(params as number),
    cellClassName: (params) =>
      params.value > 0 ? "positive" : params.value < 0 ? "negative" : "",
  },
  {
    field: "cumulativeNetPnl",
    headerName: "Cumulative Net $ P&L",
    flex: 1,
    minWidth: 130,
    align: "left",
    headerAlign: "left",
    valueFormatter: (params) => formatCurrencyInteger(params as number),
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
    valueFormatter: (params) => formatCurrencyPrice(params as number),
  },
  {
    field: "avgInPrice",
    headerName: "Avg In Price",
    flex: 0.8,
    minWidth: 100,
    align: "left",
    headerAlign: "left",
    valueFormatter: (params) => formatCurrencyPrice(params as number),
  },
  {
    field: "avgExitPrice",
    headerName: "Avg Exit Price",
    flex: 0.8,
    minWidth: 110,
    align: "left",
    headerAlign: "left",
    valueFormatter: (params) => formatCurrencyPrice(params as number),
  },
  {
    field: "currentPrice",
    headerName: "Current Price",
    flex: 0.8,
    minWidth: 100,
    align: "left",
    headerAlign: "left",
    valueFormatter: (params) => formatCurrencyPrice(params as number),
  },
  {
    field: "ultimateStop",
    headerName: "Ultimate Stop",
    flex: 0.8,
    minWidth: 120,
    align: "left",
    headerAlign: "left",
    valueFormatter: (params) => formatCurrencyPrice(params as number),
  },
  {
    field: "targetPrice",
    headerName: "Target Price",
    flex: 0.8,
    minWidth: 100,
    align: "left",
    headerAlign: "left",
    valueFormatter: (params) => formatCurrencyPrice(params as number),
  },
];

const pdfColumns = columns.map((col) => ({
  field: col.field as keyof MDRDailyPortfolioRow,
  header: col.headerName || String(col.field),
  align: (col.align || "left") as React.CSSProperties["textAlign"],
}));

const PDF_TABLE_MIN_WIDTH = 1600;

const pdfValueFormatters: Partial<
  Record<keyof MDRDailyPortfolioRow, (value: any) => string>
> = {
  daysHeld: formatInteger,
  currentShares: formatInteger,
  currentExposure: formatCurrencyInteger,
  maxPercent: formatPercent,
  grossPercent: formatPercent1Digit,
  excessReturnPercent: formatPercent,
  dtdPnl: formatCurrencyInteger,
  cumulativeGrossPnl: formatCurrencyInteger,
  cumulativeNetPnl: formatCurrencyInteger,
  issuePrice: formatCurrencyPrice,
  avgInPrice: formatCurrencyPrice,
  avgExitPrice: formatCurrencyPrice,
  currentPrice: formatCurrencyPrice,
  ultimateStop: formatCurrencyPrice,
  targetPrice: formatCurrencyPrice,
};

const getDisplayValue = (
  field: keyof MDRDailyPortfolioRow,
  row: MDRDailyPortfolioRow
) => {
  const formatter = pdfValueFormatters[field];
  const raw = row[field] as any;
  const formatted = formatter ? formatter(raw) : raw ?? "";
  return typeof formatted === "string" ? formatted : String(formatted ?? "");
};

const getCellColor = (
  field: keyof MDRDailyPortfolioRow,
  row: MDRDailyPortfolioRow
) => {
  const value = Number(row[field as keyof MDRDailyPortfolioRow] ?? 0);
  if (["dtdPnl", "cumulativeGrossPnl", "cumulativeNetPnl"].includes(field)) {
    if (value > 0) return "green";
    if (value < 0) return "red";
  }
  return undefined;
};

/* ========= Props for the view ========= */

interface MDRDailyPortfolioTableViewProps {
  rows: MDRDailyPortfolioRow[];
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
  titleSuffix?: string;
  tickerOptions: string[];
  searchText: string;
  onSearchTextChange: (value: string) => void;
  onExport: () => void;
  pdfMode?: boolean;
  actionsSlot?: React.ReactNode;
  dealTypeFilter: string[];
  onDealTypeFilterChange: (value: string[]) => void;
  dealTypeOptions: string[];
  regionFilter: string[];
  onRegionFilterChange: (value: string[]) => void;
  regionOptions: string[];
}

/* ========= Presentational component ========= */

const MDRDailyPortfolioTableView: React.FC<MDRDailyPortfolioTableViewProps> = ({
  rows,
  loading,
  error,
  onRefresh,
  titleSuffix,
  tickerOptions,
  searchText,
  onSearchTextChange,
  onExport,
  pdfMode = false,
  actionsSlot,
  dealTypeFilter,
  onDealTypeFilterChange,
  dealTypeOptions,
  regionFilter,
  onRegionFilterChange,
  regionOptions,
}) => {
  return (
    <Container maxWidth="xl">
      <Stack spacing={2} mt={4}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#C00000", letterSpacing: 0.4 }}
          >
            Monashee Daily Portfolio Report
            {titleSuffix ? ` - ${titleSuffix}` : ""}
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Autocomplete
              size="small"
              freeSolo
              options={tickerOptions}
              inputValue={searchText}
              onInputChange={(_event, value) => onSearchTextChange(value)}
              sx={{ minWidth: 260 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Ticker"
                  placeholder="Type to search ticker"
                />
              )}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Deal Type</InputLabel>
              <Select
                multiple
                value={dealTypeFilter}
                label="Deal Type"
                onChange={(e) => {
                  const val = e.target.value;
                  onDealTypeFilterChange(
                    typeof val === "string" ? val.split(",") : val
                  );
                }}
                renderValue={(selected) =>
                  selected.length === 0
                    ? "All"
                    : selected.length === 1
                      ? selected[0]
                      : `${selected[0]} +${selected.length - 1}`
                }
              >
                {dealTypeOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    <Checkbox
                      size="small"
                      checked={dealTypeFilter.includes(opt)}
                    />
                    <ListItemText primary={opt} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Region</InputLabel>
              <Select
                multiple
                value={regionFilter}
                label="Region"
                onChange={(e) => {
                  const val = e.target.value;
                  onRegionFilterChange(
                    typeof val === "string" ? val.split(",") : val
                  );
                }}
                renderValue={(selected) =>
                  selected.length === 0
                    ? "All"
                    : selected.length === 1
                      ? selected[0]
                      : `${selected[0]} +${selected.length - 1}`
                }
              >
                {regionOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    <Checkbox
                      size="small"
                      checked={regionFilter.includes(opt)}
                    />
                    <ListItemText primary={opt} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={onExport}
              sx={{
                backgroundColor: "#002060",
                color: "#fff",
                textTransform: "none",
              }}
            >
              Export to Excel
            </Button>

            {actionsSlot}
          </Stack>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{ width: "100%", overflowX: "auto" }}>
          {pdfMode ? (
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  minWidth: PDF_TABLE_MIN_WIDTH,
                  borderCollapse: "separate",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr>
                    {pdfColumns.map((col) => (
                      <th
                        key={col.field as string}
                        style={{
                          padding: "6px 8px",
                          borderBottom: "1px solid #e5e7eb",
                          backgroundColor: "#f0f3ff",
                          color: PRIMARY_COLOR,
                          textAlign: col.align,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} style={{ backgroundColor: "#ffffff" }}>
                      {pdfColumns.map((col) => {
                        const value = getDisplayValue(col.field, row);
                        const color = getCellColor(col.field, row);
                        return (
                          <td
                            key={`${row.id}-${col.field as string}`}
                            style={{
                              padding: "6px 8px",
                              borderBottom: "1px solid #f1f3f5",
                              textAlign: col.align,
                              color: color || "#111827",
                              fontVariantNumeric: "tabular-nums",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
              disableColumnMenu
              columnHeaderHeight={50}
              rowHeight={45}
              autoHeight={false}
              sx={{
                height: 600,
                fontSize: 12,
                "& .MuiDataGrid-container--top [role='row']": {
                  backgroundColor: "#002060",
                  color: "#FFFFFF",
                },
                "& .Mui-selected": {
                  backgroundColor: "#cad0f1ff !important",
                },
                "& .MuiDataGrid-columnHeader .MuiDataGrid-sortIcon": {
                  color: "#FFFFFF",
                },
                cursor: "pointer",
                border: "1px solid #ccccccff",
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
                "& .positive": {
                  color: "green",
                  fontWeight: 600,
                },
                "& .negative": {
                  color: "red",
                  fontWeight: 600,
                },
              }}
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
                    <Typography variant="body2" color="#000000">
                      No data available.
                    </Typography>
                    {onRefresh && (
                      <Typography
                        variant="caption"
                        color="#000000"
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
          )}
        </Box>
      </Stack>
    </Container>
  );
};

// memo to avoid unnecessary re-renders when props don't change
export default React.memo(MDRDailyPortfolioTableView);
