import React, { useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Card, CardContent, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PublicIcon from "@mui/icons-material/Public";
import CategoryIcon from "@mui/icons-material/Category";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";


interface NewDashboardLifeCyclePeerDealsProps {
  data?: any[];
  selectedDeal?: {
    ticker?: string;
    deal_type?: string;
    fo_type?: string;
    broad_region?: string;
    gics_sector?: string;
    years?: string[];
    region?: string;
    sector?: string;
  };
}

const NewDashboardLifeCyclePeerDeals: React.FC<NewDashboardLifeCyclePeerDealsProps> = ({
  data,
  selectedDeal,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [rows, setRows] = useState<any[]>(data ?? []);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (data) {
      setRows(data);
    }
  }, [data]);

  useEffect(() => {
    if (!selectedDeal || data) return;
    const fetchData = async () => {
      try {
        const payload = {
          deal_type: selectedDeal.deal_type ? [selectedDeal.deal_type] : [],
          fo_type: selectedDeal.fo_type ? [selectedDeal.fo_type] : [],
          broad_region: selectedDeal.broad_region
            ? [selectedDeal.broad_region]
            : selectedDeal.region
            ? [selectedDeal.region]
            : [],
          gics_sector: selectedDeal.gics_sector
            ? [selectedDeal.gics_sector]
            : selectedDeal.sector
            ? [selectedDeal.sector]
            : [],
          years: selectedDeal.years ?? [],
        };

        const response = await fetch(`${apiUrl}/api/detailed_gap_analysis/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();
        setRows(result.data || []);
      } catch (error) {
        console.error("Error fetching peer deals:", error);
      }
    };

    fetchData();
  }, [selectedDeal, data, apiUrl, token]);

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

const averageValue = (list: any[], getter: (row: any) => number) => {
  const values = list
    .map((row) => getter(row))
    .filter((value) => Number.isFinite(value));
  if (values.length === 0) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
};

const getPricingDateValue = (pricingDate: any): number => {
  if (!pricingDate) return 0;
  const dateValue = new Date(pricingDate).getTime();
  return isNaN(dateValue) ? 0 : dateValue;
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
    return preprocessRows(rows)
      .filter((row) => row.ticker?.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort(
        (a, b) => getPricingDateValue(b.pricing_date) - getPricingDateValue(a.pricing_date)
      )
      .slice(0, 15);
  }, [rows, searchQuery]);

  const averageMetrics = useMemo(() => {
    return {
      dealSize: averageValue(filteredRows, (row) => cleanDealSize(row.deal_size)),
      allocationIoi: averageValue(filteredRows, (row) =>
        cleanDealSize(row.allocation_ioi_percentage)
      ),
      allocationDealSize: averageValue(filteredRows, (row) =>
        cleanDealSize(row.allocation_deal_size_percentage)
      ),
      t1dReturn: averageValue(filteredRows, (row) => cleanDealSize(row.t1d_return_actual)),
      t1mReturn: averageValue(filteredRows, (row) => cleanDealSize(row.t1m_return_actual)),
    };
  }, [filteredRows]);

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
  elevation={0}
  sx={{
    p: 2.5,
    mb: 2,
    borderRadius: 3,
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
  }}
>
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
  <Stack
    direction={{ xs: "column", md: "row" }}
    spacing={3}
    alignItems="center"
    justifyContent="space-between"
  >
    <Box>
      <Typography variant="caption" color="text.secondary">
        Average Deal Size
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#0b1844" }}>
        {formatDealSize(averageMetrics.dealSize)}
      </Typography>
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary">
        Avg Allocation IOI %
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#0b1844" }}>
        {averageMetrics.allocationIoi.toFixed(2)}%
      </Typography>
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary">
        Avg Allocation % of Deal Size
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#0b1844" }}>
        {averageMetrics.allocationDealSize.toFixed(2)}%
      </Typography>
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary">
        Avg T+1 Day Return
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#0b1844" }}>
        {averageMetrics.t1dReturn.toFixed(2)}%
      </Typography>
    </Box>
    <Box>
      <Typography variant="caption" color="text.secondary">
        Avg T+1 Month Return
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "#0b1844" }}>
        {averageMetrics.t1mReturn.toFixed(2)}%
      </Typography>
    </Box>
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
            cursor: "pointer",
            border: "1px solid #ccccccff",
          }}
        />
      </Box>



  </>
);
};

export default NewDashboardLifeCyclePeerDeals;
