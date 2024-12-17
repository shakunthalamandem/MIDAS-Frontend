import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";

interface ScreenerDataRow {
  id: number;
  pricing_date: string;
  issuer_name: string;
  ticker_symbol: string;
  gics_sector: string;
  us_international: string;
  deal_type: string;
  deal_value: number;
  t1m_returns: number;
  t1_return: number;
  t1m_returns_index_returns: number;
  t1d_returns_index_returns: number;
  opportunity_value_ex: number;
}

interface ScreenerDataTableProps {
  sectorwiseData: { [key: string]: (string | number)[] };
}

const ScreenerDataTable: React.FC<ScreenerDataTableProps> = ({
  sectorwiseData,
}) => {
  const [result, setResult] = useState<ScreenerDataRow[]>([]);
  const [rows, setRows] = useState<ScreenerDataRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 100,
  });
  const [totalRows, setTotalRows] = useState<number>(0);

  useEffect(() => {
    if (sectorwiseData) {
      fetchDataFromApi(sectorwiseData);
    }
  }, [sectorwiseData, paginationModel]);

  const fetchDataFromApi = async (
    data: ScreenerDataTableProps["sectorwiseData"]
  ) => {
    setLoading(true);
    setError(null);

    const payload = {
      year_range: data.year_range,
      dealType: data.dealType,
      region: data.region,
      sector: data.sector,
      deal_value: data.deal_value,
      t1_return: data.t1_return,
      t1m_returns: data.t1m_returns,
      page: paginationModel.page + 1, // API pages are often 1-indexed
      pageSize: paginationModel.pageSize,
    };

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }

      const response = await fetch(`${apiUrl}/api/super-screener/`, {
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
            id: index + 1, // Ensure each row has a unique ID
          }))
        );
        setTotalRows(result.pagination?.total_items || 0);
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };
// Function to calculate the total deal value after filtering the data
const calculateTotalDealValue = (result: ScreenerDataRow[]) => {
  let totaldealvalue = 0;

  result.forEach((row) => {
    // Clean deal_value by removing non-numeric characters like $ and commas
    const cleanedDealValue = row.deal_value
      .toString()
      .replace(/[^0-9.-]+/g, ''); // Removes any non-numeric characters (except decimal and minus)

    // Parse cleaned value as a float
    const dealValue = parseFloat(cleanedDealValue);

    // Check if dealValue is a valid number before adding to the total
    if (!isNaN(dealValue)) {
      totaldealvalue += dealValue;
    } else {
      console.error(`Invalid deal value: ${row.deal_value}`); // Log any invalid deal_value for debugging
    }
  });

  return totaldealvalue;
};

// Calculate total deal value based on the current filtered data
const totaldealvalue = calculateTotalDealValue(rows);

  // DataGrid columns definition
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 150 },
    { field: "pricing_date", headerName: "Pricing Date", width: 150 },
    { field: "issuer_name", headerName: "Issuer Name", width: 200 },
    { field: "ticker_symbol", headerName: "Ticker Symbol", width: 150 },
    { field: "gics_sector", headerName: "Sector", width: 180 },
    { field: "us_international", headerName: "Region", width: 110 },
    { field: "deal_type", headerName: "Deal Type", width: 100 },
    { field: "deal_value", headerName: "Deal Value", width: 180 },
    { field: "t1_return", headerName: "T + 1D Return", width: 180 },
    {
      field: "t1d_returns_index_returns",
      headerName: "T + 1D Index Returns",
      width: 200,
    },
    { field: "t1m_returns", headerName: "T + 1M Returns", width: 180 },
    {
      field: "t1m_returns_index_returns",
      headerName: "T + 1M Index Returns",
      width: 200,
    },
    {
      field: "opportunity_value_ex",
      headerName: "Opportunity Value Excess",
      width: 220,
    },
  ];

  return (
    <div>
      {/* Box for displaying the summed total deal value */}
      <Box
        sx={{
          height: "auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
          padding: 2,
          marginTop: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "black",
            marginBottom: 2,
          }}
        >
          Summary
        </Typography>

        {/* Display total deal value */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: 1,
            padding: "5px 10px",
            backgroundColor: "#e6f7ff",
            borderRadius: "4px",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
  Total Deal Value: ${totaldealvalue.toLocaleString()}
</Typography>

        </Box>
      </Box>

      {/* DataGrid below the summary */}
      <Box sx={{ height: 400, width: "100%", marginTop: 3 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          paginationMode="server"
          rowCount={totalRows}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "transparent",
              fontWeight: "bold",
              color: "#002060",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
            },
            "& .MuiDataGrid-cell": {
              color: "#000000",
            },
            "& .MuiDataGrid-cell--editing": {
              border: "none",
            },
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            "& .MuiDataGrid-row:nth-of-type(odd)": {
              backgroundColor: "#F5F5F5",
            },
            "& .Mui-checked": {
              color: "#002060 !important",
            },
            "& .MuiCheckbox-root": {
              color: "#002060",
            },
          }}
        />
      </Box>
    </div>
  );
};

export default ScreenerDataTable;
