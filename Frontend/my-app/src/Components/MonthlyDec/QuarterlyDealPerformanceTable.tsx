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
import {
  fetchQuarterlyDealPerformance,
  QuarterlyDealPerformanceRow,
} from "./monthlyDecApi";
import { formatDollarsCompact, formatPercent, pnlColor } from "./monthlyDecFormat";

const HEADER_BG = "#1e3a8a";
const HEADER_FG = "#ffffff";

const QuarterlyDealPerformanceTable: React.FC = () => {
  const [rows, setRows] = useState<QuarterlyDealPerformanceRow[]>([]);
  const [total, setTotal] = useState<QuarterlyDealPerformanceRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchQuarterlyDealPerformance(2024);
        if (!cancelled) {
          setRows(resp.data || []);
          setTotal(resp.total || null);
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
  }, []);

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Box mb={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1f3a8a" }}>
          Quarterly Deal Performance & Excess Return Breakdown - 2024 to Latest
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={32} />
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
                {[
                  "Year",
                  "Total Deal Count",
                  "Total Deal Volume ($)",
                  "% of Positively Performing Deals",
                  "% of Negatively Performing Deals",
                  "Weighted Avg T+1M Excess Return (Positive Deals)",
                  "Weighted Avg T+1M Excess Return (Negative Deals)",
                  "Expected Returns Excess",
                  "Opportunity Value (T + 1M Excess)",
                ].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      color: HEADER_FG,
                      fontWeight: 700,
                      fontSize: 12,
                      verticalAlign: "top",
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow
                  key={r.quarter}
                  sx={{
                    backgroundColor: "transparent",
                  }}
                >
                  <TableCell>{r.quarter}</TableCell>
                  <TableCell>{r.total_deal_count}</TableCell>
                  <TableCell>{formatDollarsCompact(r.total_deal_volume)}</TableCell>
                  <TableCell>{formatPercent(r.pct_positive_deals, 0)}</TableCell>
                  <TableCell>{formatPercent(r.pct_negative_deals, 0)}</TableCell>
                  <TableCell sx={{ color: pnlColor(r.wavg_t1m_excess_positive) }}>
                    {formatPercent(r.wavg_t1m_excess_positive)}
                  </TableCell>
                  <TableCell sx={{ color: pnlColor(r.wavg_t1m_excess_negative) }}>
                    {formatPercent(r.wavg_t1m_excess_negative)}
                  </TableCell>
                  <TableCell sx={{ color: pnlColor(r.expected_returns_excess) }}>
                    {formatPercent(r.expected_returns_excess)}
                  </TableCell>
                  <TableCell sx={{ color: pnlColor(r.opportunity_value_excess) }}>
                    {formatDollarsCompact(r.opportunity_value_excess)}
                  </TableCell>
                </TableRow>
              ))}
              {total && (
                <TableRow sx={{ backgroundColor: "#f3f4f6" }}>
                  <TableCell sx={{ fontWeight: 700 }}>{total.quarter}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{total.total_deal_count}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {formatDollarsCompact(total.total_deal_volume)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {formatPercent(total.pct_positive_deals, 0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    {formatPercent(total.pct_negative_deals, 0)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: pnlColor(total.wavg_t1m_excess_positive) }}>
                    {formatPercent(total.wavg_t1m_excess_positive)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: pnlColor(total.wavg_t1m_excess_negative) }}>
                    {formatPercent(total.wavg_t1m_excess_negative)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: pnlColor(total.expected_returns_excess) }}>
                    {formatPercent(total.expected_returns_excess)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: pnlColor(total.opportunity_value_excess) }}>
                    {formatDollarsCompact(total.opportunity_value_excess)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default QuarterlyDealPerformanceTable;
