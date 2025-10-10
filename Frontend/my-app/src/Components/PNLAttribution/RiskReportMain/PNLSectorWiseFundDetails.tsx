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

interface PNLSectorWiseFundDetailsProps {
  fund: string;
}

interface SectorExposure {
  sector: string;
  net_of_hedge_pnl: number;
  net_of_hedge_pnl_percent: number;
  long_exposure: number;
  beta_adj_long_Exp_lmv: number;
}

const PNLSectorWiseFundDetails: React.FC<PNLSectorWiseFundDetailsProps> = ({
  fund,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SectorExposure[]>([]);
  const [reportDate, setReportDate] = useState<string>("");

  useEffect(() => {
    const fetchSectorExposure = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        const res = await fetch(`${apiUrl}/api/risk_report_sector_exposure/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ fund }), // only fund
        });

        if (!res.ok) {
          throw new Error("Failed to fetch sector exposure data");
        }

        const json = await res.json();
        setData(json.sector_exposure || []);
        setReportDate(json.report_date || "");
      } catch (error) {
        console.error("Error fetching sector exposure:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSectorExposure();
  }, [fund]);

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
      sx={{ p: 2, borderRadius: 2, backgroundColor: "#f9f9f9", mt: 2 }}
    >
      <Typography
        variant="body1"
        gutterBottom
        color="#002060"
        sx={{ fontWeight: "bold" }}
        align="center"
      >
        {fund}: Summary by category as of{" "}
        {reportDate ? new Date(reportDate).toLocaleDateString() : "—"}
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e1eaff" }}>
              <TableCell>
                <strong>Sector</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Net Of Hedge P&L</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Net Of Hedge P&L (%)</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Long Exposure / LMV (%)</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Beta Adj. Long Exp. / LMV (%)</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.sector}</TableCell>
                  <TableCell align="right">
                    {row.net_of_hedge_pnl < 0
                      ? `-$${Math.abs(row.net_of_hedge_pnl).toLocaleString()}`
                      : `$${row.net_of_hedge_pnl.toLocaleString()}`}
                  </TableCell>{" "}
                  <TableCell align="right">
                    {(row.net_of_hedge_pnl_percent * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell align="right">
                    {(row.long_exposure * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell align="right">
                    {row.beta_adj_long_Exp_lmv.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
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

export default PNLSectorWiseFundDetails;
