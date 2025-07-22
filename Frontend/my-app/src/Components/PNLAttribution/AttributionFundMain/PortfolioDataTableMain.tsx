import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface PortfolioRow {
  client_symbol: string;
  first_trade_date: string;
  total_quantity: number;
  total_pnl: number;
  total_days_held: number;
  ytd_pnl: number;
}

interface Props {
  fund: string;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const PortfolioDataTableMain: React.FC<Props> = ({ fund }) => {
  const [data, setData] = useState<PortfolioRow[]>([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/pnl_portfolio/`, {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fund }),
        });
        const json = await res.json();

        const mappedResults: PortfolioRow[] = (json.results || []).map(
          (item: any) => ({
            client_symbol: item.client_symbol,
            first_trade_date: item.first_trade_date,
            total_quantity: item.qty,
            total_days_held: item.days_hld,
            total_pnl: item.daily_pnl,
            ytd_pnl: item.ytd_pnl,
          })
        );

        setData(mappedResults);
      } catch (error) {
        console.error("Failed to fetch portfolio data", error);
      } finally {
        setLoading(false);
      }
    };

    if (fund) fetchData();
  }, [fund]);

  const columns: GridColDef[] = [
    { field: "client_symbol", headerName: "Client Symbol", flex: 1 },
    { field: "first_trade_date", headerName: "Issue Date", flex: 1 },
    { field: "total_quantity", headerName: "Quantity", flex: 1 },
    { field: "total_days_held", headerName: "Days Held", flex: 1 },
    {
      field: "total_pnl",
      headerName: "Daily PnL",
      flex: 1,
      renderCell: ({ value }) => (
        <span style={{ color: value > 0 ? "green" : value < 0 ? "red" : "black" }}>
          {typeof value === "number" && !isNaN(value)
            ? currencyFormatter.format(value)
            : "$0"}
        </span>
      ),
    },
    {
      field: "ytd_pnl",
      headerName: "YTD PnL",
      flex: 1,
      renderCell: ({ value }) => (
        <span style={{ color: value > 0 ? "green" : value < 0 ? "red" : "black" }}>
          {typeof value === "number" && !isNaN(value)
            ? currencyFormatter.format(value)
            : "$0"}
        </span>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
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
              color: "#002060",
              background: "#e3eafc",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
            }}
          >
            Portfolio P&L Overview for {fund}
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={300}>
              <CircularProgress />
            </Box>
          ) : (
            <div style={{ height: 450, width: "100%" }}>
              <DataGrid
                rows={data}
                columns={columns}
                getRowId={(row) => row.client_symbol + "_" + row.first_trade_date} // Unique ID composed of these two fields
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
    </Container>
  );
};

export default PortfolioDataTableMain;
