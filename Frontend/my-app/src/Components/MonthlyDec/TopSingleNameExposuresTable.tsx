import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Stack,
} from "@mui/material";
import {
  fetchTopSingleNameExposures,
  SingleNameExposureRow,
} from "./monthlyDecApi";

const HEADER_BG = "#5a7ab8";
const HEADER_FG = "#ffffff";

const formatDollarsExact = (val: number): string => {
  const sign = val < 0 ? "-" : "";
  const abs = Math.abs(Math.round(val));
  return `${sign}$${abs.toLocaleString()}`;
};

interface Props {
  fund?: string;
}

const TopSingleNameExposuresTable: React.FC<Props> = ({ fund }) => {
  const [rows, setRows] = useState<SingleNameExposureRow[]>([]);
  const [varPct, setVarPct] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchTopSingleNameExposures(fund, 5);
        if (!cancelled) {
          setRows(resp.rows || []);
          setVarPct(resp.var_1pct || 0);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fund]);

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Box mb={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1f3a8a" }}>
          Top 5 Single-Name Exposures by GMV (Gross MV / Net Notional / Delta-Adj / Beta-Adj)
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={28} />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : rows.length === 0 ? (
        <Typography align="center" color="text.secondary">No data available</Typography>
      ) : (
        <>
          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: HEADER_BG }}>
                  <TableCell sx={{ color: HEADER_FG, fontWeight: 700, fontSize: 12 }}>
                    Issuer
                  </TableCell>
                  <TableCell colSpan={4} align="center" sx={{ color: HEADER_FG, fontWeight: 700, fontSize: 12, borderLeft: "1px solid rgba(255,255,255,0.3)" }}>
                    Top 5 Exposure
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: HEADER_BG }}>
                  <TableCell sx={{ color: HEADER_FG, fontWeight: 700, fontSize: 12 }} />
                  <TableCell align="right" sx={{ color: HEADER_FG, fontWeight: 700, fontSize: 12 }}>
                    Gross Market Value
                  </TableCell>
                  <TableCell align="right" sx={{ color: HEADER_FG, fontWeight: 700, fontSize: 12 }}>
                    Net Notional Exposure
                  </TableCell>
                  <TableCell align="right" sx={{ color: HEADER_FG, fontWeight: 700, fontSize: 12 }}>
                    Delta Adjusted Net Exp
                  </TableCell>
                  <TableCell align="right" sx={{ color: HEADER_FG, fontWeight: 700, fontSize: 12 }}>
                    Beta Adjusted Net Exp
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r, idx) => (
                  <TableRow
                    key={r.issuer}
                    sx={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#e5e7eb" }}
                  >
                    <TableCell>{r.issuer}</TableCell>
                    <TableCell align="right">{formatDollarsExact(r.gross_market_value)}</TableCell>
                    <TableCell align="right">{formatDollarsExact(r.net_notional_exp)}</TableCell>
                    <TableCell align="right">{formatDollarsExact(r.delta_adj_net_exp)}</TableCell>
                    <TableCell align="right">{formatDollarsExact(r.beta_adj_net_exp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1f3a8a", mb: 1 }}>
              Portfolio Value-at-Risk (VaR)
            </Typography>
            <Stack direction="row" sx={{ width: { xs: "100%", md: 360 } }}>
              <Box
                sx={{
                  flex: 1,
                  backgroundColor: HEADER_BG,
                  color: HEADER_FG,
                  fontWeight: 700,
                  px: 2,
                  py: 1,
                  textAlign: "center",
                }}
              >
                1% VaR
              </Box>
              <Box
                sx={{
                  flex: 1,
                  backgroundColor: "#d1d5db",
                  color: "#111827",
                  fontWeight: 700,
                  px: 2,
                  py: 1,
                  textAlign: "center",
                }}
              >
                {varPct.toFixed(1)}%
              </Box>
            </Stack>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default TopSingleNameExposuresTable;
