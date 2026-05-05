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
  fetchMonthlyPnlByRegion,
  MonthlyRegionPnlResponse,
} from "./monthlyDecApi";
import { formatPnlMillions, pnlColor } from "./monthlyDecFormat";

const HEADER_BG = "#5a7ab8";

interface Props {
  year?: number;
  fund?: string;
}

const MonthlyRegionPnlTable: React.FC<Props> = ({ year, fund }) => {
  const [data, setData] = useState<MonthlyRegionPnlResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchMonthlyPnlByRegion(year, fund);
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
  }, [year, fund]);

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Box mb={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1f3a8a" }}>
          Monthly P&L Contribution by Region
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={28} />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : !data || data.rows.length === 0 ? (
        <Typography align="center" color="text.secondary">No data available</Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: HEADER_BG }}>
                <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Region</TableCell>
                {data.months.map((m) => (
                  <TableCell key={m} align="right" sx={{ color: "#fff", fontWeight: 700 }}>
                    {m}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ color: "#fff", fontWeight: 700 }}>
                  YTD
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.rows.map((r, idx) => (
                <TableRow
                  key={r.region}
                  sx={{
                    backgroundColor: idx % 2 === 0 ? "#fafafa" : "#e5e7eb",
                  }}
                >
                  <TableCell>{r.region}</TableCell>
                  {data.months.map((m) => {
                    const v = r.monthly[m] ?? 0;
                    return (
                      <TableCell key={m} align="right" sx={{ color: pnlColor(v) }}>
                        {formatPnlMillions(v)}
                      </TableCell>
                    );
                  })}
                  <TableCell align="right" sx={{ color: pnlColor(r.ytd) }}>
                    {formatPnlMillions(r.ytd)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: "#d1d5db" }}>
                <TableCell sx={{ fontWeight: 700 }}>{data.total_row.region}</TableCell>
                {data.months.map((m) => {
                  const v = data.total_row.monthly[m] ?? 0;
                  return (
                    <TableCell
                      key={m}
                      align="right"
                      sx={{ fontWeight: 700, color: pnlColor(v) }}
                    >
                      {formatPnlMillions(v)}
                    </TableCell>
                  );
                })}
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, color: pnlColor(data.total_row.ytd) }}
                >
                  {formatPnlMillions(data.total_row.ytd)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default MonthlyRegionPnlTable;
