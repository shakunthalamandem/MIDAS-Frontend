import React, { useEffect, useState } from "react";
import { Paper, Typography, CircularProgress, Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface RiskReportPNLPortfolioTableProps {
  fund: string;
}

interface PortfolioData {
  id?: number;
  ticker: string;
  company: string;
  net_of_hedge_pnl: number;
  net_of_hedge_pnl_bps: number;
  long_exposure: number;
  beta: number;
  beta_adj_exposure_lmv: number;
}

const RiskReportPNLPortfolioTable: React.FC<
  RiskReportPNLPortfolioTableProps
> = ({ fund }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PortfolioData[]>([]);
  const [reportDate, setReportDate] = useState<string>("");

  useEffect(() => {
    const fetchPortfolioData = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        const res = await fetch(`${apiUrl}/api/risk_report_portfolio_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ fund }),
        });

        if (!res.ok) throw new Error("Failed to fetch portfolio data");

        const json = await res.json();
        const portfolioData = (json.portfolio_data || []).map(
          (item: PortfolioData, index: number) => ({
            id: index + 1,
            ...item,
          })
        );
        setData(portfolioData);
        setReportDate(json.report_date || "");
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [fund]);

  const columns: GridColDef[] = [
    { field: "ticker", headerName: "Ticker", flex: 1, minWidth: 100 },
    { field: "company", headerName: "Company", flex: 1.5, minWidth: 150 },
    {
      field: "net_of_hedge_pnl",
      headerName: "Net Of Hedge P&L",
      flex: 1,
      minWidth: 150,
      type: "number",
      renderCell: (params) => {
        const value = params.value as number;
        if (value == null) return "—";
        const formatted = `$${Math.abs(value).toLocaleString()}`;
        return (
          <span style={{ color: value < 0 ? "red" : "green" }}>
            {value < 0 ? `-${formatted}` : formatted}
          </span>
        );
      },
    },
    {
      field: "net_of_hedge_pnl_bps",
      headerName: "Net Of Hedge P&L (bps)",
      flex: 1,
      minWidth: 150,
      valueFormatter: (params) => (params * 100).toFixed(2).toString(),
    },
    {
      field: "long_exposure",
      headerName: "Long Exp/LMV (%)",
      flex: 1,
      minWidth: 150,
      valueFormatter: (params) => (params * 100).toFixed(2).toString() + "%",
    },
    {
      field: "beta",
      headerName: "Beta",
      flex: 0.7,
      minWidth: 100,
      valueFormatter: (params) => (params != null ? params : "—"),
    },
    {
      field: "beta_adj_exposure_lmv",
      headerName: "Beta Adj.Long Exp. / LMV (%)",
      flex: 1.3,
      minWidth: 180,
valueFormatter: (params) => (params * 100).toFixed(2) + "%",    },
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: "#f9f9f9",
        mt: 2,
      }}
    >
      <Typography
        variant="body1"
        gutterBottom
        color="#002060"
        sx={{ fontWeight: "bold" }}
        align="center"
      >
        {fund}: Long Analysis as{" "}
        {reportDate ? new Date(reportDate).toLocaleDateString() : "—"}
      </Typography>

      {/* Increased height */}
      <div style={{ height: 985, width: "100%" }}>
        <DataGrid
          rows={data}
          columns={columns}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          rowHeight={35}
          disableRowSelectionOnClick
          sx={{
            border: 0,
            backgroundColor: "white",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#e1eaff", // header background color
              fontWeight: "bold",
              color: "#002060",
              textAlign: "left", // align header text left
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              justifyContent: "flex-start", // align title text left
            },
            "& .MuiDataGrid-row": {
              alignItems: "center",
            },
            "& .MuiDataGrid-cell": {
              justifyContent: "flex-start", // align cell text left
              textAlign: "left",
            },
            "& .MuiDataGrid-row:nth-of-type(odd)": {
              backgroundColor: "#f5f7ff",
            },
          }}
        />
      </div>
    </Paper>
  );
};

export default RiskReportPNLPortfolioTable;
