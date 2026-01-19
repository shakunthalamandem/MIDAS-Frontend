import React, { useMemo } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { formatDate, formatDealSize } from "./IPOWriteUpUtils";
import { IpoData } from "./types";

type IPOWriteUpTableProps = {
  title: string;
  rows: IpoData[];
  emptyMessage: string;
  selectedTicker: string;
  dashboardLocked: boolean;
  onRowSelect: (ticker: string) => void;
};

const IPOWriteUpTable: React.FC<IPOWriteUpTableProps> = ({
  title,
  rows,
  emptyMessage,
  selectedTicker,
  dashboardLocked,
  onRowSelect,
}) => {
  const columns = useMemo<GridColDef<IpoData>[]>(
    () => [
      {
        field: "ticker",
        headerName: "Symbol",
        minWidth: 90,
        flex: 0.8,
        renderCell: (params) => (
          <span
            style={{
              color: "#b10f0f",
              fontWeight: 700,
              textDecoration: "underline",
            }}
          >
            {params.value}
          </span>
        ),
      },
      {
        field: "company_name",
        headerName: "Company",
        minWidth: 180,
        flex: 1.6,
      },
      {
        field: "pricing_date",
        headerName: "Pricing Date",
        minWidth: 130,
        flex: 1,
        renderCell: (params) => formatDate(params.value),
      },
      {
        field: "sector",
        headerName: "Sector",
        minWidth: 140,
        flex: 1,
      },
      {
        field: "pricing_range_max",
        headerName: "Price Range",
        minWidth: 140,
        flex: 1,
        renderCell: (params) => {
          const row = params.row;
          return row.pricing_range_min !== null &&
            row.pricing_range_max !== null
            ? `$${row.pricing_range_min} - $${row.pricing_range_max}`
            : "TBA";
        },
      },
      {
        field: "exchange",
        headerName: "Exchange",
        minWidth: 110,
        flex: 1,
      },
      {
        field: "deal_size",
        headerName: "Deal Size",
        minWidth: 120,
        flex: 1,
        renderCell: (params) => formatDealSize(params.value),
      },
    ],
    []
  );

  const handleRowClick = (row: IpoData) => {
    if (dashboardLocked && row.ticker !== selectedTicker) return;
    if (row.ticker === selectedTicker) return;
    onRowSelect(row.ticker);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="h6"
        fontWeight={700}
        color="#f18900ff"
        sx={{ mb: 1 }}
        align="center"
      >
        {title}
      </Typography>
      {rows.length > 0 ? (
        <Paper sx={{ borderRadius: 2 }}>
<Box
  sx={{
    width: "100%",
    height: rows.length > 6 ? 400 : "auto",
    maxHeight: rows.length > 6 ? 400 : "none",
    overflowY: rows.length > 6 ? "auto" : "hidden",
  }}
>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => `${row.ticker}_${row.pricing_date ?? "tba"}`}
              sortingOrder={["asc", "desc"]}
              rowHeight={35}
              disableRowSelectionOnClick
              onRowClick={(params) => handleRowClick(params.row)}
              getRowClassName={(params) => {
                const isSelected = params.row.ticker === selectedTicker;
                const isDisabled = dashboardLocked && !isSelected;
                return [
                  isSelected ? "row-selected" : "",
                  isDisabled ? "row-disabled" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
              }}
              sx={{
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
                "& .MuiDataGrid-row.row-selected, & .MuiDataGrid-row.row-selected .MuiDataGrid-cell": {
                  backgroundColor: "#bdf2b2 !important",
                },
                "& .MuiDataGrid-row.row-selected:hover, & .MuiDataGrid-row.row-selected:hover .MuiDataGrid-cell": {
                  backgroundColor: "#bdf2b2 !important",
                },
                cursor: "pointer",
                border: "1px solid #ccccccff",
              }}
            />
          </Box>
        </Paper>
      ) : (
        <Box
          sx={{
            py: 6,
            textAlign: "center",
            color: "text.secondary",
            border: "1px dashed #cbd5e1",
            borderRadius: 2,
            backgroundColor: "#fff",
          }}
        >
          <Typography variant="body2">{emptyMessage}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default IPOWriteUpTable;
