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
import { motion } from "framer-motion";

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

const formatCurrency = (val: number | null | undefined) => {
  if (val == null || isNaN(val)) return "-";
  const abs = Math.abs(val).toLocaleString("en-US", { maximumFractionDigits: 0 });
  return val < 0 ? `-$${abs}` : `$${abs}`;
};

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

        const mappedResults: PortfolioRow[] = [];
        const seenKeys = new Set();
        (json.data || []).forEach((item: any) => {
          const key = `${item.client_symbol}_${item.first_trade_date || ""}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            mappedResults.push({
              client_symbol: item.client_symbol,
              first_trade_date: item.first_trade_date || "-",
              total_quantity: item.total_quantity ?? 0,
              total_days_held: item.days_hld ?? 0,
              total_pnl: item.total_pnl ?? 0,
              ytd_pnl: item.ytd_pnl ?? 0,
            });
          }
        });

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
    {
      field: "client_symbol",
      headerName: "Client Symbol",
      flex: 1,
      renderCell: ({ value }) => value || "-",
    },
    {
      field: "first_trade_date",
      headerName: "Issue Date",
      flex: 1,
      renderCell: ({ value }) => value || "-",
    },
    {
      field: "total_quantity",
      headerName: "Quantity",
      flex: 1,
      renderCell: ({ value }) => (value === null || value === undefined ? "-" : value),
    },
    {
      field: "total_days_held",
      headerName: "Days Held",
      flex: 1,
      renderCell: ({ value }) => value || "-",
    },
    {
      field: "total_pnl",
      headerName: "Daily PnL",
      flex: 1,
      renderCell: ({ value }) => (
        <span style={{ color: value > 0 ? "green" : value < 0 ? "red" : "black" }}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      field: "ytd_pnl",
      headerName: "YTD PnL",
      flex: 1,
      renderCell: ({ value }) => (
        <span style={{ color: value > 0 ? "green" : value < 0 ? "red" : "black" }}>
          {formatCurrency(value)}
        </span>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card
          elevation={5}
          sx={{
            borderRadius: 4,
            background: "linear-gradient(to bottom, #e3f2fd, #fce4ec)",
            boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardContent sx={{ px: 2, py: 3 }}>
            <Typography
              variant="h5"
              align="center"
              sx={{
                mb: 2,
                fontWeight: 700,
                background: "linear-gradient(to right, #370150ff, #280057ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Portfolio P&L Overview — {fund}
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ height: 450, width: "100%" }}>
                <DataGrid
                  rows={data}
                  columns={columns}
                  getRowId={(row) =>
                    `${row.client_symbol}_${row.first_trade_date || ""}`
                  }
                  rowHeight={36}
                  sx={{
                    border: "1px solid #d1e0f0",
                    borderRadius: 2,
                    px: 1,
                    "& .MuiDataGrid-columnHeaders": {
                      background: "linear-gradient(to right, #1a237e, #283593) !",
                      color: "#FFFFFF",
                      fontWeight: "bold",
                    },
                    "& .MuiDataGrid-columnHeaderTitle": {
                      background: "linear-gradient(to right, #261e53ff, #00265cff)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: "bold",
                      fontSize: "13px",
                    },
           
                    "& .MuiDataGrid-cell": {
                      fontSize: "13px",
                    },
                    "& .MuiDataGrid-row:nth-of-type(odd)": {
                      backgroundColor: "#f7fafd",
                    },
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default PortfolioDataTableMain;
