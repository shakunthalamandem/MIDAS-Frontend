import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/material";

interface GapDataTableProps {
  data: any[];
}
const columns: GridColDef[] = [
    { field: "pricing_date", headerName: "Pricing Date", flex: 1 },
    { field: "issuer_name", headerName: "Issuer Name", flex: 1 },
    { field: "ticker_us", headerName: "Ticker", flex: 1 },
    { field: "deal_type", headerName: "Deal Type", flex: 1 },
    { field: "broad_region", headerName: "Region", flex: 1 },
    { 
      field: "deal_size", 
      headerName: "Deal Size", 
      flex: 1,
      valueFormatter: (params) => `$${Number(params).toLocaleString()}`,
    },
    { field: "gics_sector_from_bloomberg", headerName: "Sector", flex: 1 },
    { 
      field: "allocation_deal_size_percentage", 
      headerName: "Allocation %", 
      flex: 1,
      valueFormatter: (params) => `${(Number(params) * 100).toFixed(2)}%`,
    },
    { 
      field: "subscription_bid_shares", 
      headerName: "Subscription Bid Shares", 
      flex: 1,
      valueFormatter: (params) => Number(params).toLocaleString(),
    },
    { 
      field: "allocation_price", 
      headerName: "Allocation Price", 
      flex: 1,
      valueFormatter: (params) => `$${Number(params).toFixed(2)}`,
    },
    { 
      field: "allocated_capital", 
      headerName: "Allocated Capital", 
      flex: 1,
      valueFormatter: (params) => `$${Number(params).toLocaleString()}`,
    },
    { 
      field: "am_capital_committed", 
      headerName: "AM Capital Committed", 
      flex: 1,
      valueFormatter: (params) => `$${Number(params).toLocaleString()}`,
    },
    { 
      field: "total_committed_capital", 
      headerName: "Total Committed Capital", 
      flex: 1,
      valueFormatter: (params) => `$${Number(params).toLocaleString()}`,
    },
    { 
      field: "t1m_return_from_dealogic", 
      headerName: "T1M Return", 
      flex: 1,
      valueFormatter: (params) => `${Number(params).toFixed(2)}%`,
    },
    { 
      field: "t1d_return_from_bloomberg", 
      headerName: "T1D Return", 
      flex: 1,
      valueFormatter: (params) => `${Number(params).toFixed(2)}%`,
    },
    { 
      field: "am_return", 
      headerName: "AM Return", 
      flex: 1,
      valueFormatter: (params) => `$${Number(params).toFixed(2)}`,
    },
    { 
      field: "allocation_return", 
      headerName: "Allocation Return", 
      flex: 1,
      valueFormatter: (params) => `$${Number(params).toFixed(2)}`,
    },
    { 
      field: "allocation_ioi_percentage", 
      headerName: "Allocation IOI %", 
      flex: 1,
      valueFormatter: (params) => `${(Number(params) * 100).toFixed(2)}%`,
    },
    { 
      field: "model_actual_return", 
      headerName: "Model Actual Return", 
      flex: 1,
      valueFormatter: (params) => `$${Number(params).toFixed(2)}`,
    },
    { 
      field: "model_capital_1_allocation", 
      headerName: "Model Capital 1 Allocation", 
      flex: 1,
      valueFormatter: (params) => `$${Number(params).toLocaleString()}`,
    },
    { 
      field: "model_return_1_allocation", 
      headerName: "Model Return 1 Allocation", 
      flex: 1,
      valueFormatter: (params) => `$${Number(params).toFixed(2)}`,
    },
    { 
      field: "model_am_capital", 
      headerName: "Model AM Capital", 
      flex: 1,
      valueFormatter: (params) => `$${Number(params).toLocaleString()}`,
    },
    { 
      field: "model_am_return", 
      headerName: "Model AM Return", 
      flex: 1,
      valueFormatter: (params) => `$${Number(params).toFixed(2)}`,
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
