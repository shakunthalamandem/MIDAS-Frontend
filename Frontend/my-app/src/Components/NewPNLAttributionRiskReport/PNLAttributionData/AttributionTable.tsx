import React, { useMemo } from "react";
import { Box } from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import type { AttributionItem } from "./types";
import { formatCurrency } from "./utils";
import "./AttributionTable.css";

interface AttributionTableProps {
  data: AttributionItem[];
  showPct: boolean;
}

const formatPctVal = (value: number) => `${value.toFixed(2)}%`;

const CustomToolbar = () => (
  <Box className="attr-datagrid-toolbar">
    <GridToolbarExport
      printOptions={{ disableToolbarButton: true }}
      csvOptions={{ fileName: "attribution_issuer_data" }}
    />
    <GridToolbarQuickFilter debounceMs={300} />
  </Box>
);

const AttributionTable: React.FC<AttributionTableProps> = ({
  data,
  showPct,
}) => {
  const rows = useMemo(
    () => data.map((item, idx) => ({ id: idx, ...item })),
    [data]
  );

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Issuer",
        flex: 1.4,
        minWidth: 200,
        cellClassName: "attr-datagrid-cell--name",
      },
      {
        field: "dtd_pnl",
        headerName: "DTD P&L",
        flex: 1,
        minWidth: 130,
        cellClassName: "attr-datagrid-cell--pnl",
        headerAlign: "right",
        align: "right",
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
        valueGetter: (value: number, row: AttributionItem) =>
          showPct ? row.beta_adj_net_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.beta_adj_net_pct)
            : formatCurrency(row.beta_adj_net),
      },
    ],
    [showPct]
  );

  return (
    <Box className="attr-datagrid-wrapper">
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
          border: "none",
          borderRadius: "12px",
          "& .MuiDataGrid-main": {
            borderRadius: "0 0 12px 12px",
          },
          /* ── Header ── */
          "& .MuiDataGrid-columnHeader": {
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            color: "#fff",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 700,
            fontSize: "12.5px",
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
          /* ── Cells ── */
          "& .MuiDataGrid-cell": {
            fontSize: "13px",
            borderBottom: "1px solid #f1f5f9",
          },
          "& .MuiDataGrid-row:nth-of-type(even)": {
            backgroundColor: "#faf5ff",
          },
          "& .MuiDataGrid-row:nth-of-type(odd)": {
            backgroundColor: "#fff",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#ede9fe !important",
          },
          "& .attr-datagrid-cell--name": {
            fontWeight: 600,
            color: "#1e293b",
          },
          "& .attr-datagrid-cell--pnl": {
            fontWeight: 600,
            color: "#7c3aed",
          },
          "& .attr-datagrid-cell--exposure": {
            fontWeight: 600,
            color: "#0891b2",
          },
          /* ── Toolbar ── */
          "& .MuiDataGrid-toolbarContainer": {
            padding: "0",
          },
          /* ── Footer ── */
          "& .MuiDataGrid-footerContainer": {
            borderTop: "1px solid #e2e8f0",
          },
        }}
      />
    </Box>
  );
};

export default AttributionTable;
