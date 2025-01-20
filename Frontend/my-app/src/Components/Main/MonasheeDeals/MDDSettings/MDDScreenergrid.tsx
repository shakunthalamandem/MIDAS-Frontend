import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Box, Container, TextField, Typography } from "@mui/material";

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

interface MDDScreenergridProps {
  sectorwiseData: { [key: string]: (string | number)[] };
}

const MDDScreenergrid: React.FC<MDDScreenergridProps> = ({
  sectorwiseData,
}) => {
  const [rows, setRows] = useState<ScreenerDataRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 100,
  });
  const [totalRows, setTotalRows] = useState(0); // Total rows from API

  useEffect(() => {
    if (sectorwiseData) {
      fetchDataFromApi(sectorwiseData);
    }
  }, [sectorwiseData, paginationModel]);

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
      lead_bank: data.lead_bank, // Array of lead banks
      year_range: data.years, // Array of years
      page: paginationModel.page + 1, // API pages are often 1-indexed
      pageSize: paginationModel.pageSize,
    };

    try {
      const apiUrl = process.env.REACT_APP_API_URL;

      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }

      const response = await fetch(`${apiUrl}/api/mdd_super_screener/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setRows(
          (result.data || []).map((item: ScreenerDataRow, index: number) => ({
            ...item,
            id: index + 1,
          }))
        );
        setTotalRows(result.pagination?.total_items || 0); // Set total rows
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  // Updated columns with new field names
  const columns: GridColDef[] = [
    { field: "pricing_date", headerName: "Pricing Date", width: 150 },
    { field: "issuer_name", headerName: "Issuer Name", width: 200 },
    { field: "ticker", headerName: "Ticker", width: 150 },
    {
      field: "gics_sector_from_bloomberg",
      headerName: "Sector (From Bloomberg)",
      width: 180,
    },
    { field: "broad_region", headerName: "Region", width: 150 },
    { field: "deal_type", headerName: "Deal Type", width: 150 },
    { field: "deal_size", headerName: "Deal Size", width: 180 },
    { field: "t1m_returns", headerName: "T + 1M Excess Returns", width: 200 },
    {
      field: "t1d_returns",
      headerName: "T + 1D Return (From Bloomberg)",
      width: 220,
    },
    {
      field: "allocation_deal_size",
      headerName: "Allocation Deal Size Percentage",
      width: 250,
    },
    { field: "allocation_ioi", headerName: "Allocation of IOI", width: 180 },
    {
      field: "average_hold_period",
      headerName: "Average Hold Period",
      width: 180,
    },
    { field: "tplus_1d_issueprice", headerName: "T + 1D issueprice", width: 180 },
    { field: "fo_discount", headerName: "Follow On Discount", width: 180 },
    { field: "percentage_primary", headerName: "Primary %", width: 100 },
  ];
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredRows = rows.filter((row) =>
    row.ticker?.toLowerCase().includes(searchQuery.toLowerCase())
  );
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
          rows={filteredRows.map((row, index) => ({ ids: index, ...row }))}
          columns={columns}
          rowCount={filteredRows.length}
          paginationMode="server"
          loading={loading}
          rowHeight={35}
          hideFooter
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
