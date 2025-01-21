import React, { useState, useEffect, useMemo } from "react";
import { Box, Card, CardContent, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { debounce } from "lodash";

interface ScreenerDataRow {
  pricing_date: string;
  issuer_name: string;
  ticker_symbol: string;
  gics_sector: string;
  broad_region: string;
  deal_type: string;
  deal_value: number;
  t_plus_1m_returns: number;
  t_plus_1_return: number;
  t_plus_1m_returns_index_returns: number;
  t_plus_1d_returns_index_returns: number;
  opportunity_value_ex: number;
}

interface ScreenerDataTableProps {
  sectorwiseData: { [key: string]: (string | number)[] };
}

const ScreenerDataTable: React.FC<ScreenerDataTableProps> = ({
  sectorwiseData,
}) => {
  const [rows, setRows] = useState<ScreenerDataRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (sectorwiseData) {
      fetchDataFromApi(sectorwiseData);
    }
  }, [sectorwiseData]);

  const fetchDataFromApi = async (
    data: ScreenerDataTableProps["sectorwiseData"]
  ) => {
    setLoading(true);
    setError(null);

    const payload = {
      year_range: data.year_range,
      dealType: data.dealType,
      broad_region: data.broad_region,
      sector: data.sector,
      deal_value: data.deal_value,
      t_plus_1_return: data.t_plus_1_return,
      t_plus_1m_returns: data.t_plus_1m_returns,
      left_lead_bank: data.left_lead_bank,

    };

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }

      const response = await fetch(`${apiUrl}/api/dealogic_screener/`, {
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
        // setTotalRows(result.pagination?.total_items || 0);
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredRows = rows.filter((row) =>
    row.ticker_symbol?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const columns: GridColDef[] = [
    { field: "pricing_date", headerName: "Pricing Date", width: 100 },
    { field: "issuer_name", headerName: "Issuer Name", width: 200 },
    { field: "ticker_symbol", headerName: "Ticker", width: 100 },
    { field: "gics_sector", headerName: "Sector", width: 180 },
    { field: "broad_region", headerName: "Region", width: 100 },
    { field: "deal_type", headerName: "Deal Type", width: 80 },
    { field: "deal_value", headerName: "Deal Value", width: 120 },
    { field: "t_plus_1_return", headerName: "T + 1D Return", width: 100 },
    {
      field: "t_plus_1d_returns_index_returns",
      headerName: "T + 1D Index Returns",
      width: 100,
    },
    { field: "t_plus_1m_returns", headerName: "T + 1M Returns", width: 100 },
    {
      field: "t_plus_1m_returns_index_returns",
      headerName: "T + 1M Index Returns",
      width: 100,
    },
    {
      field: "opportunity_value_ex",
      headerName: "Opportunity Value Excess",
      width: 140,
    },
    { field: "left_lead_bank", headerName: "lead bank", width: 150 },
  ];

  return (
    <>
      <Box mb={10} sx={{ height: 600, width: "100%" }}>
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
        <Box sx={{ height: 500, width: "100%", marginTop: 3 }}>
          <DataGrid
            rows={filteredRows.map((row, index) => ({ id: index, ...row }))}
            columns={columns}
            rowCount={filteredRows.length}
            loading={loading}
            rowHeight={35}
            hideFooter // Hides the entire footer, including pagination controls
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
        </Box>
      </Box>
    </>
  );
};

export default ScreenerDataTable;
