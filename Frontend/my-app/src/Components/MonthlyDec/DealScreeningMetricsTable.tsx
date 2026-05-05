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
  fetchDealScreeningMetrics,
  DealScreeningBucket,
  DealScreeningMetricsResponse,
} from "./monthlyDecApi";

const HEADER_BG = "#5a7ab8";
const HEADER_FG = "#ffffff";

const ROW_DEFINITIONS: Array<{
  label: string;
  field: keyof DealScreeningBucket;
  formatter: (v: number) => string;
}> = [
  { label: "Number of Deals Screened", field: "screened", formatter: (v) => `${v}` },
  { label: "Number of Deals Participated", field: "participated", formatter: (v) => `${v}` },
  { label: "Average Allocation as % of Deal Size", field: "avg_alloc_pct_deal_size", formatter: (v) => `${v.toFixed(1)}%` },
  { label: "Average Allocation as % of IOI", field: "avg_alloc_pct_ioi", formatter: (v) => `${v.toFixed(1)}%` },
  { label: "Average Hold Period", field: "avg_hold_period", formatter: (v) => `${v.toFixed(0)}` },
];

interface Props {
  year?: number;
}

const DealScreeningMetricsTable: React.FC<Props> = ({ year }) => {
  const [data, setData] = useState<DealScreeningMetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchDealScreeningMetrics(year);
        if (!cancelled) setData(resp);
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
  }, [year]);

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Box mb={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1f3a8a" }}>
          Deal Screening, Participation & Allocation Metrics - IPO vs FO
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={28} />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : !data ? (
        <Typography align="center" color="text.secondary">No data available</Typography>
      ) : (
        <TableContainer sx={{ maxWidth: 720, mx: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: HEADER_BG }}>
                <TableCell sx={{ color: HEADER_FG, fontWeight: 700, fontSize: 13 }} />
                <TableCell align="center" sx={{ color: HEADER_FG, fontWeight: 700, fontSize: 13 }}>
                  IPO
                </TableCell>
                <TableCell align="center" sx={{ color: HEADER_FG, fontWeight: 700, fontSize: 13 }}>
                  FO
                </TableCell>
                <TableCell align="center" sx={{ color: HEADER_FG, fontWeight: 700, fontSize: 13 }}>
                  Total
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ROW_DEFINITIONS.map((rowDef, idx) => (
                <TableRow
                  key={rowDef.label}
                  sx={{ backgroundColor: idx % 2 === 0 ? "#e5e7eb" : "#ffffff" }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{rowDef.label}</TableCell>
                  <TableCell align="center">
                    {rowDef.formatter(Number(data.ipo[rowDef.field] ?? 0))}
                  </TableCell>
                  <TableCell align="center">
                    {rowDef.formatter(Number(data.fo[rowDef.field] ?? 0))}
                  </TableCell>
                  <TableCell align="center">
                    {rowDef.formatter(Number(data.total[rowDef.field] ?? 0))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default DealScreeningMetricsTable;
