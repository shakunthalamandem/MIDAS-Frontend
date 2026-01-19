import React, { useMemo, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Card, CardContent, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PublicIcon from "@mui/icons-material/Public";
import CategoryIcon from "@mui/icons-material/Category";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";


interface DealInfoTableUIMainProps {
  data: any[];
}

const DealInfoTableUIMain: React.FC<DealInfoTableUIMainProps> = ({ data }) => {
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
  const headerRow = data && data.length > 0 ? data[0] : {};


  const preprocessRows = (rows: any[]) =>
    rows.map((row, index) => ({
      id: index,
      ...row,
      deal_size: row.deal_size ? formatDealSize(row.deal_size.toFixed()) : "$0",
      gics_sector_from_bloomberg: row.gics_sector_from_bloomberg || "N/A",
      broad_region: row.broad_region || "N/A",
      deal_type: row.deal_type || "N/A",
      fo_type: row.deal_type === "IPO" ? "-" : row.fo_type || "-",
      issue_offer_price: row.issue_offer_price ? formatDealSize(row.issue_offer_price.toFixed(2)) : "$0",
      ioi_deal_size: row.ioi_deal_size ? `${row.ioi_deal_size.toFixed(2)}%` : "0%",
      allocation_return: row.allocation_return ? `${formatDealSize(row.allocation_return.toFixed())}` : "$0",
      allocation_ioi_percentage: row.allocation_ioi_percentage ? `${row.allocation_ioi_percentage.toFixed(2)}%` : "0%",

      t1m_return_actual: row.t1m_return_actual ? `${row.t1m_return_actual.toFixed(2)}%` : "0%",
      t1d_return_actual: row.t1d_return_actual ? `${row.t1d_return_actual.toFixed(2)}%` : "0%",
      am_return_difference: row.am_return_difference ? `${row.am_return_difference.toFixed(2)}%` : "0%",
      am_return: row.am_return ? `${formatDealSize(row.am_return.toFixed())}` : "$0",
      total_committed_capital: row.total_committed_capital ? `${formatDealSize(row.total_committed_capital.toFixed())}` : "$0",
      am_capital_committed: row.am_capital_committed ? `${formatDealSize(row.am_capital_committed.toFixed())}` : "$0",
      allocated_capital: row.allocated_capital ? `${formatDealSize(row.allocated_capital.toFixed())}` : "$0",
      allocation_deal_size_percentage: row.allocation_deal_size_percentage ? `${row.allocation_deal_size_percentage.toFixed(2)}%` : "0%",
      monahsee_actual_total: row.monahsee_actual_total ? `${formatDealSize(row.monahsee_actual_total.toFixed())}` : "$0",
      

    }));
 

  const filteredRows = useMemo(() => {
    return preprocessRows(rows).filter((row) =>
      row.ticker?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rows, searchQuery]);

  const columns: GridColDef[] = [ {
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
        href={`/opportunity/equity/${params.value}`}
        style={{
          color: "brown",
          fontWeight: "bold",
          paddingLeft: 15,
          textDecoration: "none",
        }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {params.value}
      </Link>
    </div>
  ),
}, 

  { field: "pricing_date", headerName: "Pricing Date", width: 100 },
     { field: "first_trade_date", headerName: "First Trade Date", width: 100 },
    { field: "issuer_name", headerName: "Issuer Name", width: 200 },
    { field: "deal_type", headerName: "Deal Type", width: 80 },
    { field: "fo_type", headerName: "FO Type", width: 80, align: "left" },
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
},

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
    field:"ioi_deal_size",
    headerName:"IOI % of Deal Size",
    width:150,
      renderCell: (params) => `${params.value}`,
    sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },

    { 
    field: "t1m_return_actual", 
    headerName: "T+1Month Return", 
    width: 140,
    renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
    { 
    field: "t1d_return_actual", 
    headerName: "T+1Day Return", 
    width: 140,
    renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
  {field: "am_return_difference",
    headerName: "AM Return",
    width: 215,
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
  field: "allocation_return", 
  headerName: "Monashee Actual Allocation PnL(Gross)", 
  width: 280,
  renderCell: (params) => `${params.value}`,
  sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  cellClassName: "first-column-border",

},

{ 
  field: "am_return", 
  headerName: "Monashee Actual AM PnL(Gross)", 
  width: 215,
  renderCell: (params) => `${params.value}`,
  sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
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

];

return (
  <>
 <Paper
  elevation={3}
  sx={{
    p: 2,
    mb: 2,
    borderRadius: 3,
    backgroundColor: "#f8f9fb",
  }}
>
  {/* Title Section */}
  <Typography
    variant="h6"
    fontWeight={600}
    sx={{
      mb: 2,
      textAlign: 'center',  // Center-align the text
      color: '#002060',  // Set text color
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',  // Set the font family
    }}
  >
    Past Deals of the Sector for the Comparison
  </Typography>

  {/* Existing Stack Content */}
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={4}
    alignItems="center"
    justifyContent="space-between"
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <BusinessIcon color="primary" />
      <Typography variant="body1" fontWeight={500}>
        Sector: <strong>{headerRow.gics_sector_from_bloomberg}</strong>
      </Typography>
    </Stack>
    <Stack direction="row" spacing={2} alignItems="center">
      <PublicIcon color="success" />
      <Typography variant="body1" fontWeight={500}>
        Region: <strong>{headerRow.broad_region}</strong>
      </Typography>
    </Stack>
    <Stack direction="row" spacing={2} alignItems="center">
      <CategoryIcon color="secondary" />
      <Typography variant="body1" fontWeight={500}>
        Deal Type: <strong>{headerRow.deal_type}</strong>
      </Typography>
    </Stack>
  </Stack>

  <Stack direction="row" spacing={1} alignItems="center" mt={2}>
    <InfoOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
    <Typography variant="body2" color="text.secondary">
      Below table consists of past 2 years of performance for tickers
      Monashee participated in.
    </Typography>
  </Stack>
</Paper>





      <Box sx={{ height: 450, width: "100%", marginTop: 3 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSizeOptions={[25, 50, 100]}
          sortingOrder={["asc", "desc"]}
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
              backgroundColor: "#F8F9CD",
            },
            "& .ticker-cell": {
              fontWeight: "bold",
              color: "#96000A",
            },
          }}
        />
      </Box>



  </>
);
};

export default DealInfoTableUIMain;
