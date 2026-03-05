import React from "react";
import { Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { formatDate, formatDealSize, formatPriceValue } from "./NewDashboardLifeCycleUtils";

type TableMode = "deals" | "pipeline";

type NewDashboardLifeCycleTableViewProps = {
  rows: any[];
  mode: TableMode;
  onRowClick?: (row: any) => void;
  selectedRegion?: string;
};

const NewDashboardLifeCycleTableView: React.FC<NewDashboardLifeCycleTableViewProps> = ({
  rows,
  mode,
  onRowClick,
  selectedRegion,
}) => {
  const dealColumns: GridColDef[] = [
    { field: "ticker", headerName: "Ticker", flex: 0.8, minWidth: 110 },
    { field: "region", headerName: "Region", flex: 0.7, minWidth: 90 },
    { field: "sector", headerName: "Sector", flex: 1, minWidth: 140 },
    {
      field: "issuer_name",
      headerName: "Issuer Name",
      flex: 1.4,
      minWidth: 180,
      valueGetter: (_, row) => row.issuer_name || row.company_name || "N/A",
    },
    {
      field: "pricing_date",
      headerName: "Pricing Date",
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) => formatDate(row.pricing_date),
    },
    {
      field: "deal_size",
      headerName: "Deal Size",
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) => formatDealSize(row.deal_size),
    },
    {
      field: "price_range",
      headerName: "Price Range",
      flex: 1,
      minWidth: 120,
      valueGetter: (_, row) => formatPriceValue(row),
    },
    {
      field: "trade_date",
      headerName: "First Trade Date",
      flex: 1,
      minWidth: 130,
      valueGetter: (_, row) => formatDate(row.trade_date),
    },
  ];

  const pipelineColumns: GridColDef[] = [
    {
      field: "ticker",
      headerName: "Ticker",
      flex: 0.9,
      minWidth: 130,
      valueGetter: (_, row) => row.ticker || row.company || "Pipeline Deal",
    },
    {
      field: "company",
      headerName: "Company",
      flex: 1.2,
      minWidth: 160,
      valueGetter: (_, row) => row.company || row.sector || "N/A",
    },
    {
      field: "expected_date",
      headerName: "Expected Date",
      flex: 1,
      minWidth: 140,
      valueGetter: (_, row) =>
        formatDate(row.expected_date || row.last_placement_date || row.lockup_date),
    },
    {
      field: "size",
      headerName: "Size / Valuation",
      flex: 1,
      minWidth: 140,
      valueGetter: (_, row) =>
        formatDealSize(
          row.size_m ||
            row.valuation_m ||
            row.sell_down_size_m ||
            row.implied_secondary_mkt_valuation_m
        ),
    },
    {
      field: "sector",
      headerName: "Sector",
      flex: 1,
      minWidth: 140,
      valueGetter: (_, row) => row.sector || row.sectors || "TBA",
    },
    {
      field: "region",
      headerName: "Region",
      flex: 0.9,
      minWidth: 120,
      valueGetter: (_, row) => row.country || row.region || selectedRegion || "N/A",
    },
  ];

  const columns = mode === "pipeline" ? pipelineColumns : dealColumns;
  const normalizedRows = rows.map((row, idx) => ({
    id: row.id ?? `${row.ticker ?? row.company ?? "row"}-${idx}`,
    ...row,
  }));
  const isPipelineView = mode === "pipeline";

  return (
    <Box sx={{ width: "100%", height: isPipelineView ? 480 : "auto" }}>
      <DataGrid
        rows={normalizedRows}
        columns={columns}
        autoHeight={!isPipelineView}
        disableRowSelectionOnClick
        onRowClick={(params) => onRowClick?.(params.row)}
        rowHeight={36}
        sx={{
          "& .MuiDataGrid-container--top [role='row']": {
            backgroundColor: "#002060",
            color: "#FFFFFF",
          },
          "& .MuiDataGrid-columnHeader .MuiDataGrid-sortIcon": {
            color: "#FFFFFF",
          },
          border: "1px solid #e2e8f0",
          borderRadius: 2,
          height: "100%",
        }}
      />
    </Box>
  );
};

export default NewDashboardLifeCycleTableView;
