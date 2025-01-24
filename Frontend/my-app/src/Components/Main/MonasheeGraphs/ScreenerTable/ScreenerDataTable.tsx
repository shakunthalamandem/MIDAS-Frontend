import React, { useState, useEffect, useMemo } from "react";
import { Box, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

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

const formatDealValue = (dealValue: number): string => {
  // Assuming dealValue is a raw number, format it with the dollar sign
  return "$" + dealValue.toLocaleString();
};

const cleanDealSize = (dealSize: any) => {
  if (!dealSize) return 0;
  // Remove any non-numeric characters including "$" and commas
  return parseFloat(dealSize.replace(/[^\d.-]/g, ""));
};

const preprocessRows = (rows: any[]) =>
  rows.map((row, index) => ({
    id: index,
    ...row,
    deal_value_raw: cleanDealSize(row.deal_value), // Clean the raw number for sorting
    deal_value: row.deal_value ? formatDealValue(cleanDealSize(row.deal_value)) : "0%", // Format deal_value properly
    t_plus_1_return: row.t_plus_1_return ? `${row.t_plus_1_return.toFixed(2)}%` : "0%",
    t_plus_1m_returns: row.t_plus_1m_returns ? `${row.t_plus_1m_returns.toFixed(2)}%` : "0%",
    t_plus_1d_returns_index_returns: row.t_plus_1d_returns_index_returns
      ? `${row.t_plus_1d_returns_index_returns.toFixed(2)}%`
      : "0%",
    t_plus_1m_returns_index_returns: row.t_plus_1m_returns_index_returns
      ? `${row.t_plus_1m_returns_index_returns.toFixed(2)}%`
      : "0%",
  }));

const ScreenerDataTable: React.FC<ScreenerDataTableProps> = ({ sectorwiseData }) => {
  const [rows, setRows] = useState<ScreenerDataRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (sectorwiseData) {
      fetchDataFromApi(sectorwiseData);
    }
  }, [sectorwiseData]);

  const fetchDataFromApi = async (data: ScreenerDataTableProps["sectorwiseData"]) => {
    setLoading(true);
    setError(null);

    const payload = {
      year_range: data.year_range,
      deal_type: data.deal_type,
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
            deal_value: formatDealValue(item.deal_value), // Format the deal_value correctly
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

  const filteredRows = useMemo(() => {
    return preprocessRows(rows).filter((row) =>
      row.ticker_symbol?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rows, searchQuery]);

  const columns: GridColDef[] = [
    { field: "ticker_symbol", headerName: "Ticker", width: 100 },
    { field: "issuer_name", headerName: "Issuer Name", width: 200 },
    { field: "pricing_date", headerName: "Pricing Date", width: 100 },
    { field: "gics_sector", headerName: "Sector", width: 180 },
    { field: "broad_region", headerName: "Region", width: 100 },
    { field: "deal_type", headerName: "Deal Type", width: 80 },
    {
      field: "deal_value",
      headerName: "Deal Size",
      width: 120,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "t_plus_1_return",
      headerName: "T + 1D Return",
      width: 100,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "t_plus_1d_returns_index_returns",
      headerName: "T + 1D Index Returns",
      width: 100,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "t_plus_1m_returns",
      headerName: "T + 1M Returns",
      width: 100,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "t_plus_1m_returns_index_returns",
      headerName: "T + 1M Index Returns",
      width: 100,
      renderCell: (params) => `${params.value}`,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "opportunity_value_ex",
      headerName: "Opportunity Value (T + 1M Excess)",
      width: 140,
      renderCell: (params) => {
        const value = parseFloat(params.value);
        return value
        ? `${value < 0 ? "-$" : "$"}${Math.abs(value).toLocaleString("en-US")}`
        : "0";
            },
    },
    { field: "left_lead_bank", headerName: "Lead Bank", width: 150 },
  ];

  return (
    <Box mb={10} sx={{ height: 600, width: "100%" }}>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {loading && <p>Loading...</p>}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
      <Box sx={{ height: 500, width: "100%", marginTop: 3 }}>
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
      </Box>
    </Box>
  );
};

export default ScreenerDataTable;