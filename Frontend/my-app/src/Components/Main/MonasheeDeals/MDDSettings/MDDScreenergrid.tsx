import React, { useState, useEffect, useMemo } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Container, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";

// Define the type for each row of data with updated column names
interface ScreenerDataRow {
  id: number; // Unique ID for each row
  pricing_date: string;
  issuer_name: string;
  ticker: string;
  gics_sector_from_bloomberg: string;
  broad_region: string;
  deal_type: string;
  deal_size: number;
  deal_captain: string;
  fo_discount:number;
  issue_price_lcl: number;
  t1m_excess_returns: number;
  t1d_return_from_bloomberg: number;
  discount_from_announcement_price: number;
  allocation_deal_size_percentage: number;
  average_hold_period: number;
  selected_bank: string;
  last_price_t1: number;
  issue_offer_price: number;
  subscription_bid_shares: number;
  allocated_shares: number;

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
    t1d_returns: row.t1d_returns ? `${row.t1d_returns.toFixed(2)}%` : "",
    t1m_returns: row.t1m_returns ? `${row.t1m_returns.toFixed(2)}%` : "",
    percentage_primary: row.percentage_primary ? `${row.percentage_primary.toFixed()}%` : "",
    fo_discount: row.fo_discount ? `${row.fo_discount.toFixed(2)}%` : "",
    t1m_excess_returns: row.t1m_excess_returns ? `${row.t1m_excess_returns.toFixed(2)}%` : "",
    t1d_return_from_bloomberg: row.t1d_return_from_bloomberg ? `${row.t1d_return_from_bloomberg.toFixed(2)}%` : "",
    discount_from_announcement_price: row.discount_from_announcement_price ? `${row.discount_from_announcement_price.toFixed(2)}%` : "",
    allocation_deal_size: row.allocation_deal_size ? `${row.allocation_deal_size.toFixed(2)}%` : "",
    allocation_ioi: row.allocation_ioi ? `${row.allocation_ioi.toFixed(2)}%` : "",
    allocation_deal_size_percentage: row.allocation_deal_size_percentage && !isNaN(parseFloat(row.allocation_deal_size_percentage))
      ? `${parseFloat(row.allocation_deal_size_percentage).toFixed(2)}%`
      : "%",
    tplus_1d_issueprice: row.tplus_1d_issueprice ? `${row.tplus_1d_issueprice.toFixed(2)}%` : "",
  }));

interface MDDScreenergridProps {
  sectorwiseData: { [key: string]: (string | number)[] };
}

const MDDScreenergrid: React.FC<MDDScreenergridProps> = ({
  sectorwiseData,
}) => {
  const [rows, setRows] = useState<ScreenerDataRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (sectorwiseData) {
      fetchDataFromApi(sectorwiseData);
    }
  }, [sectorwiseData]);

  const fetchDataFromApi = async (
    data: MDDScreenergridProps["sectorwiseData"]
  ) => {
    setLoading(true);
    setError(null);

    const payload = {
      region: data.broad_region, // Array of regions
      deal_captain: data.deal_captain, // Array of deal captains
      deal_type: data.deal_type, // Array of deal types
      sector: data.gics_sector, // Array of sectors
      selected_bank: data.selected_bank, // Array of lead banks
      year_range: data.years // Array of years

    };

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }

      const response = await fetch(`${apiUrl}/api/mdd_screener/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setRows(
          (result.data || []).map((item: ScreenerDataRow, index: number) => ({
            ...item,
            id: index + 1,
            deal_size: formatDealSize(item.deal_size),
          }))
        );
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "ticker",
      headerName: "Ticker",
      width: 100,
      headerAlign: "center",
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >

          <Link
            to={`/monasheeperformance/${params.value}`}
            style={{ color: "brown", fontWeight: "bold",paddingLeft:15,textDecoration: "none" }}
            target="_blank"
          >
            {params.value}
          </Link>
        </div>
      ),
    }
    
,        { field: "issuer_name", headerName: "Issuer Name", width: 200 },
    { field: "pricing_date", headerName: "Pricing Date", width: 150 },
    {
      field: "gics_sector_from_bloomberg",
      headerName: "Sector",
      width: 180,
    },
    { field: "broad_region", headerName: "Region", width: 150 },
    { field: "deal_type", headerName: "Deal Type", width: 150 },
    {
      field: "deal_size",
      headerName: "Deal Size",
      width: 120,
      renderCell: (params) => params.value,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    { field: "deal_captain", headerName: "Deal Caption", width: 150 },
    { field: "selected_bank", headerName: "Lead Bank", width: 150 },
    { field: "fo_type", headerName: "FO Type", width: 100 },
    {
      field: "t1m_returns",
      headerName: "T + 1M Excess Returns",
      width: 200,
      renderCell: (params) => params.value,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "t1d_returns",
      headerName: "T + 1D Return ",
      width: 220,
      renderCell: (params) => params.value,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },

    {
      field: "allocation_deal_size",
      headerName: "Allocation as % of Deal Size",
      width: 250,
      renderCell: (params) => params.value,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    { field: "allocation_ioi", headerName: "Allocation as % of IOI", width: 180 },
    {
      field: "average_hold_period",
      headerName: "Average Hold Period",
      width: 180,
      renderCell: (params) => params.value,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "tplus_1d_issueprice",
      headerName: "T + 1D issueprice",
      width: 180,
      renderCell: (params) => params.value,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "fo_discount",
      headerName: "Follow On Discount",
      width: 180,
      renderCell: (params) => params.value,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "percentage_primary", headerName: "Primary %", width: 100,

      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
  ];

  const filteredRows = useMemo(() => {
    return preprocessRows(rows).filter((row) =>
      row.ticker?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rows, searchQuery]);

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
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
            {" "}
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
      </div>
    </Container>
  );
};

export default MDDScreenergrid;
