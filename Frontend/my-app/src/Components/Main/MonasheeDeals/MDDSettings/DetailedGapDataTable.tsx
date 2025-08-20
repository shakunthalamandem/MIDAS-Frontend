import React, { useMemo, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Button, Card, CardContent, TextField } from "@mui/material";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface DetailedGapDataTableProps {
  data: any[];
}

const DetailedGapDataTable: React.FC<DetailedGapDataTableProps> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [rows, setRows] = useState<any[]>(data);

const cleanDealSize = (dealSize: any): number => {
  if (dealSize == null || dealSize === "") return 0;
  const cleanedValue = parseFloat(dealSize.toString().replace(/[^0-9.-]+/g, ""));
  return isNaN(cleanedValue) ? 0 : cleanedValue;
};

const formatDealSize = (dealSize: any) => {
  const cleanedValue = cleanDealSize(dealSize);
  const isNegative = cleanedValue < 0;
  const absoluteValue = Math.abs(cleanedValue);
  const formattedValue = absoluteValue.toLocaleString("en-US");
  return (isNegative ? "-$" : "$") + formattedValue;
};
  const exportToExcel = () => {
    const exportData = rows.map(({ id, ...row }) => row);
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Deals");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, "Deal_Detailed_Gap_Analysis.xlsx");
  };

  const preprocessRows = (rows: any[]) =>
    rows.map((row, index) => ({
      id: index,
      ...row,
      deal_size: row.deal_size ? formatDealSize(row.deal_size.toFixed()) : "$0",
      issue_offer_price: row.issue_offer_price ? formatDealSize(row.issue_offer_price.toFixed(2)) : "$0",
      allocation_return: row.allocation_return ? `${formatDealSize(row.allocation_return.toFixed())}` : "$0",
      allocation_ioi_percentage: row.allocation_ioi_percentage ? `${row.allocation_ioi_percentage.toFixed()}%` : "0%",
      model_am_return: row.model_am_return ? `${formatDealSize(row.model_am_return.toFixed())}` : "$0",
      total_model_capital: row.total_model_capital ? `${formatDealSize(row.total_model_capital.toFixed())}` : "$0",
      model_am_capital: row.model_am_capital ? `${formatDealSize(row.model_am_capital.toFixed())}` : "$0",
      model_return_1_allocation: row.model_return_1_allocation ? `${formatDealSize(row.model_return_1_allocation.toFixed())}` : "$0",
      model_capital_1_allocation: row.model_capital_1_allocation ? `${formatDealSize(row.model_capital_1_allocation.toFixed())}` : "$0",
      model_actual_return: row.model_actual_return ? `${formatDealSize(row.model_actual_return.toFixed())}` : "$0",
      am_return: row.am_return ? `${formatDealSize(row.am_return.toFixed())}` : "$0",
      t1d_return_from_bloomberg: row.t1d_return_from_bloomberg ? `${row.t1d_return_from_bloomberg.toFixed(2)}%` : "",
      t1m_return_from_bloomberg: row.t1m_return_from_bloomberg ? `${row.t1m_return_from_bloomberg.toFixed(2)}%` : "",
      total_committed_capital: row.total_committed_capital ? `${formatDealSize(row.total_committed_capital.toFixed())}` : "$0",
      am_capital_committed: row.am_capital_committed ? `${formatDealSize(row.am_capital_committed.toFixed())}` : "$0",
      allocated_capital: row.allocated_capital ? `${formatDealSize(row.allocated_capital.toFixed())}` : "$0",
      allocation_price: row.allocation_price ? `${row.allocation_price.toFixed()}%` : "",
      subscription_bid_shares: row.subscription_bid_shares ? `${row.subscription_bid_shares.toFixed(2)}%` : "",
      allocation_deal_size_percentage: row.allocation_deal_size_percentage ? `${row.allocation_deal_size_percentage.toFixed(2)}%` : "0%",
      model_actual_total: row.model_actual_total ? `${formatDealSize(row.model_actual_total.toFixed())}` : "$0",
      monahsee_actual_total: row.monahsee_actual_total ? `${formatDealSize(row.monahsee_actual_total.toFixed())}` : "$0",
      model_actual_am_return: row.model_actual_am_return ? `${formatDealSize(row.model_actual_am_return.toFixed())}` : "$0",
      model_allocation_gap: row.model_allocation_gap ? `${formatDealSize(row.model_allocation_gap.toFixed())}` : "$0",
      monashee_exit_gap: row.monashee_exit_gap ? `${formatDealSize(row.monashee_exit_gap.toFixed())}` : "$0",
      am_gap: row.am_gap ? `${formatDealSize(row.am_gap.toFixed())}` : "$0",
      am_exit_gap: row.am_exit_gap ? `${formatDealSize(row.am_exit_gap.toFixed())}` : "$0",
      total_gap: row.monahsee_actual_total - row.model_actual_total 
      ? formatDealSize((row.monahsee_actual_total - row.model_actual_total).toFixed()) 
      : "$0",
      

    }));
 

  const filteredRows = useMemo(() => {
    return preprocessRows(rows).filter((row) =>
      row.ticker?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rows, searchQuery]);

  const columns: GridColDef[] = [
 {
      field: "ticker",
      headerName: "Ticker",
      width: 100,
      headerAlign: "left",
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            justifyContent: "left",
            alignItems: "left",
            height: "100%",
          }}
        >

          <Link
            to={`/opportunity/equity/${params.value}`}
            style={{ color: "brown", fontWeight: "bold",paddingLeft:15,textDecoration: "none" }}
            target="_blank"
          >
            {params.value}
          </Link>
        </div>
      ),
    },    { field: "pricing_date", headerName: "Pricing Date", width: 100 },
     { field: "first_trade_date", headerName: "First Trade Date", width: 100 },
    { field: "issuer_name", headerName: "Issuer Name", width: 200 },
    { field: "deal_type", headerName: "Deal Type", width: 80 },
    { field: "fo_type", headerName: "FO Type", width: 80 },
    { field: "broad_region", headerName: "Region", width: 80 },
    {
      field: "deal_size",
      headerName: "Deal Size",
      width: 120,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
        {
      field: "issue_offer_price",
      headerName: "Issue Offer Price",
      width: 120,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    { field: "gics_sector_from_bloomberg", headerName: "Sector", width: 180 },
{
  field: "number_of_shares_offered",
  headerName: "Shares Offered",
  width: 120,
  valueFormatter: (params) => {
    const value = Number(params);
    return isNaN(value) ? '' : value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
}
,
  { 
    field: "allocation_deal_size_percentage", 
    headerName: "Allocation % of Deal Size", 
    width: 180,
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
    field: "t1m_return_from_bloomberg", 
    headerName: "T+1Month Return", 
    width: 140,
    renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
  { 
    field: "allocated_capital", 
    headerName: "Allocation Capital", 
    width: 180,
    renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "am_capital_committed",
      headerName: "AM Capital Committed",
      width: 150,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "total_committed_capital",
      headerName: "Total Committed Capital",
      width: 160,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
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
      field: "total_model_capital",
      headerName: "Total Model Capital",
      width: 180,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),

    }
    
,    
{ 
  field: "allocation_return", 
  headerName: "Monashee Actual Allocation PnL(Gross)", 
  width: 280,
  renderCell: (params) => `${params.value}`,
  sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  cellClassName: "first-column-border",

},
{ 
  field: "model_actual_return", 
  headerName: "Model PnL With Actual Allocation(Gross)", 
  width: 260,
  renderCell: (params) => `${params.value}`,
  sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
},
{ 
  field: "model_return_1_allocation", 
  headerName: "Model PnL with Model Allocation", 
  width: 260,
  renderCell: (params) => `${params.value}`,
  sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
},
{ 
  field: "model_allocation_gap", 
  headerName: "Model Allocation Gap", 
  width: 180,
  renderCell: (params) => `${params.value}`,
  sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  cellClassName: "highlight-cell",
},
{ 
  field: "monashee_exit_gap", 
  headerName: "Monashee Exit Gap", 
  width: 150,
  renderCell: (params) => `${params.value}`,
  sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  cellClassName: "last-columns-border highlight-cell",

},
{ 
  field: "am_return", 
  headerName: "Monashee Actual AM PnL(Gross)", 
  width: 215,
  renderCell: (params) => `${params.value}`,
  sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
},
{ 
  field: "model_actual_am_return", 
  headerName: "Model PnL with Actual AM", 
  width: 215,
  renderCell: (params) => `${params.value}`,
  sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
},
{ 
  field: "model_am_return", 
  headerName: "Model PnL with Model AM(Gross)", 
  width: 220,
  renderCell: (params) => `${params.value}`,
  sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  // cellClassName: "last-columns-border",
},
{ 
  field: "am_gap", 
  headerName: "Model AM Gap", 
  width: 120,
  renderCell: (params) => `${params.value}`,
  sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  cellClassName: "highlight-cell",
},
{ 
  field: "am_exit_gap", 
  headerName: "Monashee AM Exit Gap", 
  width: 180,
  renderCell: (params) => `${params.value}`,
  sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  cellClassName: "last-columns-border   highlight-cell",
},
{
  field: "monahsee_actual_total", 
  headerName: "Monashee Actual Total PnL(Gross)",
  width: 220,
  renderCell: (params) => {
    return `${params.value}`;
  },
  sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
},
{ 
  field: "model_actual_total", 
  headerName: "Model Actual Total PnL(Gross)", 
  width: 220,
  renderCell: (params) => `${params.value}`,
  sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  // cellClassName: "last-columns-border",
},
{
  field: "total_gap", 
  headerName: "Total Gap",
  width: 120,
  renderCell: (params) => {
    return `${params.value}`;
  },
  sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  cellClassName: "last-columns-border highlight-cell",
 
},


];

return (
<Box mb={15} sx={{ height: 600, width: "100%" }}>
  <Card>
    <CardContent>
      <Box sx={{ display: "flex", marginBottom: 2 }}>
        <TextField
          label="Search by Ticker"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: "200px" }}
        />
      </Box>
        <Button
            variant="contained"
            onClick={exportToExcel}
            sx={{
              backgroundColor: "#002060",
              color: "#fff",
              textTransform: "none",
            }}
          >
            Export to Excel
          </Button>
      <Box sx={{ height: 600, width: "100%", marginTop: 3 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSizeOptions={[25, 50, 100]}
          disableRowSelectionOnClick
          rowHeight={35}

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
            "& .first-column-border": {
              borderLeft: "2px solid rgb(110, 110, 110)",
            },
            "& .last-columns-border": {
              borderRight: "2px solid rgb(110, 110, 110)",
            },
            "& .highlight-cell": {
              backgroundColor: "#F8F9CD",},
          }}
        />
      </Box>
    </CardContent>
  </Card>
</Box>
);
};

export default DetailedGapDataTable;
