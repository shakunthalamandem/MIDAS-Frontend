import React from "react";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Box } from "@mui/material";

interface GapDataTableProps {
  data: any[];
}

const columns: GridColDef[] = [
  { field: "ticker_us", headerName: "Ticker", width: 120 },
  { field: "pricing_date", headerName: "Pricing Date", width: 150 },
  { field: "issuer_name", headerName: "Issuer Name", width: 200 },
  { field: "deal_type", headerName: "Deal Type", width: 150 },
  { field: "broad_region", headerName: "Region", width: 130 },
  { 
    field: "deal_size", 
    headerName: "Deal Size", 
    width: 150,
    valueFormatter: (params) => `$${Number(params).toLocaleString()}`,
  },
  { field: "gics_sector_from_bloomberg", headerName: "Sector", width: 180 },
  { 
    field: "allocation_deal_size_percentage", 
    headerName: "Allocation %", 
    width: 140,
    valueFormatter: (params) => `${(Number(params) * 100).toFixed(2)}%`,
  },
  { 
    field: "subscription_bid_shares", 
    headerName: "Subscription Bid Shares", 
    width: 180,
    valueFormatter: (params) => Number(params).toLocaleString(),
  },
  { 
    field: "allocation_price", 
    headerName: "Allocation Price", 
    width: 150,
    valueFormatter: (params) => `$${Number(params).toFixed(2)}`,
  },
  { 
    field: "allocated_capital", 
    headerName: "Allocated Capital", 
    width: 180,
    valueFormatter: (params) => `$${Number(params).toLocaleString()}`,
  },
  { 
    field: "am_capital_committed", 
    headerName: "AM Capital Committed", 
    width: 180,
    valueFormatter: (params) => `$${Number(params).toLocaleString()}`,
  },
  { 
    field: "total_committed_capital", 
    headerName: "Total Committed Capital", 
    width: 180,
    valueFormatter: (params) => `$${Number(params).toLocaleString()}`,
  },
  { 
    field: "t1m_return_from_dealogic", 
    headerName: "T1M Return", 
    width: 140,
    valueFormatter: (params) => `${Number(params).toFixed(2)}%`,
  },
  { 
    field: "t1d_return_from_bloomberg", 
    headerName: "T1D Return", 
    width: 140,
    valueFormatter: (params) => `${Number(params).toFixed(2)}%`,
  },
  { 
    field: "am_return", 
    headerName: "AM Return", 
    width: 140,
    valueFormatter: (params) => `$${Number(params).toFixed(2)}`,
  },
  { 
    field: "allocation_return", 
    headerName: "Allocation Return", 
    width: 150,
    valueFormatter: (params) => `$${Number(params).toFixed(2)}`,
  },
  { 
    field: "allocation_ioi_percentage", 
    headerName: "Allocation IOI %", 
    width: 150,
    valueFormatter: (params) => `${(Number(params) * 100).toFixed(2)}%`,
  },
  { 
    field: "model_actual_return", 
    headerName: "Model Actual Return", 
    width: 160,
    valueFormatter: (params) => `$${Number(params).toFixed(2)}`,
  },
  { 
    field: "model_capital_1_allocation", 
    headerName: "Model Capital 1 Allocation", 
    width: 180,
    valueFormatter: (params) => `$${Number(params).toLocaleString()}`,
  },
  { 
    field: "model_return_1_allocation", 
    headerName: "Model Return 1 Allocation", 
    width: 180,
    valueFormatter: (params) => `$${Number(params).toFixed(2)}`,
  },
  { 
    field: "model_am_capital", 
    headerName: "Model AM Capital", 
    width: 180,
    valueFormatter: (params) => `$${Number(params).toLocaleString()}`,
  },
  { 
    field: "model_am_return", 
    headerName: "Model AM Return", 
    width: 150,
    valueFormatter: (params) => `$${Number(params).toFixed(2)}`,
  },
];

const GapDataTable: React.FC<GapDataTableProps> = ({ data }) => {
  return (
    <Box sx={{ height: 600, width: "100%", overflowX: "auto" }}>
      <DataGrid
        rows={data.map((row, index) => ({ id: index, ...row }))}
        columns={columns}
        pageSizeOptions={[25, 50, 100]}
        disableRowSelectionOnClick
        // slots={{ toolbar: GridToolbar }}
    sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "transparent",
              fontWeight: "bold",
              color: "#002060",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
              fontSize: "12px", // Decrease header font size
            },
            "& .MuiDataGrid-cell": {
              color: "#000000",
              fontSize: "12px", // Decrease font size for cell values
              padding: "4px", // Optional: Reduce padding for compact look
            },
            "& .MuiDataGrid-row:nth-of-type(odd)": {
              backgroundColor: "#F5F5F5",
            },
          }}
      />
    </Box>
  );
};

export default GapDataTable;
