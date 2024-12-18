import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Typography } from "@mui/material";

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

interface MDDScreenerDataTableProps {
  sectorwiseData: { [key: string]: (string | number)[] };
}

const MDDScreenerDataTable: React.FC<MDDScreenerDataTableProps> = ({
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
    data: MDDScreenerDataTableProps["sectorwiseData"]
  ) => {
    setLoading(true);
    setError(null);

    const payload = {
      year_range: data.year_range,
      deal_type: data.dealType,
      region: data.region,
      sector: data.sector,
      deal_captain: data.deal_captain,
      deal_value: data.deal_value,
      lead_bank: data.lead_bank,
      fo_discount: data.FollowOnDiscount,
      t1d_returns: data.t1_return,
      t1m_returns: data.t1m_returns,
      allocation_deal_size: data.AllocationPercentOfDealSize,
      average_hold_period: data.HoldPeriod,
      allocation_ioi: data.AllocationPercentOfIOI,
      t_1d_issue_price: data.Tplus1DIssuePrice,
      percentage_primary: data.Primary,
      sponsor: data.Sponsor,
      page: paginationModel.page + 1, // API pages are often 1-indexed
      pageSize: paginationModel.pageSize,
    };
    console.log("Payload", payload);
    console.log("Data", data);

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
    { field: "deal_size", headerName: "Deal Size", width: 120 },
    { field: "fo_discount", headerName: "Follow On Discount", width: 100 },
    { field: "T+1M_returns", headerName: "T + 1M Excess Returns", width: 100 },
    {
      field: "T+1D_returns",
      headerName: "T + 1D Return (From Bloomberg)",
      width: 100,
    },
    {
      field: "allocation_deal_size",
      headerName: "Allocation Deal Size Percentage",
      width: 100,
    },
    { field: "allocation_ioi", headerName: "Allocation of IOI", width: 100 },
    {
      field: "average_hold_period",
      headerName: "Average Hold Period",
      width: 100,
    },
    { field: "T+1D_issueprice", headerName: "T + 1D issueprice", width: 100 },
  ];

  return (
    <div style={{ height: 600, width: "100%" }}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}
      <Typography
        align="center"
        style={{ fontWeight: "bold", color: "#fd0303", marginBottom: "15px" }}
      >
        Total No of Deals:
        <span style={{ color: "#004b33" }}>{totalRows}</span>
      </Typography>

      <DataGrid
        rows={rows}
        columns={columns}
        paginationMode="server"
        rowCount={totalRows}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50, 100]}
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
  );
};

export default MDDScreenerDataTable;
