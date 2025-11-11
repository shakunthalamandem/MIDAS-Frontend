import React, { useEffect, useMemo, useState } from "react";
import { Paper, Typography, CircularProgress, Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

interface RiskReportPNLPortfolioTableProps {
  fund: string;
  showAllRows?: boolean;
  footnote?: string;
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

const RiskReportPNLPortfolioTable: React.FC<RiskReportPNLPortfolioTableProps> = ({
  fund,
  showAllRows = false,
  footnote,
}) => {
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
    },
    {
      field: "long_exposure",
      headerName: "Long Exp/LMV (%)",
      flex: 1,
      minWidth: 150,
      valueFormatter: (params) => `${params}%`,
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
      valueFormatter: (params) => `${params}%`,
    },
  ];

  const rowsPerPage = 50;

  const paginatedData = useMemo(() => {
    if (!showAllRows) {
      return [];
    }
    const chunks: PortfolioData[][] = [];
    for (let i = 0; i < data.length; i += rowsPerPage) {
      chunks.push(data.slice(i, i + rowsPerPage));
    }
    return chunks;
  }, [data, showAllRows]);

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) {
      return "-";
    }
    const absValue = Math.abs(value);
    const formatted = `$${absValue.toLocaleString()}`;
    return value < 0 ? `-${formatted}` : formatted;
  };

  const formatNumber = (value: number | null | undefined, suffix = "") => {
    if (value == null) {
      return "-";
    }
    return `${value}${suffix}`;
  };

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

  if (showAllRows) {
    if (!paginatedData.length) {
      return (
        <Box
          className="pdf-section"
          data-footnote={footnote}
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: "#ffffff",
            boxShadow: "0 20px 45px rgba(0, 32, 96, 0.08)",
            border: "1px solid rgba(0, 32, 96, 0.08)",
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
            {reportDate ? new Date(reportDate).toLocaleDateString() : "-"}
          </Typography>
          <Typography variant="body2" align="center" color="#5a5a5a">
            No portfolio rows available for export.
          </Typography>
        </Box>
      );
    }

    return (
      <>
        {paginatedData.map((pageRows, pageIndex) => (
          <Box
            key={`portfolio-page-${pageIndex}`}
            className="pdf-section"
            data-footnote={
              pageIndex === paginatedData.length - 1 ? footnote : undefined
            }
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "#ffffff",
              boxShadow: "0 20px 45px rgba(0, 32, 96, 0.08)",
              border: "1px solid rgba(0, 32, 96, 0.08)",
              "& + .pdf-section": { mt: 3 },
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
              {reportDate ? new Date(reportDate).toLocaleDateString() : "-"}
            </Typography>
            <Typography
              variant="body2"
              align="center"
              color="#5a5a5a"
              sx={{ mb: 1 }}
            >
              Page {pageIndex + 1} of {paginatedData.length} | {pageRows.length} rows
            </Typography>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 12,
                fontSize: 12,
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#e1eaff",
                    color: "#002060",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "8px" }}>Ticker</th>
                  <th style={{ padding: "8px" }}>Company</th>
                  <th style={{ padding: "8px" }}>Net Of Hedge P&amp;L</th>
                  <th style={{ padding: "8px" }}>Net Of Hedge P&amp;L (bps)</th>
                  <th style={{ padding: "8px" }}>Long Exp/LMV (%)</th>
                  <th style={{ padding: "8px" }}>Beta</th>
                  <th style={{ padding: "8px" }}>Beta Adj.Long Exp. / LMV (%)</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, rowIndex) => (
                  <tr
                    key={row.id ?? `portfolio-row-${pageIndex}-${rowIndex}`}
                    style={{
                      backgroundColor:
                        rowIndex % 2 === 0 ? "#f5f7ff" : "white",
                    }}
                  >
                    <td style={{ padding: "8px" }}>{row.ticker}</td>
                    <td style={{ padding: "8px" }}>{row.company}</td>
                    <td
                      style={{
                        padding: "8px",
                        color: row.net_of_hedge_pnl < 0 ? "red" : "green",
                        fontWeight: 500,
                      }}
                    >
                      {formatCurrency(row.net_of_hedge_pnl)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {formatNumber(row.net_of_hedge_pnl_bps)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {formatNumber(row.long_exposure, "%")}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {row.beta == null ? "-" : row.beta}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {formatNumber(row.beta_adj_exposure_lmv, "%")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        ))}
      </>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: "#ffffff",
        mt: 2,
        boxShadow: "0 20px 45px rgba(0, 32, 96, 0.08)",
        border: "1px solid rgba(0, 32, 96, 0.08)",
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
        {reportDate ? new Date(reportDate).toLocaleDateString() : "-"}
      </Typography>

      {/* Increased height */}
      <div style={{ height: 985, width: "100%" }}>
        <DataGrid
          rows={data}
          columns={columns}
          rowHeight={35}
          disableRowSelectionOnClick
          pagination
          pageSizeOptions={[25, 50, 100] as number[]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
            sx={{
    "& .MuiDataGrid-container--top [role='row']": {
      backgroundColor: "#002060",
      fontWeight: "bold",
      color: "#FFFFFF",
      alignItems: "center",
    },
    "& .Mui-selected": {
      backgroundColor: "#cad0f1ff !important",
    },
    "& .MuiDataGrid-columnHeader .MuiDataGrid-sortIcon": {
      color: "#FFFFFF",
    },
    cursor: "pointer",
    border: "1px solid #ccccccff",
  }}
        />
      </div>
    </Paper>
  );
};

export default RiskReportPNLPortfolioTable;
