import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Grid,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface DealData {
  "Pricing Date": string;
  "Issuer Name": string;
  Ticker: string;
  "Deal Type": string;
  "FO Type": string;
  "Broad Region": string;
  Year: number;
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
}

const DealDetailedGapAnalysis: React.FC = () => {
  const [data, setData] = useState<DealData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) {
        throw new Error("API URL is not defined in environment variables");
      }

      const response = await fetch(`${apiUrl}/api/deal_detailed_gap_analysis/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({}),
      });

      const json = await response.json();
      setData(json.data);
    } catch (error) {
      console.error("Error fetching deal data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: GridColDef[] = [
    { field: "Pricing Date", headerName: "Pricing Date", width: 130 },
    { field: "Issuer Name", headerName: "Issuer Name", width: 200 },
    { field: "Ticker", headerName: "Ticker", width: 120 },
    { field: "Deal Type", headerName: "Deal Type", width: 120 },
    { field: "FO Type", headerName: "FO Type", width: 120 },
    { field: "Broad Region", headerName: "Region", width: 120 },
    { field: "Year", headerName: "Year", width: 100 },
    { field: "T + 1 Month Return", headerName: "+1M Return %", width: 130 },
    { field: "T + 1 Day Return", headerName: "+1D Return %", width: 130 },
    { field: "AM Return Percentage", headerName: "AM Return %", width: 130 },
    { field: "Allocated Capital", headerName: "Allocated Capital", width: 150 },
    { field: "Am Capital Committed", headerName: "AM Capital", width: 150 },
    { field: "Total Committed Capital", headerName: "Total Capital", width: 150 },
    { field: "Model Allocation Capital", headerName: "Model Allocation Capital", width: 170 },
    { field: "Model AM Capital", headerName: "Model AM Capital", width: 150 },
    { field: "Total Model Capital", headerName: "Total Model Capital", width: 150 },
    { field: "Allocation Exposure Gap", headerName: "Allocation Gap", width: 150 },
    { field: "AM Exposure Gap", headerName: "AM Gap", width: 130 },
    { field: "Total Exposure Gap", headerName: "Total Gap", width: 130 },
    { field: "Allocated Shares", headerName: "Allocated Shares", width: 150 },
    { field: "Am Buy Shares", headerName: "AM Buy Shares", width: 130 },
    { field: "Total Buy Shares", headerName: "Total Buy Shares", width: 130 },
    { field: "Model Allocation Shares", headerName: "Model Allocation Shares", width: 170 },
    { field: "Model Am Shares", headerName: "Model AM Shares", width: 150 },
    { field: "Total Model Shares", headerName: "Total Model Shares", width: 150 },
    { field: "Allocation Gap Shares", headerName: "Allocation Gap Shares", width: 170 },
    { field: "Am Gap Shares", headerName: "AM Gap Shares", width: 130 },
    { field: "Total Gap Shares", headerName: "Total Gap Shares", width: 130 },
    { field: "Days Held", headerName: "Days Held", width: 100 },
  ];

  const rows = data.map((row, index) => ({
    id: index,
    ...row,
    "FO Type": row["Deal Type"] === "IPO" ? "-" : row["FO Type"],
  }));

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom color="#002060" align="center">
        Deal Detailed Gap Analysis
      </Typography>
      {loading ? (
        <Grid container justifyContent="center" alignItems="center" style={{ height: 400 }}>
          <CircularProgress />
        </Grid>
      ) : (
        <Paper elevation={3} sx={{ borderRadius: 4, p: 2, bgcolor: "background.paper" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight
            disableRowSelectionOnClick
            sx={{
              fontSize: "0.75rem", // Reduce overall font size
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "#f0f0f0",
                color: "#002060",
                minHeight: "32px",
                maxHeight: "32px",
                fontSize: "0.75rem",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: "bold",
              },
              "& .MuiDataGrid-row": {
                minHeight: "32px !important",
                maxHeight: "32px !important",
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

        </Paper>
      )}
    </Box>
  );
};

export default DealDetailedGapAnalysis;