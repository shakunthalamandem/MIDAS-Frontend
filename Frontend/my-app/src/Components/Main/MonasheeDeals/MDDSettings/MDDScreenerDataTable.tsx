import React, { useState, useEffect ,useMemo} from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, TextField, Typography } from "@mui/material";
import MDDScreenerSummary from "./MDDScrennerSummary";
// Define the type for each row of data
interface ScreenerDataRow {
  id: number; // Unique ID for each row
  pricing_date: string;
  issuer_name: string;
  ticker: string;
  gics_sector_from_bloomberg: string;
  broad_region: string;
  deal_type: string;
  deal_size: number;
  issue_price_lcl: number;
  t1m_excess_returns: number;
  t1d_return_from_bloomberg: number;
  discount_from_announcement_price: number;
  allocation_deal_size_percentage: number;
  average_hold_period: number;
  last_price_t1: number;
  issue_offer_price: number;
  subscription_bid_shares: number;
  allocated_shares: number;
}
interface MDDScreenerDataTableProps {
  sectorwiseData: { [key: string]: (string | number)[] };
}


const cleanDealSize = (dealSize: any): number => {
  if (dealSize == null || dealSize === "") return 0; // Handle null, undefined, or empty values
  const cleanedValue = parseFloat(dealSize.toString().replace(/[^0-9.-]+/g, ""));
  return isNaN(cleanedValue) ? 0 : cleanedValue; // Return 0 if parsing fails
};

const formatDealSize = (dealSize: any) => {
  const cleanedValue = cleanDealSize(dealSize);
  return "$" + cleanedValue.toLocaleString("en-US");
};



const preprocessRows = (rows: any[]) =>
  rows.map((row, index) => ({
    id: index,
    ...row,
    percentage_primary: row.percentage_primary ? `${row.percentage_primary.toFixed()}%` : "",
    fo_discount: row.fo_discount ? `${row.fo_discount.toFixed(2)}%` : "",
    t1d_returns: row.t1d_returns ? `${row.t1d_returns.toFixed(2)}%` : "",
    t1m_returns: row.t1m_returns ? `${row.t1m_returns.toFixed(2)}%` : "",
    allocation_deal_size: row.allocation_deal_size ? `${row.allocation_deal_size.toFixed(2)}%` : "",
    tplus_1d_issueprice: row.tplus_1d_issueprice ? `${row.tplus_1d_issueprice.toFixed(2)}%` : "",
  }));



const MDDScreenerDataTable: React.FC<MDDScreenerDataTableProps> = ({
  sectorwiseData,
}) => {
  const [rows, setRows] = useState<ScreenerDataRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (sectorwiseData) {
      fetchData(sectorwiseData);
    }
  }, [sectorwiseData]);

  const fetchData = async (
    data: MDDScreenerDataTableProps["sectorwiseData"]
  ) => {
    setLoading(true);
    setError(null);

    const payload = {
      allocation_deal_size: data.allocation_deal_size,
      allocation_ioi: data.allocation_ioi,
      average_hold_period: data.average_hold_period,
      deal_captain: data.deal_captain,
      deal_type: data.deal_type,
      deal_value: data.deal_value,
      fo_discount: data.fo_discount,
      percentage_primary: data.percentage_primary,
      region: data.region,
      sector: data.sector,
      selected_bank: data.selected_bank,
      sponsor: data.sponsor,
      t1d_returns: data.t1d_returns,
      t1m_returns: data.t1m_returns,
      tplus_1d_issueprice: data.tplus_1d_issueprice,
      year_range: data.year_range
  };
  

    try {
      const apiUrl = process.env.REACT_APP_API_URL;

      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }

      const response = await fetch(`${apiUrl}/api/mdd_screener/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        const formattedRows = (result.data || []).map(
          (item: ScreenerDataRow, index: number) => ({
            ...item,
            id: index + 1,
            deal_size: formatDealSize(item.deal_size),
          })
        );
        setRows(formattedRows);
        setApiResponse(result);
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };
  const filteredRows = useMemo(() => {
    return preprocessRows(rows).filter((row) =>
      row.ticker?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rows, searchQuery]);

  const columns: GridColDef[] = [
    { field: "pricing_date", headerName: "Pricing Date", width: 100 },
    { field: "issuer_name", headerName: "Issuer Name", width: 200 },
    { field: "ticker", headerName: "Ticker", width: 100 },
    {
      field: "gics_sector_from_bloomberg",
      headerName: "Sector (From Bloomberg)",
      width: 180,
    },
    { field: "broad_region", headerName: "Region", width: 100 },
    { field: "deal_type", headerName: "Deal Type", width: 100 },
    {
      field: "deal_size",
      headerName: "Deal Size",
      width: 120,
      renderCell: (params) => params.value,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "t1m_returns",
      headerName: "T + 1M Excess Returns",
      width: 150,
      renderCell: (params) => params.value,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "t1d_returns",
      headerName: "T + 1D Return",
      width: 150,
      renderCell: (params) => params.value,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "allocation_deal_size",
      headerName: "Allocation Deal Size %",
      width: 150,
      renderCell: (params) => params.value,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "average_hold_period",
      headerName: "Average Hold Period",
      width: 150,
    }, { field: "tplus_1d_issueprice", headerName: "T + 1D issueprice", width: 100 ,renderCell: (params) => `${params.value}`,
    sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),},
    { field: "fo_discount", headerName: "Follow On Discount", width: 100,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "percentage_primary", headerName: "Primary %", width: 100,

      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    { field: "sponsor", headerName: "Sponsor", width: 70 }];


  return (
    <>
      <div style={{ height: 600, width: "100%" }}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading && <p>Loading...</p>}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            align="left"
            style={{
              fontWeight: "bold",
              color: "#fd0303",
              marginBottom: "15px",
            }}
          >
            Total no of deals:{" "}
            <span style={{ color: "#004b33" }}>{filteredRows.length}</span>
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search Ticker"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 300 }}
          />
        </Box>

        <DataGrid
          rows={filteredRows}
          columns={columns}
          rowCount={filteredRows.length}
          loading={loading}
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
          }}
        />
      </div>
      <Box mt={2} mb={4}>
        <MDDScreenerSummary apiResponse={apiResponse} />
      </Box>
    </>
  );
};

export default MDDScreenerDataTable;