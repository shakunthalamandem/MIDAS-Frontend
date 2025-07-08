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
      const apiName = "deal_detailed_gap_analysis";
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
        body: JSON.stringify({}), // Add any necessary payload
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
    { field: "Broad Region", headerName: "Region", width: 120 },
    { field: "Year", headerName: "Year", width: 100 },
    { field: "T + 1 Month Return", headerName: "+1M Return %", width: 130 },
    { field: "T + 1 Day Return", headerName: "+1D Return %", width: 130 },
    { field: "AM Return Percentage", headerName: "AM Return %", width: 130 },
    { field: "Allocated Capital", headerName: "Allocated Capital", width: 150 },
    { field: "Am Capital Committed", headerName: "AM Capital", width: 150 },
    { field: "Total Committed Capital", headerName: "Total Capital", width: 150 },
    { field: "Allocation Exposure Gap", headerName: "Allocation Gap", width: 150 },
    { field: "AM Exposure Gap", headerName: "AM Gap", width: 130 },
    { field: "Total Exposure Gap", headerName: "Total Gap", width: 130 },
    { field: "Days Held", headerName: "Days Held", width: 100 },
  ];

  const rows = data.map((row, index) => ({ id: index, ...row }));

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom color="primary">
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
              "& .MuiDataGrid-columnHeaders": { bgcolor: "#f0f4f8", color: "#333" },
              "& .MuiDataGrid-row:nth-of-type(odd)": { bgcolor: "#fafafa" },
              "& .MuiDataGrid-cell": { color: "#555" },
            }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default DealDetailedGapAnalysis;