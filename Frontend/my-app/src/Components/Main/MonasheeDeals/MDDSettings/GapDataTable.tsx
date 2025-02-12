import React, { useMemo, useState } from "react";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Box, TextField } from "@mui/material";

interface GapDataTableProps {
  data: any[];
}

const GapDataTable: React.FC<GapDataTableProps> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [rows, setRows] = useState<any[]>(data);

  const cleanDealSize = (dealSize: any): number => {
    if (dealSize == null || dealSize === "") return 0;
    const cleanedValue = parseFloat(dealSize.toString().replace(/[^0-9.-]+/g, ""));
    return isNaN(cleanedValue) ? 0 : cleanedValue;
  };

  const formatDealSize = (dealSize: any) => {
    const cleanedValue = cleanDealSize(dealSize);
    const formattedValue = cleanedValue < 0 ? `-$${Math.abs(cleanedValue).toLocaleString("en-US")}` : `$${cleanedValue.toLocaleString("en-US")}`;
    return formattedValue;
  };
  
  const preprocessRows = (rows: any[]) =>
    rows.map((row, index) => ({
      id: index,
      ...row,
      deal_size: row.deal_size ? formatDealSize(row.deal_size.toFixed()) : "$0",
      
      allocation_return: row.allocation_return ? `$${row.allocation_return.toFixed()}` : "0%",
      allocation_ioi_percentage: row.allocation_ioi_percentage ? `${row.allocation_ioi_percentage.toFixed()}%` : "0%",
      model_am_return: row.model_am_return ? `${formatDealSize(row.model_am_return.toFixed())}` : "",
      model_am_capital: row.model_am_capital ? `${formatDealSize(row.model_am_capital.toFixed())}` : "",
      model_return_1_allocation: row.model_return_1_allocation ? `${formatDealSize(row.model_return_1_allocation.toFixed())}` : "",
      model_capital_1_allocation: row.model_capital_1_allocation ? `${formatDealSize(row.model_capital_1_allocation.toFixed())}` : "",
      model_actual_return: row.model_actual_return ? `${formatDealSize(row.model_actual_return.toFixed())}` : "",
      // allocation_ioi_percentage: row.allocation_ioi_percentage ? `${row.allocation_ioi_percentage.toFixed(2)}%` : "",
      // allocation_return: row.allocation_return ? `${row.allocation_return.toFixed(2)}%` : "",
      am_return: row.am_return ? `${formatDealSize(row.am_return.toFixed())}` : "",
      t1d_return_from_bloomberg: row.t1d_return_from_bloomberg ? `${row.t1d_return_from_bloomberg.toFixed(2)}%` : "",
      t1m_return_from_dealogic: row.t1m_return_from_dealogic ? `${row.t1m_return_from_dealogic.toFixed(2)}%` : "",
      total_committed_capital: row.total_committed_capital ? `${formatDealSize(row.total_committed_capital.toFixed())}` : "",
      am_capital_committed: row.am_capital_committed ? `${formatDealSize(row.am_capital_committed.toFixed())}` : "",
      allocated_capital: row.allocated_capital ? `${formatDealSize(row.allocated_capital.toFixed())}` : "",
      allocation_price: row.allocation_price ? `${row.allocation_price.toFixed()}%` : "",
      subscription_bid_shares: row.subscription_bid_shares ? `${row.subscription_bid_shares.toFixed(2)}%` : "",
      allocation_deal_size_percentage: row.allocation_deal_size_percentage ? `${row.allocation_deal_size_percentage.toFixed(2)}%` : "",
      // deal_size: row.deal_size ? `${row.deal_size.toFixed(2)}%` : "",
      
    }));

  // Filter rows based on search query
  const filteredRows = useMemo(() => {
    return preprocessRows(rows).filter((row) =>
      row.ticker_us?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rows, searchQuery]);

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
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    { field: "gics_sector_from_bloomberg", headerName: "Sector", width: 180 },
  { 
    field: "allocation_deal_size_percentage", 
    headerName: "Allocation %", 
    width: 140,
    renderCell: (params) => `${params.value}`,
    sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
  { 
    field: "allocation_ioi_percentage", 
    headerName: "Allocation IOI %", 
    width: 150,
    renderCell: (params) => `${params.value}`,
    sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
  { 
    field: "t1m_return_from_dealogic", 
    headerName: "T+1Month Return", 
    width: 140,
    renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
  // { 
  //   field: "subscription_bid_shares", 
  //   headerName: "Subscription Bid Shares", 
  //   width: 180,
  //   valueFormatter: (params) => Number(params).toLocaleString(),
  // },
  // { 
  //   field: "allocation_price", 
  //   headerName: "Allocation Price", 
  //   width: 150,
  //   renderCell: (params) => `${params.value}`,
  //     sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  // },
  { 
    field: "allocated_capital", 
    headerName: "Allocated Capital", 
    width: 180,
    renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
  { 
    field: "am_capital_committed", 
    headerName: "AM Capital Committed", 
    width: 180,
    renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
  { 
    field: "total_committed_capital", 
    headerName: "Total Committed Capital", 
    width: 180,
    renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
  // { 
  //   field: "t1d_return_from_bloomberg", 
  //   headerName: "T1D Return", 
  //   width: 140,
  //   renderCell: (params) => `${params.value}`,
  //     sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  // },
    { 
      field: "model_capital_1_allocation", 
      headerName: "Model Allocation", 
      width: 180,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    { 
      field: "model_am_capital", 
      headerName: "Model AM Capital", 
      width: 180,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    { 
      field: "allocation_return", 
      headerName: "Monashee Actual Allocation PnL(Gross)", 
      width: 150,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    { 
      field: "model_actual_return", 
      headerName: "Model PnL With Actual Allocation(Gross)", 
      width: 160,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    { 
      field: "model_return_1_allocation", 
      headerName: "Model PnL with Model Allocation", 
      width: 180,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    { 
      field: "am_return", 
      headerName: "Monashee Actual AM PnL(Gross)", 
      width: 140,
      renderCell: (params) => `${params.value}`,
        sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    { 
      field: "model_am_return", 
      headerName: "Model PnL with Model AM(Gross)", 
      width: 150,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    { 
      field: "allocation_return" + "am_return", 
      headerName: "Monashee Actual Total PnL(Gross)", 
      width: 150,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    
    { 
      field: "model_return_1_allocation" + "model_am_return", 
      headerName: "Model Actual Total PnL(Gross)", 
      width: 150,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
  ];

  return (
    <Box sx={{ height: 600, width: "100%", overflowX: "auto", padding: "10px" }}>
      <Box sx={{ display: "flex", marginBottom: 2,marginLeft: 2 }}>
  <TextField
    label="Search by Ticker"
    variant="outlined"
    size="small"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    sx={{ width: "200px" }}
  />
</Box>


      
      <DataGrid
        rows={filteredRows}
        columns={columns}
        pageSizeOptions={[25, 50, 100]}
        disableRowSelectionOnClick
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "transparent",
            fontWeight: "bold",
            color: "#002060",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "bold",
            fontSize: "12px",
          },
          "& .MuiDataGrid-cell": {
            color: "#000000",
            fontSize: "12px",
            padding: "4px",
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