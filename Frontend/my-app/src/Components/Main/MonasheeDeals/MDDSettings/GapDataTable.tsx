import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

interface GapDataTableProps {
  data: any[];
}

const columns: GridColDef[] = [
  { field: "year", headerName: "Year", flex: 1 },
  { field: "deal_type", headerName: "Deal Type", flex: 1 },
  { field: "broad_region", headerName: "Region", flex: 1 },
  { 
    field: "deal_size", 
    headerName: "Deal Size", 
    flex: 1,
    valueFormatter: (params) => `$${Number(params).toLocaleString()}`,
  },
  { field: "ticker_us", headerName: "Ticker", flex: 1 },
  { field: "gics_sector_from_bloomberg", headerName: "Sector", flex: 1 },
  { field: "deal_captain", headerName: "Deal Captain", flex: 1 },
  { 
    field: "total_return", 
    headerName: "Return", 
    flex: 1,
    valueFormatter: (params) => Number(params).toFixed(2),
  },
];

const GapDataTable: React.FC<GapDataTableProps> = ({ data }) => {
  return (
    <Box sx={{ height: 500, width: "100%" }}>
      <DataGrid
        rows={data.map((row, index) => ({ id: index, ...row }))}
        columns={columns}
        pageSizeOptions={[25, 50, 100]}
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default GapDataTable;
