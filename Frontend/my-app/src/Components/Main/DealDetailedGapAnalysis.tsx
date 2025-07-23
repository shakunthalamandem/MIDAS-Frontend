import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  TextField,
  Button,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface DealData {
  "Pricing Date": string;
  "Issuer Name": string;
  "Ticker": string;
  "Deal Type": string;
  "FO Type": string;
  "Broad Region": string;
  "Year": number;
  "Issue Offer Price": number;
  "T + 1 Month Return": number;
  "T + 1 Day Return": number;
  "AM Return Percentage": number;
  "Allocated Capital": number;
  "Am Capital Committed": number;
  "Total Committed Capital": number;
  "Model Allocation Capital": number;
  "Model AM Capital": number;
  "Total Model Capital": number;
  "Allocation Exposure Gap": number;
  "AM Exposure Gap": number;
  "Total Exposure Gap": number;
  "Allocated Shares": number;
  "Am Buy Shares": number;
  "Total Buy Shares": number;
  "Model Allocation Shares": number;
  "Model Am Shares": number;
  "Total Model Shares": number;
  "Allocation Gap Shares": number;
  "Am Gap Shares": number;
  "Total Gap Shares": number;
  "Days Held": number;
  "Current Quantity": number;
}

const formatCurrency = (val: number | null | undefined) => {
  if (val == null || isNaN(val)) return "";
  const absVal = Math.abs(val).toLocaleString("en-US", { maximumFractionDigits: 0 });
  return val < 0 ? `-$${absVal}` : `$${absVal}`;
};


const formatComma = (val: number | null | undefined) => {
  if (val == null || isNaN(val)) return "";
  return val.toLocaleString("en-US", { maximumFractionDigits: 0 });
};

const formatPercentage = (val: number | null | undefined) => {
  if (val == null || isNaN(val)) return "";
  const absVal = Math.abs(val);
  if (absVal < 0.005) return "0.00%";
  return `${val.toFixed(2)}%`;
};

const DealDetailedGapAnalysis: React.FC = () => {
  const [data, setData] = useState<DealData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchData = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) throw new Error("API URL is not defined");

      const response = await fetch(`${apiUrl}/api/deal_detailed_gap_analysis/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({}),
      });

      const json = await response.json();
      setData(json.data || []);
    } catch (error) {
      console.error("Error fetching deal data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const rows = useMemo(() => {
    return data
      .map((row, index) => ({
        id: index,
        ...row,
        "FO Type": row["Deal Type"] === "IPO" ? "-" : row["FO Type"],
      }))
      .filter((row) =>
        row["Ticker"]?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [data, searchQuery]);

  const exportToExcel = () => {
    const exportData = rows.map(({ id, ...row }) => row);
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Deals");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, "Deal_Detailed_Gap_Analysis.xlsx");
  };

  const columns: GridColDef[] = [
    { field: "Pricing Date", headerName: "Pricing Date", width: 120 },
    { field: "Issuer Name", headerName: "Issuer Name", width: 180 },
    { field: "Ticker", headerName: "Ticker", width: 100 },
    { field: "Deal Type", headerName: "Deal Type", width: 100 },
    { field: "FO Type", headerName: "FO Type", width: 100 },
    { field: "Broad Region", headerName: "Region", width: 100 },
    { field: "Year", headerName: "Year", width: 80 },
    { field: "Issue Offer Price", headerName: "Issue Price", width: 80 ,
            renderCell: (params) => formatCurrency(params.value),

    },
    {
      field: "T + 1 Month Return",
      headerName: "T + 1 Month Return",
      width: 120,
      renderCell: (params) => formatPercentage(params.value),
    },
    {
      field: "T + 1 Day Return",
      headerName: "T + 1 Day Return",
      width: 120,
      renderCell: (params) => formatPercentage(params.value),
    },
    {
      field: "AM Return Percentage",
      headerName: "AM Return Percentage",
      width: 120,
      renderCell: (params) => formatPercentage(params.value),
    },
    {
      field: "Allocated Capital",
      headerName: "Allocated Capital",
      width: 140,
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: "Am Capital Committed",
      headerName: "Am Capital Committed",
      width: 130,
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: "Total Committed Capital",
      headerName: "Total Committed Capital",
      width: 130,
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: "Model Allocation Capital",
      headerName: "Model Allocation Capital",
      width: 170,
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: "Model AM Capital",
      headerName: "Model AM Capital",
      width: 150,
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: "Total Model Capital",
      headerName: "Total Model Capital",
      width: 150,
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: "Allocation Exposure Gap",
      headerName: "Allocation Exposure Gap",
      width: 140,
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: "AM Exposure Gap",
      headerName: "AM Exposure Gap",
      width: 100,
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: "Total Exposure Gap",
      headerName: "Total Exposure Gap",
      width: 110,
      renderCell: (params) => formatCurrency(params.value),
    },
    {
      field: "Allocated Shares",
      headerName: "Allocated Shares",
      width: 140,
      renderCell: (params) => formatComma(params.value),
    },
    {
      field: "Am Buy Shares",
      headerName: "AM Buy Shares",
      width: 120,
      renderCell: (params) => formatComma(params.value),
    },
    {
      field: "Total Buy Shares",
      headerName: "Total Buy Shares",
      width: 130,
      renderCell: (params) => formatComma(params.value),
    },
       {
      field: "Current Quantity",
      headerName: "Current Quantity",
      width: 130,
      renderCell: (params) => formatComma(params.value),
    },
    {
      field: "Model Allocation Shares",
      headerName: "Model Allocation Shares",
      width: 170,
      renderCell: (params) => formatComma(params.value),
    },
    {
      field: "Model Am Shares",
      headerName: "Model AM Shares",
      width: 130,
      renderCell: (params) => formatComma(params.value),
    },
    {
      field: "Total Model Shares",
      headerName: "Total Model Shares",
      width: 130,
      renderCell: (params) => formatComma(params.value),
    },
    {
      field: "Allocation Gap Shares",
      headerName: "Allocation Gap Shares",
      width: 160,
      renderCell: (params) => (
        <span style={{ color: params.value < 0 ? "green" : params.value > 0 ? "red" : "black" }}>
          {formatComma(params.value)}
        </span>
      ),
    },
    {
      field: "Am Gap Shares",
      headerName: "AM Gap Shares",
      width: 120,
      renderCell: (params) => (
        <span style={{ color: params.value < 0 ? "green" : params.value > 0 ? "red" : "black" }}>
          {formatComma(params.value)}
        </span>
      ),
    },
    {
      field: "Total Gap Shares",
      headerName: "Total Gap Shares",
      width: 120,
      renderCell: (params) => (
        <span style={{ color: params.value < 0 ? "green" : params.value > 0 ? "red" : "black" }}>
          {formatComma(params.value)}
        </span>
      ),
    },
    { field: "Days Held", headerName: "Days Held", width: 100 },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5" color="#002060" align="center" sx={{ flex: 1, ml: 45 }}>
          Deal Detailed Gap Analysis
        </Typography>
        <Box display="flex" gap={2}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Search Ticker"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 300 }}
          />
          <Button variant="outlined" onClick={exportToExcel} sx={{ backgroundColor: "#002060", color: "#fff" }}>
            Export to Excel
          </Button>
        </Box>
      </Box>

      <Typography variant="body2" color="textSecondary" align="left" sx={{ mb: 1 }}>
        <b>Note :</b> The table below includes all IPO and FO deals from 2025, positions are still held in the portfolio (i.e., current quantity &gt; 0), and the holding period is less than 30 days.
      </Typography>

      <Typography variant="body2" color="textSecondary" align="left" sx={{ mb: 2 }}>
        <b>Assumptions :</b> As for the below GAP Analysis, we have assumed that 0.5% IPO Allocation, 1% for FO Allocation, and 0.5% AM for both IPOs and FOs. There is a Position limit of $30M. Also note that, for each year deals issued in that year are considered, and the EXIT date for actual PnL could be in future years. For Model, the EXIT date is always T+1Month. This analysis excludes SPACs and PIPEs.
      </Typography>

      {loading ? (
        <Grid container justifyContent="center" alignItems="center" style={{ height: 400 }}>
          <CircularProgress />
        </Grid>
      ) : (
        <Paper elevation={3} sx={{ borderRadius: 4, p: 2, bgcolor: "background.paper" ,}}>
<div style={{ height: 600, width: "100%" }}>
  <DataGrid
    rows={rows}
    columns={columns}
    rowHeight={32}
    disableRowSelectionOnClick
    sx={{
      fontSize: "0.75rem",
      "& .MuiDataGrid-columnHeaders": {
        height: 32,
        minHeight: "32px !important",
        maxHeight: "32px !important",
        lineHeight: "32px",
        bgcolor: "#f0f0f0",
        color: "#002060",
        fontSize: "0.75rem",
      },
      "& .MuiDataGrid-columnHeader": {
        maxHeight: "32px !important",
      },
      "& .MuiDataGrid-columnHeaderTitle": {
        fontWeight: "bold",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        lineHeight: "32px",
      },
      "& .MuiDataGrid-cell": {
        color: "#555",
        lineHeight: "1.2",
        padding: "4px 4px",
      },
      "& .MuiDataGrid-row:nth-of-type(odd)": {
        bgcolor: "#fafafa",
      },
    }}
  />
</div>

        </Paper>
      )}
    </Box>
  );
};

export default DealDetailedGapAnalysis;
