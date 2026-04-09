import React, { useMemo } from "react";
import { Box, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import type { AttributionItem, AttributionGroupBy } from "./types";
import { formatCurrency } from "./utils";
import "./AttributionTable.css";

interface TabTheme {
  headerBg: string;
  evenRow: string;
  hoverRow: string;
  pnlColor: string;
  expColor: string;
  toolbarBg: string;
  exportBg: string;
}

interface AttributionTableProps {
  data: AttributionItem[];
  showPct: boolean;
  groupBy: AttributionGroupBy;
  theme: TabTheme;
  selectedFunds?: string[];
  selectedDate?: string;
  expandedRow?: string | null;
  onRowClick?: (name: string) => void;
}

const GROUP_BY_LABELS: Record<AttributionGroupBy, string> = {
  analyst: "Analyst",
  sector: "Sector",
  industry: "Industry",
  holding_period: "Holding Period",
  issuer: "Issuer",
};

const FONT = "Inter, ui-sans-serif, system-ui, sans-serif";

const formatPctVal = (value: number) => `${value.toFixed(2)}%`;

// Sort comparator that always pins "OTHER" rows to the bottom.
// DataGrid multiplies comparator result by -1 for desc sort, so we
// compensate by flipping our pin value when the active sort is descending.
const pinOtherComparator =
  (defaultCompare: (a: any, b: any) => number) =>
  (v1: any, v2: any, params1: any, params2: any) => {
    const isOther1 = params1.api.getRow(params1.id)?.name?.toUpperCase() === "OTHER";
    const isOther2 = params2.api.getRow(params2.id)?.name?.toUpperCase() === "OTHER";
    if (isOther1 && isOther2) return 0;
    if (!isOther1 && !isOther2) return defaultCompare(v1, v2);

    const sortModel = params1.api.getSortModel();
    const isDesc = sortModel.length > 0 && sortModel[0].sort === "desc";
    // In asc: return 1 puts OTHER after → bottom. DataGrid uses as-is.
    // In desc: return -1, DataGrid negates to 1 → OTHER still at bottom.
    if (isOther1) return isDesc ? -1 : 1;
    return isDesc ? 1 : -1;
  };

const numericCompare = (a: any, b: any) => (a ?? 0) - (b ?? 0);
const stringCompare = (a: any, b: any) => String(a ?? "").localeCompare(String(b ?? ""));

// Chronological order for holding period categories
const HOLDING_PERIOD_ORDER: Record<string, number> = {
  "0-30 DAYS": 1,
  "31-90 DAYS": 2,
  "91-180 DAYS": 3,
  "181-365 DAYS": 4,
  "> 365 DAYS": 5,
};
const holdingPeriodCompare = (a: any, b: any) => {
  const orderA = HOLDING_PERIOD_ORDER[String(a ?? "").toUpperCase()] ?? 99;
  const orderB = HOLDING_PERIOD_ORDER[String(b ?? "").toUpperCase()] ?? 99;
  return orderA - orderB;
};

const CustomToolbar = () => (
  <Box className="attr-datagrid-toolbar">
    <GridToolbarExport
      printOptions={{ disableToolbarButton: true }}
      csvOptions={{ fileName: "attribution_data" }}
    />
    <GridToolbarQuickFilter debounceMs={300} />
  </Box>
);

const AttributionTable: React.FC<AttributionTableProps> = ({
  data,
  showPct,
  groupBy,
  theme,
  selectedFunds,
  selectedDate,
  expandedRow,
  onRowClick,
}) => {
  const rows = useMemo(
    () => data.map((item, idx) => ({ id: idx, ...item })),
    [data]
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: GROUP_BY_LABELS[groupBy],
        flex: 1.4,
        minWidth: 200,
        cellClassName: "attr-datagrid-cell--name",
        sortComparator: pinOtherComparator(
          groupBy === "holding_period" ? holdingPeriodCompare : stringCompare
        ),
      },
      {
        field: "dtd_pnl",
        headerName: "DTD P&L",
        flex: 1,
        minWidth: 130,
        cellClassName: "attr-datagrid-cell--pnl",
        headerAlign: "center",
        align: "center",
        sortComparator: pinOtherComparator(numericCompare),
        valueGetter: (value: number, row: AttributionItem) =>
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
        cellClassName: "attr-datagrid-cell--pnl",
        headerAlign: "center",
        align: "center",
        sortComparator: pinOtherComparator(numericCompare),
        valueGetter: (value: number, row: AttributionItem) =>
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
        cellClassName: "attr-datagrid-cell--pnl",
        headerAlign: "center",
        align: "center",
        sortComparator: pinOtherComparator(numericCompare),
        valueGetter: (value: number, row: AttributionItem) =>
          showPct ? row.ytd_pnl_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.ytd_pnl_pct)
            : formatCurrency(row.ytd_pnl),
      },
      {
        field: "market_value",
        headerName: "Market Value",
        flex: 1,
        minWidth: 140,
        cellClassName: "attr-datagrid-cell--exposure",
        headerAlign: "center",
        align: "center",
        sortComparator: pinOtherComparator(numericCompare),
        renderHeader: () => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <span style={{ fontWeight: 700 }}>Market Value</span>
            <Tooltip
              placement="top"
              arrow
              title={
                <Box sx={{ fontSize: "12px", lineHeight: 1.6 }}>
                  <Box sx={{ fontWeight: 700, mb: 0.5 }}>GMV (Gross Market Value)</Box>
                  <Box>Σ |Price × Quantity × Multiplier|</Box>
                  <Box sx={{ mt: 0.5, color: "#5f6875" }}>Uses premium price for options</Box>
                </Box>
              }
              slotProps={{ tooltip: { sx: { bgcolor: "#1e293b", maxWidth: 300, "& .MuiTooltip-arrow": { color: "#1e293b" } } } }}
            >
              <InfoOutlinedIcon
                sx={{ fontSize: 14, color: "#5f6875", cursor: "pointer", "&:hover": { color: "#64748b" } }}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          </Box>
        ),
        valueGetter: (value: number, row: AttributionItem) =>
          showPct ? row.market_value_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.market_value_pct)
            : formatCurrency(row.market_value),
      },
      {
        field: "net_exp",
        headerName: "Net Exp",
        flex: 1,
        minWidth: 130,
        cellClassName: "attr-datagrid-cell--exposure",
        headerAlign: "center",
        align: "center",
        sortComparator: pinOtherComparator(numericCompare),
        renderHeader: () => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <span style={{ fontWeight: 700 }}>Net Exp</span>
            <Tooltip
              placement="top"
              arrow
              title={
                <Box sx={{ fontSize: "12px", lineHeight: 1.6 }}>
                  <Box sx={{ fontWeight: 700, mb: 0.5 }}>Net Exposure</Box>
                  <Box>Total Long Exposure − Total Short Exposure</Box>
                  <Box>Σ (Price × Quantity × Multiplier)</Box>
                  <Box sx={{ mt: 0.5, color: "#5f6875" }}>Uses underlying price for options</Box>
                </Box>
              }
              slotProps={{ tooltip: { sx: { bgcolor: "#1e293b", maxWidth: 300, "& .MuiTooltip-arrow": { color: "#1e293b" } } } }}
            >
              <InfoOutlinedIcon
                sx={{ fontSize: 14, color: "#5f6875", cursor: "pointer", "&:hover": { color: "#64748b" } }}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          </Box>
        ),
        valueGetter: (value: number, row: AttributionItem) =>
          showPct ? row.net_exp_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.net_exp_pct)
            : formatCurrency(row.net_exp),
      },
      {
        field: "delta_adj_net",
        headerName: "Delta Adj Net",
        flex: 1.1,
        minWidth: 150,
        cellClassName: "attr-datagrid-cell--exposure",
        headerAlign: "center",
        align: "center",
        sortComparator: pinOtherComparator(numericCompare),
        renderHeader: () => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <span style={{ fontWeight: 700 }}>Delta Adj Net</span>
            <Tooltip
              placement="top"
              arrow
              title={
                <Box sx={{ fontSize: "12px", lineHeight: 1.6 }}>
                  <Box sx={{ fontWeight: 700, mb: 0.5 }}>Delta Adjusted Net Exposure</Box>
                  <Box>Σ (Price × Quantity × Multiplier × Delta)</Box>
                </Box>
              }
              slotProps={{ tooltip: { sx: { bgcolor: "#1e293b", maxWidth: 300, "& .MuiTooltip-arrow": { color: "#1e293b" } } } }}
            >
              <InfoOutlinedIcon
                sx={{ fontSize: 14, color: "#5f6875", cursor: "pointer", "&:hover": { color: "#64748b" } }}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          </Box>
        ),
        valueGetter: (value: number, row: AttributionItem) =>
          showPct ? row.delta_adj_net_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.delta_adj_net_pct)
            : formatCurrency(row.delta_adj_net),
      },
      {
        field: "beta_adj_net",
        headerName: "Beta Adj Net",
        flex: 1.1,
        minWidth: 150,
        cellClassName: "attr-datagrid-cell--exposure",
        headerAlign: "center",
        align: "center",
        sortComparator: pinOtherComparator(numericCompare),
        renderHeader: () => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <span style={{ fontWeight: 700 }}>Beta Adj Net</span>
            <Tooltip
              placement="top"
              arrow
              title={
                <Box sx={{ fontSize: "12px", lineHeight: 1.6 }}>
                  <Box sx={{ fontWeight: 700, mb: 0.5 }}>Beta Adjusted Net Exposure</Box>
                  <Box>Σ (Price × Quantity × Multiplier × Delta × Beta)</Box>
                </Box>
              }
              slotProps={{ tooltip: { sx: { bgcolor: "#1e293b", maxWidth: 300, "& .MuiTooltip-arrow": { color: "#1e293b" } } } }}
            >
              <InfoOutlinedIcon
                sx={{ fontSize: 14, color: "#5f6875", cursor: "pointer", "&:hover": { color: "#64748b" } }}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          </Box>
        ),
        valueGetter: (value: number, row: AttributionItem) =>
          showPct ? row.beta_adj_net_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.beta_adj_net_pct)
            : formatCurrency(row.beta_adj_net),
      },
    ],
    [showPct, groupBy]
  );

  return (
    <Box className="attr-datagrid-wrapper" sx={{ borderColor: theme.headerBg + "33" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        density="compact"
        rowHeight={42}
        disableRowSelectionOnClick
        disableColumnMenu
        getRowClassName={(params) =>
          expandedRow && params.row.name === expandedRow ? "attr-row--expanded" : ""
        }
        slots={{ toolbar: CustomToolbar }}
        onRowClick={(params: GridRowParams) => {
          if (!selectedFunds || !selectedDate || !onRowClick) return;
          const name = params.row.name;
          if (name?.toUpperCase() === "OTHER") return;
          onRowClick(name);
        }}
        initialState={{
          sorting: {
            sortModel: [
              groupBy === "holding_period"
                ? { field: "name", sort: "asc" }
                : { field: "ytd_pnl", sort: "desc" },
            ],
          },
        }}
        sx={{
          fontFamily: FONT,
          border: "none",
          borderRadius: "12px",
          "& .MuiDataGrid-main": {
            borderRadius: "0 0 12px 12px",
          },
          /* ── Header ── */
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: theme.headerBg,
            color: "#1e293b",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: "13px",
            color: "#1e293b",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
          },
          "& .MuiDataGrid-sortIcon": {
            color: "#1e293b !important",
          },
          "& .MuiDataGrid-columnSeparator": {
            display: "none",
          },
          /* ── Cells ── */
          "& .MuiDataGrid-cell": {
            fontFamily: FONT,
            fontSize: "13px",
            borderBottom: "1px solid #e8ecf1",
          },
          "& .MuiDataGrid-row:nth-of-type(even)": {
            backgroundColor: theme.evenRow,
          },
          "& .MuiDataGrid-row:nth-of-type(odd)": {
            backgroundColor: "#fff",
          },
          "& .MuiDataGrid-row": {
            cursor: selectedFunds && selectedDate && onRowClick ? "pointer" : "default",
          },
          "& .MuiDataGrid-row.attr-row--expanded": {
            backgroundColor: `${theme.hoverRow} !important`,
            fontWeight: 700,
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: `${theme.hoverRow} !important`,
          },
          "& .attr-datagrid-cell--name": {
            fontWeight: 500,
            color: "#1e293b",
            textTransform: "uppercase",
          },
          "& .attr-datagrid-cell--pnl": {
            fontWeight: 500,
            color: "#1e293b",
          },
          "& .attr-datagrid-cell--exposure": {
            fontWeight: 500,
            color: "#1e293b",
          },
          /* ── Toolbar ── */
          "& .MuiDataGrid-toolbarContainer": {
            padding: "0",
          },
          "& .attr-datagrid-toolbar": {
            background: theme.toolbarBg,
          },
          "& .attr-datagrid-toolbar .MuiButton-root": {
            color: "#fff",
            background: theme.exportBg,
            fontWeight: 700,
            fontSize: "12px",
            padding: "6px 18px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          },
          "& .attr-datagrid-toolbar .MuiButton-root:hover": {
            background: theme.exportBg,
            filter: "brightness(0.85)",
            color: "#fff",
          },
          /* ── Footer ── */
          "& .MuiDataGrid-footerContainer": {
            fontFamily: FONT,
            borderTop: "1px solid #e2e8f0",
          },
        }}
      />
    </Box>
  );
};

export default AttributionTable;
