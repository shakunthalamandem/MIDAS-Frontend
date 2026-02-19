import React, { useMemo } from "react";
import { Box } from "@mui/material";
import {
  DataGrid,
  GridColDef,
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

// Sort comparator that always pins "OTHER" rows to the bottom
const pinOtherComparator =
  (defaultCompare: (a: any, b: any) => number) =>
  (v1: any, v2: any, params1: any, params2: any) => {
    const isOther1 = params1.api.getRow(params1.id)?.name?.toUpperCase() === "OTHER";
    const isOther2 = params2.api.getRow(params2.id)?.name?.toUpperCase() === "OTHER";
    if (isOther1 && !isOther2) return 1;
    if (!isOther1 && isOther2) return -1;
    if (isOther1 && isOther2) return 0;
    return defaultCompare(v1, v2);
  };

const numericCompare = (a: any, b: any) => (a ?? 0) - (b ?? 0);
const stringCompare = (a: any, b: any) => String(a ?? "").localeCompare(String(b ?? ""));

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
        sortComparator: pinOtherComparator(stringCompare),
      },
      {
        field: "dtd_pnl",
        headerName: "DTD P&L",
        flex: 1,
        minWidth: 130,
        cellClassName: "attr-datagrid-cell--pnl",
        headerAlign: "right",
        align: "right",
        sortComparator: pinOtherComparator(numericCompare),
        valueGetter: (value: number, row: AttributionItem) =>
          showPct ? row.dtd_pnl_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.dtd_pnl_pct)
            : formatCurrency(row.dtd_pnl),
      },
      {
        field: "mtd_pnl",
        headerName: "MTD P&L",
        flex: 1,
        minWidth: 130,
        cellClassName: "attr-datagrid-cell--pnl",
        headerAlign: "right",
        align: "right",
        sortComparator: pinOtherComparator(numericCompare),
        valueGetter: (value: number, row: AttributionItem) =>
          showPct ? row.mtd_pnl_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.mtd_pnl_pct)
            : formatCurrency(row.mtd_pnl),
      },
      {
        field: "ytd_pnl",
        headerName: "YTD P&L",
        flex: 1,
        minWidth: 130,
        cellClassName: "attr-datagrid-cell--pnl",
        headerAlign: "right",
        align: "right",
        sortComparator: pinOtherComparator(numericCompare),
        valueGetter: (value: number, row: AttributionItem) =>
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
        cellClassName: "attr-datagrid-cell--exposure",
        headerAlign: "right",
        align: "right",
        sortComparator: pinOtherComparator(numericCompare),
        valueGetter: (value: number, row: AttributionItem) =>
          showPct ? row.net_exp_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.net_exp_pct)
            : formatCurrency(row.net_exp),
      },
      {
        field: "beta_adj_net",
        headerName: "\u03B2 Adj Net",
        flex: 1,
        minWidth: 130,
        cellClassName: "attr-datagrid-cell--exposure",
        headerAlign: "right",
        align: "right",
        sortComparator: pinOtherComparator(numericCompare),
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
