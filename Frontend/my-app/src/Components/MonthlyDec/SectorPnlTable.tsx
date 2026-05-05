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
} from "@mui/material";
import { fetchPnlBySector, SectorPnlRow } from "./monthlyDecApi";
import { formatDollarsCompact, pnlColor } from "./monthlyDecFormat";

const HEADER_BG = "#1e3a8a";

interface Props {
  fund?: string;
}

const SectorPnlTable: React.FC<Props> = ({ fund }) => {
  const [rows, setRows] = useState<SectorPnlRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchPnlBySector(fund);
        if (!cancelled) {
          setRows(resp.data || []);
          setTotal(resp.total || 0);
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
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: "100%" }}>
      <Box mb={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1f3a8a" }}>
          YTD P&L Contribution by Sector
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
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: HEADER_BG }}>
                <TableCell sx={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>
                  SECTOR
                </TableCell>
                <TableCell align="right" sx={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>
                  YTD P&L
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.sector}>
                  <TableCell>{r.sector}</TableCell>
                  <TableCell align="right" sx={{ color: pnlColor(r.ytd_pnl) }}>
                    {formatDollarsCompact(r.ytd_pnl)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: "#f3f4f6" }}>
                <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: pnlColor(total) }}>
                  {formatDollarsCompact(total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default SectorPnlTable;
