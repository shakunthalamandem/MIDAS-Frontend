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

interface RiskReportIndexPortfolioTableProps {
  fund: string;
}

interface IndexPortfolioData {
  ticker: string;
  company: string;
  pnl: number;
  pnlvslmv: number;
  beta: number;
  exposurevslmv: number;
  beta_adj_exposure_lmv: number;
}

const RiskReportIndexPortfolioTable: React.FC<RiskReportIndexPortfolioTableProps> = ({ fund }) => {
  const [loading, setLoading] = useState(true);
  const [indexData, setIndexData] = useState<IndexPortfolioData[]>([]);
  const [reportDate, setReportDate] = useState<string>("");

  useEffect(() => {
    const fetchIndexData = async () => {
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

        if (!res.ok) throw new Error("Failed to fetch index portfolio data");

        const json = await res.json();
        setIndexData(json.index_portfolio_data || []);
        setReportDate(json.report_date || "");
      } catch (error) {
        console.error("Error fetching index portfolio data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndexData();
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
        Index Portfolio as of {reportDate ? new Date(reportDate).toLocaleDateString() : "—"}
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e1eaff" }}>
              <TableCell><strong>Ticker</strong></TableCell>
              <TableCell><strong>Company</strong></TableCell>
              <TableCell align="right"><strong>P&L</strong></TableCell>
              <TableCell align="right"><strong>P&L vs LMV (%)</strong></TableCell>
              <TableCell align="right"><strong>Beta</strong></TableCell>
              <TableCell align="right"><strong>Exposure vs LMV (%)</strong></TableCell>
              <TableCell align="right"><strong>Beta Adj. Exposure / LMV (%)</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {indexData.length > 0 ? (
              indexData.map((row, idx) => (
                <TableRow
                  key={idx}
                  sx={{ backgroundColor: idx % 2 === 0 ? "transparent" : "#f2f2f2" }}
                >
                  <TableCell>{row.ticker}</TableCell>
                  <TableCell>{row.company}</TableCell>
                  <TableCell align="right">
                    {row.pnl < 0 ? `-$${Math.abs(row.pnl).toLocaleString()}` : `$${row.pnl.toLocaleString()}`}
                  </TableCell>
                  <TableCell align="right">{(row.pnlvslmv * 100).toFixed(2)}</TableCell>
                  <TableCell align="right">{row.beta.toFixed(2)}</TableCell>
                  <TableCell align="right">{(row.exposurevslmv * 100).toFixed(2)}</TableCell>
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

export default RiskReportIndexPortfolioTable;
