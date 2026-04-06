import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Container,
  TextField,
  Typography,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

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
  left_lead_bank?: string;
  id?: number;
}

interface ScreenerDataTableProps {
  selectedFilters: Record<string, string | number | (string | number)[]>;
  handleReset: () => void;
}

const DEFAULT_START_YEAR = 2001;
const DEFAULT_END_YEAR = 2026;

const formatDealValue = (dealValue: number): string =>
  "$" + dealValue.toLocaleString("en-US");

const formatPercentage = (value: number | null | undefined): string => {
  if (value == null || isNaN(value)) return "";
  const absVal = Math.abs(value);
  if (absVal < 0.005) return "0.00%";
  return `${value.toFixed(2)}%`;
};

const cleanDealSize = (dealSize: any) => {
  if (dealSize == null || dealSize === "") return 0;
  return parseFloat(dealSize.toString().replace(/[^\d.-]/g, ""));
};

const toArray = (v: any): (string | number)[] => {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
};

const firstNumber = (v: any): number | null => {
  const arr = toArray(v);
  if (!arr.length) return null;
  const n = Number(arr[0]);
  return Number.isFinite(n) ? n : null;
};

const preprocessRows = (rows: any[]) =>
  rows.map((row, index) => ({
    id: index + 1,
    ...row,
    deal_value_raw: cleanDealSize(row.deal_value),
    deal_value: row.deal_value
      ? formatDealValue(cleanDealSize(row.deal_value))
      : "$0",
    t_plus_1_return: row.t_plus_1_return
      ? `${row.t_plus_1_return.toFixed(2)}%`
      : "0%",
    t_plus_1m_returns: row.t_plus_1m_returns
      ? `${row.t_plus_1m_returns.toFixed(2)}%`
      : "0%",
    t_plus_1d_returns_index_returns: row.t_plus_1d_returns_index_returns
      ? `${row.t_plus_1d_returns_index_returns.toFixed(2)}%`
      : "0%",
    t_plus_1m_returns_index_returns: row.t_plus_1m_returns_index_returns
      ? `${row.t_plus_1m_returns_index_returns.toFixed(2)}%`
      : "0%",
  }));

const MarketCapitalTable: React.FC<ScreenerDataTableProps> = ({
  selectedFilters,
  handleReset,
}) => {
  const [rows, setRows] = useState<ScreenerDataRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Always call API; default years if not selected
  const payload = useMemo(() => {
    const startYear =
      firstNumber((selectedFilters as any)?.start_year) ?? DEFAULT_START_YEAR;
    const endYear =
      firstNumber((selectedFilters as any)?.end_year) ?? DEFAULT_END_YEAR;

    return {
      year_range: [startYear, endYear],
      deal_type: toArray((selectedFilters as any)?.deal_type),
      broad_region: toArray((selectedFilters as any)?.region),
      sector: toArray((selectedFilters as any)?.sector),
    };
  }, [selectedFilters]);

  useEffect(() => {
    fetchDataFromApi(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  const fetchDataFromApi = async (body: any) => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) throw new Error("API URL is not defined in environment variables");

      const response = await fetch(`${apiUrl}/api/dealogic_screener/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();

      if (result?.detail === "No data found.") {
        setRows([]);
        return;
      }

      setRows(result.data || []);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const processedRows = useMemo(() => preprocessRows(rows), [rows]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return processedRows;
    return processedRows.filter((row) =>
      row.ticker_symbol?.toLowerCase().includes(q)
    );
  }, [processedRows, searchQuery]);

  const columns: GridColDef[] = [
    {
      field: "ticker_symbol",
      headerName: "Ticker",
      width: 120,
      headerAlign: "center",
      align: "center",
      sortable: true,
      renderCell: (params) => (
        <Link
          to={`/opportunity/equity/${params.value}`}
          style={{ color: "#1E88E5", textDecoration: "none", fontWeight: 600 }}
          target="_blank"
        >
          {params.value}
        </Link>
      ),
    },
    { field: "issuer_name", headerName: "Issuer Name", width: 220 },
    { field: "pricing_date", headerName: "Pricing Date", width: 130 },
    { field: "gics_sector", headerName: "Sector", width: 200 },
    { field: "broad_region", headerName: "Region", width: 130 },
    { field: "deal_type", headerName: "Deal Type", width: 120 },
    {
      field: "deal_value",
      headerName: "Deal Size",
      width: 140,
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "t_plus_1_return",
      headerName: "T + 1D Return",
      width: 140,
      renderCell: (params) => formatPercentage(cleanDealSize(params.value)),
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "t_plus_1d_returns_index_returns",
      headerName: "T + 1D Index",
      width: 140,
      renderCell: (params) => formatPercentage(cleanDealSize(params.value)),
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "t_plus_1m_returns",
      headerName: "T + 1M Return",
      width: 140,
      renderCell: (params) => formatPercentage(cleanDealSize(params.value)),
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "t_plus_1m_returns_index_returns",
      headerName: "T + 1M Index",
      width: 140,
      renderCell: (params) => formatPercentage(cleanDealSize(params.value)),
      sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
    },
    {
      field: "opportunity_value_ex",
      headerName: "Opportunity Value (Excess)",
      width: 220,
      renderCell: (params) => {
        const value = Number(params.value);
        if (!Number.isFinite(value)) return "0";
        return `${value < 0 ? "-$" : "$"}${Math.abs(value).toLocaleString("en-US")}`;
      },
    },
    { field: "left_lead_bank", headerName: "Lead Bank", width: 180 },
  ];

  const handleExportToExcel = useCallback(() => {
    // export what user is seeing (after search)
    const exportData = filteredRows.map((r: any) => {
      const obj: Record<string, any> = {};
      columns.forEach((col) => {
        const header = col.headerName || col.field;
        obj[header] = r[col.field];
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Market Capital");

    const fileName = `market_capital_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }, [filteredRows]);

  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          p: 2,
          border: "1px solid #e6e6e6",
          backgroundColor: "#fff",
        }}
      >
        {/* Top Bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
            gap: 2,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, color: "#9b0000" }}>
              Total no of deals:{" "}
              <span style={{ color: "#004b33" }}>{filteredRows.length}</span>
            </Typography>
            {error && (
              <Typography sx={{ color: "error.main", fontSize: 12, mt: 0.5 }}>
                {error}
              </Typography>
            )}
          </Box>

          {/* Right Controls: Search then Export */}
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search Ticker"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: 280,
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
            <Button
              variant="contained"
              onClick={handleExportToExcel}
              disabled={loading || filteredRows.length === 0}
              sx={{
                borderRadius: 2,
                px: 2,
                whiteSpace: "nowrap",
                bgcolor: "#002060",
                "&:hover": { bgcolor: "#00358f" },
              }}
            >
              Export to Excel
            </Button>
          </Stack>
        </Box>

        {/* Grid */}
        <Box sx={{ height: 720, width: "100%" }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            loading={loading}
            rowHeight={40}
            columnHeaderHeight={44}
            disableRowSelectionOnClick
            sx={{
              borderRadius: 2,
              border: "1px solid #d9d9d9",

              // Header style
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f7f9fc",
                color: "#002060",
                fontWeight: 800,
                borderBottom: "1px solid #d9d9d9",
              },

              // Cell borders (vertical + horizontal)
              "& .MuiDataGrid-cell": {
                fontSize: "12px",
                color: "#111",
                borderRight: "1px solid #e0e0e0",
                borderBottom: "1px solid #e0e0e0",
              },
              "& .MuiDataGrid-columnHeader": {
                borderRight: "1px solid #d9d9d9",
              },

              // Zebra rows
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: "#fcfcfc",
              },

              // Hover
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f2f6ff",
              },

              // Remove focus outline
              "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": {
                outline: "none",
              },
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default MarketCapitalTable;
