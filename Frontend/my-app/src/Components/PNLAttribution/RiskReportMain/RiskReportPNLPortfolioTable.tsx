import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Box,
} from "@mui/material";

interface RiskReportPNLPortfolioTableProps {
  fund: string;
}

interface PortfolioData {
  ticker: string;
  company: string;
  net_of_hedge_pnl: number;
  net_of_hedge_pnl_bps: number;
  long_exposure: number;
  beta: number;
  beta_adj_exposure_lmv: number;
}

const RiskReportPNLPortfolioTable: React.FC<RiskReportPNLPortfolioTableProps> = ({ fund }) => {
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
        setData(json.portfolio_data || []);
        setReportDate(json.report_date || "");
      } catch (error) {
        console.error("Error fetching portfolio data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [fund]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, backgroundColor: "#f9f9f9", mt: 2 }}>
      <Typography variant="h6" gutterBottom color="#002060" sx={{ fontWeight: "bold" }}>
        FMAP: Long Analysis as of {reportDate ? new Date(reportDate).toLocaleDateString() : "—"}
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e1eaff" }}>
              <TableCell><strong>Ticker</strong></TableCell>
              <TableCell><strong>Company</strong></TableCell>
              <TableCell align="right"><strong>Net Of Hedge P&L</strong></TableCell>
              <TableCell align="right"><strong>Net Of Hedge P&L (bps)</strong></TableCell>
              <TableCell align="right"><strong>Long Exposure (%)</strong></TableCell>
              <TableCell align="right"><strong>Beta</strong></TableCell>
              <TableCell align="right"><strong>Beta Adj. Exposure / LMV (%)</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.ticker}</TableCell>
                  <TableCell>{row.company}</TableCell>
                  <TableCell align="right">
                    {row.net_of_hedge_pnl < 0
                      ? `-$${Math.abs(row.net_of_hedge_pnl).toLocaleString()}`
                      : `$${row.net_of_hedge_pnl.toLocaleString()}`}
                  </TableCell>
                  <TableCell align="right">{(row.net_of_hedge_pnl_bps * 100).toFixed(2)}</TableCell>
                  <TableCell align="right">{(row.long_exposure * 100).toFixed(2)}</TableCell>
                  <TableCell align="right">{row.beta.toFixed(2)}</TableCell>
                  <TableCell align="right">{(row.beta_adj_exposure_lmv * 100).toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RiskReportPNLPortfolioTable;
