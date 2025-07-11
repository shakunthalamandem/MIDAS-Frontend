import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface MostAgedStockData {
  ticker: string;
  first_trade_date: string;
  cumulative_pnl: number;
  days_held: number;
}

interface MostAgedStocksTableProps {
  fund: string;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const MostAgedStocksTable: React.FC<MostAgedStocksTableProps> = ({ fund }) => {
  const [data, setData] = useState<MostAgedStockData[]>([]);
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
        const res = await fetch(`${apiUrl}/api/most_aged_stocks/`, {
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

        const result: MostAgedStockData[] = await res.json();
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
    { field: "first_trade_date", headerName: "Issue Date", flex: 1 },
    {
      field: "cumulative_pnl",
      headerName: "Cumulative PnL",
      flex: 1,
      renderCell: ({ value }) => (
        <span style={{ color: value > 0 ? "green" : value < 0 ? "red" : "black" }}>
          {typeof value === "number" && !isNaN(value)
            ? currencyFormatter.format(value)
            : "$0"}
        </span>
      ),
    },
    { field: "days_held", headerName: "Days Held", flex: 1 },
  ];

  return (
    <Box >
      <Card
        sx={{
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          background: "linear-gradient(to bottom right, #f0f4ff, #ffffff)",
        }}
      >
        <CardContent sx={{ padding: 0 }}>
          <Typography
            variant="h6"
            align="center"
            sx={{
              px: 2,
              py: 2,
              fontWeight: 600,
              color: "#fff",
              background: "#002060",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
            }}
          >
            Most Aged Stocks for {fund}
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ p: 2 }}>
              {error}
            </Typography>
          ) : (
            <div style={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={data.map((row, index) => ({ id: index, ...row }))}
                columns={columns}
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
            </div>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MostAgedStocksTable;
