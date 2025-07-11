import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface BottomPnlData {
  ticker: string;
  first_trade_date: string;
  cumulative_pnl: number;
  days_held: number;
}

interface BottomStocksPNLMainProps {
  fund: string;
}

const BottomStocksPNLMain: React.FC<BottomStocksPNLMainProps> = ({ fund }) => {
  const [data, setData] = useState<BottomPnlData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      if (!fund) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${apiUrl}/api/bottom_pnl/`, {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fund }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const result: BottomPnlData[] = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fund, apiUrl, token]);

  const columns: GridColDef[] = [
    { field: "ticker", headerName: "Ticker", flex: 1 },
    { field: "first_trade_date", headerName: "First Trade Date", flex: 1 },
    { field: "cumulative_pnl", headerName: "Cumulative PnL", flex: 1 },
    { field: "days_held", headerName: "Days Held", flex: 1 },
  ];

  return (
    <Box px={2} py={3} >
<Typography
  variant="h6"
  align="center"
  gutterBottom
  sx={{ color: "#002060", fontWeight: 600 }}
>
  High Loss Positions (PnL &lt; -$1M) — {fund}
</Typography>


     
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Box
            sx={{
              overflowX: "auto",
              backgroundColor: "#ffffff",
              borderRadius: 2,
              boxShadow: 3,
              "& .MuiDataGrid-root": {
                border: "none",
                fontSize: "0.75rem",
              },
              "& .MuiDataGrid-columnHeaders": {
                fontWeight: 600,
                fontSize: "0.75rem",
                lineHeight: 1.2,
                minHeight: "36px !important",
                maxHeight: "none !important",
              },
              "& .MuiDataGrid-columnHeader": {
                background:  "#77B0FC",
                color: "#002060",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                whiteSpace: "normal",
                lineHeight: "1.1rem",
                fontSize: "0.75rem",
                textAlign: "center",
                padding: "0 4px",
              },
              "& .MuiDataGrid-cell": {
                whiteSpace: "normal",
                wordWrap: "break-word",
                lineHeight: 1.4,
                fontSize: "0.75rem",
                padding: "6px 8px",
                display: "flex",
                alignItems: "center",
              },
              "& .MuiDataGrid-row": {
                minHeight: "42px !important",
              },
              "& .MuiDataGrid-row:nth-of-type(even)": {
                backgroundColor: "#f5f8fc",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#dee7f7",
                transition: "background-color 0.3s ease",
              },
            }}
          >
            <DataGrid
              rows={data.map((row, index) => ({ id: index, ...row }))}
              columns={columns}
              autoHeight
              pagination
              pageSizeOptions={[25]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25, page: 0 } },
              }}
              disableRowSelectionOnClick
              disableColumnMenu
              hideFooterSelectedRowCount
              getRowHeight={() => "auto"}
            />
          </Box>
        )}
    </Box>
  );
};

export default BottomStocksPNLMain;
