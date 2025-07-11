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
  id_3: string;
  client_symbol: string;
  first_trade_date: string;
  quantity: number;
  pnl: number;
  days_hld: number;
  cumulative_pnl: number;
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
        setData(json.results || []);
      } catch (error) {
        console.error("Failed to fetch portfolio data", error);
      } finally {
        setLoading(false);
      }
    };

    if (fund) fetchData();
  }, [fund]);

  const columns: GridColDef[] = [
    {
      field: "client_symbol",
      headerName: "Client Symbol",
      flex: 1,
    },
    {
      field: "first_trade_date",
      headerName: "Trade Date",
      flex: 1,
    },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 1,
    },
        {
      field: "days_hld",
      headerName: "Days Held",
      flex: 1,
    },
    {
      field: "pnl",
      headerName: "Daily PnL",
      flex: 1,
      renderCell: ({ value }) => (
        <span
          style={{
            color: value > 0 ? "green" : value < 0 ? "red" : "black",
          }}
        >
          {typeof value === "number" && !isNaN(value)
            ? currencyFormatter.format(value)
            : "$0"}
        </span>
      ),
    },
    {
      field: "cumulative_pnl",
      headerName: "Cumulative PnL",
      flex: 1,
      renderCell: ({ value }) => (
        <span
          style={{
            color: value > 0 ? "green" : value < 0 ? "red" : "black",
          }}
        >
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
            Portfolio PnL Overview
          </Typography>

          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height={300}
            >
              <CircularProgress />
            </Box>
          ) : (
            <div style={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={data.map((row, index) => ({ ...row, id: index }))}
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
    </Container>
  );
};

export default PortfolioDataTableMain;
